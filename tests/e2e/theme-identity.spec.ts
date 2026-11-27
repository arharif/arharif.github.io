import { test, expect } from "@playwright/test";
import { palettes } from "../../src/lib/palettes";

for (const width of [1440, 390]) {
  test(`professional identities and theme controls at ${width}px`, async ({ page }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const capture = process.env.X1_IDENTITY_SCREENSHOTS;
    const expressions = new Set<string>();
    await page.goto("/");
    const logo = page.getByRole("link", { name: "X1 home", exact: true });
    const face = page.locator(".assistant-launcher");
    const shell = page.locator(".universe-shell");

    for (const [id, [name]] of Object.entries(palettes)) {
      await page.getByRole("button", { name: "Open theme selector" }).click();
      await page.getByRole("menuitemradio", { name: "Activate " + name, exact: true }).click();
      await expect(shell).toHaveCSS("background-color", id === "onyx-black" ? "rgb(8, 10, 13)" : "rgb(255, 255, 255)");
      if (id === "rainbow") await expect(shell).toHaveCSS("background-image", /linear-gradient/);
      else await expect(shell).toHaveCSS("background-image", "none");
      await expect(logo.locator(".mark-word")).toHaveText("X1");
      await expect(logo.locator(".universe-mark")).toHaveCSS("width", "36px");
      // Move keyboard focus back to the brand from the selector, independent of pointer hover.
      await page.keyboard.press("Tab");
      await logo.focus();
      await expect(logo.locator(".mark-face")).toHaveCSS("opacity", "1");
      expressions.add((await logo.locator("path").evaluateAll(paths => paths.map(p => p.getAttribute("d")))).join("|"));
      if (capture) await logo.screenshot({ path: `${capture}/${width}-logo-${id}.png` });
      await page.keyboard.press("Tab");
      await expect(logo.locator(".mark-word")).toHaveCSS("opacity", "1");
      await expect(face).toHaveAttribute("data-guide", "face");
      await expect(face).toHaveCSS("box-shadow", "none");
      await expect(face).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      await expect(face).toHaveCSS("background-image", "none");
      await expect(face).toHaveCSS("border-top-width", "0px");
      const bounds = await face.boundingBox();
      expect(Math.min(bounds!.width, bounds!.height)).toBeGreaterThanOrEqual(44);
      await expect(face.locator(".living-face")).toHaveCSS("animation-name", "none");
      if (capture) {
        await page.locator("h1").click();
        await page.screenshot({ path: `${capture}/${width}-${id}.jpg`, quality: 84 });
      }
    }
    expect(expressions.size).toBe(3);
    await page.getByRole("button", { name: "Open theme selector" }).click();
    if (capture) await page.screenshot({ path: `${capture}/${width}-selector.jpg`, quality: 84 });
    await page.keyboard.press("Home");
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("menuitemradio", { name: "Activate Mature White" })).toBeFocused();
    await page.keyboard.press("Enter");
    for (const [path, identity] of [["/x1-academic","face"],["/insights-innovation","astronaut"],["/games","phantom"]]) {
      await page.goto(path);
      await expect(face).toHaveAttribute("data-guide", identity);
      await face.click();
      const panel = page.getByRole("dialog", { name: "X1 assistant" });
      await expect(panel).toBeVisible();
      if (identity === "face") {
        await expect(panel).toHaveAttribute("data-expression", "welcome");
        await panel.getByRole("textbox").fill("Academic");
        await panel.getByRole("button", { name: "Send" }).click();
        await expect(panel).toHaveAttribute("data-expression", "pleased");
      }
      if (capture) await page.screenshot({ path: `${capture}/${width}-${identity}.jpg`, quality: 84 });
      await page.keyboard.press("Escape");
      await expect(face).toBeFocused();
    }
  });
}

test("the X1 face responds to a pending request and a failed guide load", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByLabel("Open X1 assistant", { exact: true });
  await trigger.click();
  const panel = page.getByRole("dialog", { name: "X1 assistant" });
  let release!: () => void;
  const pending = new Promise<void>(resolve => { release = resolve; });
  // Hold the real lazy-loaded guide until the pending state has been observed.
  await page.route(/\/assets\/siteAssistant-[\w-]+\.js$/, async route => {
    await pending;
    await route.abort("failed");
  });
  await panel.getByRole("textbox").fill("Find articles about books");
  await panel.getByRole("button", { name: "Send" }).click();
  try {
    await expect(panel).toHaveAttribute("data-expression", "thinking");
  } finally {
    release();
  }
  await expect(panel).toHaveAttribute("data-expression", "reassuring");
  await expect(panel.getByText(/trouble checking/)).toBeVisible();
});

test("the animated brand responds to hover and returns to Home", async ({ page }) => {
  await page.goto("/insights-innovation");
  const home = page.getByRole("link", { name: "X1 home", exact: true });
  await home.hover();
  await expect(home.locator(".mark-face")).toHaveCSS("opacity", "1");
  await page.locator("h1").hover();
  await expect(home.locator(".mark-word")).toHaveCSS("opacity", "1");
  await home.click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Clear Thinking");
});
