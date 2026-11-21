// Rebuild with: node scripts/standards/import-nist.mjs /path/to/downloaded/NIST/json
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const dir = process.argv[2];
if (!dir)
  throw new Error(
    "Supply the directory containing the five original NIST OSCAL JSON files.",
  );
const prefix = "NIST_SP-800-53_rev5_";
const source =
  "https://github.com/usnistgov/oscal-content/blob/main/nist.gov/SP800-53/rev5/json/";
const provenance = [];
async function read(name) {
  const raw = await readFile(`${dir}/${name}`, "utf8");
  provenance.push({
    file: name,
    url: source + name,
    sha256: createHash("sha256").update(raw).digest("hex"),
  });
  return JSON.parse(raw);
}
const { catalog } = await read(prefix + "catalog.json");
function prose(parts) {
  return (parts || [])
    .flatMap((p) => [p.prose || "", ...prose(p.parts)])
    .filter(Boolean);
}
const baselines = {};
for (const b of ["LOW", "MODERATE", "HIGH", "PRIVACY"]) {
  const { profile } = await read(prefix + b + "-baseline_profile.json");
  baselines[b] = [
    ...new Set(
      profile.imports.flatMap((i) =>
        (i["include-controls"] || []).flatMap((c) => c["with-ids"] || []),
      ),
    ),
  ];
}
const controls = [];
for (const group of catalog.groups) {
  function walk(items, parent = null) {
    for (const c of items || []) {
      const status = (c.props || []).find((p) => p.name === "status")?.value;
      const plain = (text) =>
        text
          .replace(/<[^>]*>/g, "")
          .replace(
            /\{\{ insert: param, ([^}]+) \}\}/g,
            "[organisation-defined parameter: $1]",
          );
      const parts = c.parts || [];
      controls.push({
        id: c.id,
        displayId:
          (c.props || []).find((p) => p.name === "label" && !p.class)?.value ||
          c.id.toUpperCase(),
        family: group.id,
        familyTitle: group.title,
        title: c.title,
        parent,
        withdrawn: status === "withdrawn",
        statement: prose(parts.filter((p) => p.name === "statement")).map(
          plain,
        ),
        guidance: prose(parts.filter((p) => p.name === "guidance")).map(plain),
        objectives: prose(
          parts.filter((p) => p.name === "assessment-objective"),
        ).map(plain),
        methods: parts
          .filter((p) => /assessment-method|assessment-object/.test(p.name))
          .flatMap((p) => [
            {
              method:
                (p.props || []).find((x) => x.name === "method")?.value ||
                p.name,
              text: prose([p]).map(plain).join("\n"),
            },
          ]),
        related: (c.links || [])
          .filter((l) => l.rel === "related")
          .map((l) => l.href.replace(/^#/, "")),
      });
      walk(c.controls, c.id);
    }
  }
  walk(group.controls);
}
const output = {
  authority: "NIST",
  edition: "SP 800-53 / 53A Rev. 5; release " + catalog.metadata.version,
  version: catalog.metadata.version,
  publicationDate: "2025-08-27",
  retrieved: "2026-11-20",
  representationModified: catalog.metadata["last-modified"],
  provenance,
  baselines,
  controls,
};
await writeFile(
  "src/academic/data/sp80053-catalog.json",
  JSON.stringify(output),
);
console.log(
  JSON.stringify({
    controls: controls.length,
    active: controls.filter((c) => !c.withdrawn).length,
    families: catalog.groups.length,
    baselines: Object.fromEntries(
      Object.entries(baselines).map(([b, c]) => [b, c.length]),
    ),
    withObjectives: controls.filter((c) => c.objectives.length).length,
  }),
);
