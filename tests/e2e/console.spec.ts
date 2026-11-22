import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import ExcelJS from "exceljs";
import { readFile } from "node:fs/promises";
const base = "/x1-academic";
const action = async (page: Page, name: string) => {
  await page
    .getByRole("button", { name: "Project actions", exact: true })
    .first()
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name, exact: true })
    .click();
};
const demo = async (page: Page) => {
  await page.getByRole("button", { name: "Try Demo", exact: true }).click();
  await expect(page.locator(".demo-status")).toHaveText("Fictional demo");
};
async function exported(page: Page) {
  const download = page.waitForEvent("download");
  await action(page, "Export project");
  return JSON.parse(await readFile((await (await download).path())!, "utf8"));
}
for (const [standard, scenario, count] of [
  ["nist-csf-2", "Northstar Manufacturing", 106],
  ["iso-27001", "Meridian Energy", 10],
  ["pci-dss", "Harbour Payments", 12],
] as const) {
  for (const space of ["explore", "assess-simulate", "implement-plan"]) {
    test(
      space + " loads a complete editable " + standard + " scenario",
      async ({ page }) => {
        await page.goto(base + "/" + space + "?standard=" + standard);
        await demo(page);
        await expect(page.locator(".xc-workhead")).toContainText(scenario);
        const p = await exported(page);
        expect(p.framework).toBe(standard);
        expect(Object.keys(p.assessments)).toHaveLength(count);
        expect(p.tasks.length).toBeGreaterThan(8);
        expect(p.risks.length).toBeGreaterThan(0);
        expect(p.flow.length).toBeGreaterThan(0);
        if (space === "implement-plan")
          await expect(page.locator(".xc-ganttrow")).toHaveCount(
            p.tasks.length,
          );
      },
    );
  }
}
test("personal work, demo edits, reset, blank and JSON recovery use independent slots", async ({
  page,
}) => {
  await page.goto(base + "/explore");
  await page.getByRole("button", { name: "All controls", exact: true }).click();
  await page.getByLabel("current GV.OC-01", { exact: true }).selectOption("1");
  await page
    .getByLabel("Control owner", { exact: true })
    .fill("Personal owner");
  await page.keyboard.press("Escape");
  await demo(page);
  await page.getByRole("button", { name: "All controls", exact: true }).click();
  const d = page.getByRole("dialog");
  await d.getByLabel("current GV.OC-01", { exact: true }).selectOption("0");
  await d
    .getByLabel("Evidence status GV.OC-01", { exact: true })
    .selectOption("Requested");
  await d.getByLabel("Control owner", { exact: true }).fill("Demo reviewer");
  await page.keyboard.press("Escape");
  await demo(page);
  await page.reload();
  const copy = await exported(page);
  expect(copy.assessments["GV.OC-01"].owner).toBe("Demo reviewer");
  await action(page, "Reset Demo");
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  expect((await exported(page)).assessments["GV.OC-01"].current).toBe(0);
  await action(page, "Reset Demo");
  await page.getByRole("button", { name: "Confirm replacement" }).click();
  expect((await exported(page)).assessments["GV.OC-01"].owner).not.toBe(
    "Demo reviewer",
  );
  await action(page, "Return to my project");
  expect((await exported(page)).assessments["GV.OC-01"].owner).toBe(
    "Personal owner",
  );
  await action(page, "Start Blank");
  await page.getByRole("button", { name: "Confirm replacement" }).click();
  expect((await exported(page)).assessments).toEqual({});
  await page.getByLabel("Import project JSON").setInputFiles({
    name: "project.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(copy)),
  });
  await page.getByRole("button", { name: "Confirm replacement" }).click();
  expect((await exported(page)).assessments["GV.OC-01"].owner).toBe(
    "Demo reviewer",
  );
});
test("control ratings update profile, radar, evidence and linked remediation", async ({
  page,
}) => {
  await page.goto(base + "/explore?standard=pci-dss");
  await demo(page);
  const before = await page.locator(".xc-maturity b").innerText();
  const reviewed = await page.locator(".xc-kpis button").last().innerText();
  await page.getByRole("button", { name: "All controls", exact: true }).click();
  const field = page.getByLabel("current PCI-1", { exact: true });
  await field.selectOption("0");
  await page
    .getByLabel("Evidence status PCI-1", { exact: true })
    .selectOption("Missing");
  await page.getByRole("button", { name: "Create remediation task" }).click();
  await page.keyboard.press("Escape");
  await expect(page.locator(".xc-maturity b")).not.toHaveText(before);
  await expect(page.locator(".xc-kpis button").last()).not.toHaveText(reviewed);
  await page
    .getByRole("link", { name: "Governance radar", exact: true })
    .click();
  const radar = page.locator(".xc-radar").first().locator("polygon").last();
  const points = await radar.getAttribute("points");
  await page.getByLabel("Governance scope").selectOption("Operations");
  expect(await radar.getAttribute("points")).not.toBe(points);
  await page
    .getByRole("link", { name: "Implement & Plan", exact: true })
    .click();
  await expect(
    page.locator(".xc-ganttlabel").filter({ hasText: "Close PCI-1 gap" }),
  ).toBeVisible();
});
test("CSV, Excel and manual risk records recalculate risk distribution and treatment simulation", async ({
  page,
}) => {
  await page.goto(base + "/assess-simulate?view=matrix");
  await page
    .getByRole("button", { name: "Risk register", exact: true })
    .click();
  const csv =
    "id,asset,threat,likelihood,impact\nR-import,Gateway,Access review gap,5,4";
  const file = page.getByLabel("Import risk spreadsheet");
  await file.setInputFiles({
    name: "risks.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(csv),
  });
  await expect(page.getByRole("dialog")).toContainText("R-import");
  const book = new ExcelJS.Workbook();
  book.addWorksheet("Risks").addRows([
    ["id", "asset", "threat", "likelihood", "impact"],
    ["R-excel", "Archive", "Retention gap", 3, 3],
  ]);
  await file.setInputFiles({
    name: "more.xlsx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    buffer: Buffer.from(await book.xlsx.writeBuffer()),
  });
  await expect(page.getByRole("dialog")).toContainText("R-excel");
  await file.setInputFiles({
    name: "duplicate.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(csv),
  });
  await expect(page.getByRole("alert")).toContainText("duplicate");
  await page.getByRole("button", { name: "Add risk", exact: true }).click();
  await page.getByLabel("asset", { exact: true }).fill("Identity");
  await page.getByLabel("threat", { exact: true }).fill("Stale entitlement");
  await page.getByRole("button", { name: "Save risk", exact: true }).click();
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", {
      name: "Likelihood 5, impact 4, 1 risks",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: /R-import.*Access review gap/ })
    .click();
  await page
    .getByRole("combobox", { name: "Residual Likelihood", exact: true })
    .selectOption("1");
  await page.getByRole("button", { name: "Save risk", exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", {
      name: "Likelihood 1, impact 4, 1 risks",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Simulate treatment", exact: true })
    .click();
  const projection = page.locator(".xc-simresult b").last(),
    before = await projection.innerText();
  await page.getByRole("slider", { name: /Likelihood reduction/ }).fill("3");
  await expect(projection).not.toHaveText(before);
});
test("editing Gantt dates and effort reschedules dependencies and moving a Kanban task updates progress", async ({
  page,
}) => {
  await page.goto(base + "/implement-plan");
  await demo(page);
  const first = page.locator(".xc-ganttrow").first(),
    second = page.locator(".xc-ganttrow").nth(1);
  const before = await second.getAttribute("data-start");
  await first.locator(".xc-ganttlabel").click();
  await page.getByLabel("Effort (hours)").fill("120");
  await page.getByLabel("Owner", { exact: true }).fill("Test owner");
  await page.getByRole("button", { name: "Save and reschedule" }).click();
  expect((await second.getAttribute("data-start"))! > before!).toBe(true);
  await expect(
    page.locator(".xc-assignee").filter({ hasText: "Test owner" }),
  ).toBeVisible();
  await first.locator(".xc-ganttlabel").click();
  await page.getByLabel("Earliest start").fill("2027-06-01");
  await page.getByRole("button", { name: "Save and reschedule" }).click();
  await expect(first).toHaveAttribute("data-start", "2027-06-01");
  await page
    .getByRole("combobox", { name: "Planner view" })
    .selectOption("Kanban");
  const cols = page.locator(".xc-kanban section"),
    task = cols.nth(0).getByRole("button").first(),
    title = await task.locator("strong").innerText();
  await task.dragTo(cols.nth(2).locator("h4"), { steps: 8 });
  await expect(
    cols.nth(2).getByRole("button").filter({ hasText: title }),
  ).toBeVisible();
  await page.reload();
  await expect(first).toHaveAttribute("data-start", "2027-06-01");
});
test("graph inspection, experiment and privacy flow edits", async ({
  page,
}) => {
  await page.goto(base + "/explore?view=graph");
  await demo(page);
  await page.getByLabel("Search knowledge graph").fill("GV.OC-01");
  await page
    .locator(".xc-knowledge aside")
    .first()
    .getByRole("button", { name: "GV.OC-01", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Assess 1 controls", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText("GV.OC-01");
  await page.keyboard.press("Escape");
  await page
    .getByRole("link", { name: "Assess & Simulate", exact: true })
    .click();
  await page.getByRole("link", { name: "AI experiment", exact: true }).click();
  const before = await page.locator(".xc-confusion").innerText();
  await page
    .getByRole("slider", { name: "Decision threshold", exact: true })
    .fill("0.82");
  await expect(page.locator(".xc-confusion")).not.toHaveText(before);
  await page.getByRole("link", { name: "Data flow map", exact: true }).click();
  await page
    .getByRole("button", { name: "Edit Factory sensors", exact: true })
    .click();
  await page.getByLabel("System name").fill("North plant meters");
  await page.getByRole("button", { name: "Save system", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Edit North plant meters", exact: true }),
  ).toBeVisible();
});
test("main-site navigation, resource links, themes, keyboard and responsive layouts", async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/about-x1");
  await page
    .getByRole("navigation", { name: "Primary navigation" })
    .getByRole("link", { name: "X1 Academic", exact: true })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "X1 Academic",
  );
  await expect(
    page
      .getByRole("navigation", { name: "Academic resources" })
      .getByRole("link"),
  ).toHaveCount(3);
  for (const theme of ["Light", "Dark"]) {
    await page.getByRole("button", { name: "Open theme selector" }).click();
    await page
      .getByRole("menuitemradio", { name: "Activate " + theme + " theme" })
      .click();
    const audit = await new AxeBuilder({ page })
      .include(".xc")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(audit.violations.map((v) => v.id)).toEqual([]);
  }
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 780 });
    for (const [space, views] of [
      ["explore", ["profile", "graph", "governance"]],
      [
        "assess-simulate",
        ["risk", "matrix", "executive", "experiment", "flow"],
      ],
      ["implement-plan", ["planner"]],
    ] as const) {
      for (const view of views) {
        await page.goto(base + "/" + space + "?view=" + view);
        await demo(page);
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth),
          view + " at " + width,
        ).toBeLessThanOrEqual(width);
      }
    }
  }
  await page
    .getByRole("button", { name: "Academic menu", exact: true })
    .click();
  await expect(
    page.getByRole("navigation", { name: "Academic menu links" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Project actions", exact: true })
    .first()
    .focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("bookmarked dashboards open their rebuilt views and historic project links keep their editor", async ({
  page,
}) => {
  await page.goto(base + "/implement?standard=iso-27001");
  await expect(
    page.getByRole("heading", { name: "Implement & Plan", exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Standard edition")).toHaveValue("iso-27001");
  await page.goto(base + "/knowledge-graph");
  await expect(
    page.getByRole("group", { name: "Framework relationships" }),
  ).toBeVisible();
  await page.goto(base + "/implement?standard=dora");
  await expect(
    page.getByRole("button", { name: "Generate seven-stage project" }),
  ).toBeVisible();
});
test("dashboard accessibility in dark and light themes", async ({ page }) => {
  test.setTimeout(120000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const failures: string[] = [];
  for (const [space, views] of [
    ["explore", ["profile", "graph", "governance"]],
    ["assess-simulate", ["risk", "matrix", "executive", "experiment", "flow"]],
    ["implement-plan", ["planner"]],
  ] as const) {
    for (const view of views) {
      await page.goto(base + "/" + space + "?view=" + view);
      await demo(page);
      for (const theme of ["Dark", "Light"]) {
        await page.getByLabel("Open theme selector").click();
        await page
          .getByRole("menuitemradio", { name: "Activate " + theme + " theme" })
          .click();
        const result = await new AxeBuilder({ page })
          .include(".xc")
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze();
        for (const v of result.violations)
          failures.push(
            view +
              " " +
              theme +
              " " +
              v.id +
              " " +
              JSON.stringify(
                v.nodes.slice(0, 3).map((n) => [n.target, n.any[0]?.data]),
              ),
          );
      }
    }
  }
  expect(failures).toEqual([]);
});
