import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";

const base = "/x1-academic";
const demoButton = (page: Page) =>
  page.getByRole("button", { name: "Load Completed Demo", exact: true });
async function loadDemo(page: Page) {
  await demoButton(page).click();
  await expect(page.locator(".xa-demo-label")).toHaveText("Fictional demo");
}
async function downloadProject(page: Page) {
  await page.locator(".xa-project-controls summary").click();
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export project JSON" }).click();
  return JSON.parse(await readFile((await (await pending).path())!, "utf8"));
}

test("main-site desktop and mobile navigation open Academy directly", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Primary navigation" })
    .getByRole("link", { name: "X1 Academic", exact: true })
    .click();
  await expect(page).toHaveURL(/\/x1-academic$/);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation menu" }).click();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "X1 Academic", exact: true })
    .click();
  await expect(page).toHaveURL(/\/x1-academic$/);
});

for (const [id, count, control] of [
  ["nist-csf-2", 106, "GV.OC-01"],
  ["iso-27001", 100, "A.8.34"],
  ["pci-dss", 280, "6.4.3"],
] as const) {
  test(`${id} control search, manual assessment and demo isolation`, async ({
    page,
  }) => {
    await page.goto(`${base}/assess?standard=${id}`);
    await page.getByRole("button", { name: "Controls", exact: true }).click();
    await page.getByLabel("Search controls").fill(control);
    await page
      .getByRole("button", { name: new RegExp(`^${control} ·`) })
      .click();
    await page.getByLabel("Finding owner").fill("Manual control owner");
    await page.getByLabel("Current educational level").selectOption("1");
    await page
      .getByLabel("Assessment rationale")
      .fill("Partial coverage across the selected service population.");
    await page
      .getByLabel("Evidence verification")
      .selectOption("Document reviewed");
    await page.getByRole("button", { name: "Save profile finding" }).click();
    await expect(
      page.locator(".xa-finding-editor [role=status]"),
    ).toContainText("Provide an evidence reference");
    await page.getByLabel("Evidence reference").fill("Example review sample");
    await page
      .getByLabel("Evidence reviewer")
      .fill("Fictional independent reviewer");
    await page.getByRole("button", { name: "Save profile finding" }).click();
    await expect(page.locator(".xe-standard-status")).toContainText(
      "Profile finding updated",
    );
    await loadDemo(page);
    await expect(page.locator(".xa-assess-kpis")).toContainText(
      `of ${count} indexed items`,
    );
    if (id === "nist-csf-2") {
      await page.getByRole("button", { name: "Govern categories" }).click();
      await page.getByText("Current / target values", { exact: true }).click();
      await page.getByRole("button", { name: "GV.OC", exact: true }).click();
      await expect(page.getByLabel("Filter profile records")).toHaveValue(
        "Category GV.OC",
      );
    }
    const artifact = await downloadProject(page);
    expect(artifact.demoId).toBe(id);
    expect(artifact.data.studio.findings.length).toBe(count);
    expect(
      artifact.data.studio.findings.some(
        (finding: { owner: string }) =>
          finding.owner === "Manual control owner",
      ),
    ).toBe(false);
    await page.getByRole("button", { name: "Return to my project" }).click();
    await page.getByRole("button", { name: "Findings", exact: true }).click();
    await expect(
      page.getByText("Manual control owner", { exact: true }),
    ).toBeVisible();
  });
}

for (const [route, demoId] of [
  ["/risk-register", "risk"],
  ["/simulate/privacy", "privacy"],
  ["/labs/cyber-incident", "incident"],
  ["/labs/ai-experiment", "ai"],
  ["/labs/ciso-boardroom", "boardroom"],
  ["/labs/framework-explorer", "nist-csf-2"],
  ["/standards/800-53", "nist-800-53"],
] as const) {
  test(`${route} opens an exportable, separate completed demo`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(base + route);
    await loadDemo(page);
    const artifact = await downloadProject(page);
    expect(artifact.demoId).toBe(demoId);
    expect(artifact.data.provenance).toContain("Fictional");
    await page.getByRole("button", { name: "Return to my project" }).click();
    await expect(demoButton(page)).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(390);
  });
}

