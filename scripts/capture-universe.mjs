import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { chromium } from "playwright";
import { palettes } from "../src/lib/palettes.ts";

const out = process.argv[2] || "docs/universe-review";
const origin = process.env.X1_REVIEW_ORIGIN || "http://127.0.0.1:4174";
await mkdir(out, { recursive: true });
const browser = await chromium.launch({
  executablePath:
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
    (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
  args: ["--no-sandbox"],
});
const routes = {
  home: "/",
  insights: "/insights-innovation",
  academic: "/x1-academic",
  about: "/about-x1",
  contribute: "/submitting",
};
const page = await browser.newPage({
  viewport: { width: 1280, height: 720 },
  reducedMotion: "reduce",
});
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
async function visit(path) {
  await page.goto(origin + path);
  await page.locator("h1").first().waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page
    .locator("img")
    .evaluateAll((images) =>
      Promise.all(
        images
          .filter(
            (img) =>
              img.src.startsWith(location.origin) && img.loading !== "lazy",
          )
          .map((img) => img.decode().catch(() => {})),
      ),
    );
}
try {
  for (const [theme, [label]] of Object.entries(palettes)) {
    await visit("/");
    await page.getByLabel("Open theme selector").click();
    await page
      .getByRole("menuitemradio", { name: "Activate " + label, exact: true })
      .click();
    for (const [name, path] of Object.entries(routes)) {
      if (name !== "home") await visit(path);
      if (name === "insights")
        await page.locator(".editorial-card").first().waitFor();
      await page.screenshot({
        path: out + "/" + theme + "-" + name + ".jpg",
        quality: 80,
        animations: "disabled",
      });
    }
  }
  await visit("/games");
  await page.screenshot({ path: out + "/arcade.jpg", quality: 85 });
  await visit("/");
  await page.getByLabel("Open theme selector").click();
  await page
    .getByRole("menuitemradio", { name: "Activate Editorial Ivory" })
    .click();
  await page.setViewportSize({ width: 390, height: 844 });
  for (const [name, path] of [
    ["home", "/"],
    ["arcade", "/games"],
    ["insights", "/insights-innovation"],
  ]) {
    await visit(path);
    await page.screenshot({
      path: out + "/mobile-" + name + ".jpg",
      quality: 80,
      fullPage: true,
    });
  }
  const metrics = [];
  for (let run = 1; run <= 3; run++) {
    for (const [name, path] of Object.entries({
      ...routes,
      arcade: "/games",
    })) {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
      });
      const sample = await context.newPage();
      await sample.addInitScript(() => {
        window.x1Metrics = { lcp: 0, cls: 0, interaction: 0 };
        for (const [type, key] of [
          ["largest-contentful-paint", "lcp"],
          ["layout-shift", "cls"],
          ["event", "interaction"],
        ]) {
          new PerformanceObserver((list) => {
            for (const e of list.getEntries()) {
              if (key === "lcp") window.x1Metrics.lcp = e.startTime;
              if (key === "cls" && !e.hadRecentInput)
                window.x1Metrics.cls += e.value;
              if (key === "interaction" && e.interactionId)
                window.x1Metrics.interaction = Math.max(
                  window.x1Metrics.interaction,
                  e.duration,
                );
            }
          }).observe({ type, buffered: true, durationThreshold: 16 });
        }
      });
      await sample.goto(origin + path);
      await sample.locator("h1").first().waitFor();
      await sample.waitForTimeout(850);
      await sample
        .getByRole("button", { name: "Open X1 assistant", exact: true })
        .click();
      await sample.getByRole("dialog").waitFor();
      await sample.waitForTimeout(180);
      metrics.push(
        await sample.evaluate(
          (name) => ({
            name,
            ...window.x1Metrics,
            transferredBytes: performance
              .getEntriesByType("resource")
              .reduce((n, e) => n + e.transferSize, 0),
          }),
          name,
        ),
      );
      await context.close();
    }
  }
  await writeFile(
    out + "/metrics.json",
    JSON.stringify(
      {
        chromium: browser.version(),
        viewport: "1440x900",
        method:
          "Three local cold-context navigations per page, each followed by opening the assistant. No throttling. Interaction is the longest observed Event Timing duration, zero if below the browser reporting threshold.",
        metrics,
        errors,
      },
      null,
      2,
    ) + "\n",
  );
} finally {
  await browser.close();
}
