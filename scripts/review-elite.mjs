import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
const phase = process.argv[2];
if (!["before", "after"].includes(phase))
  throw new Error("Choose before or after");
const out = process.env.X1_REVIEW_DIR || "docs/elite-review";
await mkdir(out, { recursive: true });
const browser = await chromium.launch({
  executablePath:
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
    (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
  args: ["--no-sandbox"],
});
const origin = process.env.X1_REVIEW_ORIGIN || "http://127.0.0.1:4174";
const samples = [];
try {
  for (const [route, path] of Object.entries({
    home: "/",
    insights: "/insights-innovation",
    academic: "/x1-academic",
    arcade: "/games",
    about: "/about-x1",
    login: "/login",
  })) {
    for (const width of [1440, 390]) {
      for (let index = 0; index < 3; index++) {
        const page = await browser.newPage({
          viewport: { width, height: width === 390 ? 844 : 900 },
        });
        await page.addInitScript(() => {
          window.sample = { lcp: 0, cls: 0, interaction: null };
          for (const [type, key] of [
            ["largest-contentful-paint", "lcp"],
            ["layout-shift", "cls"],
            ["event", "interaction"],
          ]) {
            new PerformanceObserver((list) => {
              for (const event of list.getEntries()) {
                if (key === "lcp") window.sample.lcp = event.startTime;
                if (key === "cls" && !event.hadRecentInput)
                  window.sample.cls += event.value;
                if (key === "interaction" && event.interactionId)
                  window.sample.interaction = Math.max(
                    window.sample.interaction ?? 0,
                    event.duration,
                  );
              }
            }).observe({ type, buffered: true, durationThreshold: 16 });
          }
        });
        await page.goto(origin + path, { waitUntil: "domcontentloaded" });
        await page.locator("h1").first().waitFor();
        await page.waitForTimeout(700);
        if (index === 0 && route === "home")
          await page.screenshot({
            path: out + "/" + phase + "-" + width + ".jpg",
            quality: 85,
          });
        await page.getByLabel("Open X1 assistant", { exact: true }).click();
        await page.getByRole("dialog").waitFor();
        await page.waitForTimeout(200);
        if (
          phase === "after" &&
          width === 390 &&
          index === 0 &&
          ["home", "arcade", "insights"].includes(route)
        )
          await page.screenshot({
            path: out + "/guide-" + route + ".jpg",
            quality: 80,
          });
        samples.push({
          route,
          width,
          ...(await page.evaluate(() => ({
            ...window.sample,
            bytes: performance
              .getEntriesByType("resource")
              .reduce((sum, e) => sum + e.transferSize, 0),
          }))),
        });
        await page.close();
      }
    }
  }
  await writeFile(
    out + "/" + phase + ".json",
    JSON.stringify({ chromium: browser.version(), samples }, null, 2) + "\n",
  );
} finally {
  await browser.close();
}
