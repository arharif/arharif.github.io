import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base, Header, Field, Source, download } from "../components/shared";
import { useWorkspace, useLabState } from "../workspace/state";
import { Bars, Donut, palette } from "../workspace/charts";
import { Panel, Method } from "./visuals";
import { metricInsight, useInsight } from "../workspace/insights";
import { newTask } from "./model";
import { controlDecisionErrors, controlDecisionState } from "./engines";
interface Control {
  id: string;
  displayId: string;
  title: string;
  family: string;
  familyTitle: string;
  parent: string | null;
  withdrawn: boolean;
  statement: string[];
  guidance: string[];
  objectives: string[];
  methods: { method: string; text: string }[];
  related: string[];
}
interface Catalogue {
  version: string;
  edition: string;
  publicationDate: string;
  provenance: { url: string; sha256: string; file: string }[];
  baselines: Record<string, string[]>;
  controls: Control[];
}
export default function NistImplementation() {
  const { studio: s, setStudio } = useWorkspace(),
    { explain } = useInsight(),
    [catalog, setCatalog] = useState<Catalogue | null>(null),
    [error, setError] = useState(""),
    [query, setQuery] = useState(""),
    [family, setFamily] = useState("All"),
    [status, setStatus] = useState("All"),
    [all, setAll] = useState(false),
    [reference, setReference] = useState<string | null>(null),
    [selected, setSelected] = useLabState(
      "nist-implementation",
      "selected",
      "ac-2",
    ),
    [message, setMessage] = useState("");
  useEffect(() => {
    let active = true;
    fetch(new URL("../data/sp80053-catalog.json", import.meta.url))
      .then((r) => {
        if (!r.ok) throw new Error("NIST source asset could not be loaded.");
        return r.json();
      })
      .then((c) => {
        if (active) setCatalog(c);
      })
      .catch((e) => setError(String(e)));
    return () => {
      active = false;
    };
  }, []);
  if (error && !catalog) return <p role="alert">{error}</p>;
  if (!catalog)
    return <p role="status">Loading the versioned NIST control catalogue…</p>;
  const baseline = new Set([
      ...catalog.baselines[s.sp.baseline],
      ...(s.sp.privacyApplicable ? catalog.baselines.PRIVACY : []),
    ]),
    inScope = catalog.controls.filter(
      (c) => !c.withdrawn && baseline.has(c.id),
    );
  const c =
    catalog.controls.find((c) => c.id === selected && !c.withdrawn) ||
    inScope[0];
  const defaultDecision = {
    reviewed: false,
    applicable: true,
    rationale: "",
    responsibility: "System-specific" as const,
    provider: "",
    status: "Not started" as const,
    evidence: "",
    assessmentMethod: "Examine" as const,
    objective: "",
    procedure: "",
    finding: "",
    owner: "",
  };
  const d = s.sp.decisions[c.id] || defaultDecision;
  const patch = (value: Partial<typeof d>) =>
    setStudio((p) => ({
      ...p,
      sp: {
        ...p.sp,
        decisions: {
          ...p.sp.decisions,
          [c.id]: { ...d, ...value, reviewed: false },
        },
      },
    }));
  const eligible = catalog.controls.filter(
    (c) =>
      !c.withdrawn &&
      (reference
        ? catalog.baselines[reference].includes(c.id)
        : all || baseline.has(c.id)) &&
      (family === "All" || c.family === family) &&
      (status === "All" ||
        controlDecisionState(s.sp.decisions[c.id]) === status) &&
      `${c.id} ${c.displayId} ${c.title}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const families = [
    ...new Map(
      catalog.controls.map((c) => [c.family, c.familyTitle]),
    ).entries(),
  ];
  const rank = { Low: 0, Moderate: 1, High: 2 };
  const derived = (["LOW", "MODERATE", "HIGH"] as const)[
    Math.max(
      rank[s.sp.confidentiality],
      rank[s.sp.integrity],
      rank[s.sp.availability],
    )
  ];
  function saveDecision() {
    const errors = controlDecisionErrors(d, s);
    if (errors.length) {
      setError(errors.join(" "));
      return;
    }
    setStudio((p) => ({
      ...p,
      sp: {
        ...p.sp,
        decisions: { ...p.sp.decisions, [c.id]: { ...d, reviewed: true } },
      },
    }));
    setError("");
    setMessage(
      "Control decision recorded as learner input; no automatic effectiveness claim.",
    );
  }
  const source = "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final";
  return (
    <>
      <Header
        eyebrow="EXPLORE / IMPLEMENT / NIST CONTROL ENGINE"
        title="NIST system implementation simulator"
      >
        <p>
          SP 800-53 controls, SP 800-53A assessment objectives and SP 800-53B
          starting baselines, from the official release {catalog.version} OSCAL
          snapshot.
        </p>
      </Header>
      <Panel
        title="1. Categorise the scoped information system"
        subtitle="Impact assessment drives baseline review; a banking label does not"
      >
        <Field label="System scope and information types">
          <textarea
            value={s.scope.informationTypes}
            maxLength={4000}
            onChange={(e) =>
              setStudio((p) => ({
                ...p,
                scope: { ...p.scope, informationTypes: e.target.value },
              }))
            }
          />
        </Field>
        <div className="xa-grid">
          {(["confidentiality", "integrity", "availability"] as const).map(
            (k) => (
              <Field key={k} label={`${k} impact`}>
                <select
                  value={s.sp[k]}
                  onChange={(e) =>
                    setStudio((p) => ({
                      ...p,
                      sp: {
                        ...p.sp,
                        [k]: e.target.value as "Low" | "Moderate" | "High",
                      },
                    }))
                  }
                >
                  {["Low", "Moderate", "High"].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </Field>
            ),
          )}
        </div>
        <Field label="Categorisation rationale and security objectives">
          <textarea
            value={s.sp.categorisation}
            maxLength={4000}
            onChange={(e) =>
              setStudio((p) => ({
                ...p,
                sp: { ...p.sp, categorisation: e.target.value },
              }))
            }
          />
        </Field>
        <p>
          Educational high-water mark suggests <strong>{derived}</strong>.
          Validate information impacts, system boundary and applicable
          authorisation context using FIPS 199/SP 800-60. These values are not
          legal applicability determinations.
        </p>
        <div className="xa-grid two">
          <Field label="Starting security baseline">
            <select
              value={s.sp.baseline}
              onChange={(e) =>
                setStudio((p) => ({
                  ...p,
                  sp: {
                    ...p.sp,
                    baseline: e.target.value as "LOW" | "MODERATE" | "HIGH",
                  },
                }))
              }
            >
              {["LOW", "MODERATE", "HIGH"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </Field>
          <button
            disabled={
              !s.sp.categorisation.trim() || !s.scope.informationTypes.trim()
            }
            onClick={() => {
              setStudio((p) => ({ ...p, sp: { ...p.sp, baseline: derived } }));
              setMessage(
                "Starting security baseline selected from entered impact assumptions. Tailoring remains required.",
              );
            }}
          >
            Use impact-based starting baseline
          </button>
        </div>
        {derived !== s.sp.baseline && (
          <p className="xs-notice">
            Your selected baseline differs from the high-water mark. Document
            the tailoring/authorisation rationale before relying on it.
          </p>
        )}
        <label className="xa-check">
          <input
            type="checkbox"
            checked={s.sp.privacyApplicable}
            onChange={(e) =>
              setStudio((p) => ({
                ...p,
                sp: { ...p.sp, privacyApplicable: e.target.checked },
              }))
            }
          />
          Include the separate privacy baseline after reviewing applicability
        </label>
        <Field label="Privacy-baseline applicability rationale">
          <textarea
            value={s.sp.privacyRationale}
            maxLength={4000}
            onChange={(e) =>
              setStudio((p) => ({
                ...p,
                sp: { ...p.sp, privacyRationale: e.target.value },
              }))
            }
          />
        </Field>
        <Source href="https://csrc.nist.gov/pubs/fips/199/final">
          FIPS 199 categorisation
        </Source>
      </Panel>
      <div className="xa-grid two">
        <Panel
          title="Baseline comparison"
          subtitle="Official explicit membership; counts include enhancements"
        >
          <Bars
            items={["LOW", "MODERATE", "HIGH", "PRIVACY"].map((label) => ({
              label,
              value: catalog.baselines[label].length,
              color: label === "PRIVACY" ? palette.Neutral : undefined,
            }))}
            onSelect={(label) => {
              if (label === "PRIVACY") {
                setReference("PRIVACY");
                setAll(false);
                setFamily("All");
                setStatus("All");
                setQuery("");
                explain(
                  metricInsight(
                    "Privacy baseline",
                    "Privacy applicability is reviewed independently of CIA impact.",
                    "Count of IDs in NIST SP 800-53B privacy profile.",
                    "Document processing/legal context; selecting it does not establish privacy-law conformity.",
                    "control",
                  ),
                );
                return;
              }
              setStudio((p) => ({
                ...p,
                sp: { ...p.sp, baseline: label as "LOW" | "MODERATE" | "HIGH" },
              }));
              setReference(null);
              setStatus("All");
              setQuery("");
              setFamily("All");
              setAll(false);
              explain(
                metricInsight(
                  label + " security baseline",
                  `${catalog.baselines[label].length} explicit security-baseline IDs. The selected union may also include separately selected privacy controls.`,
                  "Count explicit IDs in the official OSCAL profile, before learner tailoring.",
                  "Inspect the control selector below; review system impacts and exclusions before relying on a baseline.",
                  "control",
                ),
              );
            }}
          />
          <p>
            {inScope.length} active unique controls/enhancements in the selected
            union before tailoring.
          </p>
        </Panel>
        <Panel
          title="Implementation position"
          subtitle="Selected starting scope, including unrecorded items"
        >
          <Donut
            label="selected controls"
            segments={[
              "Not started",
              "Implementing",
              "Implemented",
              "Assessed",
              "Excluded",
            ].map((label, i) => ({
              label,
              value: inScope.filter(
                (c) => controlDecisionState(s.sp.decisions[c.id]) === label,
              ).length,
              color: [
                palette.Unassessed,
                palette.Gaps,
                palette.Neutral,
                palette.Evidenced,
                "#a2abb9",
              ][i],
            }))}
            onSelect={(label) => {
              setReference(null);
              setAll(false);
              setFamily("All");
              setQuery("");
              setStatus(label);
              explain(
                metricInsight(
                  label + " controls",
                  "The selector below shows matching records from the selected starting scope.",
                  "Count reviewed control states; unreviewed/unrecorded entries are Not started and exclusions are separate.",
                  "Assessed means an assessment was recorded, not that the test passed.",
                  "control",
                ),
              );
            }}
          />
          <p className="xa-muted">
            Unreviewed decision drafts are grouped under Not started.
            Implemented and assessed statuses remain learner records.
            Independent control effectiveness requires scoped tests and
            evidence.
          </p>
        </Panel>
      </div>
      <Panel
        title="2. Tailor, implement and assess"
        subtitle={`${catalog.controls.filter((c) => !c.withdrawn).length} active controls/enhancements available; withdrawn records excluded`}
      >
        <div className="xa-toolbar">
          <Field label="Search NIST control catalogue">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="AC-2, IR-4, audit or account"
            />
          </Field>
          <Field label="Control family">
            <select value={family} onChange={(e) => setFamily(e.target.value)}>
              <option>All</option>
              {families.map(([id, title]) => (
                <option key={id} value={id}>
                  {id.toUpperCase()} · {title}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Control implementation filter">
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {[
                "All",
                "Not started",
                "Implementing",
                "Implemented",
                "Assessed",
                "Excluded",
              ].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </Field>
        </div>
        <label className="xa-check">
          <input
            type="checkbox"
            checked={all}
            onChange={(e) => {
              setReference(null);
              setAll(e.target.checked);
            }}
          />
          Explore all active controls, including outside the selected baseline
        </label>
        {reference && (
          <p className="xs-notice">
            Viewing the {reference} reference profile's control records. This
            view does not change privacy applicability or the selected security
            baseline.{" "}
            <button onClick={() => setReference(null)}>
              Return to selected control scope
            </button>
          </p>
        )}
        <Field label="NIST control or enhancement">
          <select
            value={eligible.some((x) => x.id === c.id) ? c.id : ""}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option value="">Select a control</option>
            {eligible.map((c) => (
              <option key={c.id} value={c.id}>
                {c.displayId} · {c.title}
                {c.parent ? " · enhancement" : ""}
              </option>
            ))}
          </select>
        </Field>
        <h2>
          {c.displayId} · {c.title}
        </h2>
        <p>
          {c.parent
            ? `Enhancement of ${c.parent.toUpperCase()}`
            : `${c.familyTitle} · base control`}{" "}
          ·{" "}
          {baseline.has(c.id)
            ? "In selected baseline union"
            : "Outside selected baseline union"}
        </p>
        <details open>
          <summary>Authoritative SP 800-53 statement</summary>
          {c.statement.map((t, i) => (
            <p key={i}>{t}</p>
          ))}
        </details>
        <details>
          <summary>Authoritative implementation discussion</summary>
          {c.guidance.map((t, i) => (
            <p key={i}>{t}</p>
          ))}
        </details>
        <details>
          <summary>
            SP 800-53A determination statements and assessment objects
          </summary>
          <h3>Assessment objectives</h3>
          {c.objectives.map((t, i) => (
            <p key={i}>{t}</p>
          ))}
          {c.methods.map((m, i) => (
            <div key={i}>
              <h3>{m.method}</h3>
              <p>{m.text}</p>
            </div>
          ))}
        </details>
        <div className="xa-grid two">
          <Field label="Control applicability">
            <select
              value={String(d.applicable)}
              onChange={(e) => patch({ applicable: e.target.value === "true" })}
            >
              <option value="true">Applicable</option>
              <option value="false">Excluded with rationale</option>
            </select>
          </Field>
          <Field label="Responsibility model">
            <select
              value={d.responsibility}
              onChange={(e) =>
                patch({
                  responsibility: e.target.value as typeof d.responsibility,
                })
              }
            >
              {["System-specific", "Common", "Inherited"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </Field>
          <Field label="Control owner">
            <input
              value={d.owner}
              maxLength={240}
              onChange={(e) => patch({ owner: e.target.value })}
            />
          </Field>
          <Field label="Common/inherited provider and boundary">
            <input
              value={d.provider}
              maxLength={240}
              onChange={(e) => patch({ provider: e.target.value })}
            />
          </Field>
          <Field label="Implementation status">
            <select
              value={d.status}
              onChange={(e) =>
                patch({ status: e.target.value as typeof d.status })
              }
            >
              {["Not started", "Implementing", "Implemented", "Assessed"].map(
                (v) => (
                  <option key={v}>{v}</option>
                ),
              )}
            </select>
          </Field>
          <Field label="SP assessment method">
            <select
              value={d.assessmentMethod}
              onChange={(e) =>
                patch({
                  assessmentMethod: e.target.value as typeof d.assessmentMethod,
                })
              }
            >
              {["Examine", "Interview", "Test"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Applicability, tailoring and parameter rationale">
          <textarea
            value={d.rationale}
            maxLength={4000}
            onChange={(e) => patch({ rationale: e.target.value })}
          />
        </Field>
        <Field label="Scoped assessment objective">
          <textarea
            value={d.objective}
            maxLength={4000}
            onChange={(e) => patch({ objective: e.target.value })}
          />
        </Field>
        <Field label="Illustrative test procedure and sampling plan">
          <textarea
            value={d.procedure}
            maxLength={4000}
            placeholder="Original learner procedure: define scope, population, sample, steps and pass/fail criteria."
            onChange={(e) => patch({ procedure: e.target.value })}
          />
        </Field>
        <Field label="Control evidence reference">
          <input
            value={d.evidence}
            maxLength={4000}
            onChange={(e) => patch({ evidence: e.target.value })}
          />
        </Field>
        <Field label="Assessment finding and remaining uncertainty">
          <textarea
            value={d.finding}
            maxLength={4000}
            onChange={(e) => patch({ finding: e.target.value })}
          />
        </Field>
        <div className="xa-actions">
          <button onClick={saveDecision}>Review control decision</button>
          <button
            onClick={() => {
              if (!d.owner.trim()) {
                setError(
                  "Assign a control owner before creating an implementation task.",
                );
                return;
              }
              const task = {
                ...newTask(
                  `control:nist-800-53:${c.id}`,
                  `Implement / validate ${c.displayId}`,
                ),
                owner: d.owner,
                accountable: d.owner,
              };
              setStudio((p) => ({ ...p, tasks: [...p.tasks, task] }));
              setMessage(
                "Control-linked implementation task created; review assumptions and validation in Implement.",
              );
            }}
          >
            Create control implementation task
          </button>
          <Link className="xa-button primary" to={`${base}/implement`}>
            Open plan →
          </Link>
          <button
            onClick={() =>
              download(
                "x1-nist-control-selection.json",
                JSON.stringify(
                  {
                    edition: catalog.edition,
                    scope: s.scope,
                    securityBaseline: s.sp.baseline,
                    privacyBaseline: s.sp.privacyApplicable,
                    privacyRationale: s.sp.privacyRationale,
                    categorisation: s.sp.categorisation,
                    controls: inScope.map((c) => ({
                      id: c.id,
                      title: c.title,
                      decision: s.sp.decisions[c.id] ?? defaultDecision,
                    })),
                    source: catalog.provenance,
                    limitations:
                      "Starting scope before tailoring; unrecorded controls are not started. No conformity or authorisation decision.",
                  },
                  null,
                  2,
                ),
                "application/json",
              )
            }
          >
            Export complete selected baseline
          </button>
        </div>
        <Method>
          Membership comes directly from the four official OSCAL profiles, with
          the union deduplicated. High-water mark uses the greatest entered CIA
          impact, independent of sector. Exclusions require a rationale;
          enhancements remain distinct records. Source placeholders identify
          organisation-defined parameters that must be assigned in the
          implementation. Assessment procedures and findings are
          learner-authored unless explicitly quoted in the authoritative
          sections.
        </Method>
        <Source href={source}>Official SP 800-53 publication</Source> ·{" "}
        <Source href="https://csrc.nist.gov/pubs/sp/800/53/a/r5/final">
          SP 800-53A
        </Source>{" "}
        ·{" "}
        <Source href="https://csrc.nist.gov/pubs/sp/800/53/b/upd1/final">
          SP 800-53B
        </Source>
      </Panel>
      {error && <p role="alert">{error}</p>}
      <p role="status">{message}</p>
    </>
  );
}
