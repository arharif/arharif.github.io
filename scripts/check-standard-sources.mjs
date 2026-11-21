import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { standards } from "../src/academic/studio/standards.ts";
const run = promisify(execFile),
  directory = await mkdtemp(join(tmpdir(), "x1-publisher-review-"));
try {
  const results = [];
  for (const standard of standards) {
    try {
      const path = join(directory, `${standard.id}.html`);
      const { stdout } = await run("curl", [
        "--silent",
        "--show-error",
        "--location",
        "--max-time",
        "15",
        "--max-filesize",
        "2000000",
        "--output",
        path,
        "--write-out",
        "%{http_code} %{url_effective}",
        standard.url,
      ]);
      const [status, finalUrl] = stdout.trim().split(" "),
        html = await readFile(path, "utf8");
      const title =
        html
          .match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 350) ?? "";
      results.push({
        id: standard.id,
        source: standard.url,
        checkedAt: new Date().toISOString(),
        status: Number(status),
        finalUrl,
        publisherTitle: title,
        outcome:
          Number(status) >= 200 && Number(status) < 300
            ? "Publisher reference reachable"
            : "Review required",
        editionStatus:
          "Manual edition, amendment and legal-status review required",
      });
    } catch (error) {
      results.push({
        id: standard.id,
        source: standard.url,
        checkedAt: new Date().toISOString(),
        outcome: "Unverified",
        error: String(error.message).slice(0, 600),
        editionStatus: "Pending authoritative verification",
      });
    }
  }
  await mkdir("test-results", { recursive: true });
  await writeFile(
    "test-results/standards-source-review.json",
    JSON.stringify(results, null, 2) + "\n",
  );
  console.log(JSON.stringify(results, null, 2));
  const summary = JSON.stringify(
    results.map(({ id, outcome, publisherTitle }) => ({
      id,
      outcome,
      publisherTitle,
    })),
  )
    .replace(/%/g, "%25")
    .replace(/\r/g, "%0D")
    .replace(/\n/g, "%0A");
  console.log(`::notice title=Publisher source review::${summary}`);
  if (results.some((row) => row.outcome !== "Publisher reference reachable"))
    process.exitCode = 1;
} finally {
  await rm(directory, { recursive: true, force: true });
}
