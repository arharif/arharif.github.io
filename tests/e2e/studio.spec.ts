import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";
const base = "/x1-academic";
async function closeGuide(page: Page) {
  const b = page.getByRole("button", {
    name: "Close explanation",
    exact: true,
  });
  if (await b.isVisible()) await b.click();
}
async function jsonDownload(page: Page, name: string) {
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name, exact: true }).click();
  return JSON.parse(await readFile((await (await pending).path())!, "utf8"));
}
async function scope(page: Page) {
  await page
    .getByRole("button", { name: "Use fictional case context" })
    .click();
  await page
    .getByRole("button", { name: "Continue to outcome assessment" })
    .click();
}
async function assess(page: Page) {
  await page
    .getByLabel("Accountable assessment owner")
    .fill("Payments service owner");
  await page
    .getByLabel("Current X1 maturity level", { exact: true })
    .selectOption("1");
  await page
    .getByLabel("Target X1 maturity level", { exact: true })
    .selectOption("3");
  await page
    .getByLabel("Rating rationale and assessment limitations")
    .fill(
      "A learner assertion based on the fictional scenario; operating evidence is not yet tested.",
    );
  await page.getByRole("button", { name: "Record profile outcome" }).click();
}
test("novice CSF profile → gap → risk → task → dependency schedule → immutable report → saved recovery", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(base);
  await page
    .getByRole("link", { name: "Previous Academy projects", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Continue to outcome assessment" })
    .click();
  await expect(page.getByRole("alert")).toContainText("Complete mission");
  await scope(page);
  await page.getByRole("button", { name: "Record profile outcome" }).click();
  await expect(page.getByRole("alert")).toContainText("owner");
  await assess(page);
  await page.getByRole("button", { name: "Review recorded gaps" }).click();
  await expect(
    page.getByRole("button", { name: /Current → target/ }),
  ).toContainText("1.0 → 3.0");
  await page.getByLabel("Linked risk for GV.OC-01").selectOption("R-001");
  await page
    .getByRole("button", { name: "Create remediation action", exact: true })
    .click();
  await page.getByRole("link", { name: "Open action →", exact: true }).click();
  await expect(page.getByLabel("Implementation task title")).toHaveValue(
    /Close GV.OC-01/,
  );
  await page.getByLabel("Earliest requested start").fill("2027-02-08");
  await page.getByLabel("Target deadline").fill("2027-02-15");
  await page
    .getByRole("button", { name: "Record implementation task" })
    .click();
  await expect(
    page.getByRole("table", {
      name: "Resource-levelled working-calendar schedule",
    }),
  ).toContainText("2027-02-08 → 2027-02-09");
  await page.getByRole("link", { name: "Report", exact: true }).click();
  await page.getByRole("button", { name: "Generate immutable report" }).click();
  const report = await jsonDownload(page, "Export complete report JSON");
  expect(report.summary.current).toBe(1);
  expect(report.summary.target).toBe(3);
  expect(report.findings[0].riskId).toBe("R-001");
  expect(report.plan[0].start).toBe("2027-02-08");
  expect(report.plan[0].end).toBe("2027-02-09");
  expect(report.plan[0].cost).toBe(1600);
  expect(report.findings[0].taskId).toBe(report.plan[0].id);
  await page.locator(".xa-project-controls summary").click();
  await page.getByLabel(/I understand this project is fictional/).check();
  await page
    .getByRole("button", { name: "Save fictional project", exact: true })
    .click();
  await expect(
    page.locator(".xa-project-controls [role=status]"),
  ).toContainText("saved on this device");
  await page.reload();
  await page.locator(".xa-project-controls summary").click();
  await page
    .getByRole("button", { name: "Restore saved project", exact: true })
    .click();
  await page.getByRole("button", { name: "Generate immutable report" }).click();
  const restored = await jsonDownload(page, "Export complete report JSON");
  expect(restored.findings).toEqual(report.findings);
  expect(restored.plan).toEqual(report.plan);
  await page.getByRole("link", { name: "Assess", exact: true }).click();
  await page
    .getByRole("navigation", { name: "Guided workflow steps" })
    .getByRole("button")
    .nth(1)
    .click();
  await page
    .getByLabel("Current X1 maturity level", { exact: true })
    .selectOption("2");
  await page.getByRole("button", { name: "Record profile outcome" }).click();
  await page.getByRole("link", { name: "Report", exact: true }).click();
  await page.getByRole("button", { name: "Generate immutable report" }).click();
  const edited = await jsonDownload(page, "Export complete report JSON");
  expect(edited.findings[0].id).toBe(report.findings[0].id);
  expect(edited.findings[0].riskId).toBe("R-001");
  expect(edited.findings[0].taskId).toBe(report.plan[0].id);
  expect(edited.plan).toHaveLength(1);
  expect(edited.summary.current).toBe(2);
  expect(errors).toEqual([]);
});
test("framework reset is scoped; unsaved editors survive navigation; full exports ignore display filters", async ({
  page,
}) => {
  await page.goto(`${base}/labs/framework-explorer`);
  await page.getByLabel("Action owner").fill("CSF draft owner");
  await page.getByRole("link", { name: "Find your learning path", exact: true }).click();
  await page.getByText("All workspaces", { exact: true }).click();
  await page
    .getByRole("link", { name: "Control & Framework Explorer", exact: true })
    .click();
  await expect(page.getByLabel("Action owner")).toHaveValue("CSF draft owner");
  await page
    .getByLabel("Assessment status", { exact: true })
    .selectOption("Not implemented");
  await page
    .getByRole("button", { name: "Save assessment", exact: true })
    .click();
  await page
    .getByLabel("Framework", { exact: true })
    .selectOption("nist-800-53");
  await page
    .getByLabel("Assessment status", { exact: true })
    .selectOption("Not implemented");
  await page.getByLabel("Action owner").fill("AC owner");
  await page
    .getByRole("button", { name: "Save assessment", exact: true })
    .click();
  await page
    .getByLabel("Framework", { exact: true })
    .selectOption("nist-csf-2");
  await page
    .getByRole("button", { name: "Reset scenario", exact: true })
    .click();
  await page
    .getByLabel("Framework", { exact: true })
    .selectOption("nist-800-53");
  await expect(page.getByLabel("Action owner")).toHaveValue("AC owner");
  await page
    .getByLabel("Framework", { exact: true })
    .selectOption("nist-csf-2");
  await page
    .getByLabel("Assessment status", { exact: true })
    .selectOption("Not implemented");
  await page
    .getByLabel("Action owner")
    .fill("New CSF owner after scoped reset");
  await page
    .getByRole("button", { name: "Save assessment", exact: true })
    .click();
  await page.getByLabel("Find an outcome or control").fill("no-such-outcome");
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export CSV", exact: true }).click();
  const csv = await readFile((await (await pending).path())!, "utf8");
  expect(csv.split("\r\n")).toHaveLength(107);
  expect(csv).toContain("GV.OC-01");
  expect(csv).toContain("RC.CO-04");
});
test("risk analysis uses current UTC date; pending date changes do not relabel the analysed snapshot", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2027-02-04T10:00:00Z") });
  await page.goto(`${base}/labs/risk-decision`);
  await expect(page.getByLabel("Analysis date", { exact: true })).toHaveValue(
    "2027-02-04",
  );
  await page
    .getByRole("button", { name: "Analyse risks", exact: true })
    .click();
  await closeGuide(page);
  await page.getByLabel("Analysis date", { exact: true }).fill("2027-02-08");
  const report = await jsonDownload(page, "Export risk JSON");
  expect(report.asOf).toBe("2027-02-04");
  expect(report.records.every((r: any) => r.asOf === "2027-02-04")).toBe(true);
});
test("privacy processing inventory → individual harm → edition-safe remediation and Gantt", async ({
  page,
}) => {
  await page.goto(`${base}/simulate/privacy?previous=1`);
  await page
    .getByRole("button", { name: "Load fictional processing scenario" })
    .click();
  await page
    .getByRole("button", { name: "Record processing activity", exact: true })
    .click();
  await page
    .getByLabel("Privacy event / problematic data action")
    .fill("Transaction features reused for unrelated customer profiling");
  await page
    .getByLabel("Potential harm to individuals")
    .fill("Unfair exclusion from essential payment services");
  await page
    .getByLabel("Privacy risk owner", { exact: true })
    .fill("Privacy officer");
  await page
    .getByLabel("Residual-rating rationale, evidence and uncertainty")
    .fill(
      "No operating evidence has been tested. Both scores are learner judgements.",
    );
  await page
    .getByRole("button", { name: "Record privacy finding", exact: true })
    .click();
  await page
    .getByRole("table", { name: /Findings for pf-1.0/ })
    .getByRole("button", { name: "Payment fraud review", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "Create privacy remediation action",
      exact: true,
    })
    .click();
  await page
    .getByLabel("Potential harm to individuals")
    .fill(
      "Unfair exclusion from essential payment services; revised exercise rationale.",
    );
  await page
    .getByRole("button", { name: "Record privacy finding", exact: true })
    .click();
  const report = await jsonDownload(page, "Export privacy assessment");
  expect(report.findings).toHaveLength(1);
  expect(report.findings[0].edition).toBe("pf-1.0");
  expect(report.findings[0].taskId).toBeTruthy();
  await page.getByLabel("Privacy Framework track").selectOption("pf-1.1-ipd");
  await expect(
    page.getByRole("button", { name: /Edition-specific findings/ }),
  ).toContainText("0");
  await page.getByLabel("Privacy Framework track").selectOption("pf-1.0");
  await expect(
    page.getByRole("button", { name: /Edition-specific findings/ }),
  ).toContainText("1");
  await page.getByRole("link", { name: "Implement", exact: true }).click();
  await expect(
    page.getByRole("table", {
      name: "Resource-levelled working-calendar schedule",
    }),
  ).toContainText("privacy");
  await page.getByRole("link", { name: "Report", exact: true }).click();
  await page.getByRole("button", { name: "Generate immutable report" }).click();
  const executive = await jsonDownload(page, "Export complete report JSON");
  expect(executive.privacy[0].taskId).toBe(executive.plan[0].id);
  expect(executive.plan[0].sources).toEqual([
    `privacy:${executive.privacy[0].id}`,
  ]);
});
test("NIST official source, baseline comparison and explicit reviewed control decisions", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(`${base}/standards/800-53`);
  await expect(page.getByRole("heading", { name: /AC-2/ })).toBeVisible();
  await expect(page.getByText(/1,014|1014/).first()).toBeVisible();
  await expect(page.getByLabel("Starting security baseline")).toHaveValue(
    "LOW",
  );
  await page.getByLabel("confidentiality impact").selectOption("High");
  await expect(page.getByLabel("Starting security baseline")).toHaveValue(
    "LOW",
  );
  await expect(
    page.getByText("Educational high-water mark suggests HIGH.", {
      exact: false,
    }),
  ).toBeVisible();
  await page.getByLabel("Starting security baseline").selectOption("HIGH");
  await page
    .getByLabel("System scope and information types")
    .fill(
      "Fictional payment identity service and its customer transaction metadata; gateway and account lifecycle boundary.",
    );
  await page
    .getByLabel("Categorisation rationale and security objectives")
    .fill(
      "High confidentiality impact is a declared exercise assumption, subject to information owner and authorisation review.",
    );
  const report = await jsonDownload(page, "Export complete selected baseline");
  expect(report.securityBaseline).toBe("HIGH");
  expect(report.controls.length).toBe(370);
  expect(report.controls.some((c: any) => c.id === "ac-2")).toBe(true);
  await page.getByRole("button", { name: "PRIVACY: 96", exact: true }).click();
  await closeGuide(page);
  await expect(
    page.getByLabel("NIST control or enhancement").locator("option"),
  ).toHaveCount(97);
  await expect(
    page.getByLabel(
      "Include the separate privacy baseline after reviewing applicability",
    ),
  ).not.toBeChecked();
  await page
    .getByRole("button", { name: "Return to selected control scope" })
    .click();
  await page
    .getByLabel(
      "Include the separate privacy baseline after reviewing applicability",
    )
    .check();
  await page
    .getByLabel("Privacy-baseline applicability rationale")
    .fill(
      "Fictional payment service processes customer information; privacy applicability is reviewed separately.",
    );
  const combined = await jsonDownload(
    page,
    "Export complete selected baseline",
  );
  expect(combined.controls).toHaveLength(423);
  expect(combined.privacyBaseline).toBe(true);
  await page
    .getByLabel("Control owner", { exact: true })
    .fill("Identity owner");
  await page
    .getByLabel("Applicability, tailoring and parameter rationale")
    .fill(
      "System-specific access lifecycle for the scoped payment service; parameters require owner approval.",
    );
  await page
    .getByLabel("Implementation status", { exact: true })
    .selectOption("Assessed");
  await page.getByRole("button", { name: "Review control decision" }).click();
  await expect(page.getByRole("alert")).toContainText("needs evidence");
  await page
    .getByLabel("Control evidence reference")
    .fill("Synthetic access sample AC-01");
  await page
    .getByLabel("Scoped assessment objective")
    .fill(
      "Determine whether account lifecycle approvals are recorded for the scoped population.",
    );
  await page
    .getByLabel("Illustrative test procedure and sampling plan")
    .fill(
      "Examine five fictional approval records; record coverage and exceptions.",
    );
  await page
    .getByLabel("Assessment finding and remaining uncertainty")
    .fill(
      "Illustrative sample contains one missing approval; remaining operating population is untested.",
    );
  await page.getByRole("button", { name: "Review control decision" }).click();
  await page
    .getByRole("button", { name: "Create control implementation task" })
    .click();
  await page.getByRole("link", { name: "Report", exact: true }).click();
  await page.getByRole("button", { name: "Generate immutable report" }).click();
  const executive = await jsonDownload(page, "Export complete report JSON");
  expect(executive.sp.decisions["ac-2"].reviewed).toBe(true);
  expect(executive.sp.decisions["ac-2"].evidence).toBe(
    "Synthetic access sample AC-01",
  );
  expect(executive.plan[0].sources).toContain("control:nist-800-53:ac-2");
  await expect(
    page
      .getByRole("table", {
        name: "Recorded NIST system control decisions in this report snapshot",
      })
      .first(),
  ).toContainText("one missing approval");
  expect(errors).toEqual([]);
});
test("saved project rejects malformed lab data and bad versions without losing open state", async ({
  page,
}) => {
  await page.goto(`${base}/assess?previous=1`);
  await scope(page);
  await assess(page);
  await page.locator(".xa-project-controls summary").click();
  const project = await jsonDownload(page, "Export project JSON");
  const invalid = structuredClone(project);
  invalid.data.labDrafts = {
    "guided-assessment": { draft: { current: "arbitrary" } },
  };
  await page.getByLabel("Import project JSON", { exact: true }).setInputFiles({
    name: "invalid.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(invalid)),
  });
  await expect(
    page.locator(".xa-project-controls [role=status]"),
  ).toContainText("schema/version is invalid");
  const unchanged = await jsonDownload(page, "Export project JSON");
  expect(unchanged.data.studio.findings).toEqual(project.data.studio.findings);
});
test("planning dependencies, RACI, baseline and validation are editable without inventing assurance", async ({
  page,
}) => {
  await page.goto(`${base}/implement?previous=1`);
  await page.getByLabel("Project start date").fill("2027-02-08");
  await page
    .getByRole("button", { name: "Generate seven-stage project" })
    .click();
  const before = await jsonDownload(page, "Export implementation project");
  expect(before.tasks).toHaveLength(21);
  expect(
    before.tasks.every(
      (t: any) => t.owner && t.accountable && t.sourceIds.length,
    ),
  ).toBe(true);
  expect(
    before.schedule.find((r: any) => r.task.stage === "DIAGNOSE").start,
  ).toBe("2027-02-09");
  await page.getByRole("button", { name: "Capture plan baseline" }).click();
  await page
    .getByRole("table", { name: "Resource-levelled working-calendar schedule" })
    .getByRole("button", { name: "FRAME: Scope & mobilise", exact: true })
    .click();
  await closeGuide(page);
  await page.getByText("Finish-to-start dependencies", { exact: true }).click();
  await page
    .getByLabel("DIAGNOSE: Understand current state", { exact: true })
    .check();
  await page
    .getByRole("button", { name: "Record implementation task" })
    .click();
  await expect(page.getByRole("alert")).toContainText("Circular");
  await page
    .getByLabel("DIAGNOSE: Understand current state", { exact: true })
    .uncheck();
  await page
    .getByLabel("Task status", { exact: true })
    .selectOption("Validated");
  await page
    .getByRole("button", { name: "Record implementation task" })
    .click();
  await expect(page.getByRole("alert")).toContainText("passed test");
  await page.getByLabel("Implementation progress (0–100)").fill("100");
  await page
    .getByLabel("Validation result", { exact: true })
    .selectOption("Passed");
  await page
    .getByLabel("Validation reviewer")
    .fill("Independent educational reviewer");
  await page
    .getByLabel("Validation evidence reference")
    .fill("Synthetic signed test record T-01");
  await page
    .getByRole("button", { name: "Record implementation task" })
    .click();
  const after = await jsonDownload(page, "Export implementation project");
  expect(after.baseline).toHaveLength(before.tasks.length);
  expect(after.tasks[0].status).toBe("Validated");
  expect(after.tasks[0].validation).toBe("Passed");
  expect(after.schedule.map((r: any) => [r.start, r.end])).toEqual(
    before.schedule.map((r: any) => [r.start, r.end]),
  );
});
test("tutorial keyboard focus, search, consistent explanation mode and legacy lab draft recovery", async ({
  page,
}) => {
  await page.goto(base + "/learning");
  await page.getByRole("button", { name: "Open interactive tutorial" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Open interactive tutorial" }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Open interactive tutorial" }).click();
  for (let i = 0; i < 3; i++)
    await page.getByRole("button", { name: "Next tutorial step" }).click();
  await page
    .getByLabel("No; scope, test evidence and review are still needed")
    .check();
  await page.getByRole("button", { name: "Check tutorial answer" }).click();
  await expect(page.getByRole("dialog").getByRole("status")).toContainText(
    "Correct",
  );
  await page.getByRole("button", { name: "Close tutorial" }).click();
  await page.getByLabel("Academy explanation mode").selectOption("Executive");
  await page.getByLabel("Search academy").fill("privacy");
  await page.locator(".xs-search-results").getByRole("link").first().click();
  await expect(page.getByLabel("Academy explanation mode")).toHaveValue(
    "Executive",
  );
  await page.getByText("All workspaces", { exact: true }).click();
  await page
    .getByRole("link", { name: "Cyber Incident Lab", exact: true })
    .click();
  await page
    .getByLabel("Investigation notes, competing explanation and uncertainty")
    .fill("Unrecorded incident hypothesis retained between routes.");
  await page.getByRole("link", { name: "Find your learning path", exact: true }).click();
  await page
    .getByRole("link", { name: "Cyber Incident Lab", exact: true })
    .click();
  await expect(
    page.getByLabel(
      "Investigation notes, competing explanation and uncertainty",
    ),
  ).toHaveValue("Unrecorded incident hypothesis retained between routes.");
});
for (const route of [
  "/standards",
  "/standards/800-53",
  "/simulate",
  "/simulate/privacy",
  "/assess",
  "/implement",
  "/report",
])
  test(`new route refresh, accessibility and responsive layout ${route}`, async ({
    page,
  }) => {
    test.setTimeout(60000);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(`${base}${route}?previous=1`);
    await expect(page.locator(".xa main h1")).toBeVisible();
    await page.reload();
    await expect(page.locator(".xa main h1")).toBeVisible();
    if (route === "/standards/800-53")
      await expect(page.getByRole("heading", { name: /AC-2/ })).toBeVisible();
    for (const theme of ["dark", "light"]) {
      if (theme === "light")
        await page
          .getByRole("button", { name: "Switch to light theme" })
          .click();
      const result = await new AxeBuilder({ page })
        .include(".xa")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(
        result.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.target),
        })),
      ).toEqual([]);
    }
    for (const width of [320, 390, 768]) {
      await page.setViewportSize({ width, height: 844 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
    expect(errors).toEqual([]);
  });
