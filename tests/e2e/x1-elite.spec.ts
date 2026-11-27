import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { featureGames } from "../../src/components/arcade/featureGames";

const standards = [
  ["NIST SP 800-53", "nist-800-53", "Aster Research Services"],
  ["DORA", "dora", "Bridgewater Mutual"],
  ["GDPR", "gdpr", "Cedar Member Services"],
  ["EU AI Act", "eu-ai-act", "Spindle Talent Systems"],
  ["NIST CSF 2.0", "nist-csf-2", "Northstar Manufacturing"],
  ["ISO/IEC 27001", "iso-27001", "Meridian Energy"],
  ["PCI DSS", "pci-dss", "Harbour Payments"],
] as const;

for (const [name, id, scenario] of standards) {
  test(`${name} loads a fictional assessment and an editable schedule in one action`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/x1-academic");
    await page.getByRole("link", { name: `Try Demo for ${name}`, exact: true }).click();
    await expect(page.locator(".xc-workhead")).toContainText(scenario);
    await expect(page.locator(".demo-status")).toHaveText("Fictional demo");
    await expect(page.locator(".xc-maturity b")).not.toHaveText("—");
    await page.getByRole("link", { name: "Plan & Implement", exact: true }).click();
    await expect(page.locator(".xc-ganttrow").first()).toBeVisible();
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export POA&M" }).click();
    const file = await download;
    expect(file.suggestedFilename()).toBe(id + "-fictional-demo-plan.csv");
    const content = await readFile((await file.path())!, "utf8");
    expect(content).toContain("Fictional educational demo");
    expect(content).toContain("Dependencies");
    expect(content).toContain("Priority");
    await page.getByRole("button", { name: "Start My Own Assessment" }).click();
    await expect(page.locator(".xc-workhead")).toContainText("Personal project");
    await expect(page.locator(".xc-maturity b")).toHaveText("—");
  });
}

test("law-specific guidance, applicability and linked estimates update without mixing projects", async ({ page }) => {
  await page.goto("/x1-academic?standard=dora");
  const choices = page.getByRole("navigation", { name: "DORA workspaces" });
  await expect(choices.getByRole("link")).toHaveCount(3);
  await choices.getByRole("link", { name: /^Learn/ }).click();
  await expect(page.getByText(/DORA applies from 17 January 2025/)).toBeVisible();
  await page.getByRole("button", { name: "ICT incident management", exact: true }).click();
  await page.getByText("Art. 19 · Major incident reporting", { exact: true }).click();
  await expect(page.getByText(/classification, timing and reporting instruments/)).toBeVisible();
  await page.goto("/x1-academic/assess-simulate?standard=dora&view=profile&demo=1");
  await page.getByRole("button", { name: "All controls" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByLabel("current Art. 26", { exact: true })).toBeDisabled();
  await expect(dialog.getByLabel("Applicability Art. 26", { exact: true })).toHaveValue("Excluded");
  async function estimate() {
    await page.getByRole("link", { name: "Plan & Implement", exact: true }).click();
    const file = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export POA&M" }).click();
    const csv = await readFile((await (await file).path())!, "utf8");
    return csv.split("\r\n").find((line) => line.includes("ICT incident management controls"));
  }
  await page.keyboard.press("Escape");
  const before = await estimate();
  await page.getByRole("link", { name: "Assess & Simulate", exact: true }).click();
  await page.getByRole("link", { name: "Control assessment", exact: true }).click();
  await page.getByRole("button", { name: "All controls" }).click();
  await dialog.getByLabel("current Art. 19", { exact: true }).selectOption("0");
  await page.keyboard.press("Escape");
  const after = await estimate();
  expect(before).toBeDefined();
  expect(after).toContain("Art. 19");
  expect(after).not.toBe(before);
  await page.getByRole("button", { name: "Reset Demo", exact: true }).click();
  await page.getByRole("button", { name: "Confirm replacement", exact: true }).click();
  expect(await estimate()).toBe(before);
});

for (const game of featureGames) {
  test(`${game.title} responds to keyboard and pointer input on a phone`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/games");
    await expect(page.locator(".arcade-featured article")).toHaveCount(3);
    await page.getByRole("button", { name: `Play ${game.title}` }).click();
    const room = page.getByRole("dialog", { name: game.title });
    await room.getByRole("button", { name: "Start game" }).click();
    await expect(room.getByLabel("Arcade play area")).toBeFocused();
    const hud = room.locator(".feature-game-hud p");
    if (game.key === "x1-platform-adventure") {
      await page.keyboard.down("ArrowRight");
      await expect(hud).toContainText("Seeds 1/3");
      await page.keyboard.up("ArrowRight");
      await page.keyboard.press("Space");
    } else if (game.key === "x1-racing") {
      const throttle = room.getByRole("button", { name: "Accelerate" });
      await throttle.hover();
      await page.mouse.down();
      await expect(hud).not.toContainText("0%");
      await page.mouse.up();
    } else {
      await expect(room.getByRole("button", { name: "Bin 1" })).toBeVisible();
      await expect(room.getByRole("status")).toHaveText("Parcel for bin 1 ready");
      await room.getByRole("button", { name: "Bin 1" }).click();
      await expect(hud).toContainText("Packed 1/8");
    }
    await room.getByRole("button", { name: "Game sound" }).click();
    await expect(room.getByRole("button", { name: "Game sound" })).toHaveAttribute("aria-pressed", "true");
    await room.getByRole("button", { name: "Pause game" }).click();
    await expect(room.getByRole("status")).toHaveText("Game paused");
    await room.getByRole("button", { name: "Restart" }).click();
    await expect(room.getByLabel("Arcade play area")).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    await page.keyboard.press("Escape");
    await expect(room).toHaveCount(0);
  });
}

