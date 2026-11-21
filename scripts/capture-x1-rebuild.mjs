import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const origin = process.env.X1_REVIEW_ORIGIN ?? "http://127.0.0.1:4174";
const output = resolve(process.argv[2] ?? "test-results/x1-reference-review");
const base = origin + "/x1-academic";
const options = {
  executablePath:
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ??
    (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
};
await mkdir(output, { recursive: true });
const browser = await chromium.launch(options);
const standards = ["nist-csf-2", "iso-27001", "pci-dss"];
const routes = [
  ["home", "/", null],
  ...standards.flatMap((id) => [
    [`standards-${id}`, `/standards/?framework=${id}`, null],
    [`results-${id}`, `/assess/?standard=${id}`, ".xa-assess-dashboard"],
    [`implementation-${id}`, `/implement/?standard=${id}`, ".xa-pmo-gantt"],
  ]),
  ["risk", "/risk-register/", ".xa-risk-command"],
  ["privacy", "/simulate/privacy/", ".xa-privacy-node"],
  ["ai", "/labs/ai-experiment/", ".xa-demo-label"],
  ["incident", "/labs/cyber-incident/", ".xa-demo-label"],
  ["boardroom", "/labs/ciso-boardroom/", ".xa-demo-label"],
  ["framework-explorer", "/labs/framework-explorer/", ".xa-demo-label"],
  ["nist-system", "/standards/800-53/", ".xa-demo-label"],
  ["graph", "/knowledge-graph/", null],
  ["report", "/report/?standard=nist-csf-2", "report"],
];

const records = [];
const issues = [];
try {
  for (const [name, viewport, theme] of [
    ["desktop", { width: 1440, height: 1000 }, "dark"],
    ["mobile", { width: 390, height: 844 }, "dark"],
    ["light-desktop", { width: 1440, height: 1000 }, "light"],
  ]) {
    const page = await browser.newPage({ viewport, reducedMotion: "reduce" });
    page.setDefaultTimeout(10000);
    page.on("pageerror", (error) => issues.push(`${name}: ${error.message}`));
    page.on("console", (message) => {
      if (
        message.type() === "error" &&
        /Error:|blocked|violat/i.test(message.text())
      )
        issues.push(`${name} ${page.url()}: ${message.text()}`);
    });
    await page.addInitScript(
      (mode) => localStorage.setItem("theme", mode),
      theme,
    );
    for (const [label, path, ready] of routes) {
      if (
        theme === "light" &&
        ![
          "home",
          "results-nist-csf-2",
          "risk",
          "implementation-nist-csf-2",
          "privacy",
        ].includes(label)
      )
        continue;
      console.log(`Capturing ${label} at ${name}`);
      const response = await page.goto(
        base + (ready === "report" ? "/assess/?standard=nist-csf-2" : path),
      );
      if (!response?.ok())
        throw new Error(`${path}: HTTP ${response?.status()}`);
      await page.locator("#academic-main h1").first().waitFor();
      if (ready) {
        await page
          .getByRole("button", { name: "Load Completed Demo", exact: true })
          .click();
        await page
          .locator(ready === "report" ? ".xa-demo-label" : ready)
          .first()
          .waitFor();
      }
      if (ready === "report") {
        await page
          .getByRole("link", { name: "Assessment report", exact: true })
          .click();
        await page
          .getByRole("button", { name: "Generate immutable report" })
          .click();
        await page
          .getByRole("button", { name: "Executive", exact: true })
          .click();
      }
      const guide = page.getByRole("button", { name: "Close explanation" });
      if (await guide.isVisible()) await guide.click();
      const data = await page.evaluate(async () => {
        await document.fonts.ready;
        window.scrollTo(0, 0);
        return {
          title: document.querySelector("#academic-main h1")?.textContent,
          documentWidth: document.documentElement.scrollWidth,
          viewport: innerWidth,
        };
      });
      const screenshot = `${label}-${name}.png`;
      await page.screenshot({
        path: resolve(output, screenshot),
        animations: "disabled",
      });
      records.push({ screenshot, path, theme, ...data });
      console.log(`${screenshot} · ${data.documentWidth}/${data.viewport}px`);
      if (label === "results-nist-csf-2" && theme === "dark") {
        await page
          .getByRole("button", { name: "Governance", exact: true })
          .click();
        await page
          .locator(".xa-governance-panel")
          .screenshot({
            path: resolve(output, `governance-radar-${name}.png`),
          });
      }
    }
    await page.close();
  }
} finally {
  await browser.close();
  await writeFile(
    resolve(output, "browser-evidence.json"),
    JSON.stringify({ records, issues }, null, 2),
  );
}
if (issues.length) throw new Error(issues.join("\n"));
