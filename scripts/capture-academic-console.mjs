import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const captures = [
  ["01-cyber-risk", "assess-simulate", "risk", 480, "dark"],
  ["02-knowledge-graph", "explore", "graph", 464, "dark"],
  ["03-framework-profile", "explore", "profile", 451, "light"],
  ["04-risk-matrix", "assess-simulate", "matrix", 412, "dark"],
  ["05-ai-experiment", "assess-simulate", "experiment", 361, "dark"],
  ["06-executive", "assess-simulate", "executive", 440, "dark"],
  ["07-project-dashboard", "implement-plan", "planner", 720, "light"],
  ["08-data-flow", "assess-simulate", "flow", 456, "light"],
  ["09-governance", "explore", "governance", 418, "light"],
];
const out = resolve(process.argv[2] ?? "docs/x1-academic/console/captures");
await mkdir(out, { recursive: true });
const browser = await chromium.launch({
  executablePath:
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
    (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
  args: ["--no-sandbox"],
});
const origin = process.env.X1_TEST_ORIGIN ?? "http://127.0.0.1:4174";
const manifest = [];
try {
  for (const [file, workspace, view, height, theme] of captures) {
    const page = await browser.newPage({
      viewport: { width: 709, height },
      reducedMotion: "reduce",
    });
    await page.addInitScript((t) => localStorage.setItem("theme", t), theme);
    await page.goto(origin + "/x1-academic/" + workspace + "?view=" + view);
    await page.getByRole("button", { name: "Try Demo", exact: true }).click();
    await page.getByRole("button", { name: "Dismiss status" }).click();
    await page.getByRole("button", { name: "Focus dashboard" }).click();
    await page.locator(".xc-stage").waitFor();
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: out + "/" + file + ".png",
      animations: "disabled",
    });
    manifest.push({
      file: file + ".png",
      workspace,
      view,
      width: 709,
      height,
      theme,
      focus: true,
      panels: await page.locator(".xc-stage section").count(),
      scrollWidth: await page.evaluate(
        () => document.documentElement.scrollWidth,
      ),
    });
    await page.close();
  }
  for (const [file, width, height, path] of [
    ["home", 1440, 900, ""],
    ["mobile", 390, 844, "/assess-simulate"],
  ]) {
    const page = await browser.newPage({
      viewport: { width, height },
      reducedMotion: "reduce",
    });
    await page.goto(origin + "/x1-academic" + path);
    if (path)
      await page.getByRole("button", { name: "Try Demo", exact: true }).click();
    await page.locator("main h1").waitFor();
    await page.screenshot({
      path: out + "/" + file + ".png",
      animations: "disabled",
    });
    await page.close();
  }
  await writeFile(
    out + "/manifest.json",
    JSON.stringify(manifest, null, 2) + "\n",
  );
} finally {
  await browser.close();
}
