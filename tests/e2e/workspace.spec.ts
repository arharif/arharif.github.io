import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import ExcelJS from "exceljs";
const base = "/x1-academic";
async function closeGuide(page: any) {
  const close = page.getByRole("button", { name: "Close explanation" });
  if (await close.isVisible()) await close.click();
}
test("risk XLSX template round trip, local analysis, chart filtering, editing and exports", async ({
  page,
}) => {
  const uploads: string[] = [];
  page.on("request", (r) => {
    if (["POST", "PUT"].includes(r.method())) uploads.push(r.url());
  });
  await page.goto(`${base}/labs/risk-decision`);
  const templateEvent = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Excel input template", exact: true })
    .click();
  const template = await templateEvent;
  const book = new ExcelJS.Workbook();
  await book.xlsx.readFile((await template.path())!);
  expect(book.worksheets[0].getCell("A1").value).toBe("Risk ID");
  expect(book.worksheets[1].name).toBe("Read me");
  book.worksheets[0].getRow(2).values = [
    "BANK-01",
    "Settlement API",
    "Account misuse",
    "Broad access",
    "Interrupted settlement",
    4,
    5,
    3,
    4,
    "MFA",
    "Review access",
    "Payments owner",
    "Banking",
    "In progress",
    "2026-11-01",
    "2026-10-01",
    "Sample reference",
  ];
  const buffer = await book.xlsx.writeBuffer();
  await page.getByLabel("Import risk spreadsheet").setInputFiles({
    name: "bank.xlsx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    buffer: Buffer.from(buffer),
  });
  await expect(
    page.getByRole("heading", { name: /Map spreadsheet columns/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Apply validated import" }).click();
  await expect(page.getByRole("status")).toContainText("Imported 1");
  await page
    .getByRole("button", { name: "Analyse risks", exact: true })
    .click();
  await closeGuide(page);
  await expect(
    page.getByRole("button", { name: /Active risk exposure/ }),
  ).toContainText("12");
  await expect(
    page.getByRole("button", { name: /Overdue reviews/ }),
  ).toContainText("1");
  await page
    .getByRole("button", {
      name: "Likelihood 3, impact 4: 1 risks",
      exact: true,
    })
    .click();
  await closeGuide(page);
  await expect(
    page.getByRole("heading", { name: "Underlying records · Residual 3 × 4" }),
  ).toBeVisible();
  await page.emulateMedia({ media: "print" });
  await expect(
    page.getByRole("article", { name: "Printable analysed risk report" }),
  ).toBeVisible();
  await expect(
    page.getByRole("article", { name: "Printable analysed risk report" }),
  ).toContainText("BANK-01");
  await page.emulateMedia({ media: "screen" });
  const jsonEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export risk JSON" }).click();
  const report = JSON.parse(
    await readFile((await (await jsonEvent).path())!, "utf8"),
  );
  expect(report.records[0].id).toBe("BANK-01");
  expect(report.records[0].residualIndex).toBe(12);
  expect(report.records[0].owner).toBe("Payments owner");
  expect(report.records[0].evidence).toBe("Sample reference");
  expect(report.provenance).toBe("Learner-supplied spreadsheet");
  const excelEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export Excel", exact: true }).click();
  const exported = new ExcelJS.Workbook();
  await exported.xlsx.readFile((await (await excelEvent).path())!);
  expect(exported.worksheets[0].getCell("A2").value).toBe("BANK-01");
  await page.getByRole("button", { name: "Edit BANK-01", exact: true }).click();
  await page.getByLabel("Asset", { exact: true }).fill("Updated API");
  await page.getByRole("button", { name: "Save risk", exact: true }).click();
  await expect(
    page.getByText("Draft changes are pending.", { exact: false }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Analyse risks", exact: true })
    .click();
  await closeGuide(page);
  await page
    .getByRole("button", { name: "Duplicate BANK-01", exact: true })
    .click();
  await page.getByRole("button", { name: "Save risk", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Delete BANK-01-copy", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Delete BANK-01-copy", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Delete BANK-01-copy", exact: true }),
  ).toHaveCount(0);
  expect(uploads).toEqual([]);
});
test("CSV column mapping, invalid dates and ratings produce row errors without changing data", async ({
  page,
}) => {
  await page.goto(`${base}/labs/risk-decision`);
  await page.getByLabel("Import risk spreadsheet").setInputFiles({
    name: "invalid.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(
      "RiskKey,System,Event,L,I,Review\nX,API,Misuse,6,4,2026-02-30\nX,API,Misuse,3,4,2026-12-01",
    ),
  });
  for (const [f, h] of [
    ["id", "RiskKey"],
    ["asset", "System"],
    ["threat", "Event"],
    ["likelihood", "L"],
    ["impact", "I"],
    ["reviewDate", "Review"],
  ])
    await page
      .getByLabel(
        `Map ${{ id: "Risk ID", asset: "Asset", threat: "Threat", likelihood: "Likelihood", impact: "Impact", reviewDate: "Review date" }[f]}`,
        { exact: true },
      )
      .selectOption(h);
  await expect(page.getByRole("alert")).toContainText("Row 2");
  await expect(page.getByRole("alert")).toContainText("valid YYYY-MM-DD");
  await expect(
    page.getByRole("button", { name: "Apply validated import" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Cancel import" }).click();
  await expect(
    page.getByRole("button", { name: "Delete R-001", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Import risk spreadsheet").setInputFiles({
    name: "valid.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(
      "Risk ID,Asset,Threat,Likelihood,Impact\nCSV-01,API,Misuse,3,4",
    ),
  });
  await page.getByRole("button", { name: "Apply validated import" }).click();
  await page
    .getByRole("button", { name: "Analyse risks", exact: true })
    .click();
  await closeGuide(page);
  await expect(
    page.getByRole("button", { name: /Active risk exposure/ }),
  ).toContainText("12");
  await page
    .getByRole("link", { name: "Bring this snapshot to the boardroom" })
    .click();
  await expect(
    page.getByRole("button", { name: /Residual exposure/ }),
  ).toContainText("12");
});
test("all CSF Functions drill into outcomes, evidence validation, gap filters and other editions", async ({
  page,
}) => {
  await page.goto(`${base}/labs/framework-explorer`);
  for (const f of [
    "GOVERN",
    "IDENTIFY",
    "PROTECT",
    "DETECT",
    "RESPOND",
    "RECOVER",
  ]) {
    await page
      .getByRole("button", { name: `Explore ${f}`, exact: true })
      .click();
    await closeGuide(page);
    await expect(page.getByLabel("Function or family")).toHaveValue(f);
  }
  await page
    .getByRole("button", { name: "Clear filters", exact: true })
    .click();
  await page.getByLabel("Find an outcome or control").fill("GV.RR-02");
  await page.getByRole("button", { name: /GV.RR-02/ }).click();
  await closeGuide(page);
  await page
    .getByLabel("Assessment status", { exact: true })
    .selectOption("Not implemented");
  await page.getByLabel("Action owner").fill("Risk owner");
  await page
    .getByLabel("Notes and next action")
    .fill("Assign delegated approval authority");
  await page.getByRole("button", { name: "Save assessment" }).click();
  await expect(page.getByRole("status")).toContainText("saved");
  await page
    .getByRole("button", { name: "Clear filters", exact: true })
    .click();
  await page.getByRole("button", { name: "Gaps: 1", exact: true }).click();
  await closeGuide(page);
  await expect(page.getByLabel("Filter assessment status")).toHaveValue("Gaps");
  await expect(
    page
      .getByRole("table", { name: "Saved assessment decisions" })
      .locator("tbody tr"),
  ).toHaveCount(1);
  for (const id of ["nist-800-53", "iso-27001", "pci-dss"]) {
    await page.getByLabel("Framework", { exact: true }).selectOption(id);
    await expect(page.locator(".xa-workspace article h2")).toBeVisible();
  }
  await expect(page.locator(".xa-framework-source summary")).toBeVisible();
});
test("graph selection, search, zoom, expansion, reset and accessible outline", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto(`${base}/knowledge-graph?node=control`);
  await page
    .getByRole("button", { name: "Explore Detection model", exact: true })
    .click();
  await expect(
    page
      .getByRole("complementary", { name: "Contextual explanation" })
      .getByRole("heading", { name: "Detection model", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Search knowledge graph").fill("threshold");
  await expect(page.locator(".xa-node-picker button")).toHaveCount(1);
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  await expect(page.getByText("1 concepts · 120%")).toBeVisible();
  await page.getByRole("button", { name: "Reset graph" }).click();
  await page.getByRole("button", { name: "Expand clusters" }).click();
  await expect(page.locator(".xa-node-picker button")).toHaveCount(25);
  await page.getByRole("button", { name: "Reset graph" }).click();
  await page.getByText("Accessible concept outline & relationships").click();
  await expect(
    page.getByRole("heading", { name: "AI", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Interactive Knowledge Graph",
  );
});
test("AI confusion cells explain counts, curve points apply thresholds and prediction export reproduces metrics", async ({
  page,
}) => {
  await page.goto(`${base}/labs/ai-experiment`);
  await page.locator(".xa-confusion-cell.fp").click();
  await closeGuide(page);
  await page.getByRole("button", { name: /^Threshold 0.75: fpr/ }).click();
  await closeGuide(page);
  await expect(
    page.getByLabel("Classification threshold", { exact: true }),
  ).toHaveValue("0.75");
  const event = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export reproducible predictions" })
    .click();
  const text = await readFile((await (await event).path())!, "utf8");
  expect(text.split("\r\n")).toHaveLength(401);
  expect(text).toContain('"seed"');
});
test("dated observations use entered history and appear in risk report without changing current scores", async ({
  page,
}) => {
  await page.goto(`${base}/labs/risk-decision`);
  await page
    .getByRole("button", { name: "Analyse risks", exact: true })
    .click();
  await closeGuide(page);
  await page.getByText("Record an observation & inspect a trend").click();
  await page
    .getByLabel("Historical risk", { exact: true })
    .selectOption("R-001");
  await page.getByLabel("Observation date", { exact: true }).fill("2026-10-01");
  await page
    .getByLabel("Observation source or assumption")
    .fill("Fictional exercise assumption: before review");
  await page.getByRole("button", { name: "Add dated observation" }).click();
  await page.getByLabel("Observation date", { exact: true }).fill("2026-11-01");
  await page.getByLabel("Observed likelihood").fill("2");
  await page
    .getByLabel("Observation source or assumption")
    .fill("Fictional exercise assumption: after review");
  await page.getByRole("button", { name: "Add dated observation" }).click();
  await expect(
    page.getByRole("img", {
      name: "Residual index observations for R-001. Exact records follow below.",
    }),
  ).toBeVisible();
  const event = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export risk JSON" }).click();
  const data = JSON.parse(
    await readFile((await (await event).path())!, "utf8"),
  );
  expect(data.datedObservations).toHaveLength(2);
  expect(data.records.find((r: any) => r.id === "R-001").residualIndex).toBe(
    12,
  );
});
test("mobile menu, risk analysis and explanation drawer remain operable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base);
  await page.getByRole("link", { name: "Previous Academy projects" }).click();
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  if (!((await page.locator(".xs-tools-nav").getAttribute("open")) !== null))
    await page.getByText("All workspaces", { exact: true }).click();
  await page
    .getByRole("navigation", { name: "Academic navigation" })
    .getByRole("link", { name: "Risk Register & Simulator", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Analyse risks", exact: true })
    .click();
  await expect(
    page.getByRole("complementary", { name: "Contextual explanation" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close explanation" }).click();
  await page
    .getByRole("button", {
      name: "Likelihood 3, impact 4: 2 risks",
      exact: true,
    })
    .click();
  await page.getByRole("button", { name: "Close explanation" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Underlying records · Residual 3 × 4",
      exact: true,
    }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("assessment decisions remain available when navigating from graph to boardroom", async ({
  page,
}) => {
  await page.goto(`${base}/labs/framework-explorer`);
  await page
    .getByLabel("Assessment status", { exact: true })
    .selectOption("Not implemented");
  await page.getByLabel("Action owner").fill("Risk owner");
  await page
    .getByRole("button", { name: "Save assessment", exact: true })
    .click();
  if (!((await page.locator(".xs-tools-nav").getAttribute("open")) !== null))
    await page.getByText("All workspaces", { exact: true }).click();
  await page
    .getByRole("navigation", { name: "Academic navigation" })
    .getByRole("link", { name: "CISO Boardroom", exact: true })
    .click();
  await expect(
    page.getByText("1 assessment record(s) saved in this tab.", {
      exact: true,
    }),
  ).toBeVisible();
  if (!((await page.locator(".xs-tools-nav").getAttribute("open")) !== null))
    await page.getByText("All workspaces", { exact: true }).click();
  await page
    .getByRole("navigation", { name: "Academic navigation" })
    .getByRole("link", { name: "Control & Framework Explorer", exact: true })
    .click();
  await expect(
    page.getByLabel("Assessment status", { exact: true }),
  ).toHaveValue("Not implemented");
});
