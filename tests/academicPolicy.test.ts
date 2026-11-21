import test from "node:test";
import assert from "node:assert/strict";
import { academicPolicy } from "../scripts/academic-policy.mjs";

test("academic policy preserves the configured HTTPS backend and rejects unsafe origins", () => {
  const local = academicPolicy(undefined);
  assert.match(local, /connect-src 'self';/);
  assert.match(local, /script-src 'self';/);
  assert.ok(!local.includes("unsafe-eval"));
  for (const input of [
    "javascript:alert(1)",
    "http://example.invalid",
    "data:text/plain,test",
    "https://user:password@example.invalid",
    "not-a-url",
    "https://*.example.invalid",
  ])
    assert.equal(academicPolicy(input), local);
  const configured = academicPolicy(
    "https://x1-test.invalid/rest/v1?token=synthetic-secret#fragment",
  );
  assert.match(configured, /connect-src 'self' https:\/\/x1-test\.invalid;/);
  assert.ok(!configured.includes("token="));
  assert.ok(!configured.includes("synthetic-secret"));
  assert.ok(!configured.includes("/rest/"));
});
