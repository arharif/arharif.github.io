import { ArrowUpRight } from "lucide-react";

const references = {
  1: ["01-cyber-risk-dashboard.png", "Cyber risk dashboard", 480],
  2: ["02-interactive-knowledge-graph.png", "Interactive knowledge graph", 464],
  3: ["03-nist-csf-assessment.png", "NIST CSF assessment dashboard", 451],
  4: [
    "04-risk-management-matrix.png",
    "Risk matrix and management dashboard",
    412,
  ],
  5: ["05-ai-experiment-studio.png", "AI experiment studio", 361],
  6: ["06-grc-executive-dashboard.png", "GRC executive dashboard", 440],
  7: ["07-pmo-gantt-planner.png", "PMO dashboard and Gantt", 720],
  8: ["08-privacy-data-flow.png", "Privacy data flow map", 456],
  9: ["09-governance-radar.png", "Governance radar dashboard", 418],
} as const;

export default function ReferenceImages({
  ids,
}: {
  ids: readonly (keyof typeof references)[];
}) {
  return (
    <section
      className="xa-reference-section"
      aria-label="Reference screenshots"
    >
      <h2>Design references</h2>
      <div className="xa-reference-grid">
        {ids.map((id) => {
          const [file, title, height] = references[id];
          const src = `/x1-academic/reference-images/${file}`;
          return (
            <figure key={id}>
              <a
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View original ${title} screenshot`}
              >
                <img
                  src={src}
                  width={709}
                  height={height}
                  alt={`${title}, third-party reference screenshot`}
                  loading="lazy"
                />
              </a>
              <figcaption>
                <span>{title}</span>
                <a href={src} target="_blank" rel="noopener noreferrer">
                  View original <ArrowUpRight size={14} aria-hidden="true" />
                </a>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </section>
  );
}
