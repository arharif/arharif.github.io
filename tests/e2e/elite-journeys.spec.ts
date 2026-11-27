import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const width of [1440, 390]) {
  test.describe("public journeys at " + width + " pixels", () => {
    test.use({ viewport: { width, height: 900 }, reducedMotion: "reduce" });

    test("professional profile and contributor email", async ({ page }) => {
      await page.goto("/");
      if (width === 390) await page.getByRole("button", { name: "Open navigation menu" }).click();
      await page.getByRole("link", { name: "About Me", exact: true }).click();
      await expect(page.getByRole("heading", { name: "Cybersecurity Advisory" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Email Anass" })).toHaveAttribute("href", "mailto:rharifanass@gmail.com");
      await expect(page.getByRole("link", { name: "LinkedIn ↗", exact: true })).toHaveAttribute("href", "https://www.linkedin.com/in/rharif-anass-/");
      if (width === 390) await page.getByRole("button", { name: "Open navigation menu" }).click();
      await page.getByRole("link", { name: "Contribute", exact: true }).click();
      await expect(page.getByRole("heading", { name: "Submit an Article" })).toBeVisible();
      await expect(page.getByText(/owner decides what to publish/)).toBeVisible();
      const mail = await page.getByRole("link", { name: "Email your submission" }).getAttribute("href");
      const draft = new URL(mail!);
      expect(draft.pathname).toBe("rharifanass@gmail.com");
      expect(draft.searchParams.get("body")).toContain("[body content]");
    });

    test("Academic demo, published article and registration-free play", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator(".destination")).toHaveCount(3);
      await page.locator(".dest-academic").click();
      await page.getByRole("link", { name: "Try Demo for NIST CSF 2.0", exact: true }).click();
      await expect(page.locator(".demo-status")).toHaveText("SAMPLE DATA · Fictional demo");
      await expect(page.getByRole("dialog", { name: /entrance/ })).toHaveCount(0);

      await page.goto("/");
      await page.locator(".dest-insights").click();
      await page.getByRole("searchbox", { name: "Search insights" }).fill("philosophy");
      await page.getByRole("link", { name: /Freedom and Identity in Anime/ }).click();
      await expect(page).toHaveTitle("Freedom and Identity in Anime · X1 Insights");
      await expect(page.getByRole("link", { name: "Back to Insights" })).toBeVisible();

      await page.goto("/");
      await page.locator(".dest-games").click();
      await page.getByRole("button", { name: "All games", exact: false }).click();
      await page.getByRole("button", { name: "Play Haunted Memory", exact: true }).click();
      await page.getByRole("button", { name: "Start game" }).click();
      await page.getByText("Deal cards").click();
      await page.getByLabel("Turn card 1", { exact: true }).click();
      await expect(page.locator("[data-revealed=true]")).toHaveCount(1);
    });
  });
}

test("global search groups results, supports keys and preserves the full search query", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("link", { name: "Search website" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Search X1" });
  const input = dialog.getByRole("searchbox");
  await expect(input).toBeFocused();
  for (const name of ["Tools", "Articles", "Topics", "Games"]) {
    await expect(dialog.getByRole("heading", { name, exact: true })).toBeVisible();
  }
  await input.fill("phantom");
  await page.keyboard.press("ArrowDown");
  await expect(dialog.getByRole("link", { name: "Phantom Dash" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await input.fill("neoN Maze");
  await input.press("Enter");
  await expect(page).toHaveURL(/\/search\?q=neoN%20Maze$/);
  await expect(page.getByRole("searchbox")).toHaveValue("neoN Maze");
  await expect(page.getByRole("link", { name: /Neon Maze Escape/ })).toBeVisible();
});

test("first intentional entry, interior clicks, repeat visits and replay", async ({ page }) => {
  await page.goto("/");
  await page.locator(".dest-academic").click();
  const intro = page.getByRole("dialog", { name: "X1 Academic entrance" });
  await expect(intro).toBeVisible();
  await intro.click({ position: { x: 60, y: 80 } });
  await expect(intro).toBeVisible();
  await intro.getByRole("button", { name: "Skip journey" }).click();
  await expect(intro).toHaveCount(0);
  await page.goBack();
  await page.locator(".dest-academic").click();
  await expect(page.locator(".xc")).toBeVisible();
  await expect(intro).toHaveCount(0);
  await page.getByRole("button", { name: "Replay introduction" }).click();
  await expect(intro).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(intro).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Replay introduction" })).toBeFocused();
  await page.goBack();
  await page.goForward();
  await expect(page.locator(".xc")).toBeVisible();
  await expect(intro).toHaveCount(0);
});

for (const [id, label] of [["onyx-black", "Onyx Black"], ["mature-white", "Mature White"]]) {
  test(label + " search overlay meets automated accessibility rules", async ({ page }) => {
    await page.addInitScript((theme) => localStorage.setItem("theme", theme), id);
    await page.goto("/");
    await page.getByRole("link", { name: "Search website" }).click();
    await expect(page.getByRole("dialog", { name: "Search X1" })).toBeVisible();
    const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(violations.map((issue) => ({ id: issue.id, nodes: issue.nodes.map((node) => node.target) }))).toEqual([]);
  });
}
