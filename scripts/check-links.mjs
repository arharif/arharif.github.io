import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { writeFile } from "node:fs/promises";
import { resources } from "../src/academic/data/resources.ts";
const run = promisify(execFile);
const results = await Promise.all(
  resources.map(async (resource) => {
    try {
      const { stdout } = await run("curl", [
        "--silent",
        "--show-error",
        "--location",
        "--max-time",
        "15",
        "--output",
        "/dev/null",
        "--write-out",
        "%{http_code} %{url_effective}",
        resource.url,
      ]);
      const [status, finalUrl] = stdout.trim().split(" ");
      return {
        id: resource.id,
        url: resource.url,
        checkedAt: new Date().toISOString(),
        status: Number(status),
        finalUrl,
        outcome:
          Number(status) >= 200 && Number(status) < 300
            ? "reachable"
            : "review-required",
      };
    } catch (error) {
      return {
        id: resource.id,
        url: resource.url,
        checkedAt: new Date().toISOString(),
        outcome: "unverified",
        error: String(error.cause?.code || error.message),
      };
    }
  }),
);
await writeFile(
  "docs/x1-academic/LINK_REPORT.json",
  JSON.stringify(results, null, 2) + "\n",
);
console.log(JSON.stringify(results, null, 2));
if (results.some((row) => row.outcome !== "reachable")) process.exitCode = 1;
