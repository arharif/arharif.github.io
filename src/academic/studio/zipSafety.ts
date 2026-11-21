// Directory and local-header preflight. Actual inflation is bounded in the worker.
export function inspectXlsxZip(buffer: ArrayBuffer) {
  if (buffer.byteLength > 3 * 1024 * 1024)
    throw new Error("Workbook exceeds 3 MB.");
  const view = new DataView(buffer);
  if (view.byteLength < 22) throw new Error("Not a valid XLSX ZIP archive.");
  let end = -1;
  for (
    let i = view.byteLength - 22;
    i >= Math.max(0, view.byteLength - 65557);
    i--
  ) {
    if (view.getUint32(i, true) === 0x06054b50) {
      end = i;
      break;
    }
  }
  if (end < 0) throw new Error("ZIP directory not found.");
  const count = view.getUint16(end + 10, true),
    size = view.getUint32(end + 12, true),
    offset = view.getUint32(end + 16, true);
  if (count === 65535 || offset === 0xffffffff || size === 0xffffffff)
    throw new Error("ZIP64 workbooks are not supported.");
  if (
    view.getUint16(end + 4, true) ||
    view.getUint16(end + 6, true) ||
    !count ||
    count > 500 ||
    offset + size > end
  )
    throw new Error(
      "Workbook ZIP directory is invalid or exceeds the 500-entry limit.",
    );
  let cursor = offset,
    total = 0;
  const names: string[] = [];
  const parts: {
    name: string;
    start: number;
    compressed: number;
    expanded: number;
    method: number;
  }[] = [];
  for (let i = 0; i < count; i++) {
    if (
      cursor + 46 > offset + size ||
      view.getUint32(cursor, true) !== 0x02014b50
    )
      throw new Error("Malformed ZIP directory entry.");
    const flags = view.getUint16(cursor + 8, true),
      method = view.getUint16(cursor + 10, true),
      compressed = view.getUint32(cursor + 20, true),
      expanded = view.getUint32(cursor + 24, true),
      nameLength = view.getUint16(cursor + 28, true),
      extra = view.getUint16(cursor + 30, true),
      comment = view.getUint16(cursor + 32, true);
    if (cursor + 46 + nameLength + extra + comment > offset + size)
      throw new Error("ZIP entry exceeds directory bounds.");
    const name = new TextDecoder().decode(
      new Uint8Array(buffer, cursor + 46, nameLength),
    );
    if (
      name.startsWith("/") ||
      name.split(/[\\/]/).includes("..") ||
      name.includes("\0")
    )
      throw new Error("Unsafe workbook archive path.");
    if (flags & 1 || ![0, 8].includes(method))
      throw new Error("Encrypted or unsupported workbook compression.");
    if (names.includes(name))
      throw new Error("Duplicate workbook archive entry.");
    const local = view.getUint32(cursor + 42, true);
    if (local + 30 > offset || view.getUint32(local, true) !== 0x04034b50)
      throw new Error("Invalid local workbook entry.");
    const localNameLength = view.getUint16(local + 26, true),
      localExtra = view.getUint16(local + 28, true),
      start = local + 30 + localNameLength + localExtra;
    if (
      start + compressed > offset ||
      view.getUint16(local + 6, true) !== flags ||
      view.getUint16(local + 8, true) !== method
    )
      throw new Error("Inconsistent workbook ZIP headers.");
    const localName = new TextDecoder().decode(
      new Uint8Array(buffer, local + 30, localNameLength),
    );
    if (
      localName !== name ||
      (!(flags & 8) &&
        (view.getUint32(local + 18, true) !== compressed ||
          view.getUint32(local + 22, true) !== expanded))
    )
      throw new Error("Inconsistent workbook ZIP sizes or names.");
    if (
      parts.some(
        (p) => start < p.start + p.compressed && p.start < start + compressed,
      )
    )
      throw new Error("Overlapping workbook entries.");
    parts.push({ name, start, compressed, expanded, method });
    if (
      expanded > 8 * 1024 * 1024 ||
      (expanded > 1024 * 1024 && expanded / Math.max(1, compressed) > 200)
    )
      throw new Error("Workbook entry exceeds expansion/ratio limits.");
    total += expanded;
    if (total > 16 * 1024 * 1024)
      throw new Error("Workbook expanded size exceeds 16 MB.");
    names.push(name);
    cursor += 46 + nameLength + extra + comment;
  }
  if (
    !names.includes("[Content_Types].xml") ||
    !names.includes("xl/workbook.xml")
  )
    throw new Error("Archive does not contain an XLSX workbook.");
  return { entries: count, expandedBytes: total, parts };
}

export async function validateWorkbookInflation(buffer: ArrayBuffer) {
  const { parts } = inspectXlsxZip(buffer);
  let total = 0;
  for (const part of parts) {
    if (part.method === 0) {
      if (part.compressed !== part.expanded)
        throw new Error("Invalid uncompressed ZIP size.");
      total += part.expanded;
      continue;
    }
    const bytes = buffer.slice(part.start, part.start + part.compressed);
    const stream = new Blob([bytes])
      .stream()
      .pipeThrough(new DecompressionStream("deflate-raw"));
    const reader = stream.getReader();
    let actual = 0;
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        actual += value.byteLength;
        total += value.byteLength;
        if (
          actual > part.expanded ||
          actual > 8 * 1024 * 1024 ||
          total > 16 * 1024 * 1024
        ) {
          await reader.cancel();
          throw new Error("Actual workbook expansion exceeds declared limits.");
        }
      }
    } finally {
      reader.releaseLock();
    }
    if (actual !== part.expanded)
      throw new Error("Workbook expansion does not match its directory.");
  }
  return total;
}
