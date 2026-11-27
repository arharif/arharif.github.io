import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

const academic = "/x1-academic";
test("Academic offers one searchable framework directory with contextual learning links", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(academic);
  await expect(page.getByRole("heading", { name: "Frameworks & Standards", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: /^(Resources|More Standards|Expert Frameworks)$/ })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /^Explore / })).toHaveCount(8);
  await page.getByRole("searchbox", { name: "Search frameworks and standards" }).fill("climate");
  await expect(page.getByRole("link", { name: /^Explore / })).toHaveCount(0);
  await page.getByRole("searchbox", { name: "Search frameworks and standards" }).fill("27001");
  await expect(page.getByRole("link", { name: /^Explore / })).toHaveCount(1);
  await page.getByRole("link", { name: "Explore ISO/IEC 27001", exact: true }).click();
  const flows = page.getByRole("navigation", { name: "ISO/IEC 27001 workspaces" });
  await expect(flows.getByRole("link")).toHaveCount(3);
  await flows.getByRole("link", { name: /^Learn/ }).click();
  await expect(page.getByRole("link", { name: "Academic Library", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Security Mindmap", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Compliance Frameworks", exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test("NIST shows the official control tree, assessment methods and baseline tailoring", async ({ page }) => {
  await page.goto(academic + "/explore?standard=nist-800-53&view=learn");
  const areas = page.getByRole("group", { name: "Framework architecture areas" });
  await expect(areas.getByRole("button")).toHaveCount(20);
  await areas.getByRole("button", { name: "System and Services Acquisition" }).click();
  await page.getByRole("searchbox", { name: "Search within this framework area" }).fill("SA-15(13)");
  await page.getByText(/^SA-15 · Development Process/).click();
  const enhancement = page.getByText("SA-15(13) · Logging Syntax", { exact: true });
  await enhancement.click();
  const control = enhancement.locator("..");
  await control.getByText("NIST text and assessment procedures", { exact: true }).click();
  await expect(control.getByRole("heading", { name: "SP 800-53 control statement" })).toBeVisible();
  await control.getByText("SP 800-53A objectives and methods").click();
  await expect(control.getByRole("heading", { name: "EXAMINE" })).toBeVisible();

  await page.goto(academic + "/assess-simulate?standard=nist-800-53&view=profile");
  await page.getByText("System categorisation, baseline selection and documented tailoring", { exact: true }).click();
  await page.getByLabel("SP 800-53B starting baseline").selectOption("LOW");
  await expect(page.locator(".xc-profile-banner")).toContainText("149 controls");
  await page.getByLabel("Add active control or enhancement from an overlay").fill("SA-15(13)");
  await page.getByRole("button", { name: "Include control", exact: true }).click();
  await expect(page.locator(".xc-profile-banner")).toContainText("151 controls");
  await page.getByRole("button", { name: "All controls" }).click();
  await page.getByLabel("Find control").fill("SA-15(13)");
  await expect(page.getByRole("dialog").getByRole("heading", { name: "SA-15(13) · Logging Syntax" })).toBeVisible();
});

test("an assessment links its finding and a matching risk to an automatically scheduled work package", async ({ page }) => {
  await page.goto(academic + "/assess-simulate?standard=gdpr&view=profile");
  await page.getByRole("button", { name: "All controls" }).click();
  await page.getByLabel("current Art. 30", { exact: true }).selectOption("2");
  await page.keyboard.press("Escape");
  await page.getByRole("link", { name: "Remediation schedule" }).click();
  await expect(page.locator(".xc-ganttlabel").filter({ hasText: "Controller and processor controls" })).toBeVisible();
  await expect(page.getByText(/1 rated requirements are below/)).toBeVisible();
  await page.getByRole("link", { name: "Review risk and treatment" }).click();
  await page.getByRole("button", { name: "Risk register", exact: true }).click();
  await page.getByRole("button", { name: "Add risk", exact: true }).click();
  const form = page.getByRole("dialog", { name: "Edit risk" });
  await form.getByLabel("asset", { exact: true }).fill("Support processing");
  await form.getByLabel("threat", { exact: true }).fill("Unrecorded secondary disclosure");
  await form.getByLabel("controls", { exact: true }).fill("Art. 30");
  await form.getByRole("combobox", { name: "Residual Likelihood", exact: true }).selectOption("5");
  await form.getByRole("combobox", { name: "Residual Impact", exact: true }).selectOption("4");
  const id = (await form.locator("form > small").first().innerText()).trim();
  await form.getByRole("button", { name: "Save risk" }).click();
  await page.keyboard.press("Escape");
  await page.getByRole("link", { name: "Plan & Implement", exact: true }).click();
  const event = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export POA&M" }).click();
  const csv = await readFile((await (await event).path())!, "utf8");
  const packageRow = csv.split("\r\n").find((row) => row.includes("Controller and processor controls"));
  expect(packageRow).toContain(id);
  expect(packageRow).toContain("High");
  const planUrl = page.url();
  await page.getByRole("button", { name: "Try Demo", exact: true }).click();
  await expect(page.locator(".demo-status")).toContainText("SAMPLE DATA");
  await expect(page).toHaveURL(planUrl);
  await expect(page.locator(".xc-ganttrow").first()).toBeVisible();
  await page.getByRole("button", { name: "Start New Plan" }).click();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.locator(".demo-status")).toContainText("SAMPLE DATA");
});

test("ISO SoA keeps a pending decision separate from assessed applicability", async ({ page }) => {
  await page.goto(academic + "/assess-simulate?standard=iso-27001&view=profile");
  await page.getByRole("button", { name: /Organisational controls/ }).click();
  const dialog = page.getByRole("dialog", { name: "Organisational controls" });
  const decision = dialog.getByRole("combobox", { name: "Statement of Applicability decision", exact: true });
  await expect(decision).toHaveValue("Pending");
  await decision.selectOption("Included");
  await dialog.getByLabel("SoA justification and risk reference").fill("R-001 policy discrepancy");
  await page.keyboard.press("Escape");
  await page.getByRole("link", { name: "Remediation schedule" }).click();
  const event = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export SoA" }).click();
  const csv = await readFile((await (await event).path())!, "utf8");
  expect(csv.split("\r\n").find((row) => row.includes("A.5.1,") || row.includes('"A.5.1"'))).toContain("R-001 policy discrepancy");
  expect(csv).toContain("Included");
  expect(csv).toContain("Pending");
});

test("PCI search reveals the full ancestor chain of a deeply nested subrequirement", async ({ page }) => {
  await page.goto(academic + "/explore?standard=pci-dss&view=learn");
  await page.getByRole("group", { name: "Framework architecture areas" }).getByRole("button", { name: "Physical access", exact: true }).click();
  await page.getByRole("searchbox", { name: "Search within this framework area" }).fill("9.5.1.2.1");
  await page.getByText(/^9\.5\.1 ·/).click();
  await page.getByText(/^9\.5\.1\.2 ·/).click();
  await expect(page.getByText(/^9\.5\.1\.2\.1 ·/)).toBeVisible();
});

test("a schedule beyond its horizon keeps all assessed controls recoverable", async ({ page }) => {
  const index = JSON.parse(await readFile("src/academic/data/sp80053-index.json", "utf8")) as {
    controls: { displayId: string; withdrawn: boolean }[];
  };
  const assessments = Object.fromEntries(index.controls.filter((r) => !r.withdrawn).map(({ displayId }) => [displayId, {
    current: 0, target: 4, evidence: "Missing", note: "", owner: "", finding: "",
  }]));
  await page.addInitScript((rows) => {
    const key = "x1-academic-console-v1-nist-800-53-work";
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, JSON.stringify({
      framework: "nist-800-53", name: "All active controls", start: "2026-11-27",
      assessments: rows, version: 1, demo: false, risks: [], tasks: [], flow: [], history: [],
      experiment: { model: 0, threshold: .5, prevalence: 30 },
    }));
  }, assessments);
  await page.goto(academic + "/assess-simulate?standard=nist-800-53&view=profile");
  await page.getByRole("button", { name: "All controls" }).click();
  await page.getByLabel("current AC-1", { exact: true }).selectOption("1");
  await page.keyboard.press("Escape");
  await expect(page.getByText(/Schedule exceeds the ten-year/)).toBeVisible();
  await page.getByRole("link", { name: "Remediation schedule" }).click();
  await expect(page.getByText(/Assessment changes were saved/)).toBeVisible();
  await expect(page.locator(".xc-ganttrow")).toHaveCount(0);
  const persisted = await page.evaluate(() => localStorage.getItem("x1-academic-console-v1-nist-800-53-work"));
  const project = JSON.parse(persisted!);
  expect(Object.keys(project.assessments)).toHaveLength(1014);
  expect(project.assessments["AC-1"].current).toBe(1);
  expect(project.tasks).toEqual([]);
  await page.reload();
  await expect(page.getByText(/Assessment changes were saved/)).toBeVisible();
  await expect(page.locator(".xc-workhead")).toContainText("All active controls");
});
