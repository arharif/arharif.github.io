import { useEffect, useState } from "react";

type Statute = "gdpr" | "dora";
const locations = {
  gdpr: new URL("../data/gdpr-article-text.json", import.meta.url),
  dora: new URL("../data/dora-article-text.json", import.meta.url),
};
const cache = new Map<Statute, Promise<Record<string, string>>>();

function getStatute(law: Statute) {
  const previous = cache.get(law);
  if (previous) return previous;
  const request = fetch(locations[law]).then(response => {
    if (!response.ok) throw Error("Official text unavailable");
    return response.json() as Promise<Record<string, string>>;
  }).catch(error => {
    cache.delete(law);
    throw error;
  });
  cache.set(law, request);
  return request;
}

export function LegalArticle({ law, id, source }: { law: Statute; id: string; source: string }) {
  const [text, setText] = useState<string>();
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let mounted = true;
    getStatute(law).then(rows => {
      if (!rows[id]) throw Error("Missing article");
      if (mounted) setText(rows[id]);
    }).catch(() => { if (mounted) setFailed(true); });
    return () => { mounted = false; };
  }, [law, id]);
  return <>
    <p><a href={source} target="_blank" rel="noreferrer">EUR-Lex · Article {id} and current official text</a></p>
    {text ? <div className="xc-nist-detail">
      <p><strong>Official wording · reference copy</strong></p>
      <p>{text}</p>
    </div> : <p role="status">{failed ? "The local reference could not be loaded. Open the EUR-Lex text." : "Loading the reference copy…"}</p>}
  </>;
}
