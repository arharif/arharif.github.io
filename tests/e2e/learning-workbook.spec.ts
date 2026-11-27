import { expect, test } from "@playwright/test";
import ExcelJS from "exceljs";

test("AI RMF demo preserves the learning figure and assessment tab, with an actual Excel workbook", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/x1-academic/explore?standard=nist-ai-rmf&view=learn");
  await page.getByRole("list", { name: "Framework workflow" }).getByRole("button", { name: "MEASURE" }).click();
  const measure = page.locator(".xc-learning-step");
  await expect(measure).toContainText("subgroup impact");
  const learnUrl = page.url();
  await page.getByRole("button", { name: "Try Demo", exact: true }).click();
  await expect(page).toHaveURL(learnUrl);
  await expect(measure).toContainText("subgroup impact");
  await expect(page.getByText("SAMPLE DATA · Juniper Payments", { exact: true })).toBeVisible();
  const handout = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download cheat sheet" }).click();
  expect((await handout).suggestedFilename()).toBe("nist-ai-rmf-cheat-sheet.txt");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);

  await page.goto("/x1-academic/assess-simulate?standard=nist-ai-rmf&view=matrix");
  const assessUrl = page.url();
  await page.getByRole("button", { name: "Try Demo", exact: true }).click();
  await expect(page).toHaveURL(assessUrl);
  await expect(page.locator(".xc-stage.view-matrix")).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download Assessment — Excel" }).click();
  const file = await download;
  expect(file.suggestedFilename()).toBe("nist-ai-rmf-sample-assessment.xlsx");
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile((await file.path())!);
  expect(workbook.worksheets).toHaveLength(7);
  expect(workbook.getWorksheet("Framework Requirements")?.rowCount).toBe(74);
  expect(workbook.getWorksheet("Risk Register")?.getColumn("H").values).toContain("MEASURE 2.11");
  expect(workbook.getWorksheet("Assessment Summary")?.getCell("A1").text).toContain("SAMPLE DATA");
});

test("workbook treats a spreadsheet-looking finding as inert text", async ({ page }) => {
  await page.goto("/x1-academic/assess-simulate?standard=dora&view=profile");
  await page.getByRole("button", { name: "All controls" }).click();
  await page.getByLabel("current Art. 5", { exact: true }).selectOption("0");
  await page.getByLabel("Finding", { exact: true }).fill("=1+1");
  await page.keyboard.press("Escape");
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download Assessment — Excel" }).click();
  const file = await pending;
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile((await file.path())!);
  const cell = workbook.getWorksheet("Gaps and Findings")?.getCell("F3");
  expect(cell?.value).toBe("'=1+1");
  expect(cell?.type).toBe(ExcelJS.ValueType.String);
});
