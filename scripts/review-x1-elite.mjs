import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";

const origin = process.env.X1_REVIEW_ORIGIN || "http://127.0.0.1:4174";
const directory = process.env.X1_REVIEW_DIR || "docs/x1-elite-release";
const visits = Number(process.env.X1_REVIEW_VISITS || 3);
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const routes = [
  ["home", "/", (page) => page.getByRole("button", { name: "Open theme selector" }).click()],
  ["academic", "/x1-academic", (page) => page.getByRole("link", { name: "Explore DORA", exact: true }).click()],
  ["assessment", "/x1-academic/assess-simulate?standard=dora&view=profile&demo=1", (page) => page.getByRole("button", { name: "All controls" }).click()],
  ["insights", "/insights-innovation", (page) => page.getByRole("button", { name: "AI", exact: true }).click()],
  ["arcade", "/games", (page) => page.getByRole("button", { name: "Play X1 Platform Adventure" }).click()],
  ["advisory", "/about-x1", (page) => page.getByRole("tab", { name: /Assure/ }).click()],
];
const devices = [
  { name: "desktop", width: 1440, height: 900, cpu: 1, network: null },
  { name: "mobile", width: 390, height: 844, cpu: 4, network: { offline: false, latency: 100, downloadThroughput: 1_500_000 / 8, uploadThroughput: 750_000 / 8 } },
];
const samples = [];
await mkdir(directory, { recursive: true });

async function capture(page, name) {
  if (name === "advisory") {
    await page.locator("#journey-title").scrollIntoViewIfNeeded();
    await page.evaluate(() => document.querySelector("#journey-title").scrollIntoView());
  } else {
    await page.evaluate(() => window.scrollTo(0, 0));
  }
  await page.screenshot({ path: `${directory}/${name}-${page.viewportSize().width}.jpg`, animations: "disabled", quality: 84 });
}
try {
  for (const device of devices) {
    for (const [name, path, interact] of routes) {
      for (let index = 0; index < visits; index++) {
        const page = await browser.newPage({
          viewport: { width: device.width, height: device.height },
          isMobile: device.name === "mobile",
          hasTouch: device.name === "mobile",
          reducedMotion: "reduce",
        });
        try {
          const session = await page.context().newCDPSession(page);
          await session.send("Network.enable");
          await session.send("Network.setCacheDisabled", { cacheDisabled: true });
          if (device.network) {
            await session.send("Network.emulateNetworkConditions", device.network);
            await session.send("Emulation.setCPUThrottlingRate", { rate: device.cpu });
          }
          await page.addInitScript(() => {
            window.x1Vitals = { lcp: 0, cls: 0, interactions: {} };
            let windowStart = 0, lastShift = 0, sessionScore = 0;
            new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) window.x1Vitals.lcp = entry.startTime;
            }).observe({ type: "largest-contentful-paint", buffered: true });
            new PerformanceObserver((list) => {
              for (const shift of list.getEntries()) {
                if (shift.hadRecentInput) continue;
                if (shift.startTime - lastShift > 1000 || shift.startTime - windowStart > 5000) {
                  sessionScore = 0;
                  windowStart = shift.startTime;
                }
                sessionScore += shift.value;
                lastShift = shift.startTime;
                window.x1Vitals.cls = Math.max(window.x1Vitals.cls, sessionScore);
              }
            }).observe({ type: "layout-shift", buffered: true });
            new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                if (!entry.interactionId) continue;
                const current = window.x1Vitals.interactions[entry.interactionId] || 0;
                window.x1Vitals.interactions[entry.interactionId] = Math.max(current, entry.duration);
              }
            }).observe({ type: "event", buffered: true, durationThreshold: 16 });
          });
          await page.goto(new URL(path, origin).href, { waitUntil: "load" });
          await page.locator("h1").first().waitFor();
          await page.waitForLoadState("networkidle");
          await page.evaluate(() => document.fonts.ready);
          if (index === 0) await capture(page, name);
          await interact(page);
          await page.waitForTimeout(250);
          const sample = await page.evaluate(() => {
            const { lcp, cls, interactions } = window.x1Vitals;
            return {
              lcpMs: Math.round(lcp),
              cls: Number(cls.toFixed(4)),
              interactionMs: Math.max(0, ...Object.values(interactions)) || null,
              documentWidth: document.documentElement.scrollWidth,
            };
          });
          samples.push({ device: device.name, route: name, visit: index + 1, ...sample });
        } finally {
          await page.close();
        }
      }
    }
  }
  await writeFile(`${directory}/metrics.json`, JSON.stringify({ chromium: browser.version(), devices, samples }, null, 2) + "\n");
} finally {
  await browser.close();
}
