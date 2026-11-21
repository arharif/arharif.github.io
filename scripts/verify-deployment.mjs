import assert from "node:assert/strict";

const origin = "https://arharif.github.io";
const expectedCommit = process.env.GITHUB_SHA;
assert.ok(
  expectedCommit,
  "GITHUB_SHA must identify the deployment being verified.",
);

async function request(path) {
  const response = await fetch(`${origin}${path}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(20000),
  });
  assert.ok(response.ok, `${path} returned HTTP ${response.status}`);
  return response;
}

let published;
for (let attempt = 0; attempt < 12; attempt++) {
  try {
    published = await (
      await request(`/deployment.json?revision=${expectedCommit}`)
    ).json();
    if (published.commit === expectedCommit) break;
  } catch (error) {
    console.log(
      `Deployment propagation check ${attempt + 1}: ${error.message}`,
    );
  }
  if (attempt < 11) await new Promise((resolve) => setTimeout(resolve, 10000));
}
assert.equal(
  published?.commit,
  expectedCommit,
  "The expected revision has not reached the public site.",
);

const routes = [
  "/",
  "/x1-academic",
  "/x1-academic/standards",
  "/x1-academic/standards/800-53",
  "/x1-academic/simulate",
  "/x1-academic/simulate/privacy",
  "/x1-academic/assess",
  "/x1-academic/implement",
  "/x1-academic/report",
  "/x1-academic/resources",
  "/x1-academic/security-map",
  "/x1-academic/risk-register",
  "/x1-academic/labs/framework-explorer",
  "/x1-academic/knowledge-graph",
  "/x1-academic/labs/risk-decision",
  "/x1-academic/labs/cyber-incident",
  "/x1-academic/labs/ai-experiment",
  "/x1-academic/labs/ciso-boardroom",
  "/x1-academic/learning/risk-assessment",
  "/x1-academic/learning/incident-triage",
  "/x1-academic/learning/detection-evaluation",
];
const assets = new Set();
for (const route of routes) {
  const response = await request(`${route}${route.endsWith("/") ? "" : "/"}`);
  assert.match(response.headers.get("content-type") || "", /text\/html/);
  const html = await response.text();
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/);
  assert.equal(
    canonical?.[1],
    `${origin}${route}`,
    `${route} has incorrect canonical metadata.`,
  );
  for (const match of html.matchAll(/(?:src|href)="(\/assets\/[^"?]+)"/g))
    assets.add(match[1]);
  console.log(`Verified published page ${route}`);
}
for (const asset of assets) {
  await (await request(asset)).arrayBuffer();
  console.log(`Verified compiled asset ${asset}`);
}
console.log(
  `Verified deployment ${expectedCommit}, ${routes.length} pages and ${assets.size} compiled entry assets.`,
);
