import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Expand, Network, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { base, Field, Header } from "../components/shared";
import { metricInsight, useInsight } from "../workspace/insights";
type Node = {
  id: string;
  label: string;
  domain: string;
  text: string;
  example: string;
  path: string;
  related: string[];
};
export const concepts: Node[] = [
  {
    id: "process",
    label: "Business process",
    domain: "GRC",
    text: "A repeatable activity that delivers a business outcome.",
    example:
      "Payment settlement relies on identities, applications and bank dependencies.",
    path: "/case-studies",
    related: ["asset", "decision"],
  },
  {
    id: "asset",
    label: "Asset",
    domain: "Cybersecurity",
    text: "Something of value that supports a business process, including data, services and identities.",
    example:
      "A payment API or an OT access gateway supports a critical service.",
    path: "/labs/risk-decision",
    related: ["threat", "vulnerability", "process"],
  },
  {
    id: "threat",
    label: "Threat",
    domain: "Cybersecurity",
    text: "A potential cause of harm, such as account misuse or an accidental configuration error.",
    example: "A stolen supplier identity attempts to change payment routing.",
    path: "/labs/cyber-incident",
    related: ["vulnerability", "risk", "asset"],
  },
  {
    id: "vulnerability",
    label: "Vulnerability",
    domain: "Cybersecurity",
    text: "A weakness that a threat can exploit or trigger.",
    example: "Standing supplier privileges without a periodic access review.",
    path: "/labs/risk-decision",
    related: ["risk", "control", "asset"],
  },
  {
    id: "risk",
    label: "Risk",
    domain: "GRC",
    text: "Uncertainty about consequences for objectives. This academy uses explicit ordinal likelihood and impact judgements.",
    example:
      "Supplier misuse may interrupt settlement; the owner reviews an inherent 4 × 5 rating.",
    path: "/labs/risk-decision",
    related: ["control", "decision", "threat", "vulnerability"],
  },
  {
    id: "control",
    label: "Control",
    domain: "GRC",
    text: "A measure that modifies risk; implementation and effectiveness need separate evidence.",
    example:
      "Time-bound supplier privileges reduce an access opportunity if enforced and reviewed.",
    path: "/labs/framework-explorer",
    related: ["framework", "evidence", "risk"],
  },
  {
    id: "framework",
    label: "Framework",
    domain: "GRC",
    text: "An organised structure of outcomes, controls or requirements. Different frameworks have different purposes.",
    example:
      "CSF 2.0 describes outcomes. SP 800-53 supplies detailed controls. ISO 27001 specifies ISMS requirements.",
    path: "/labs/framework-explorer",
    related: ["assessment", "control", "evidence"],
  },
  {
    id: "evidence",
    label: "Evidence",
    domain: "GRC",
    text: "Traceable information used to support or challenge a scoped assertion.",
    example:
      "An approved access review with sampled removals supports account lifecycle assessment.",
    path: "/labs/framework-explorer",
    related: ["assessment", "control", "incident"],
  },
  {
    id: "assessment",
    label: "Assessment",
    domain: "GRC",
    text: "A scoped examination of outcomes, implementation or effectiveness against explicit criteria.",
    example:
      "Examine, interview and test an access-review sample for a defined population and period.",
    path: "/labs/framework-explorer",
    related: ["decision", "framework", "evidence"],
  },
  {
    id: "decision",
    label: "Executive decision",
    domain: "GRC",
    text: "An authorised choice about treatment, resources or acceptance with a defined review trigger.",
    example:
      "The risk committee approves a staged investment and records an acceptance expiry.",
    path: "/labs/ciso-boardroom",
    related: ["process", "risk", "assessment"],
  },
  {
    id: "incident",
    label: "Incident",
    domain: "Cybersecurity",
    text: "An event that jeopardises security and requires coordinated analysis and response.",
    example:
      "Correlate a new-device login with an unapproved service change before proposing containment.",
    path: "/labs/cyber-incident",
    related: ["evidence", "threat", "asset"],
  },
  {
    id: "model",
    label: "Detection model",
    domain: "AI",
    text: "A scoring system evaluated against known labels and representative conditions.",
    example:
      "The synthetic generator yields scores for 400 labelled events. It does not train a model.",
    path: "/labs/ai-experiment",
    related: ["threshold", "shift", "incident"],
  },
  {
    id: "threshold",
    label: "Decision threshold",
    domain: "AI",
    text: "The score cutoff used to classify a predicted positive.",
    example:
      "Lowering a threshold usually catches more positives and increases false alerts on the same data.",
    path: "/labs/ai-experiment",
    related: ["model", "evaluation", "decision"],
  },
  {
    id: "evaluation",
    label: "Model evaluation",
    domain: "AI",
    text: "Measurement of predictions against ground truth using defined metrics and a valid protocol.",
    example:
      "Precision = TP/(TP+FP); recall = TP/(TP+FN). Holdout evaluation limits training optimism.",
    path: "/labs/ai-experiment",
    related: ["evidence", "model", "shift"],
  },
  {
    id: "shift",
    label: "Distribution shift",
    domain: "AI",
    text: "A change in conditions or data distribution that can invalidate previous evaluation assumptions.",
    example:
      "New production telemetry changes score separation and the false-alert burden.",
    path: "/labs/ai-experiment",
    related: ["evaluation", "risk", "model"],
  },
];
const colors: Record<string, string> = {
  Cybersecurity: "#77bcfc",
  GRC: "#68dcc3",
  AI: "#b5a3ff",
};
export default function KnowledgeGraph() {
  const [params] = useSearchParams();
  const initial =
    concepts.find((c) => c.id === params.get("node"))?.id || "risk";
  const [selected, setSelected] = useState(initial),
    [query, setQuery] = useState(""),
    [domain, setDomain] = useState("All"),
    [zoom, setZoom] = useState(1),
    [pan, setPan] = useState({ x: 0, y: 0 }),
    [extra, setExtra] = useState<Node[]>([]),
    [expanded, setExpanded] = useState(false);
  const { explain } = useInsight();
  const nodes = [...concepts, ...extra];
  const current = nodes.find((n) => n.id === selected) || concepts[4];
  const visible = nodes.filter(
    (n) =>
      (domain === "All" || n.domain === domain) &&
      `${n.label} ${n.text}`.toLowerCase().includes(query.toLowerCase()),
  );
  const edges = useMemo(() => {
    const seen = new Set<string>();
    return nodes
      .flatMap((n) =>
        n.related
          .filter((id) => nodes.some((o) => o.id === id))
          .map((id) => ({ from: n.id, to: id })),
      )
      .filter((e) => {
        const key = [e.from, e.to].sort().join(":");
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }, [extra]);
  function choose(n: Node) {
    setSelected(n.id);
    explain({
      ...metricInsight(
        n.label,
        n.text,
        "The graph shows curated conceptual relationships, not formal equivalences or an official framework crosswalk.",
        `Connected to ${n.related.map((id) => nodes.find((o) => o.id === id)?.label || id).join(", ")}.`,
        n.domain === "AI" ? "ai" : "risk",
      ),
      technical: n.example,
      business:
        n.domain === "AI"
          ? "A factory validates changed telemetry; a bank reviews false-alert capacity before deploying a fraud detector."
          : "A bank traces a payment dependency through risk, control evidence and an accountable decision. A plant adds operations and safety approval.",
      path: n.path,
    });
  }
  useEffect(() => {
    choose(concepts.find((c) => c.id === initial)!);
  }, []);
  function position(n: Node) {
    const index = nodes.indexOf(n);
    if (n.id === "risk") return { x: 410, y: 310 };
    const baseNodes = concepts.filter((c) => c.id !== "risk");
    const idx = baseNodes.findIndex((c) => c.id === n.id);
    const angle =
      (idx >= 0
        ? idx / baseNodes.length
        : (index - concepts.length) / Math.max(1, extra.length)) *
        Math.PI *
        2 -
      Math.PI / 2;
    const radius = idx >= 0 ? 235 : 340;
    return {
      x: 410 + Math.cos(angle) * radius,
      y: 310 + Math.sin(angle) * radius * (idx >= 0 ? 0.95 : 0.76),
    };
  }
  async function expand() {
    if (expanded) {
      setExtra([]);
      setExpanded(false);
      return;
    }
    const data = await import("../../data/securityMindmap");
    const chosen = data.mindmapNodes
      .filter((n) =>
        ["identity", "operations", "governance", "ai"].includes(n.category),
      )
      .slice(0, 10);
    setExtra(
      chosen.map((n) => ({
        id: n.id,
        label: n.label,
        domain:
          n.category === "ai"
            ? "AI"
            : n.category === "governance"
              ? "GRC"
              : "Cybersecurity",
        text: n.description,
        example: n.whyItMatters,
        path: "/security-map",
        related: [
          n.category === "ai"
            ? "model"
            : n.category === "governance"
              ? "decision"
              : "control",
        ],
      })),
    );
    setExpanded(true);
    setZoom(0.8);
  }
  return (
    <>
      <Header
        eyebrow="CONNECTED LEARNING / CONCEPT EXPLORER"
        title="Interactive Knowledge Graph"
      >
        <p>
          Follow the thread from a business objective to a technical control,
          evidence and an executive decision.
        </p>
      </Header>
      <div className="xa-toolbar">
        <Field label="Search knowledge graph">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a concept or relationship"
          />
        </Field>
        <Field label="Graph domain">
          <select value={domain} onChange={(e) => setDomain(e.target.value)}>
            {["All", "Cybersecurity", "GRC", "AI"].map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </Field>
        <button
          aria-label="Zoom in"
          onClick={() => setZoom(Math.min(2, zoom + 0.2))}
        >
          <ZoomIn size={17} />
        </button>
        <button
          aria-label="Zoom out"
          onClick={() => setZoom(Math.max(0.5, zoom - 0.2))}
        >
          <ZoomOut size={17} />
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
            setQuery("");
            setDomain("All");
            setExtra([]);
            setExpanded(false);
          }}
        >
          <RotateCcw size={15} /> Reset graph
        </button>
        <button onClick={expand}>
          <Expand size={15} />
          {expanded ? "Collapse clusters" : "Expand clusters"}
        </button>
      </div>
      <section className="xa-panel xa-graph-panel">
        <div className="xa-panel-heading">
          <h2>
            <Network size={18} /> Knowledge in context
          </h2>
          <span className="xa-pill">
            {visible.length} concepts · {Math.round(zoom * 100)}%
          </span>
        </div>
        <p className="xa-muted">
          Drag the canvas to pan. Select a node below or use the accessible
          concept outline. All relationships are educational interpretations.
        </p>
        <div className="xa-graph-canvas">
          <svg
            viewBox="0 0 820 620"
            role="group"
            aria-label="Concept relationships. Use the node buttons or concept outline below."
            onPointerDown={(e) => {
              if ((e.target as Element).closest('[role="button"]')) return;
              e.currentTarget.setPointerCapture(e.pointerId);
              e.currentTarget.dataset.dragX = String(e.clientX);
              e.currentTarget.dataset.dragY = String(e.clientY);
            }}
            onPointerMove={(e) => {
              if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const dx =
                  ((e.clientX - Number(e.currentTarget.dataset.dragX)) * 820) /
                  rect.width,
                dy =
                  ((e.clientY - Number(e.currentTarget.dataset.dragY)) * 620) /
                  rect.height;
              setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
              e.currentTarget.dataset.dragX = String(e.clientX);
              e.currentTarget.dataset.dragY = String(e.clientY);
            }}
            onPointerUp={(e) =>
              e.currentTarget.hasPointerCapture(e.pointerId) &&
              e.currentTarget.releasePointerCapture(e.pointerId)
            }
          >
            <defs>
              <pattern
                id="xa-dots"
                width="22"
                height="22"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="1" cy="1" r="1" fill="var(--xa-line)" />
              </pattern>
            </defs>
            <rect width="820" height="620" fill="url(#xa-dots)" />
            <g
              transform={`translate(${410 + pan.x} ${310 + pan.y}) scale(${zoom}) translate(-410 -310)`}
            >
              {edges
                .filter(
                  (e) =>
                    visible.some((n) => n.id === e.from) &&
                    visible.some((n) => n.id === e.to),
                )
                .map((e) => {
                  const a = position(nodes.find((n) => n.id === e.from)!),
                    b = position(nodes.find((n) => n.id === e.to)!);
                  const active = e.from === selected || e.to === selected;
                  return (
                    <line
                      key={e.from + e.to}
                      x1={a.x}
                      y1={a.y}
                      x2={b.x}
                      y2={b.y}
                      stroke={active ? "var(--xa-accent)" : "var(--xa-line)"}
                      strokeWidth={active ? 2 : 1}
                      opacity={active ? 0.9 : 0.5}
                    />
                  );
                })}
              {visible.map((n) => {
                const p = position(n),
                  active = n.id === selected,
                  linked =
                    current.related.includes(n.id) ||
                    n.related.includes(selected);
                return (
                  <g
                    role="button"
                    tabIndex={0}
                    aria-label={`Explore ${n.label}`}
                    onClick={() => choose(n)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        choose(n);
                      }
                    }}
                    key={n.id}
                    transform={`translate(${p.x},${p.y})`}
                    opacity={active || linked ? 1 : 0.65}
                  >
                    <circle
                      r={active ? 33 : 21}
                      fill={colors[n.domain]}
                      opacity=".1"
                    />
                    <circle
                      r={active ? 15 : 8}
                      fill={colors[n.domain]}
                      stroke={active ? "var(--xa-text)" : "none"}
                      strokeWidth="2"
                    />
                    <rect
                      x={-n.label.length * 3.8}
                      y="31"
                      width={n.label.length * 7.6}
                      height="24"
                      rx="5"
                      fill="var(--xa-panel)"
                    />
                    <text
                      textAnchor="middle"
                      y="47"
                      fill="var(--xa-text)"
                      fontSize="13"
                    >
                      {n.label}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
        <div className="xa-node-picker" aria-label="Graph nodes">
          {visible.map((n) => (
            <button
              key={n.id}
              aria-pressed={selected === n.id}
              onClick={() => choose(n)}
            >
              <i style={{ background: colors[n.domain] }} />
              {n.label}
            </button>
          ))}
        </div>
        {!visible.length && (
          <p>No concepts match. Reset the graph or broaden the filter.</p>
        )}
      </section>
      <section className="xa-panel">
        <span className="xa-eyebrow">SELECTED CONCEPT</span>
        <h2>{current.label}</h2>
        <p>{current.text}</p>
        <p>{current.example}</p>
        <div className="xa-actions">
          {current.related
            .map((id) => nodes.find((n) => n.id === id))
            .filter((n): n is Node => !!n)
            .map((n) => (
              <button key={n.id} onClick={() => choose(n)}>
                {current.label} → {n.label}
              </button>
            ))}
          <Link className="xa-button primary" to={`${base}${current.path}`}>
            Apply in a workspace →
          </Link>
        </div>
      </section>
      <details className="xa-panel">
        <summary>Accessible concept outline & relationships</summary>
        {["Cybersecurity", "GRC", "AI"].map((d) => (
          <div key={d}>
            <h2>{d}</h2>
            <ul>
              {visible
                .filter((n) => n.domain === d)
                .map((n) => (
                  <li key={n.id}>
                    <button
                      className="xa-text-button"
                      onClick={() => choose(n)}
                    >
                      {n.label}
                    </button>
                    <p>{n.text}</p>
                    <small>
                      Related:{" "}
                      {n.related
                        .map(
                          (id) => nodes.find((o) => o.id === id)?.label || id,
                        )
                        .join(" · ")}
                    </small>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </details>
    </>
  );
}
