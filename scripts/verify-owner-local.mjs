// Run only against a disposable local Supabase stack with this project ID.
// Local integration data stays in that stack until it is removed.
import assert from "node:assert/strict";
import { randomUUID, createHmac } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { chromium, expect } from "@playwright/test";
import { build, preview } from "vite";

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
const root = await mkdtemp(join(tmpdir(), "x1-owner-build-"));
const buildOptions = {outDir: join(root, "dist")};
await build({build: buildOptions, logLevel: "error"});
execFileSync(process.execPath, [fileURLToPath(new URL("./pages-csp.mjs", import.meta.url))], {cwd:root});
const server = await preview({build: buildOptions, preview: {host:"127.0.0.1", port:4177, strictPort:true},logLevel:"error"});
const browser = await chromium.launch({
  executablePath:
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const evidence = [];
const timingsMs = {};
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  const proxy = async (route) => {
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
  };
  await page.route("https://x1-local.example/**", proxy);
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
  const verifyStarted = performance.now();
  await page.getByRole("button", { name: "Verify", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Owner Publishing Studio" }),
  ).toBeVisible();
  evidence.push(
    "Owner password, native factor enrollment, TOTP challenge, verification and AAL2 studio access",
  );
  timingsMs.verifyToStudio = Math.round(performance.now() - verifyStarted);
  const suffix = randomUUID().slice(0, 8);
  const topic = "Studio test " + suffix,
    title = "Editorial integration " + suffix;
  await page.getByRole("button", {name:"Create Topic",exact:true}).click();
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
  await page.getByRole("navigation",{name:"Publishing workflow"}).getByRole("button",{name:"Preview"}).click();
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
  await page.locator(".studio-editor").evaluate(el => window.scrollTo(0, el.getBoundingClientRect().top + scrollY - 80));
  await page.screenshot({path:"docs/elite-review/studio.jpg",quality:82});
  await page.reload();
  await expect(page.getByLabel("Article title")).toHaveValue(title);
  const saveStarted = performance.now();
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(
    page.getByText("Draft saved privately and verified."),
  ).toBeVisible();
  timingsMs.saveToDraftConfirmation = Math.round(performance.now() - saveStarted);
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
  const publishStarted = performance.now();
  await page.getByRole("group",{name:"Publishing actions"}).getByRole("button",{name:"Publish",exact:true}).click();
  await expect(
    page.getByText("Published and verified on the public content service."),
  ).toBeVisible();
  timingsMs.publishToPublicConfirmation = Math.round(performance.now() - publishStarted);
  assert.equal((await select())[0].reading_minutes, 4);
  assert.deepEqual((await select())[0].tags, ["AI", "Technology"]);
  assert.equal(await imageStatus(), 200);
  const visitor = await browser.newPage();
  await visitor.route("https://x1-local.example/**",proxy);
  async function publicCover(file) {

    await visitor.goto("http://127.0.0.1:4177/insights-innovation");
    const card = visitor.locator(".editorial-card").filter({hasText:title});
    async function matchImage(image) {
      await expect.poll(() => image.evaluate(async (el, path) => {
        if (!el.complete || !el.naturalWidth || !el.src.startsWith("blob:")) return false;
        const original = new Image();
        original.src = "/" + path.replace(/^public\//,"");
        await original.decode();
        const pixels = img => {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img,0,0);
          return ctx.getImageData(0,0,canvas.width,canvas.height).data;
        };
        const a = pixels(el), b = pixels(original);
        return a.length === b.length && a.every((value,i) => value === b[i]);
      },file)).toBe(true);
    }
    await matchImage(card.locator("img"));
    await card.getByRole("link").click();
    await matchImage(visitor.getByRole("img",{name:title,exact:true}));
  }
  await publicCover("public/art/insights-small.webp");
  await page.getByLabel("Cover image",{exact:true}).setInputFiles("public/art/academic-small.webp");
  await expect(image).toHaveJSProperty("naturalHeight",200);
  await page.getByRole("button",{name:"Update published",exact:true}).click();
  await expect.poll(imageStatus).not.toBe(200);
  await publicCover("public/art/academic-small.webp");
  await page.getByRole("button",{name:"Remove cover"}).click();
  await page.getByRole("button",{name:"Update published",exact:true}).click();
  await expect.poll(async () => Boolean((await select())[0].cover_image_url)).toBe(false);
  await visitor.reload();
  await expect(visitor.getByRole("heading",{name:title,exact:true}).last()).toBeVisible();
  await expect(visitor.getByRole("img",{name:title,exact:true})).toHaveCount(0);
  await visitor.close();
  evidence.push("Anonymous Insights card and full article rendered pixel-identical uploaded and replaced covers. Published removal cleared the full article cover.");
  await page.getByLabel("Article Markdown").fill("Published revision.");
  const mutation = /https:\/\/x1-local\.example\/rest\/v1\/content\?.*/;
  await page.route(mutation, route => route.request().method() === "PATCH" ? route.abort() : route.fallback());
  await page.getByRole("button", {name:"Update published",exact:true}).click();
  await expect(page.getByText("Save failed. Your edits are retained in this tab.")).toBeVisible();
  await expect(page.getByLabel("Article Markdown")).toHaveValue("Published revision.");
  assert.notEqual((await select())[0].body,"Published revision.");
  await page.unroute(mutation);
  evidence.push("An interrupted edit preserves unsaved text and the next attempt succeeds");
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
  async function logout() {
    const revoked = page.waitForResponse(r => r.url().includes("/auth/v1/logout") && r.request().method() === "POST");
    await page.getByRole("button", { name: "Logout", exact: true }).click();
    assert.ok((await revoked).ok());
  }
  await logout();
  await expect(
    page.getByRole("heading", { name: "Owner sign in" }),
  ).toBeVisible();
  evidence.push("Logout closes the studio");
  await login(owner);
  await expect(page.getByLabel("One-time code")).toBeVisible();
  await expect(page.locator(".owner-login code")).toHaveCount(0);
  // A used authenticator code cannot be replayed. Wait for the next TOTP step.
  await new Promise(resolve => setTimeout(resolve, 31_000 - Date.now() % 30_000));
  await page.getByLabel("One-time code").fill(totp(secret));
  await page.getByRole("button", {name:"Verify",exact:true}).click();
  await expect(page.getByRole("heading",{name:"Owner Publishing Studio"})).toBeVisible();
  await logout();
  await page.unrouteAll({behavior:"wait"});
  evidence.push("Returning owner completes an existing TOTP challenge without re-enrollment");
  await writeFile(
    "docs/elite-review/owner-local.json",
    JSON.stringify(
      { service: "Disposable local Supabase", client:"Production Vite build with document CSP", timingsMs, evidence },
      null,
      2,
    ) + "\n",
  );
  console.log(evidence.join("\n"));
} finally {
  await browser.close();
  await new Promise(resolve => server.httpServer.close(resolve));
  await rm(root,{recursive:true,force:true});
}
