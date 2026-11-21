import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Link, useLocation } from "react-router-dom";
import { BookOpen, Lightbulb, ArrowUpRight } from "lucide-react";
export interface Explanation {
  id: string;
  title: string;
  category: string;
  meaning: string;
  why: string;
  method: string;
  interpretation: string;
  analogy: string;
  technical: string;
  business: string;
  actions: string[];
  sources: { title: string; url: string }[];
  lesson: string;
  executive?: string;
}
const initial: Explanation = {
  id: "welcome",
  title: "Explore a decision",
  category: "Learning companion",
  meaning:
    "Select a metric, chart, control or graph node to examine its meaning and the data behind it.",
  why: "Professional decisions combine a business objective, a transparent method and evidence about remaining uncertainty.",
  method:
    "The dashboard uses the selected educational case or the records you submit. Each metric declares its scope.",
  interpretation:
    "Follow the underlying records before drawing a conclusion from an aggregate.",
  analogy:
    "A map helps you choose a route. The route still depends on your destination and the conditions on the ground.",
  technical:
    "Trace a supplier identity from its access permission to its audit event and assessment record.",
  business:
    "A payment service owner needs to understand the possible interruption and who can authorise treatment.",
  actions: [
    "Open a case study or load example risks.",
    "Select a chart and inspect its underlying records.",
    "Record assumptions before exporting a recommendation.",
  ],
  sources: [
    { title: "NIST CSF 2.0", url: "https://www.nist.gov/cyberframework" },
  ],
  lesson: "risk-assessment",
};
const Context = createContext<{
  selection: Explanation;
  explain: (value: Explanation) => void;
} | null>(null);
export function ExplanationProvider({ children }: { children: ReactNode }) {
  const [selection, explain] = useState(initial);
  const location = useLocation();
  useEffect(() => explain(initial), [location.pathname]);
  return (
    <Context.Provider value={{ selection, explain }}>
      {children}
    </Context.Provider>
  );
}
export function useExplanation() {
  const value = useContext(Context);
  if (!value) throw new Error("Explanation provider missing.");
  return value;
}
export function ExplanationPanel() {
  const { selection } = useExplanation();
  const [level, setLevel] = useState("Beginner");
  const [open, setOpen] = useState(() => window.innerWidth >= 1180);
  useEffect(() => {
    if (window.innerWidth < 1180) setOpen(selection.id !== "welcome");
  }, [selection.id]);
  return (
    <aside className="xa-inspector" aria-label="Contextual explanation">
      <details
        open={open}
        onToggle={(event) => setOpen(event.currentTarget.open)}
      >
        <summary>
          <Lightbulb size={16} aria-hidden="true" />
          Understand this view
        </summary>
        <div className="xa-inspector-body">
          <label className="xa-field">
            <span>Explanation depth</span>
            <select value={level} onChange={(e) => setLevel(e.target.value)}>
              {["Beginner", "Practitioner", "Executive"].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <div aria-live="polite" aria-atomic="false">
            <p className="xa-eyebrow">{selection.category}</p>
            <h2>{selection.title}</h2>
            <p>
              {level === "Executive"
                ? (selection.executive ?? selection.why)
                : level === "Practitioner"
                  ? selection.technical
                  : selection.meaning}
            </p>
          </div>
          <h3>Why it matters</h3>
          <p>{selection.why}</p>
          <h3>Method & interpretation</h3>
          <p>{selection.method}</p>
          <p>{selection.interpretation}</p>
          <details>
            <summary>A simple analogy</summary>
            <p>{selection.analogy}</p>
          </details>
          <details open={level === "Practitioner"}>
            <summary>Technical example</summary>
            <p>{selection.technical}</p>
          </details>
          <details open={level === "Executive"}>
            <summary>Business application</summary>
            <p>{selection.business}</p>
          </details>
          <h3>Apply your understanding</h3>
          <ul>
            {selection.actions.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ul>
          <Link
            className="xa-inspector-lesson"
            to={`/x1-academic/learning/${selection.lesson}`}
          >
            <BookOpen size={15} aria-hidden="true" />
            Related learning →
          </Link>
          <h3>Source references</h3>
          {selection.sources.map((source) => (
            <a
              key={source.url}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {source.title} <ArrowUpRight size={12} aria-hidden="true" />
            </a>
          ))}
        </div>
      </details>
    </aside>
  );
}
export function metricExplanation(
  title: string,
  value: string,
  method: string,
  domain: "risk" | "ai" | "assurance" | "incident" | "executive" = "risk",
): Explanation {
  const contexts = {
    risk: {
      why: "The risk owner needs to know which exposures require treatment and what assumptions support the estimate.",
      analogy:
        "A weather warning helps prioritise preparation, while the consequence depends on which activities are exposed.",
      technical:
        "A supplier-account risk rated likelihood 4 and impact 5 has an inherent ordinal index of 20. A residual estimate requires a separate evidence-backed judgement.",
      business:
        "For PaySecure, fraud and payment interruption drive impact. For PetroShield, production continuity and safety authority shape treatment.",
      lesson: "risk-assessment",
      source: "https://www.nist.gov/cyberframework",
    },
    ai: {
      why: "An operational detector must balance missed events, false alerts and the capacity to investigate them.",
      analogy:
        "A screening checkpoint can catch more prohibited items by inspecting more bags, while also delaying more legitimate travellers.",
      technical:
        "Precision uses TP/(TP+FP). Recall uses TP/(TP+FN). A threshold changes predicted labels on the same underlying scores.",
      business:
        "At SmartFactory, changed production telemetry can shift detection performance. Operators need representative evaluation and a human escalation path.",
      lesson: "detection-evaluation",
      source: "https://scikit-learn.org/stable/modules/model_evaluation.html",
    },
    assurance: {
      why: "An implemented safeguard and an independently effective safeguard are different assurance claims.",
      analogy:
        "Owning a fire extinguisher differs from checking that it works and that staff know how to use it.",
      technical:
        "Examine the policy, interview an owner and test a sample over a defined period. Record exceptions and sampling limitations.",
      business:
        "PaySecure can assert that supplier access is reviewed. An assessor still needs review samples and evidence that excessive access was removed.",
      lesson: "risk-assessment",
      source: "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final",
    },
    incident: {
      why: "Response decisions need corroboration and an understanding of business disruption.",
      analogy:
        "A smoke alarm is a signal. Investigation locates the source before deciding which area needs evacuation.",
      technical:
        "Correlate identity, session, service-change and owner records. Preserve timestamps and competing explanations.",
      business:
        "Restricting a payment support account can be proportionate. Isolating industrial equipment requires operations and safety approval.",
      lesson: "incident-triage",
      source: "https://csrc.nist.gov/projects/incident-response",
    },
    executive: {
      why: "A board decision needs a clear request, accountable owner and explicit cost and uncertainty.",
      analogy:
        "A constrained maintenance budget must fund both urgent repairs and the checks that show repairs worked.",
      technical:
        "Separate investment cost, exposure assumptions, evidence readiness and delivery dependencies.",
      business:
        "A bank contract may demand evidence by a deadline. Industrial delivery may depend on a safe maintenance window.",
      lesson: "risk-assessment",
      source: "https://www.nist.gov/cyberframework",
    },
  };
  const context = contexts[domain];
  return {
    id: `${domain}-${title}`,
    title,
    category: `${domain} analysis`,
    meaning: `${title} is ${value} in the current selection.`,
    why: context.why,
    method,
    interpretation:
      "Inspect the underlying records and stated scope. A numerical indicator supports judgement and requires contextual review.",
    analogy: context.analogy,
    technical: context.technical,
    business: context.business,
    actions: [
      "Inspect the selected records or configuration.",
      "Check scope, assumptions and supporting evidence.",
      "Document a proportionate next action and its owner.",
    ],
    sources: [
      {
        title:
          domain === "ai"
            ? "Classification metric definitions"
            : "Authoritative reference",
        url: context.source,
      },
    ],
    lesson: context.lesson,
  };
}
