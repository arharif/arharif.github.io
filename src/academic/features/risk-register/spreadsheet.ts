import type { RiskRecord, SheetRows, SheetValue } from "./model.ts";
import { labels, riskFields } from "./model.ts";

// Bound ZIP expansion before an XLSX parser allocates worksheet contents.
export function validateWorkbookZip(bytes: Uint8Array) {
  if (bytes.byteLength > 5_000_000)
    throw new Error("Workbook must be smaller than 5 MB.");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let end = -1;
  for (
    let offset = bytes.length - 22;
    offset >= Math.max(0, bytes.length - 65557);
    offset--
  ) {
    if (view.getUint32(offset, true) === 0x06054b50) {
      end = offset;
      break;
    }
  }
  if (end < 0) throw new Error("Invalid XLSX archive.");
  const count = view.getUint16(end + 10, true),
    directorySize = view.getUint32(end + 12, true),
    directory = view.getUint32(end + 16, true);
  if (
    count > 2000 ||
    directorySize > bytes.length ||
    directory + directorySize > end
  )
    throw new Error("Workbook archive exceeds supported limits.");
  let offset = directory,
    expanded = 0;
  for (let index = 0; index < count; index++) {
    if (offset + 46 > end || view.getUint32(offset, true) !== 0x02014b50)
      throw new Error("Invalid workbook directory.");
    const compressed = view.getUint32(offset + 20, true),
      size = view.getUint32(offset + 24, true);
    expanded += size;
    if (
      size === 0xffffffff ||
      compressed === 0xffffffff ||
      expanded > 15_000_000
    )
      throw new Error("Expanded workbook must be smaller than 15 MB.");
    offset +=
      46 +
      view.getUint16(offset + 28, true) +
      view.getUint16(offset + 30, true) +
      view.getUint16(offset + 32, true);
  }
  if (offset !== directory + directorySize)
    throw new Error("Invalid workbook directory length.");
}
export async function readWorkbook(
  bytes: Uint8Array,
): Promise<{ name: string; rows: SheetRows }[]> {
  validateWorkbookZip(bytes);
  const { default: Excel } = await import("exceljs");
  const workbook = new Excel.Workbook();
  await workbook.xlsx.load(
    bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength,
    ) as ArrayBuffer,
  );
  const sheets: { name: string; rows: SheetRows }[] = [];
  workbook.eachSheet((sheet) => {
    if (sheet.rowCount > 501 || sheet.columnCount > 40)
      throw new Error("Worksheets support up to 500 records and 40 columns.");
    const rows: SheetRows = [];
    sheet.eachRow((row) => {
      const cells: SheetValue[] = [];
      for (let index = 1; index <= sheet.columnCount; index++) {
        const value = row.getCell(index).value;
        if (
          value !== null &&
          typeof value === "object" &&
          !(value instanceof Date)
        )
          throw new Error(
            "Use plain values. Formula, rich-text and linked cells are unsupported.",
          );
        cells.push(value as SheetValue);
      }
      rows.push(cells);
    });
    if (rows.length) sheets.push({ name: sheet.name, rows });
  });
  if (!sheets.length) throw new Error("The workbook contains no data.");
  return sheets;
}
export async function workbookBytes(
  rows: RiskRecord[],
  template = false,
): Promise<Uint8Array> {
  const { default: Excel } = await import("exceljs");
  const workbook = new Excel.Workbook();
  workbook.creator = "X1 Academic";
  const sheet = workbook.addWorksheet(
    template ? "Risk input" : "Risk register",
    { views: [{ state: "frozen", ySplit: 1 }] },
  );
  sheet.columns = riskFields.map((field) => ({
    header: labels[field],
    key: field,
    width: [
      "threat",
      "vulnerability",
      "businessImpact",
      "controls",
      "treatment",
      "evidence",
    ].includes(field)
      ? 42
      : 22,
  }));
  rows.forEach((row) =>
    sheet.addRow(
      Object.fromEntries(riskFields.map((field) => [field, row[field]])),
    ),
  );
  sheet.autoFilter = { from: "A1", to: "Q1" };
  sheet.getRow(1).height = 32;
  sheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF153E52" },
    };
  });
  sheet.eachRow((row) => {
    row.alignment = { vertical: "top", wrapText: true };
  });
  const instructions = workbook.addWorksheet("Read me");
  instructions.getColumn(1).width = 110;
  [
    "X1 Academic educational risk register",
    "Sample rows are fictional. Replace them before using your own data. Processing stays in this browser.",
    "Required columns: risk ID, asset, threat, vulnerability, business consequence, inherent likelihood, inherent impact and accountable owner.",
    "Ratings are integers 1–5. Residual ratings default to inherent ratings when omitted.",
    "Status values: Open, In progress, Accepted, Closed. Dates use YYYY-MM-DD.",
    "Risk indices are ordinal teaching aids. They estimate neither financial loss nor probability.",
    "Use plain values. Formulas, links and rich-text cells are rejected on import.",
    "Evidence references record learner assertions. Independent validation remains necessary.",
  ].forEach((text) => instructions.addRow([text]));
  return new Uint8Array(await workbook.xlsx.writeBuffer());
}
