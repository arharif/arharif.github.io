import { createHmac } from "node:crypto";
import { expect, test, type Page } from "@playwright/test";

test.skip(process.env.X1_AUTH_FIXTURE !== "1", "Requires the isolated synthetic Auth build");

const origin = "https://x1-auth.example";
const secret = "JBSWY3DPEHPK3PXP";
const key = Buffer.from("48656c6c6f21deadbeef", "hex");
const epoch = Math.floor(Date.now() / 30000);
const email = "owner@example.test";
const password = "browser-fixture-password";
function otp(tick = epoch) {
  const bytes = Buffer.alloc(8);
  bytes.writeBigUInt64BE(BigInt(tick));
  const digest = createHmac("sha1", key).update(bytes).digest();
  const index = digest.at(-1)! & 15;
  return String((digest.readUInt32BE(index) & 0x7fffffff) % 1_000_000).padStart(6, "0");
}

async function install(page: Page, initiallyEnrolled: boolean) {
  let enrolled = initiallyEnrolled;
  let challenge = 0;
  let refresh = 0;
  let logout = 0;
  let setup = false;
  let expired = false;
  const owner = { id: "owner-fixture", email };
  const auth = (access_token: string) => ({
    access_token, refresh_token: "refresh-fixture", token_type: "bearer",
    expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, user: owner,
  });
  await page.route(origin + "/**", async route => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const token = request.headers().authorization?.replace("Bearer ", "");
    const body = request.postDataJSON();
    const send = (json: unknown, status = 200) => route.fulfill({
      status, contentType: "application/json",
      headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(json),
    });
    if (request.method() === "OPTIONS") return route.fulfill({
      status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Methods": "*" },
    });
    if (path.endsWith("/token") && url.searchParams.get("grant_type") === "password") {
      if (body.password !== password) return send({ error_code: "invalid_credentials" }, 400);
      return send(auth(body.email === email ? "owner-aal1" : "ordinary-aal1"));
    }
    if (path.endsWith("/token")) {
      refresh++;
      return expired ? send({ error_code: "refresh_token_not_found" }, 400) : send(auth("owner-aal2"));
    }
    if (path.endsWith("/is_x1_owner")) return send(token?.startsWith("owner-") ?? false);
    if (path.endsWith("/can_publish_x1")) return send(token === "owner-aal2");
    if (path.endsWith("/user")) return send({ ...owner, factors: enrolled
      ? [{ id: "factor-fixture", factor_type: "totp", status: "verified" }]
      : setup ? [{ id: "factor-fixture", factor_type: "totp", status: "unverified", friendly_name: "X1 Publishing" }] : [] });
    if (path.endsWith("/factors/factor-fixture") && request.method() === "DELETE") { setup = false; return send({}); }
    if (path.endsWith("/factors")) {
      if (setup) return send({ error_code: "mfa_factor_name_conflict" }, 422);
      setup = true;
      return send({ id: "factor-fixture", totp: { secret, qr_code: '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40"/></svg>' } });
    }
    if (path.endsWith("/challenge")) return send({ id: "challenge-" + ++challenge });
    if (path.endsWith("/verify")) {
      if (body.challenge_id !== "challenge-" + challenge || body.code !== otp()) return send({ error_code: "mfa_verification_failed" }, 422);
      enrolled = true;
      return send(auth("owner-aal2"));
    }
    if (path.endsWith("/logout")) { logout++; return route.fulfill({ status: 204, headers: { "Access-Control-Allow-Origin": "*" } }); }
    return send([]);
  });
  return { refreshes: () => refresh, logouts: () => logout, challenges: () => challenge, expire: () => { expired = true; } };
}

async function passwordStep(page: Page, account = email, supplied = password) {
  await page.getByLabel("Email", { exact: true }).fill(account);
  await page.getByLabel("Password", { exact: true }).fill(supplied);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
}
async function enterCode(page: Page, value: string) {
  await page.getByLabel("One-time code").fill(value);
  await page.getByRole("button", { name: "Verify", exact: true }).click();
}

test("initial enrolment, reload, expired code, verified owner session and logout", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const server = await install(page, false);
  await page.goto("/");
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login$/);
  await passwordStep(page, email, "wrong-password-fixture");
  await expect(page.getByRole("alert")).toHaveText("Email or password is incorrect.");
  await passwordStep(page);
  await expect(page.getByRole("img", { name: "Scan with your authenticator app" })).toBeVisible();
  await page.getByText("Enter a setup key manually").click();
  await expect(page.locator(".owner-login code")).toBeVisible();
  expect(await page.evaluate(() => sessionStorage.getItem("x1-auth-session"))).toBeNull();
  await page.reload();
  await expect(page.getByLabel("Password")).toBeVisible();
  await passwordStep(page);
  await enterCode(page, otp(epoch - 5));
  await expect(page.getByRole("alert")).toContainText("fresh six-digit code");
  await enterCode(page, otp() === "000000" ? "000001" : "000000");
  await expect(page.getByRole("alert")).toContainText("fresh six-digit code");
  await enterCode(page, otp());
  await expect(page).toHaveURL(/\/admin$/);
  expect(server.challenges()).toBe(3);
  await page.reload();
  await expect(page.getByRole("button", { name: "Logout", exact: true })).toBeVisible();
  expect(server.refreshes()).toBe(0);
  await page.getByRole("button", { name: "Open navigation menu" }).click();
  await page.getByRole("link", { name: "X1 Academic", exact: true }).click();
  await expect(page).toHaveURL(/\/x1-academic$/);
  await expect(page.getByRole("heading", { name: "X1 Academic.", exact: true })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole("button", { name: "Open navigation menu" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Logout", exact: true })).toBeVisible();
  expect(server.refreshes()).toBe(0);
  await page.getByRole("button", { name: "Logout", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("You signed out");
  await expect.poll(server.logouts).toBeGreaterThan(0);
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await page.goForward();
  await expect(page.getByLabel("Password")).toBeVisible();
  await passwordStep(page);
  await expect(page.getByLabel("One-time code")).toBeVisible();
  await expect(page.getByRole("img", { name: "Scan with your authenticator app" })).toHaveCount(0);
});

test("non-owner denial and owner refresh and expiry", async ({ page }) => {
  const server = await install(page, true);
  await page.goto("/login");
  await passwordStep(page, "other@example.test");
  await expect(page.getByRole("alert")).toContainText("configured for X1 owner access");
  await passwordStep(page);
  await enterCode(page, otp());
  await expect(page).toHaveURL(/\/admin$/);
  const expireStorage = () => page.evaluate(() => {
    const key = "x1-auth-session";
    const value = JSON.parse(sessionStorage.getItem(key)!);
    sessionStorage.setItem(key, JSON.stringify({ ...value, expires_at: 1 }));
  });
  await expireStorage();
  await page.reload();
  await expect(page.getByRole("button", { name: "Logout", exact: true })).toBeVisible();
  expect(server.refreshes()).toBe(1);
  await expireStorage();
  server.expire();
  await page.reload();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("status")).toContainText("session could not be restored");
});
