import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";
const base = "/x1-academic";
test("overview bubbles expand into connected academy workspaces", async ({
  page,
}) => {
  await page.goto(base);
  await expect(
    page.getByRole("heading", { name: "Explore. Assess. Implement." }),
  ).toBeVisible();
  for (const name of [
    "Explore Standards",
    "Assess & Simulate",
    "Implement",
    "Security Mindmap",
  ]) {
    const button = page
      .getByRole("button", { name: new RegExp(`^${name.replace("&", "&")}`) })
      .first();
    await expect(button).toBeVisible();
  }
  await page.getByRole("button", { name: /^Implement Build/ }).click();
  await page
    .getByRole("link", { name: "Implementation Gantt", exact: true })
    .click();
  await expect(page).toHaveURL(/\/implement$/);
  await page.getByRole("link", { name: "X1 Academic overview" }).click();
  await expect(page).toHaveURL(new RegExp(`${base}$`));
});
test("all supported standards expose specific architectures and meaningful selections", async ({
  page,
}) => {
  await page.goto(`${base}/standards`);
  await page.getByLabel("Select standard or regulation").selectOption("dora");
  await expect(
    page.getByRole("button", { name: /ICT risk management/ }).first(),
  ).toBeVisible();
  await page
    .getByRole("button", { name: /ICT risk management/ })
    .first()
    .click();
  await expect(
    page.getByRole("complementary", { name: "Contextual explanation" }),
  ).toContainText("ICT risk");
  await page.getByLabel("Select standard or regulation").selectOption("nis2");
  await expect(page.getByText(/national transposition/i).first()).toBeVisible();
  await page
    .getByLabel("Select standard or regulation")
    .selectOption("iso-27001");
  await expect(page.locator(".xa-cycle-core")).toContainText("ISO/IEC 27001");
  await page
    .getByLabel("Select standard or regulation")
    .selectOption("pci-dss");
  await expect(
    page.getByRole("button", { name: /Account data protection/ }).first(),
  ).toBeVisible();
});
test("completed assessment demo is persistent, filterable and linked to a generated Gantt", async ({
  page,
}) => {
  await page.goto(`${base}/standards`);
  await page.getByRole("button", { name: "Try Completed Demo" }).click();
  await expect(
    page.getByRole("button", { name: /Coverage.*22\/22/ }),
  ).toBeVisible();
  await page.reload();
  await page
    .getByRole("button", { name: "Assessment dashboard", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: /Coverage.*22\/22/ }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: /Not implemented:.*show records/ })
    .click();
  await expect(page.getByLabel("Control-state filter")).toHaveValue(
    "Not implemented",
  );
  await page
    .getByRole("button", { name: "Assessment dashboard", exact: true })
    .click();
  await page
    .getByRole("link", { name: "Generate implementation roadmap" })
    .click();
  await page
    .getByRole("button", { name: "Generate roadmap", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Editable implementation Gantt" }),
  ).toBeVisible();
  await expect(
    page.getByText(/open assessment gaps are available/),
  ).toContainText("12");
});
test("risk manual entry, duplicate, deletion and analysis use actual submitted records", async ({
  page,
}) => {
  await page.goto(`${base}/risk-register`);
  await page.getByRole("button", { name: "Add risk", exact: true }).click();
  await page.getByLabel("Risk ID *", { exact: true }).fill("USER-01");
  await page
    .getByLabel("Asset or service *", { exact: true })
    .fill("Example processing service");
  await page
    .getByLabel("Threat event *", { exact: true })
    .fill("Supplier identity misuse");
  await page
    .getByLabel("Vulnerability or exposure *", { exact: true })
    .fill("Broad supplier permissions");
  await page
    .getByLabel("Business consequence *", { exact: true })
    .fill("Service interruption");
  await page
    .getByLabel("Accountable owner *", { exact: true })
    .fill("Service owner");
  await page.getByRole("button", { name: "Save risk", exact: true }).click();
  await page
    .getByRole("button", { name: "Duplicate USER-01", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Delete USER-01-COPY", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Confirm delete", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Analyse risks", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: /Submitted risks.*6/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Critical risks.*1/ }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "matching records" }),
  ).toContainText("1 matching records");
  await expect(
    page.getByRole("complementary", { name: "Contextual explanation" }),
  ).toContainText("Critical risks");
});
test("Excel template downloads, imports locally and exports populated analysis", async ({
  page,
}) => {
  await page.goto(`${base}/risk-register`);
  await page
    .getByRole("button", { name: "Register input", exact: true })
    .click();
  const template = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download Excel template" }).click();
  const file = await template;
  expect(file.suggestedFilename()).toMatch(/\.xlsx$/);
  const bytes = await readFile((await file.path())!);
  expect(bytes.length).toBeGreaterThan(1000);
  await page
    .getByLabel("Import XLSX or CSV risk register")
    .setInputFiles({
      name: "template.xlsx",
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      buffer: bytes,
    });
  await page
    .getByRole("button", { name: "Validate and import", exact: true })
    .click();
  await expect(page.getByRole("status").first()).toContainText("5 valid rows");
  await page
    .getByRole("button", { name: "Analyse risks", exact: true })
    .click();
  const output = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export Excel", exact: true }).click();
  expect(
    (await readFile((await (await output).path())!)).length,
  ).toBeGreaterThan(1000);
});
test("CSV import shows row errors and does not replace the draft until valid", async ({
  page,
}) => {
  await page.goto(`${base}/risk-register`);
  await page
    .getByRole("button", { name: "Register input", exact: true })
    .click();
  const csv =
    "Risk ID,Asset or service,Threat event,Vulnerability or exposure,Business consequence,Inherent likelihood,Inherent impact,Accountable owner\nBAD-1,API,Misuse,Broad access,Outage,9,5,Owner";
  await page
    .getByLabel("Import XLSX or CSV risk register")
    .setInputFiles({
      name: "invalid.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(csv),
    });
  await page
    .getByRole("button", { name: "Validate and import", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("Row 2");
  await expect(page.getByRole("alert")).toContainText("integer from 1 to 5");
  await expect(
    page.getByText("Current draft · 5 risks.", { exact: false }),
  ).toBeVisible();
});
test("Gantt task edits recalculate dates, reject cycles and survive refresh", async ({
  page,
}) => {
  await page.goto(`${base}/implement?framework=iso-22301`);
  await page
    .getByRole("button", { name: "Generate roadmap", exact: true })
    .click();
  await page
    .getByRole("button", { name: /^Confirm scope, applicability/ })
    .first()
    .click();
  await page.getByLabel("Duration in calendar days").fill("12");
  await page.getByLabel("Task progress percent").fill("50");
  await page.getByRole("button", { name: "Save task and recalculate" }).click();
  await expect(page.getByRole("status")).toContainText("recalculated");
  await page.reload();
  await expect(
    page.getByRole("region", { name: "Editable implementation Gantt" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: /^Confirm scope, applicability/ })
    .first()
    .click();
  await expect(page.getByLabel("Duration in calendar days")).toHaveValue("12");
  await page
    .getByLabel("Approved improvement milestone", { exact: true })
    .check();
  await page.getByRole("button", { name: "Save task and recalculate" }).click();
  await expect(page.getByRole("status")).toContainText("cycle");
});
test("knowledge graph search, expansion, zoom and node explanations operate", async ({
  page,
}) => {
  await page.goto(`${base}/knowledge-graph`);
  await page.getByRole("button", { name: "Expand all clusters" }).click();
  await page
    .getByRole("button", { name: "Explore AI model", exact: true })
    .click();
  await expect(
    page.getByRole("complementary", { name: "Contextual explanation" }),
  ).toContainText("AI model");
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  await expect(page.getByText("120%", { exact: true })).toBeVisible();
  await page.getByLabel("Search knowledge concepts").fill("privacy");
  await expect(
    page.getByRole("button", { name: "Explore Privacy", exact: true }),
  ).toBeVisible();
});
for (const route of [
  "/standards",
  "/implement",
  "/risk-register",
  "/knowledge-graph",
])
  test(`responsive and accessible premium workspace ${route}`, async ({
    page,
  }) => {
    await page.goto(`${base}${route}`);
    await expect(page.locator("main h1").first()).toBeVisible();
    if (route === "/implement")
      await page
        .getByRole("button", { name: "Generate roadmap", exact: true })
        .click();
    const result = await new AxeBuilder({ page })
      .include(".xa")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(
      result.violations.map((item) => ({
        id: item.id,
        nodes: item.nodes.map((node) => node.target),
      })),
    ).toEqual([]);
    for (const width of [320, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }
    await page.reload();
    await expect(page.locator("main h1").first()).toBeVisible();
  });
