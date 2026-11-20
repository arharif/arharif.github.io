import { riskFields, riskFieldLabels } from "./risk.ts";
export async function readSpreadsheet(
  file: File,
): Promise<{ headers: string[]; rows: Record<string, unknown>[] }> {
  if (file.size > 3 * 1024 * 1024)
    throw new Error("Choose a file smaller than 3 MB. Maximum 2000 records.");
  let grid: unknown[][];
  if (/\.csv$/i.test(file.name)) grid = parseCsv(await file.text());
  else if (/\.xlsx$/i.test(file.name)) {
    const { Workbook } = await import("exceljs");
    const workbook = new Workbook();
    await workbook.xlsx.load(await file.arrayBuffer());
    const sheet = workbook.worksheets[0];
    if (!sheet) throw new Error("Workbook has no worksheets.");
    if (sheet.rowCount > 2001 || sheet.columnCount > 80)
      throw new Error("Maximum 2000 data rows and 80 columns.");
    grid = [];
    sheet.eachRow({ includeEmpty: true }, (row) => {
      const cells: unknown[] = [];
      for (let c = 1; c <= sheet.columnCount; c++) {
        const value = row.getCell(c).value;
        if (value instanceof Date) cells.push(value.toISOString().slice(0, 10));
        else if (value && typeof value === "object") {
          if ("formula" in value || "sharedFormula" in value)
            throw new Error(
              "Formula cells are not accepted. Paste values into a clean workbook.",
            );
          cells.push(row.getCell(c).text);
        } else cells.push(value ?? "");
      }
      grid.push(cells);
    });
  } else throw new Error("Use .csv or .xlsx.");
  if (grid.length > 2001 || grid.some((r) => r.length > 80))
    throw new Error("Maximum 2000 data rows and 80 columns.");
  const headers = (grid.shift() || []).map((v) =>
    String(v ?? "")
      .replace(/^\uFEFF/, "")
      .trim(),
  );
  if (
    !headers.length ||
    headers.some((h) => !h) ||
    new Set(headers).size !== headers.length
  )
    throw new Error("Headers must be nonempty and unique.");
  if (grid.some((r) => r.length > headers.length))
    throw new Error(
      "A row contains more values than the header. Check CSV delimiters.",
    );
  const rows = grid
    .filter((r) => r.some((v) => String(v ?? "").trim()))
    .map((r) => Object.fromEntries(headers.map((h, i) => [h, r[i] ?? ""])));
  return { headers, rows };
}
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [],
    cell = "",
    quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (quoted && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (quoted) {
        quoted = false;
      } else if (!cell) {
        quoted = true;
      } else throw new Error("Malformed CSV quote.");
    } else if (ch === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((ch === "\n" || ch === "\r") && !quoted) {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  if (quoted) throw new Error("Unclosed CSV quote.");
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}
export async function exportWorkbook(
  name: string,
  rows: Record<string, unknown>[],
  method: string,
) {
  const { Workbook } = await import("exceljs");
  const book = new Workbook();
  book.creator = "X1 Academic";
  const sheet = book.addWorksheet("Risk register");
  const headers = rows.length
    ? [...new Set(rows.flatMap((r) => Object.keys(r)))]
    : [...riskFields];
  sheet.columns = headers.map((key) => ({
    header: riskFieldLabels[key as keyof typeof riskFieldLabels] || key,
    key,
    width: key.includes("Date") ? 16 : 25,
  }));
  rows.forEach((r) =>
    sheet.addRow(
      Object.fromEntries(
        headers.map((h) => [
          h,
          typeof r[h] === "number" ? r[h] : String(r[h] ?? ""),
        ]),
      ),
    ),
  );
  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF183B4B" },
  };
  sheet.views = [{ state: "frozen", ySplit: 1 }];
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: Math.max(1, rows.length + 1), column: headers.length },
  };
  const guidance = book.addWorksheet("Read me");
  guidance.columns = [{ width: 120 }];
  for (const text of [
    "X1 Academic · local educational workbook",
    method,
    "Required: id, asset, threat, likelihood, impact. Ratings are integers 1–5.",
    "Optional residual ratings default to inherent. Dates: YYYY-MM-DD. Status: Open, In progress, Accepted, Closed.",
    "Evidence values are references asserted by the learner, not verified evidence. Import reads the first worksheet. Maximum 2000 rows, 80 columns, 3 MB.",
  ])
    guidance.addRow([text]);
  const buffer = await book.xlsx.writeBuffer();
  const url = URL.createObjectURL(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
