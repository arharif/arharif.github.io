import { useState } from "react";
import type { Standard } from "../../data/standards";
export default function ArchitectureDiagram({
  standard,
  selected,
  onSelect,
}: {
  standard: Standard;
  selected: string;
  onSelect: (id: string) => void;
}) {
  const [zoom, setZoom] = useState(1);
  const count = standard.nodes.length;
  const cycle = standard.layout === "cycle";
  return (
    <div className="xa-standard-diagram">
      <div className="xa-actions">
        <button
          aria-label="Zoom out architecture"
          onClick={() => setZoom(Math.max(0.75, zoom - 0.15))}
        >
          −
        </button>
        <span>{Math.round(zoom * 100)}%</span>
        <button
          aria-label="Zoom in architecture"
          onClick={() => setZoom(Math.min(1.6, zoom + 0.15))}
        >
          +
        </button>
        <button onClick={() => setZoom(1)}>Reset view</button>
      </div>
      <div
        className="xa-diagram-scroll"
        role="region"
        aria-label={`${standard.title} interactive architecture`}
        tabIndex={0}
      >
        <div
          className={`xa-architecture ${cycle ? "is-cycle" : `is-${standard.layout}`}`}
          style={{
            width: "100%",
            transform: `scale(${zoom})`,
            transformOrigin: "top left",
            minHeight: cycle ? "430px" : undefined,
          }}
        >
          {cycle && (
            <div className="xa-cycle-core">
              <strong>{standard.title}</strong>
              <span>Continual improvement</span>
            </div>
          )}
          {standard.nodes.map((item, index) => (
            <button
              key={item.id}
              className="xa-architecture-node"
              aria-pressed={selected === item.id}
              onClick={() => onSelect(item.id)}
              style={
                cycle
                  ? {
                      left: `${50 + 34 * Math.cos((index / count) * Math.PI * 2 - Math.PI / 2)}%`,
                      top: `${50 + 35 * Math.sin((index / count) * Math.PI * 2 - Math.PI / 2)}%`,
                    }
                  : undefined
              }
            >
              <span className={`xa-stage-icon xa-stage-${index % 5}`}>
                {item.id === "GOVERN"
                  ? "GV"
                  : item.id === "IDENTIFY"
                    ? "ID"
                    : item.id === "PROTECT"
                      ? "PR"
                      : item.id === "DETECT"
                        ? "DE"
                        : item.id === "RESPOND"
                          ? "RS"
                          : item.id === "RECOVER"
                            ? "RC"
                            : index + 1}
              </span>
              <strong>{item.title}</strong>
              <small>{item.owner}</small>
              {!cycle && index < count - 1 && standard.layout === "flow" && (
                <span className="xa-flow-arrow" aria-hidden="true">
                  →
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      <p className="xa-chart-note">
        {standard.layout === "cycle"
          ? "Management-system learning lifecycle. Node placement illustrates relationships and does not reproduce mandatory clause text."
          : standard.layout === "functions"
            ? "The six CSF Functions apply together. Their arrangement does not prescribe a chronological sequence."
            : standard.layout === "families"
              ? "Selected control families or requirement groups. Drill down to see the teaching scope and assessment context."
              : standard.layout === "pillars"
                ? "Related areas shown together. Their arrangement is an educational summary of the selected source."
                : "An educational decision flow. Check the source for applicable obligations and implementation details."}
      </p>
    </div>
  );
}
