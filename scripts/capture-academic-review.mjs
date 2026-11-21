// Run against a locally served production build. Inputs are fictional and entered through the UI.
import { chromium } from "@playwright/test";
import { existsSync } from "node:fs";
import { readFile, writeFile, mkdir } from "node:fs/promises";
const origin = process.env.X1_REVIEW_ORIGIN || "http://127.0.0.1:4176";
const dir = "docs/x1-academic/v2/screenshots/";
await mkdir("docs/x1-academic/v2/examples", { recursive: true });
const browser = await chromium.launch({
  executablePath:
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
    (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
  args: ["--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } }),
  errors = [],
  requests = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("request", (r) => requests.push(r.url()));
async function capture(name) {
  await page.evaluate(() => {
    document.activeElement?.blur();
    window.scrollTo(0, 0);
  });
  await page.screenshot({ path: dir + name + ".png", fullPage: true });
}
async function closeGuide() {
  const b = page.getByRole("button", {
    name: "Close explanation",
    exact: true,
  });
  if (await b.isVisible()) await b.click();
}
await page.goto(origin + "/x1-academic/");
await page.locator(".xs-home-hero").waitFor();
await capture("after-overview-dark-desktop");
const homeRequests = [...requests];
await page.getByRole("button", { name: "Switch to light theme" }).click();
await capture("after-overview-light-desktop");
await page.setViewportSize({ width: 390, height: 844 });
await capture("after-overview-mobile");
await page.setViewportSize({ width: 1600, height: 1000 });
await page.getByRole("button", { name: "Switch to dark theme" }).click();
await page
  .getByRole("link", { name: "Start a guided assessment", exact: true })
  .click();
await page.getByRole("button", { name: "Use fictional case context" }).click();
await page.getByLabel("Assessment period end").fill("2026-12-31");
await page
  .getByRole("button", { name: "Continue to outcome assessment" })
  .click();
for (let i = 0; i < 6; i++) {
  await page.locator(".xs-functions button").nth(i).click();
  await closeGuide();
  await page
    .getByLabel("Accountable assessment owner")
    .fill("Fictional service owner");
  await page
    .getByLabel("Current X1 maturity level", { exact: true })
    .selectOption(String([1, 2, 2, 1, 1, 0][i]));
  await page
    .getByLabel("Target X1 maturity level", { exact: true })
    .selectOption("3");
  await page
    .getByLabel("Current state narrative")
    .fill(
      "Illustrative Current Profile exercise input; independent operating evidence not tested.",
    );
  await page
    .getByLabel("Target outcome narrative")
    .fill(
      "A defined, managed outcome within the declared fictional service scope.",
    );
  await page
    .getByLabel("Rating rationale and assessment limitations")
    .fill(
      "Screenshot exercise assumption, recorded explicitly on the X1 educational scale. This fictional input is not certification or independent assurance.",
    );
  await page.getByRole("button", { name: "Record profile outcome" }).click();
}
await page.getByRole("button", { name: "Review recorded gaps" }).click();
await capture("after-csf-profile-desktop");
await page
  .locator(".xa-grid.two")
  .first()
  .screenshot({ path: dir + "after-csf-charts.png" });
await page.setViewportSize({ width: 390, height: 844 });
await capture("after-csf-profile-mobile");
await page.setViewportSize({ width: 1600, height: 1000 });
for (let i = 0; i < 6; i++)
  await page
    .getByRole("button", { name: "Create remediation action", exact: true })
    .first()
    .click();
await page.getByRole("link", { name: "Implement", exact: true }).click();
await page.getByLabel("Project start date").fill("2026-12-01");
await page
  .getByRole("button", { name: "Generate seven-stage project" })
  .click();
await page.getByRole("button", { name: "Capture plan baseline" }).click();
await capture("after-implementation-desktop");
await page.setViewportSize({ width: 1600, height: 1800 });
await page
  .locator(".xs-gantt")
  .evaluate((el) => el.scrollIntoView({ block: "start" }));
await page.evaluate(() => window.scrollBy(0, -105));
await page
  .locator(".xs-gantt")
  .screenshot({ path: dir + "after-gantt-detail.png" });
await page.setViewportSize({ width: 1600, height: 1000 });
await page
  .locator(".xs-gantt")
  .evaluate((el) => el.scrollIntoView({ block: "start" }));
await page.evaluate(() => window.scrollBy(0, -105));
await page.screenshot({ path: dir + "after-gantt-desktop.png" });
await page.getByRole("link", { name: "Report", exact: true }).click();
await page.getByRole("button", { name: "Generate immutable report" }).click();
await page.getByRole("button", { name: "Executive", exact: true }).click();
await capture("after-executive-report");
await page.getByRole("link", { name: "Simulate", exact: true }).click();
await page.locator('a[href="/x1-academic/simulate/privacy"]').click();
await page
  .getByRole("button", { name: "Load fictional processing scenario" })
  .click();
await page
  .getByRole("button", { name: "Record processing activity", exact: true })
  .click();
await page
  .getByLabel("Privacy event / problematic data action")
  .fill("Transaction metadata reused beyond the declared fraud-review purpose");
await page
  .getByLabel("Potential harm to individuals")
  .fill("Unfair service exclusion and loss of autonomy");
await page
  .getByLabel("Privacy risk owner", { exact: true })
  .fill("Fictional privacy officer");
await page
  .getByLabel("Residual-rating rationale, evidence and uncertainty")
  .fill(
    "Illustrative 3×3 judgement before independent testing; no change assumed from a proposed control.",
  );
await page
  .getByRole("button", { name: "Record privacy finding", exact: true })
  .click();
await page
  .getByRole("button", {
    name: "Create privacy remediation action",
    exact: true,
  })
  .click();
await capture("after-privacy-desktop");
await page
  .locator(".xs-flow")
  .first()
  .screenshot({ path: dir + "after-privacy-flow.png" });
await page.locator(".xa-project-controls summary").click();
const pending = page.waitForEvent("download");
await page
  .getByRole("button", { name: "Export project JSON", exact: true })
  .click();
await writeFile(
  "docs/x1-academic/v2/examples/fictional-connected-project.json",
  await readFile(await (await pending).path()),
);
await page.goto(origin + "/x1-academic/standards/800-53/");
await page.getByRole("heading", { name: /AC-2/ }).waitFor();
await capture("after-nist-controls-desktop");
await page.goto(origin + "/x1-academic/labs/risk-decision/");
await page.getByRole("button", { name: "Analyse risks", exact: true }).click();
await capture("after-risk-desktop");
await page.goto(origin + "/x1-academic/knowledge-graph/");
await page.getByRole("button", { name: "Expand clusters" }).click();
await capture("after-graph-desktop");
await page.goto(origin + "/x1-academic/labs/ai-experiment/");
await page.getByTestId("recall").waitFor();
await capture("after-ai-desktop");
const evidence = {
  pageErrors: errors,
  homeLoadedNist: homeRequests.some((x) => x.includes("sp80053-catalog")),
  homeLoadedExcel: homeRequests.some(
    (x) => x.includes("exceljs") || x.includes("xlsx.worker"),
  ),
  homeResourceCount: homeRequests.length,
  fictionalInputs:
    "Six explicitly entered CSF current ratings [1,2,2,1,1,0], target 3; 6 linked actions plus 9 lifecycle tasks; one privacy finding 3×3 and its explicit action. No assumed score change from task creation.",
};
await writeFile(
  "docs/x1-academic/v2/screenshots/browser-evidence.json",
  JSON.stringify(evidence, null, 2) + "\n",
);
await browser.close();
if (errors.length) throw new Error(errors.join("\n"));
console.log(
  "Captured review screens and exported the fictional project through the UI.",
);
