import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";
const base = "/x1-academic";
const reasoning =
  "The payment service faces residual exposure. Our assumption needs evidence from a tested sample. The budget and cost require owner approval by the risk committee.";
test("academy sections, route refresh, metadata and static teaching content", async ({
  page,
  request,
}) => {
  const errors: string[] = [];
  const consoleDetails: unknown[] = [];
  const detailTasks: Promise<void>[] = [];
  const cspViolations: string[] = [];
  await page.addInitScript(() => {
    (window as any).__x1CspViolations = [];
    window.addEventListener("securitypolicyviolation", (event) => {
      (window as any).__x1CspViolations.push(
        `${event.violatedDirective}: ${event.blockedURI}`,
      );
    });
  });
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text());
      detailTasks.push(
        Promise.all(
          message.args().map((arg) =>
            arg.evaluate((value) => ({
              name: value?.name,
              message: value?.message,
              stack: value?.stack,
            })),
          ),
        )
          .then((args) => {
            consoleDetails.push({ location: message.location(), args });
          })
          .catch((error) => {
            consoleDetails.push({
              location: message.location(),
              unavailable: String(error),
            });
          }),
      );
    }
  });
  page.on("response", (response) => {
    if (response.url().includes("/assets/") && response.status() >= 400)
      errors.push(response.url());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(base);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "X1 Academic",
  );
  cspViolations.push(
    ...(await page.evaluate(() => (window as any).__x1CspViolations)),
  );
  for (const route of [
    "learning",
    "cybersecurity",
    "grc",
    "artificial-intelligence",
    "labs",
    "frameworks",
    "case-studies",
    "security-map",
    "certifications",
    "resources",
    "assistant",
    "progress",
  ]) {
    await page.goto(`${base}/${route}`);
    await expect(page.locator(".xa main h1")).toBeVisible();
    cspViolations.push(
      ...(await page.evaluate(() => (window as any).__x1CspViolations)),
    );
  }
  await page.goto(`${base}/learning/risk-assessment`);
  await expect(page.locator(".xa main h1")).toHaveText(
    "Enterprise Risk and Cyber Risk Assessment",
  );
  cspViolations.push(
    ...(await page.evaluate(() => (window as any).__x1CspViolations)),
  );
  await page.reload();
  await expect(page.locator(".xa main h1")).toHaveText(
    "Enterprise Risk and Cyber Risk Assessment",
  );
  const html = await (
    await request.get(`${base}/learning/risk-assessment`)
  ).text();
  expect(html).toContain("Write a cause");
  expect(html).toContain("application/ld+json");
  cspViolations.push(
    ...(await page.evaluate(() => (window as any).__x1CspViolations)),
  );
  await Promise.all(detailTasks);
  if (errors.length)
    await test.info().attach("console-error-details", {
      body: JSON.stringify(consoleDetails, null, 2),
      contentType: "application/json",
    });
  expect(errors).toEqual([]);
  expect(cspViolations).toEqual([]);
});
test("framework hierarchy, evidence validation, assessment and gap export", async ({
  page,
}) => {
  await page.goto(`${base}/labs/framework-explorer`);
  await page.getByRole("button", { name: /PR.AA-05/ }).click();
  await expect(
    page.getByRole("heading", {
      name: "Review access permissions",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByLabel("Assessment status", { exact: true })
    .selectOption("Implemented and evidenced");
  await page.getByRole("button", { name: "Save assessment" }).click();
  await expect(page.getByRole("status")).toContainText("evidence reference");
  await page.getByLabel("Action owner").fill("Payments owner");
  await page
    .getByLabel("Evidence reference and assessment period")
    .fill("Synthetic access sample AC-01, November");
  await page.getByRole("button", { name: "Save assessment" }).click();
  await expect(page.getByRole("status")).toContainText("saved");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON" }).click();
  const file = await download;
  const data = JSON.parse(await readFile((await file.path())!, "utf8"));
  expect(data.results.summary.evidenced).toBe(1);
  await page.getByRole("button", { name: "Reset scenario" }).click();
  await expect(
    page.getByRole("button", { name: "Export JSON" }),
  ).toBeDisabled();
});
test("risk workflow exports actual decisions and imports context in boardroom", async ({
  page,
}) => {
  await page.goto(`${base}/labs/risk-decision`);
  await page
    .getByRole("button", { name: "Decision simulator", exact: true })
    .click();
  await page
    .getByLabel("Effectiveness evidence, limitations and uncertainty")
    .fill(
      "Assumption that access reviews work. Obtain an independent test sample.",
    );
  await page.getByLabel("Accountable decision owner").fill("Head of Payments");
  await page
    .getByLabel("Review date or escalation trigger")
    .fill("Review in 30 days or upon control failure");
  await page.getByLabel("Committee reasoning").fill(reasoning);
  await page
    .getByRole("button", { name: "Challenge my recommendation" })
    .click();
  await expect(page.getByRole("status")).toContainText("coverage check");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON" }).click();
  const file = await download;
  const path = (await file.path())!;
  const data = JSON.parse(await readFile(path, "utf8"));
  expect(data.results.accountableOwner).toBe("Head of Payments");
  expect(data.results.residual.index).toBe(12);
  await page.getByRole("button", { name: "Reset scenario" }).click();
  await expect(page.getByLabel("Accountable decision owner")).toHaveValue("");
  await expect(
    page.getByRole("button", { name: "Export JSON" }),
  ).toBeDisabled();
  await page.goto(`${base}/labs/ciso-boardroom`);
  await page.getByText("Import lab context (JSON)", { exact: true }).click();
  await page.getByLabel("Import case-state JSON").setInputFiles({
    name: "case.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(data)),
  });
  await expect(
    page.getByText("Imported context", { exact: false }),
  ).toBeVisible();
});
test("incident evidence, hypothesis, response and report generation", async ({
  page,
}) => {
  await page.goto(`${base}/labs/cyber-incident`);
  await page.getByLabel("Mark E01").check();
  await page.getByLabel("Mark E03").check();
  await page.getByLabel("Mark E04").check();
  await page
    .getByLabel("Working hypothesis")
    .selectOption("Possible supplier account compromise");
  await page.getByRole("button", { name: "Review evidence chain" }).click();
  await expect(page.getByRole("status")).toContainText(
    "supports suspected misuse",
  );
  await page
    .getByRole("button", { name: "Preserve the evidence snapshot" })
    .click();
  await page
    .getByLabel("Investigation notes, competing explanation and uncertainty")
    .fill(
      "Correlated supplier session with a change. Scope and attribution remain uncertain.",
    );
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON" }).click();
  const data = JSON.parse(
    await readFile((await (await download).path())!, "utf8"),
  );
  expect(data.results.evidenceExamined).toHaveLength(3);
  expect(data.results.decisions[0].id).toBe("preserve");
  await page.getByRole("button", { name: "Reset scenario" }).click();
  await expect(page.getByLabel("Mark E01")).not.toBeChecked();
});
test("AI controls calculate, compare, persist and reset reproducible results", async ({
  page,
}) => {
  await page.goto(`${base}/labs/ai-experiment`);
  const before = await page.getByTestId("recall").textContent();
  await page.getByRole("button", { name: "Add to comparison" }).click();
  await page
    .getByLabel("Classification threshold", { exact: true })
    .fill("0.9");
  expect(await page.getByTestId("recall").textContent()).not.toEqual(before);
  await page.getByRole("button", { name: "Add to comparison" }).click();
  await expect(
    page
      .getByRole("table", { name: "Up to four recorded configurations" })
      .locator("tbody tr"),
  ).toHaveCount(2);
  await page.getByRole("button", { name: "Save configuration" }).click();
  await page.reload();
  await expect(
    page.getByLabel("Classification threshold", { exact: true }),
  ).toHaveValue("0.9");
  await page.getByRole("button", { name: "Reset scenario" }).click();
  await expect(
    page.getByLabel("Classification threshold", { exact: true }),
  ).toHaveValue("0.5");
});
test("boardroom constrains budgets and evaluates recorded decisions", async ({
  page,
}) => {
  await page.goto(`${base}/labs/ciso-boardroom`);
  await page.getByLabel("Executive scenario").selectOption("2");
  await page
    .getByLabel("Access review & privileged identity", { exact: true })
    .check();
  await page
    .getByLabel("Correlated telemetry & response exercise", { exact: true })
    .check();
  await page.getByLabel("Accountable programme owner").fill("Programme lead");
  await page.getByLabel("Executive briefing").fill(reasoning);
  await page
    .getByRole("button", { name: "Evaluate briefing coverage" })
    .click();
  await expect(page.getByRole("status")).toContainText("keyword cues");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON" }).click();
  const data = JSON.parse(
    await readFile((await (await download).path())!, "utf8"),
  );
  expect(data.results.budgetAssumptions.cost).toBe(55);
  expect(data.results.roadmap).toHaveLength(2);
  await page
    .getByLabel("Recovery validation & resilience test", { exact: true })
    .check();
  await page
    .getByLabel("Independent evidence sampling", { exact: true })
    .check();
  await expect(page.getByRole("alert")).toContainText("Budget exceeded");
  await expect(
    page.getByRole("button", { name: "Export JSON" }),
  ).toBeDisabled();
  await page.getByLabel("Fictional organisation").selectOption("petroshield");
  await expect(page.getByLabel("Accountable programme owner")).toHaveValue("");
  await expect(
    page.getByLabel("Access review & privileged identity", { exact: true }),
  ).not.toBeChecked();
  await page.getByRole("button", { name: "Reset scenario" }).click();
  await expect(
    page.getByRole("button", { name: "Export JSON" }),
  ).toBeDisabled();
});
test("learning assessment, explicit completion, local progress and bookmarks", async ({
  page,
}) => {
  await page.goto(`${base}/learning/risk-assessment`);
  await page.getByLabel("Activity reasoning").fill(reasoning);
  await page.getByLabel("The authorised risk owner under").check();
  await page.getByRole("button", { name: "Check answer" }).click();
  await page
    .getByRole("button", { name: "Complete module", exact: true })
    .click();
  await expect(
    page.getByText("Module complete.", { exact: false }),
  ).toBeVisible();
  await page.goto(`${base}/progress`);
  await expect(
    page.getByText("Completed activity and knowledge check"),
  ).toBeVisible();
  await page.goto(`${base}/resources`);
  await page
    .getByRole("button", { name: "Bookmark resource", exact: true })
    .first()
    .click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Remove bookmark" }),
  ).toBeVisible();
  await page
    .getByLabel("Search resource catalogue")
    .fill("no-such-resource-xyz");
  await expect(
    page.getByRole("heading", { name: "No matching resources" }),
  ).toBeVisible();
});
test("navigator retrieves a real learning route and handles unknown material", async ({
  page,
}) => {
  await page.goto(`${base}/assistant`);
  await page.getByLabel("What would you like to learn?").fill("risk");
  await page.getByRole("button", { name: "Find learning material" }).click();
  await expect(
    page.getByRole("link", {
      name: "Enterprise Risk and Cyber Risk Assessment",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByLabel("What would you like to learn?").fill("zzzunknownzzz");
  await page.getByRole("button", { name: "Find learning material" }).click();
  await expect(
    page.getByText("I could not find a reliable match", { exact: false }),
  ).toBeVisible();
});
test("legacy routes still render and Pages fallback preserves query and fragment", async ({
  page,
}) => {
  for (const path of [
    "/",
    "/about-x1",
    "/security-mindmap",
    "/compliance-frameworks",
    "/academic-library",
    "/professional",
    "/personal",
    "/games",
    "/admin",
    "/login",
  ]) {
    await page.goto(path);
    await expect(page.locator("main")).toBeVisible();
    await expect(
      page.getByText("Unable to load page", { exact: true }),
    ).toHaveCount(0);
  }
  await page.goto(`${base}/unpublished-test?first=1&second=2#context`);
  await expect(page).toHaveURL(/unpublished-test\?first=1&second=2#context/);
  await expect(
    page.getByRole("heading", { name: "Learning page unavailable" }),
  ).toBeVisible();
});
for (const route of [
  "/learning",
  "/labs/framework-explorer",
  "/labs/risk-decision",
  "/labs/cyber-incident",
  "/labs/ai-experiment",
  "/labs/ciso-boardroom",
  "/learning/risk-assessment",
  "/resources",
  "/knowledge-graph",
]) {
  test(`accessibility and 320px layout ${route || "home"}`, async ({
    page,
  }) => {
    await page.goto(`${base}${route}?previous=1`);
    await expect(page.locator(".xa main h1")).toBeVisible();
    const results = await new AxeBuilder({ page })
      .include(".xa")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(
      results.violations.map((item) => ({
        id: item.id,
        nodes: item.nodes.map((node) => node.target),
      })),
    ).toEqual([]);
    await page.getByRole("button", { name: "Open theme selector" }).click();
    await page.getByRole("menuitemradio", { name: "Activate Cosmic Indigo" }).click();
    const darkResults = await new AxeBuilder({ page })
      .include(".xa")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(
      darkResults.violations.map((item) => ({
        id: item.id,
        nodes: item.nodes.map((node) => node.failureSummary),
      })),
    ).toEqual([]);
    await page.setViewportSize({ width: 320, height: 720 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.getByRole("button", { name: "Menu", exact: true }).click();
    await expect(
      page.getByRole("navigation", { name: "Academic navigation" }),
    ).toBeVisible();
    const first = await page.locator(".xa-sidebar a").nth(0).boundingBox();
    const second = await page.locator(".xa-sidebar a").nth(1).boundingBox();
    expect(second!.y).toBeGreaterThanOrEqual(first!.y + first!.height);
    await page.setViewportSize({ width: 768, height: 1024 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.keyboard.press("Tab");
    expect(
      await page.evaluate(() =>
        ["A", "BUTTON", "INPUT", "SELECT", "TEXTAREA", "SUMMARY"].includes(
          document.activeElement?.tagName || "",
        ),
      ),
    ).toBe(true);
  });
}
