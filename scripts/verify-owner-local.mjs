// Run only against a disposable local Supabase stack with this project ID.
// Local integration data stays in that stack until it is removed.
import assert from "node:assert/strict";
import { randomUUID, createHmac } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { chromium, expect } from "@playwright/test";
import { createServer } from "vite";

const api = "http://127.0.0.1:54321";
const anon = process.env.X1_TEST_ANON;
if (!anon)
  throw new Error("Supply the disposable local stack anon key as X1_TEST_ANON");
const sql = await readFile("docs/supabase.sql", "utf8");
const project = "supabase_db_x1-local-supabase";
const db = (script) =>
  execFileSync(
    "docker",
    [
      "--host=unix:///var/run/docker.sock",
      "exec",
      "-i",
      project,
      "psql",
      "-v",
      "ON_ERROR_STOP=1",
      "-U",
      "postgres",
      "-d",
      "postgres",
      "-q",
    ],
    { input: script, stdio: ["pipe", "ignore", "pipe"] },
  );
async function newAccount() {
  const email = "x1-" + randomUUID() + "@example.test",
    password = randomUUID();
  const result = await fetch(api + "/auth/v1/signup", {
    method: "POST",
    headers: { apikey: anon, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  assert.ok(result.ok, "Local signup returned " + result.status);
  const { user } = await result.json();
  return { email, password, id: user.id };
}
function totp(secret) {
  const bits = [...secret.replace(/=+$/, "").toUpperCase()]
    .map((c) =>
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
        .indexOf(c)
        .toString(2)
        .padStart(5, "0"),
    )
    .join("");
  const key = Buffer.from(bits.match(/.{8}/g).map((s) => parseInt(s, 2)));
  const clock = Buffer.alloc(8);
  clock.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30000)));
  const hash = createHmac("sha1", key).update(clock).digest();
  return String(
    (hash.readUInt32BE(hash[19] & 15) & 0x7fffffff) % 1000000,
  ).padStart(6, "0");
}
const owner = await newAccount(),
  member = await newAccount();