test("risk demo charts open their source records and remain in the analysis snapshot", async ({
  page,
}) => {
  await page.goto(base + "/risk-register");
  await loadDemo(page);
  await page.getByRole("button", { name: /Critical risks/ }).click();
  await expect(
    page.getByRole("heading", { name: "Underlying records · Critical risks" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close explanation" }).click();
  await page.locator(".xa-risk-aging circle").first().click();
  await expect(
    page.getByRole("heading", { name: /Underlying records · DEMO/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close explanation" }).click();
  await expect(
    page.getByRole("group", {
      name: "Recorded risk ratings by date and severity",
    }),
  ).toBeVisible();
  await page.getByLabel("Analysis date").fill("2027-01-07");
  await expect(
    page.getByText("Draft changes are pending.", { exact: false }),
  ).toBeVisible();
});

test("privacy map node, edge and date/class filters resolve to real activity records", async ({
  page,
}) => {
  await page.goto(base + "/simulate/privacy");
  await loadDemo(page);
  await page
    .getByLabel("Data class", { exact: true })
    .selectOption("Contact details");
  await expect(page.locator(".xa-privacy-node")).toHaveCount(4);
  await page
    .getByRole("button", {
      name: /Customer support: connection from Transfer to Processing/,
    })
    .click();
  await expect(
    page.getByRole("complementary", { name: "Selected data flow details" }),
  ).toContainText("Loss of control over contact information");
  await page
    .getByRole("button", { name: "Edit activity", exact: true })
    .click();
  await expect(page.getByLabel("Processing activity name")).toHaveValue(
    "Customer support",
  );
  await page.getByLabel("Recorded from").fill("2099-12-31");
  await expect(
    page.getByText("No activities match these filters."),
  ).toBeVisible();
});

test("PMO timeline recomputes after a task edit", async ({ page }) => {
  await page.goto(base + "/implement?standard=iso-27001");
  await loadDemo(page);
  await expect(
    page.getByRole("heading", { name: "Team assignments" }),
  ).toBeVisible();
  const gantt = page.getByRole("region", {
    name: "Interactive implementation Gantt",
  });
  await page.getByLabel("Gantt timeline view").selectOption("month");
  await gantt
    .getByRole("button", {
      name: /^FRAME: Approve the ISMS scope:.*implementation progress/,
    })
    .click();
  const close = page.getByRole("button", { name: "Close explanation" });
  if (await close.isVisible()) await close.click();
  await page.getByLabel("Responsible owner").fill("ISMS project lead");
  await page.getByLabel("Earliest requested start").fill("2027-02-08");
  await page
    .getByRole("button", { name: "Record implementation task" })
    .click();
  await expect(
    gantt.getByRole("button", {
      name: /FRAME: Approve the ISMS scope: 2027-02-08/,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Milestone tracking" }),
  ).toBeVisible();
  await expect(
    page.getByRole("table", {
      name: "Resource-levelled working-calendar schedule",
    }),
  ).toContainText("2027-02-08");
});

test("reference screens retain nine original PNG assets and full-size links", async ({
  page,
  request,
}) => {
  let count = 0;
  for (const path of [
    "/assess?standard=nist-csf-2",
    "/risk-register",
    "/knowledge-graph",
    "/labs/ai-experiment",
    "/report",
    "/implement",
    "/simulate/privacy",
  ]) {
    await page.goto(base + path);
    const images = page
      .getByRole("region", { name: "Reference screenshots" })
      .getByRole("img");
    await expect(images.first()).toBeVisible();
    for (const img of await images.all()) {
      await img.scrollIntoViewIfNeeded();
      await expect
        .poll(() =>
          img.evaluate((element: HTMLImageElement) => element.naturalWidth),
        )
        .toBe(709);
      const src = (await img.getAttribute("src"))!;
      const asset = await request.get(src);
      expect(asset.ok()).toBe(true);
      expect((await asset.body()).subarray(0, 8)).toEqual(
        Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
      );
      await expect(page.locator(`a[href="${src}"]`).first()).toHaveAttribute(
        "target",
        "_blank",
      );
      count += 1;
    }
  }
  expect(count).toBe(9);
});

test("loaded NIST and privacy dashboards meet automated accessibility checks", async ({
  page,
}) => {
  for (const route of ["/assess?standard=nist-csf-2", "/simulate/privacy"]) {
    await page.goto(base + route);
    await loadDemo(page);
    const results = await new AxeBuilder({ page })
      .include(".xa")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(
      results.violations.map(({ id, nodes }) => ({
        id,
        targets: nodes.map((node) => node.target),
      })),
    ).toEqual([]);
  }
});
