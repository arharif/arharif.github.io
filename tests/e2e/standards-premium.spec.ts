import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";
const base = "/x1-academic";
test("three workspace choices expand by standard and retain the official themes", async ({
  page,
}) => {
  await page.goto(base);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "X1 Academic.",
  );
  await expect(page.locator(".xc-homecards > section")).toHaveCount(3);
  for (const title of [
    "Explore Standards",
    "Assess & Simulate",
    "Implement & Plan",
  ]) {
    await page.getByRole("button", { name: new RegExp(title) }).click();
    await expect(
      page
        .getByRole("navigation", { name: title + " standards" })
        .getByRole("link"),
    ).toHaveCount(3);
  }
  await page.getByRole("link", { name: "PCI DSS", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Implement & Plan", exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Standard edition")).toHaveValue("pci-dss");
  await page.getByRole("link", { name: "X1 Academic overview" }).click();
  await expect(page.locator(".x1-mark")).toBeVisible();
  await page.getByRole("button", { name: "Open theme selector" }).click();
  await page
    .getByRole("menuitemradio", { name: "Activate Purple theme" })
    .click();
  await expect(page.locator(".xc")).toHaveAttribute("data-theme", "purple");
});
test("standards architecture differs by source and CSF category drill-down reaches official outcomes", async ({
  page,
}) => {
  await page.goto(`${base}/standards?previous=1`);
  await page
    .locator(".xe-standard-tree summary")
    .filter({ hasText: "GOVERN" })
    .click();
  await expect(page.getByText("GV.OC · Official Core outcomes")).toBeVisible();
  await page.locator(".xe-outcome-list button").first().click();
  await expect(
    page.getByRole("complementary", { name: "Contextual explanation" }),
  ).toContainText("GV.OC-01");
  await page.getByLabel("Standard edition").selectOption("iso-27001");
  await expect(page.locator(".xa-architecture")).toHaveClass(/is-cycle/);
  await expect(
    page.getByRole("complementary", { name: "Contextual explanation" }),
  ).toContainText("Context & accountability");
  await page.getByLabel("Standard edition").selectOption("dora");
  await expect(page.locator(".xa-architecture")).toHaveClass(/is-pillars/);
  await page
    .locator(".xa-architecture-node")
    .filter({ hasText: "ICT incident management" })
    .click();
  await expect(
    page.getByRole("complementary", { name: "Contextual explanation" }),
  ).toContainText("reporting");
  await page.getByLabel("Standard edition").selectOption("nis2");
  await expect(page.locator(".xa-architecture")).toHaveClass(/is-flow/);
  await page
    .locator(".xa-architecture-node")
    .filter({ hasText: "Applicability & transposition" })
    .click();
  await expect(
    page.getByRole("complementary", { name: "Contextual explanation" }),
  ).toContainText("national");
});
test("completed CSF demo contains 106 real outcomes and preserves learner edits on repeat", async ({
  page,
}) => {
  await page.goto(`${base}/standards?previous=1`);
  await page.getByLabel("Search standards", { exact: true }).fill("NIST");
  await page.getByRole("button", { name: "Try Completed Demo" }).click();
  await expect(
    page.getByRole("button", { name: /Profile records.*106/ }),
  ).toBeVisible();
  await page
    .getByLabel("Search profile records", { exact: true })
    .fill("GV.OC-01");
  await expect(page.locator(".xa-table-scroll tbody tr")).toHaveCount(1);
  await page.getByLabel("Search profile records", { exact: true }).clear();
  await page.getByRole("button", { name: /^GV.OC-01 ·/ }).click();
  await page
    .getByLabel("Finding owner", { exact: true })
    .fill("Learner risk owner");
  await page
    .getByRole("button", { name: "Save profile finding", exact: true })
    .click();
  await page.getByRole("button", { name: "Try Completed Demo" }).click();
  await expect(
    page.getByRole("button", { name: /Profile records.*106/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: /^GV.OC-01 ·/ }).click();
  await expect(page.getByLabel("Finding owner", { exact: true })).toHaveValue(
    "Learner risk owner",
  );
  await page.locator(".xa-project-controls summary").click();
  const pending = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export project JSON", exact: true })
    .click();
  const raw = await readFile((await (await pending).path())!, "utf8");
  expect(JSON.parse(raw).data.studio.findings).toHaveLength(106);
  await page.getByLabel("Import project JSON", { exact: true }).setInputFiles({
    name: "fictional-assessment.json",
    mimeType: "application/json",
    buffer: Buffer.from(raw),
  });
  await expect(
    page.locator(".xa-project-controls [role=status]"),
  ).toContainText("Project imported and validated");
});
test("framework-specific roadmap includes themed implementation and validation tasks", async ({
  page,
}) => {
  await page.goto(`${base}/implement?standard=dora`);
  await page
    .getByRole("button", { name: "Generate seven-stage project" })
    .click();
  await expect(
    page
      .getByRole("button", { name: /Implement: ICT risk management/ })
      .first(),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Validate: ICT risk management/ }).first(),
  ).toBeVisible();
  await page.getByLabel("Gantt timeline view").selectOption("month");
  await page
    .locator(".xe-phase-group")
    .filter({ hasText: "IMPLEMENT ·" })
    .click();
  await expect(
    page.locator(".xe-phase-group").filter({ hasText: "IMPLEMENT ·" }),
  ).toHaveAttribute("aria-expanded", "false");
  await page.getByRole("button", { name: "Expand all phases" }).click();
  await expect(
    page.locator(".xe-phase-group").filter({ hasText: "IMPLEMENT ·" }),
  ).toHaveAttribute("aria-expanded", "true");
});
test("original library and security mindmap are available within academy routes", async ({
  page,
}) => {
  await page.goto(`${base}/resources`);
  await page
    .getByRole("button", { name: "Published Academic Library", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Course & PDF Library", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByPlaceholder("Search courses, PDFs, frameworks…"),
  ).toBeVisible();
  await page.goto(`${base}/security-map`);
  await expect(
    page.getByRole("heading", { name: "Security Mindmap", exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Search security role")).toBeVisible();
});
for (const theme of ["dark", "light"])
  test(`standards architecture and assessment accessibility ${theme}`, async ({
    page,
  }) => {
    await page.goto(`${base}/standards?previous=1`);
    await expect(page.locator(".xe-standard-tree").first()).toBeVisible();
    if (theme === "light")
      await page.getByRole("button", { name: "Switch to light theme" }).click();
    const result = await new AxeBuilder({ page })
      .include(".xa")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(
      result.violations.map((row) => ({
        id: row.id,
        targets: row.nodes.map((node) => node.target),
      })),
    ).toEqual([]);
    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }
  });