db(sql.replaceAll("<OWNER_UUID>", owner.id));
db("notify pgrst, 'reload schema';");
process.env.VITE_SUPABASE_URL = "https://x1-local.example";
process.env.VITE_SUPABASE_ANON_KEY = anon;
const server = await createServer({
  server: { host: "127.0.0.1", port: 4177, strictPort: true },
  logLevel: "error",
});
await server.listen();
const browser = await chromium.launch({
  executablePath:
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const evidence = [];
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  await page.route("https://x1-local.example/**", async (route) => {
    const response = await route.fetch({
      url:
        api +
        new URL(route.request().url()).pathname +
        new URL(route.request().url()).search,
    });
    await route.fulfill({
      response,
      headers: { ...response.headers(), "access-control-allow-origin": "*" },
    });
  });
  await page.goto("http://127.0.0.1:4177/login");
  async function login(account) {
    await page.getByLabel("Email", { exact: true }).fill(account.email);
    await page.getByLabel("Password", { exact: true }).fill(account.password);
    await page.getByRole("button", { name: "Continue", exact: true }).click();
  }
  await login(member);
  await expect(
    page.getByText("Authentication could not be completed.", { exact: true }),
  ).toBeVisible();
  evidence.push("Non-owner password sign-in denied by owner RPC");
  await login(owner);
  await expect(page.getByLabel("One-time code")).toBeVisible();
  const secret = await page.locator("code").innerText();
  await page.getByLabel("One-time code").fill(totp(secret));
  await page.getByRole("button", { name: "Verify", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Owner Publishing Studio" }),
  ).toBeVisible();
  evidence.push(
    "Owner password, native factor enrollment, TOTP challenge, verification and AAL2 studio access",
  );
  const suffix = randomUUID().slice(0, 8);
  const topic = "Studio test " + suffix,
    title = "Editorial integration " + suffix;
  await page.getByPlaceholder("Topic title", { exact: true }).fill(topic);
  await page.getByPlaceholder("Category", { exact: true }).fill("Technology");
  await page.getByRole("button", { name: "Save Topic", exact: true }).click();
  await page
    .getByLabel("Topic", { exact: true })
    .selectOption({ label: topic });
  await page.getByLabel("Article title").fill(title);
  const body =
    "## Editorial note\n\nA [published link](https://example.com) with **emphasis**.";
  await page.getByLabel("Article Markdown").fill(body);
  await page.getByLabel("Editor mode").selectOption("visual");
  await page.getByRole("button", { name: "Edit block 2" }).click();
  await page
    .getByLabel("Block text")
    .fill("Updated paragraph with **emphasis**.");
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await page.getByLabel("Editor mode").selectOption("markdown");
  await expect(page.getByLabel("Article Markdown")).toHaveValue(
    "## Editorial note\n\nUpdated paragraph with **emphasis**.",
  );
  await page
    .getByPlaceholder("Excerpt", { exact: true })
    .fill("Local integration fixture.");
  await page
    .getByPlaceholder("Quick tags (optional, text only)")
    .fill("AI,Technology");
  await page.getByLabel("Reading time override").fill("4");
  await page.getByRole("button", { name: "Preview", exact: true }).click();
  await expect(
    page.getByLabel("Live preview").getByText("emphasis", { exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("Cover image", { exact: true })
    .setInputFiles("public/art/academic-small.webp");
  const image = page.getByAltText("Cover preview");
  await expect(image).toHaveJSProperty("naturalWidth", 448, { timeout: 20000 });
  await page.getByRole("button", { name: "Remove cover", exact: true }).click();
  await expect(image).toHaveCount(0);
  await page
    .getByLabel("Cover image", { exact: true })
    .setInputFiles("public/art/insights-small.webp");
  await expect(image).toHaveJSProperty("naturalWidth", 448);
  await page.getByLabel("Article title").scrollIntoViewIfNeeded();
  await page.screenshot({path:"docs/elite-review/studio.jpg",quality:82});
  await page.reload();
  await expect(page.getByLabel("Article title")).toHaveValue(title);
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(
    page.getByText("Draft saved privately and verified."),
  ).toBeVisible();
  const select = async (token = anon) => {
    const r = await fetch(
      api + "/rest/v1/content?title=eq." + encodeURIComponent(title),
      { headers: { apikey: anon, Authorization: "Bearer " + token } },
    );
    assert.equal(r.status, 200);
    return r.json();
  };
  assert.equal((await select()).length, 0);
  const rows = await select(
    await page.evaluate(
      () => JSON.parse(sessionStorage.getItem("x1-auth-session")).access_token,
    ),
  );
  const key = rows[0].cover_image_url.split("/").pop();
  const imageStatus = async () =>
    (
      await fetch(
        api + "/storage/v1/object/authenticated/x1-editorial/" + key,
        { headers: { apikey: anon, Authorization: "Bearer " + anon } },
      )
    ).status;
  assert.notEqual(await imageStatus(), 200);
  evidence.push(
    "Topic creation, visual and Markdown editing, live preview, tags, manual reading time, cover upload/replacement/removal, reload recovery and private draft read boundaries",
  );
  await page.getByRole("button", { name: "Publish", exact: true }).click();
  await expect(
    page.getByText("Published and verified on the public content service."),
  ).toBeVisible();
  assert.equal((await select())[0].reading_minutes, 4);
  assert.deepEqual((await select())[0].tags, ["AI", "Technology"]);
  assert.equal(await imageStatus(), 200);
  await page.getByLabel("Article Markdown").fill("Published revision.");
  await page
    .getByRole("button", { name: "Update published", exact: true })
    .click();
  await expect
    .poll(async () => (await select())[0].body)
    .toBe("Published revision.");
  await page
    .getByRole("button", { name: "Unpublish to draft", exact: true })
    .click();
  await expect(
    page.getByText("Draft saved privately and verified."),
  ).toBeVisible();
  assert.equal((await select()).length, 0);
  assert.notEqual(await imageStatus(), 200);
  evidence.push(
    "Publish, anonymous article and image reads, edit, unpublish and withdrawal of image access",
  );
  await page.getByRole("button", { name: "Logout", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Owner sign in" }),
  ).toBeVisible();
  evidence.push("Logout closes the studio");
  await writeFile(
    "docs/elite-review/owner-local.json",
    JSON.stringify(
      { service: "Disposable local Supabase", evidence },
      null,
      2,
    ) + "\n",
  );
  console.log(evidence.join("\n"));
} finally {
  await browser.close();
  await server.close();
}
