import { Workbook } from "exceljs";
import { validateWorkbookInflation } from "./zipSafety";
const worker = self as unknown as {
  onmessage: ((e: MessageEvent<ArrayBuffer>) => void) | null;
  postMessage: (v: unknown) => void;
};
worker.onmessage = async (e) => {
  try {
    await validateWorkbookInflation(e.data);
    const book = new Workbook();
    await book.xlsx.load(e.data);
    const sheet = book.worksheets[0];
    if (!sheet) throw new Error("Workbook has no worksheets.");
    if (sheet.rowCount > 2001 || sheet.columnCount > 80)
      throw new Error("Maximum 2000 data rows and 80 columns.");
    const grid: unknown[][] = [];
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
    worker.postMessage({ ok: true, grid });
  } catch (e) {
    worker.postMessage({
      ok: false,
      error: e instanceof Error ? e.message : "Workbook parsing failed.",
    });
  }
};
