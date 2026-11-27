import { useEffect, useState } from "react";

type Detail = {
  id: string;
  withdrawn: boolean;
  statement: string[];
  guidance: string[];
  objectives: string[];
  methods: { method: string; text: string }[];
};
let catalogueRequest: Promise<Map<string, Detail>> | undefined;
function loadCatalogue() {
  catalogueRequest ??= fetch(new URL("../data/sp80053-catalog.json", import.meta.url))
    .then(async (response) => {
      if (!response.ok) throw Error("Could not load NIST records.");
      const data: { controls: Detail[] } = await response.json();
      return new Map(data.controls.map((row) => [row.id, row]));
    }).catch((error) => {
      catalogueRequest = undefined;
      throw error;
    });
  return catalogueRequest;
}

export function NistDetails({ locator }: { locator: string }) {
  const [result, setResult] = useState<Detail>();
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    loadCatalogue().then((details) => {
      const row = details.get(locator);
      if (!row) throw Error("Missing NIST record.");
      if (active) setResult(row);
    }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [locator, retry]);
  return (
    <div className="xc-nist-detail">
      {error ? <p role="alert">The catalogue could not be loaded. <button type="button" onClick={() => { setError(false); setRetry(n => n + 1); }}>Retry</button></p>
        : !result ? <p role="status">Loading NIST text and assessment procedures…</p>
        : result.withdrawn ? <p>Withdrawn in this edition. Review related controls in the official publication.</p>
        : <>
          <h4>SP 800-53 control statement</h4>
          {result.statement.map((text, i) => <p key={i}>{text}</p>)}
          {result.guidance.length > 0 && <details><summary>NIST discussion</summary>{result.guidance.map((text, i) => <p key={i}>{text}</p>)}</details>}
          <details><summary>SP 800-53A objectives and methods</summary>
            {result.objectives.map((text, i) => <p key={i}>{text}</p>)}
            {result.methods.filter((row) => ["EXAMINE", "INTERVIEW", "TEST"].includes(row.method)).map((row, i) => (
              <div key={i}><h4>{row.method}</h4><p>{row.text}</p></div>
            ))}
          </details>
        </>}
      <p><a href="https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final">SP 800-53</a> · <a href="https://csrc.nist.gov/pubs/sp/800/53/a/r5/final">SP 800-53A</a> · <a href="https://csrc.nist.gov/pubs/sp/800/53/b/upd1/final">SP 800-53B</a></p>
    </div>
  );
}