test("a published article renders its cover and a draft stays out of Insights", async ({ page }) => {
  await page.route("https://covers.example.test/editorial.webp", (route) => route.fulfill({
    status: 200,
    contentType: "image/webp",
    path: "public/art/insights-observatory-mobile.webp",
  }));
  await page.addInitScript(() => localStorage.setItem("arharif-local-content", JSON.stringify([
    { id: "public-cover-fixture", slug: "public-cover", title: "Cover fixture", status: "published", coverImageUrl: "https://covers.example.test/editorial.webp", contentType: "article", body: "Public content." },
    { id: "private-cover-fixture", slug: "private-cover", title: "Draft cover fixture", status: "draft" },
  ])));
  await page.goto("/insights-innovation");
  const cover = page.locator(".editorial-card img");
  await expect(cover).toHaveAttribute("src", "https://covers.example.test/editorial.webp");
  await expect.poll(() => cover.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBe(720);
  await expect(page.getByText("Draft cover fixture")).toHaveCount(0);
});

test("the advisory path supports all six stages with arrow keys and focusable panels", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/about-x1");
  const journey = page.getByRole("tablist", { name: "Cybersecurity advisory journey" });
  const tabs = journey.getByRole("tab");
  await expect(tabs).toHaveCount(6);
  await tabs.first().focus();
  for (let stage = 0; stage < 6; stage++) {
    await expect(tabs.nth(stage)).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("tabpanel")).toContainText(`Stage ${stage + 1} of 6`);
    await expect(page.getByRole("tabpanel")).toContainText("Business objective");
    if (stage < 5) await page.keyboard.press("ArrowRight");
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test("mobile control edits show one requirement at a time and update the assessment", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/x1-academic/assess-simulate?standard=dora&view=profile&demo=1");
  await page.getByRole("button", { name: "All controls" }).click();
  const editor = page.getByRole("dialog");
  await editor.getByLabel("Choose control").selectOption("Art. 19");
  await expect(editor.getByRole("heading", { name: "Art. 19 · Major incident reporting" })).toBeVisible();
  await editor.getByLabel("current Art. 19", { exact: true }).selectOption("0");
  await expect(editor.getByLabel("current Art. 19", { exact: true })).toHaveValue("0");
  await expect(editor.getByLabel("current Art. 5", { exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
