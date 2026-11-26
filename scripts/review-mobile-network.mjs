import { writeFile } from "node:fs/promises";
import { chromium } from "playwright";

const origins = process.argv.slice(2);
if (origins.length !== 2) throw new Error("Pass the baseline and candidate fixture origins");

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
});
const samples = [];
const conditions = {
  offline: false,
  latency: 100,
  downloadThroughput: 1_500_000 / 8,
  uploadThroughput: 750_000 / 8,
};
try {
  for (const path of ["/", "/insights-innovation"]) {
    for (let visit = 0; visit < 2; visit++) {
      for (const [index, origin] of origins.entries()) {
        const page = await browser.newPage({
          viewport: { width: 390, height: 844 },
          isMobile: true,
          hasTouch: true,
        });
        try {
          const cdp = await page.context().newCDPSession(page);
          await cdp.send("Network.enable");
          await cdp.send("Network.emulateNetworkConditions", conditions);
          await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
          await page.addInitScript(() => {
            window.vitals = { lcp: 0, cls: 0 };
            new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) window.vitals.lcp = entry.startTime;
            }).observe({ type: "largest-contentful-paint", buffered: true });
            new PerformanceObserver((list) => {
              for (const entry of list.getEntries())
                if (!entry.hadRecentInput) window.vitals.cls += entry.value;
            }).observe({ type: "layout-shift", buffered: true });
          });
          await page.goto(new URL(path, origin).href, { waitUntil: "load" });
          await page.locator("h1").first().waitFor();
          await page.waitForLoadState("networkidle");
          const metrics = await page.evaluate(() => window.vitals);
          if (!metrics.lcp) throw new Error("No largest contentful paint observed");
          samples.push({ build: index === 0 ? "before" : "after", path, ...metrics });
        } finally {
          await page.close();
        }
      }
    }
  }
  await writeFile("docs/reference-review/mobile-network.json",
    JSON.stringify({ chromium: browser.version(), cpuSlowdown: 4, conditions, samples }, null, 2) + "\n");
} finally {
  await browser.close();
}
