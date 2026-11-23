export const maxImageBytes = 8 * 1024 * 1024;
export const extensions = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
} as const;

export function imageType(
  bytes: Uint8Array,
): keyof typeof extensions | undefined {
  const size = bytes.length;
  if (size < 20 || size > maxImageBytes) return;
  const matches = (offset: number, ...values: number[]) =>
    values.every((v, i) => bytes[offset + i] === v);
  const ascii = (offset: number, count: number) =>
    String.fromCharCode(...bytes.subarray(offset, offset + count));
  if (matches(0, 255, 216, 255) && matches(size - 2, 255, 217))
    return "image/jpeg";
  if (
    matches(0, 137, 80, 78, 71, 13, 10, 26, 10) &&
    ascii(12, 4) === "IHDR" &&
    ascii(size - 8, 4) === "IEND"
  )
    return "image/png";
  if (["GIF87a", "GIF89a"].includes(ascii(0, 6)) && bytes[size - 1] === 59)
    return "image/gif";
  if (
    ascii(0, 4) === "RIFF" &&
    ascii(8, 4) === "WEBP" &&
    ["VP8 ", "VP8L", "VP8X"].includes(ascii(12, 4)) &&
    new DataView(bytes.buffer, bytes.byteOffset, size).getUint32(4, true) ===
      size - 8
  )
    return "image/webp";
}
