import { createContext, useContext, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Sparkles, X, ArrowUpRight } from "lucide-react";
import { base, Source } from "../components/shared";
export interface Insight {
  title: string;
  tag: string;
  meaning: string;
  why: string;
  method: string;
  interpretation: string;
  analogy: string;
  technical: string;
  business: string;
  actions: string[];
  sources: { title: string; url: string }[];
  path?: string;
}
export const riskSource = {
  title: "NIST SP 800-30 Rev. 1",
  url: "https://csrc.nist.gov/pubs/sp/800/30/r1/final",
};
export const aiSource = {
  title: "Scikit-learn · Model evaluation",
  url: "https://scikit-learn.org/stable/modules/model_evaluation.html",
};
export const initialInsight: Insight = {
  title: "A workspace for better decisions",
  tag: "START HERE",
  meaning:
    "Connect cybersecurity, risk governance and AI through evidence and practical decisions.",
  why: "A number becomes useful when you understand its assumptions and know what action it supports.",
  method:
    "Select a metric, chart, outcome or graph node. This guide follows your selection using curated local explanations.",
  interpretation:
    "Start with a fictional register, assess a control, then test a decision. Your work stays in this browser session unless you export it.",
  analogy:
    "A flight simulator lets you practise decisions before you are responsible for the aircraft.",
  technical:
    "A supplier account links an asset, a threat, an access control, audit evidence and a risk-owner decision.",
  business:
    "A bank balances payment availability against the need to restrict a suspicious supplier session.",
  actions: [
    "Explore the six CSF Functions.",
    "Load a fictional risk register and select Analyse risks.",
    "Export a report with its assumptions.",
  ],
  sources: [riskSource],
  path: "/learning/risk-assessment",
};
const Context = createContext<{
  level: string;
  setLevel: (value: string) => void;
  insight: Insight;
  explain: (insight: Insight) => void;
  open: boolean;
  setOpen: (value: boolean) => void;
} | null>(null);
export function InsightProvider({ children }: { children: ReactNode }) {
  const [level, updateLevel] = useState(() => {
    try {
      const value = localStorage.getItem("x1-explanation-mode");
      return ["Beginner", "Practitioner", "Executive"].includes(value || "")
        ? value!
        : "Beginner";
    } catch {
      return "Beginner";
    }
  });
  const setLevel = (value: string) => {
    if (!["Beginner", "Practitioner", "Executive"].includes(value)) return;
    updateLevel(value);
    try {
      localStorage.setItem("x1-explanation-mode", value);
    } catch {}
  };
  const [insight, setInsight] = useState(initialInsight),
    [open, setOpen] = useState(false);
  return (
    <Context.Provider
      value={{
        insight,
        level,
        setLevel,
        explain: (value) => {
          setInsight(value);
          setOpen(true);
        },
        open,
        setOpen,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useInsight() {
  const value = useContext(Context);
  if (!value) throw new Error("Insight provider missing");
  return value;
}
export function ExplanationPanel() {
  const { insight: i, open, setOpen, level, setLevel } = useInsight();
  return (
    <aside
      className={`xa-insight ${open ? "is-open" : ""}`}
      aria-label="Contextual explanation"
    >
      <div className="xa-insight-top">
        <span>
          <Sparkles size={16} aria-hidden="true" /> X1 Learning guide
        </span>
        <button
          className="xa-insight-close"
          aria-label="Close explanation"
          onClick={() => setOpen(false)}
        >
          <X size={16} />
        </button>
      </div>
      <div className="xa-insight-body">
        <span className="xa-pill">CURATED · LOCAL</span>
        <p className="xa-eyebrow">{i.tag}</p>
        <h2>{i.title}</h2>
        <div className="xa-segment" aria-label="Explanation level">
          {["Beginner", "Practitioner", "Executive"].map((l) => (
            <button
              key={l}
              aria-pressed={level === l}
              onClick={() => setLevel(l)}
            >
              {l}
            </button>
          ))}
        </div>
        <div aria-live="polite">
          <h3>
            {level === "Executive"
              ? "Decision relevance"
              : level === "Practitioner"
                ? "Assessment context"
                : "What it means"}
          </h3>
          <p>
            {level === "Executive"
              ? i.why
              : level === "Practitioner"
                ? i.method
                : i.meaning}
          </p>
        </div>
        <div className="xa-insight-callout">
          <h3>How to interpret it</h3>
          <p>{i.interpretation}</p>
        </div>
        <details open>
          <summary>Calculation & assessment</summary>
          <p>{i.method}</p>
        </details>
        <details>
          <summary>A simple analogy</summary>
          <p>{i.analogy}</p>
        </details>
        <details>
          <summary>Technical example</summary>
          <p>{i.technical}</p>
        </details>
        <details>
          <summary>Banking & industry</summary>
          <p>{i.business}</p>
        </details>
        <h3>Recommended next steps</h3>
        <ol>
          {i.actions.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ol>
        <h3>Go to the source</h3>
        <div className="xa-source-list">
          {i.sources.map((s) => (
            <Source key={s.url} href={s.url}>
              {s.title}
            </Source>
          ))}
        </div>
        {i.path && (
          <Link
            className="xa-button secondary"
            to={`${base}${i.path}`}
            onClick={() => setOpen(false)}
          >
            <BookOpen size={15} /> Continue learning <ArrowUpRight size={14} />
          </Link>
        )}
        <p className="xa-disclaimer">
          Educational guidance. No external AI calls or uploaded register data.
        </p>
      </div>
    </aside>
  );
}
export function metricInsight(
  title: string,
  meaning: string,
  method: string,
  interpretation: string,
  domain: "risk" | "ai" | "control" = "risk",
): Insight {
  return {
    title,
    tag: `${domain.toUpperCase()} · EXPLAINED`,
    meaning,
    why:
      domain === "ai"
        ? "Detection quality affects missed events and the workload of the people reviewing alerts."
        : "Prioritise resources and make the evidence behind a decision visible to accountable owners.",
    method,
    interpretation,
    analogy:
      domain === "ai"
        ? "A smoke alarm can be sensitive enough to catch smoke but also ring when you make toast. The threshold sets that trade-off."
        : "A maintenance checklist shows what was checked; the mechanic’s test record tells you whether the repair worked.",
    technical:
      domain === "ai"
        ? "At threshold 0.70, scores at or above 0.70 are positive. Count these against the known labels before calculating rates."
        : "A supplier identity with broad privileges can create a 4 × 5 exposure. A proposed access restriction needs a separate residual rating and evidence.",
    business:
      domain === "ai"
        ? "A banking fraud team may favour recall but must staff the resulting alert queue. A factory must validate changed production telemetry before trusting a detector."
        : "A bank requires an owner and expiry for accepted payment risk. An industrial operator coordinates treatment with a safe maintenance window.",
    actions:
      domain === "ai"
        ? [
            "Change one parameter at a time.",
            "Save a baseline and compare the resulting counts.",
            "Declare synthetic-data and evaluation limitations.",
          ]
        : [
            "Inspect the underlying records.",
            "Assign an owner and test the supporting evidence.",
            "Record a dated review and escalation trigger.",
          ],
    sources: [domain === "ai" ? aiSource : riskSource],
    path:
      domain === "ai"
        ? "/learning/detection-evaluation"
        : "/learning/risk-assessment",
  };
}
