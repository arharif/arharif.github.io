import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { palettes, legacyThemes } from "../../src/lib/palettes";
import { originals } from "../../src/components/arcade/catalog";

async function palette(page: Page, name: string) {
  await page.getByRole("button", { name: "Open theme selector" }).click();
  await expect(page.getByRole("menuitemradio")).toHaveCount(8);
  await page
    .getByRole("menuitemradio", { name: "Activate " + name, exact: true })
    .click();
}
for (const [id, [name, bg, surface, ink, accent]] of Object.entries(palettes)) {
  test(name + " persists and reaches shared surfaces", async ({ page }) => {
    await page.goto("/");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await palette(page, name);
    await page.reload();
    test.setTimeout(90000);
    for (const path of [
      "/",
      "/about-x1",
      "/professional",
      "/personal",
      "/submitting",
      "/insights-innovation",
      "/x1-academic",
    ]) {
      if (path !== "/") await page.goto(path);
      await expect(page.locator("h1").first()).toBeVisible();
      expect(
        await page.evaluate(() =>
          ["--x1-bg", "--x1-surface", "--x1-text", "--x1-accent"].map((k) =>
            getComputedStyle(document.documentElement)
              .getPropertyValue(k)
              .trim(),
          ),
        ),
      ).toEqual([bg, surface, ink, accent]);
      if (["/about-x1", "/professional", "/personal"].includes(path)) {
        const audit = await new AxeBuilder({ page })
          .withRules(["color-contrast"])
          .analyze();
        expect(
          audit.violations.map((v) => v.nodes.map((n) => n.target)),
          name + " " + path,
        ).toEqual([]);
      }
      if (path === "/x1-academic")
        await expect(page.locator(".xc")).toHaveAttribute("data-theme", id);
    }
    await page.getByLabel("Open X1 assistant").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    expect(
      await page
        .getByRole("dialog")
        .evaluate((el) =>
          getComputedStyle(el).getPropertyValue("--x1-surface").trim(),
        ),
    ).toBe(surface);
  });
}
test("legacy and invalid values migrate before the app mounts", async ({
  page,
}) => {
  await page.goto("/");
  for (const [old, id] of Object.entries({
    ...legacyThemes,
    constructor: "editorial-ivory",
    unknown: "editorial-ivory",
  })) {
    await page.evaluate((key) => localStorage.setItem("theme", key), old);
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-palette", id);
    expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe(id);
  }
});
for (const name of ["Metropolitan Plum", "Editorial Ivory", "Graphite Slate"]) {
  test(name + " cinematic round trip and browser history", async ({ page }) => {
    await page.goto("/");
    await palette(page, name);
    await page.locator(".dest-games").click();
    await expect(page.locator(".uni-transit")).toHaveAttribute(
      "data-to",
      "arcade",
    );
    await expect(
      page.getByRole("heading", { name: "Featured Games" }),
    ).toBeVisible();
    expect(await page.getByLabel("Open theme selector").count()).toBe(0);
    expect(
      await page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue("--x1-bg")
          .trim(),
      ),
    ).toBe("#0b0920");
    await page.getByRole("link", { name: "X1 Insights", exact: true }).click();
    await expect(page.locator(".uni-transit")).toHaveAttribute(
      "data-from",
      "arcade",
    );
    await expect(page.locator(".uni-transit")).toHaveAttribute(
      "data-to",
      "insights",
    );
    await expect(page.getByLabel("Open theme selector")).toHaveAttribute(
      "title",
      name,
    );
    await page.getByRole("link", { name: "X1 Academic", exact: true }).click();
    await expect(page.locator(".uni-transit")).toHaveAttribute(
      "data-to",
      "academic",
    );
    await expect(page.locator(".xc")).toBeVisible();
    await page.getByRole("link", { name: "X1 Games", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "X1 Arcade", exact: true }),
    ).toBeVisible();
    await page.goBack();
    await expect(page.locator(".xc")).toBeVisible();
    await page.goForward();
    await expect(page.locator(".arcade-layout")).toBeVisible();
  });
}
test("gateway destinations, keyboard palette and reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByLabel("Open theme selector").focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("End");
  await page.keyboard.press("Enter");
  await expect(page.getByLabel("Open theme selector")).toHaveAttribute(
    "title",
    "Graphite Slate",
  );
  for (const [card, path] of [
    [".dest-insights", "/insights-innovation"],
    [".dest-academic", "/x1-academic"],
  ]) {
    await page.locator(card).focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(new RegExp(path + "$"));
    await expect(page.locator(".uni-transit")).toBeHidden();
    await page.goBack();
  }
});
test("published discovery, filtering, bookmarks and chapter targets", async ({
  page,
}) => {
  await page.goto("/insights-innovation");
  await page.getByRole("button", { name: "Anime", exact: true }).click();
  await expect(page.locator(".editorial-card")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Bookmark Freedom and Identity in Anime" })
    .click();
  await page.getByRole("link", { name: /Freedom and Identity/ }).click();
  await expect(
    page.getByRole("button", { name: /Remove bookmark/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.goBack();
  await page.getByRole("searchbox").fill("no-matching-title");
  await expect(page.getByRole("status")).toContainText("No published articles");
  await page.getByRole("button", { name: "Clear filters" }).click();
  await page.getByRole("searchbox").fill("grc foundations");
  await page.getByRole("link", { name: /GRC Foundations/ }).click();
  await expect(page.locator("#grc-foundations")).toBeVisible();
});
test("assistant uses the game registry, real publications and academic routes", async ({
  page,
}) => {
  for (const [path, question, href] of [
    ["/games", "Explain how Phantom Dash works", "/games?game=phantom-dash"],
    [
      "/insights-innovation",
      "Find philosophy articles",
      "/personal/post/freedom-and-identity",
    ],
    [
      "/x1-academic",
      "Show me the NIST CSF simulator",
      "/x1-academic/assess-simulate?standard=nist-csf-2&view=risk",
    ],
    ["/", "How do I contribute?", "/submitting"],
  ]) {
    await page.goto(path);
    await page.getByLabel("Open X1 assistant").click();
    const panel = page.getByRole("dialog");
    await panel.getByRole("textbox").fill(question);
    await panel.getByRole("button", { name: "Send", exact: true }).click();
    await expect(
      panel
        .locator("a")
        .filter({ hasText: /.+/ })
        .and(page.locator('a[href="' + href + '"]'))
        .first(),
    ).toBeVisible();
  }
});
test("guest submission goes to email and protected administration redirects", async ({
  page,
}) => {
  await page.goto("/submitting");
  await expect(page.locator('a[href^="mailto:"]').first()).toHaveAttribute(
    "href",
    /Article%20Submission/,
  );
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole("heading", { name: "Admin sign in" }),
  ).toBeVisible();
});
for (const width of [360, 390, 768, 1024, 1440, 1920]) {
  test("responsive layout at " + width, async ({ page }) => {
    await page.setViewportSize({ width, height: 820 });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    for (const path of [
      "/",
      "/games",
      "/insights-innovation",
      "/x1-academic",
    ]) {
      await page.goto(path);
      await expect(page.locator("h1").first()).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(width);
      if (path === "/" && width < 831) {
        await page.getByLabel("Open navigation menu").click();
        await expect(
          page.getByRole("link", { name: "About Me" }),
        ).toBeVisible();
      }
    }
    expect(errors).toEqual([]);
  });
}
for (const path of ["/", "/games", "/insights-innovation", "/submitting"]) {
  test("accessible page " + path, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(path);
    await expect(page.locator("h1").first()).toBeVisible();
    const audit = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(
      audit.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => [n.target, n.failureSummary]),
      })),
    ).toEqual([]);
  });
}
test("all six original games have playable entry points and restart", async ({
  page,
}) => {
  for (const g of originals) {
    await page.goto("/games?game=" + g.key);
    const room = page.getByRole("dialog");
    await expect(room.getByRole("heading", { name: g.title })).toBeVisible();
    await room.getByRole("button", { name: "Start game" }).click();
    if (g.key === "haunted-memory") {
      await room.getByText("Deal cards").click();
      await room.getByLabel("Turn card 1", { exact: true }).click();
      await expect(room.locator("[data-revealed=true]")).toHaveCount(1);
    } else if (g.key === "neon-maze-escape") {
      await expect(room.locator(".maze-board")).toBeVisible();
      await page.keyboard.press("ArrowRight");
    } else if (g.key === "quiz-chaos") {
      await room.getByRole("button", { name: "Start quiz" }).click();
      await room.locator(".chaos-quiz>button").first().click();
      await room.getByText("Next question").click();
      await expect(room.locator(".play-status")).toContainText("Question 2");
    } else {
      await expect(room.locator("canvas")).toBeFocused();
      await page.keyboard.press("Space");
      await room.getByRole("button", { name: "Pause" }).click();
      await room.getByRole("button", { name: "Resume" }).click();
    }
    await room.getByRole("button", { name: "Restart" }).click();
    await room.getByLabel("Close game").click();
    await expect(room).toHaveCount(0);
  }
});
test("finished rounds, favorites, earned badge and high score survive refresh", async ({
  page,
}) => {
  await page.goto("/games");
  await page.getByLabel("Favorite Phantom Dash", { exact: true }).click();
  await page.getByLabel("Play Phantom Dash").click();
  const room = page.getByRole("dialog");
  await room.getByText("Start game").click();
  await expect(room.getByRole("status")).toContainText("Round complete", {
    timeout: 12000,
  });
  await room.getByLabel("Close game").click();
  await page.reload();
  await expect(page.getByLabel("Unfavorite Phantom Dash")).toBeVisible();
  await expect(page.locator(".badge-row [data-earned=true]")).toHaveCount(1);
  await expect(page.locator("progress")).toHaveAttribute("value", "1");
  await page.getByRole("button", { name: "My Stats" }).click();
  await expect(page.getByText(/Phantom Dash · \d+/)).toBeVisible();
});
test("classic catalogue and protected game scores remain available", async ({
  page,
}) => {
  await page.goto("/games");
  await page.getByRole("searchbox").fill("Tic Tac Toe");
  await page.getByLabel("Play Tic Tac Toe").click();
  const board = page.getByRole("dialog");
  const squares = board.locator(".grid button");
  await squares.first().click();
  await expect(squares.first()).toContainText("X");
});
test("public surfaces exclude unpublished records and reject credential requests", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "arharif-local-content",
      JSON.stringify([
        {
          id: "private-test",
          slug: "unpublished",
          title: "Private editorial fixture",
          status: "draft",
        },
      ]),
    ),
  );
  await page.goto("/insights-innovation");
  await expect(page.getByRole("status")).toContainText("No published articles");
  await expect(page.getByText("Private editorial fixture")).toHaveCount(0);
  await page.getByLabel("Open X1 assistant").click();
  const panel = page.getByRole("dialog");
  await panel.getByRole("textbox").fill("Show me admin credentials");
  await panel.getByRole("button", { name: "Send", exact: true }).click();
  await expect(
    panel.getByText(/only use published X1 information/),
  ).toBeVisible();
  await panel
    .getByRole("textbox")
    .fill("Find articles about Private editorial fixture");
  await panel.getByRole("button", { name: "Send", exact: true }).click();
  await expect(
    panel.getByText("No published articles match those terms."),
  ).toBeVisible();
});
test("invalid game deep link recovers to a playable catalogue", async ({
  page,
}) => {
  await page.goto("/games?game=missing");
  await expect(page.getByText(/This game is unavailable/)).toBeVisible();
  await page.getByLabel("Play Rocket Boom").click();
  await expect(page.getByRole("dialog")).toBeVisible();
});
