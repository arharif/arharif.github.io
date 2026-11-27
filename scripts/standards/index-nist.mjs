// The console index is regenerated from the checked-in NIST OSCAL derivative.
import { readFile, writeFile } from "node:fs/promises";
const data = JSON.parse(await readFile(new URL("../../src/academic/data/sp80053-catalog.json", import.meta.url)));
const index = {
  version: data.version,
  baselines: data.baselines,
  families: [...new Map(data.controls.map(row => [row.family, row.familyTitle]))],
  controls: data.controls.map(({ id, displayId, title, family, parent, withdrawn }) =>
    ({ id, displayId, title, family, parent, withdrawn })),
};
await writeFile(new URL("../../src/academic/data/sp80053-index.json", import.meta.url), JSON.stringify(index) + "\n");
