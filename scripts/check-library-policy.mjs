// Build with the documented fictional integration settings and serve dist on 4174.
// Every backend request is intercepted; this never authenticates or publishes remotely.
import { chromium, expect } from "@playwright/test";
import { existsSync } from "node:fs";
const browser = await chromium.launch({
  executablePath:
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
    (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
  args: ["--no-sandbox"],
});
try {
  const page = await browser.newPage();
  const requests = [],
    errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    sessionStorage.setItem(
      "x1-auth-session",
      JSON.stringify({
        access_token: "fictional-token",
        refresh_token: "fictional-refresh",
        token_type: "bearer",
        expires_in: 3600,
        user: { id: "fictional-admin", email: "teacher@example.invalid" },
      }),
    );
    window.__policyViolations = [];
    document.addEventListener("securitypolicyviolation", (event) =>
      window.__policyViolations.push(event.violatedDirective),
    );
  });
  await page.route("https://x1-test.invalid/**", async (route) => {
    const request = route.request();
    requests.push({
      method: request.method(),
      path: new URL(request.url()).pathname,
    });
    let result = request.url().includes("/auth/")
      ? { id: "fictional-admin", email: "teacher@example.invalid" }
      : [];
    if (
      request.method() === "POST" &&
      request.url().includes("academic_resources")
    )
      result = [{ id: "fictional-resource", ...request.postDataJSON() }];
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      },
      body: JSON.stringify(result),
    });
  });
  await page.goto("http://127.0.0.1:4174/x1-academic/resources/");
  await page
    .getByRole("button", { name: "Published Academic Library", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Resource management", exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("Resource name", { exact: true })
    .fill("Synthetic publishing boundary test");
  await page
    .getByLabel("Link / URL", { exact: true })
    .fill("https://example.invalid/fictional-guide");
  await page
    .getByLabel("Description", { exact: true })
    .fill("Entirely fictional browser-intercepted integration test.");
  await page
    .getByRole("button", { name: "Publish resource", exact: true })
    .click();
  await expect(
    page.getByText("Resource published successfully.", { exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => window.__policyViolations)).toEqual([]);
  expect(errors).toEqual([]);
  expect(requests.some((request) => request.method === "POST")).toBe(true);
  console.log(
    JSON.stringify({
      outcome:
        "PASS: synthetic auth, library read and publishing permitted under configured-origin CSP",
      requests,
      pageErrors: errors,
    }),
  );
} finally {
  await browser.close();
}
