import AssessmentEditor from "../components/editors/AssessmentEditor";
import { useEffect, useState } from "react";
import { mappings } from "../data/controls";
import {
  controls,
  frameworkSources,
  csfFunctions,
  frameworkGroups,
  functionBusiness,
} from "../workspace/frameworks";
import { Kpi, Panel, Donut, ProgressBar, palette } from "../workspace/charts";
import { metricInsight, useInsight } from "../workspace/insights";
import { useWorkspace } from "../workspace/state";
import { Link, useSearchParams } from "react-router-dom";
import { base } from "../components/shared";
import type { ControlAssessment } from "../data/types";
import { statuses, validateAssessment, gapSummary } from "../utils/engines";
import {
  ExportPanel,
  Field,
  Header,
  LabIntro,
  Reset,
  Source,
} from "../components/shared";
const blank = (): ControlAssessment => ({
  status: "Not assessed",
  notes: "",
  evidence: "",
  owner: "",
  justification: "",
});
export default function FrameworkLab() {
  const [params] = useSearchParams();
  const initial = frameworkSources.some((f) => f.id === params.get("framework"))
    ? params.get("framework")!
    : "nist-csf-2";
  const [framework, setFramework] = useState(initial);
  const { explain } = useInsight();
  const [group, setGroup] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected] = useState(
    controls.find((c) => c.framework === initial)!.id,
  );
  const [query, setQuery] = useState("");
  const {
    assessments: register,
    setAssessments: setRegister,
    assessmentDrafts,
    setAssessmentDrafts,
  } = useWorkspace();
  const draft = assessmentDrafts[selected] ?? register[selected] ?? blank();
  const setDraft = (value: ControlAssessment) =>
    setAssessmentDrafts((previous) => ({ ...previous, [selected]: value }));
  const [message, setMessage] = useState("");
  const source = frameworkSources.find((item) => item.id === framework)!;
  const visible = controls.filter(
    (item) =>
      item.framework === framework &&
      (group === "All" || item.path[0] === group) &&
      (statusFilter === "All" ||
        (statusFilter === "Gaps"
          ? ["Partially implemented", "Not implemented"].includes(
              register[item.id]?.status ?? "Not assessed",
            )
          : (register[item.id]?.status ?? "Not assessed") === statusFilter)) &&
      `${item.id} ${item.title} ${item.path.join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const control = controls.find((item) => item.id === selected)!;
  const summary = gapSummary(
    register,
    controls.filter((c) => c.framework === framework).map((item) => item.id),
  );
  const choose = (id: string) => {
    setSelected(id);
    setMessage("");
    const c = controls.find((c) => c.id === id)!;
    explain({
      ...metricInsight(
        `${c.id} · ${c.title}`,
        c.explanation,
        c.methods,
        c.gap,
        "control",
      ),
      technical: c.implementation,
      business: c.risk,
      sources: [{ title: "Official framework", url: c.source }],
      actions: [
        "Define scope and population.",
        `Request: ${c.evidence}`,
        "Record gaps, ownership and follow-up.",
      ],
      path: "/knowledge-graph?node=control",
    });
  };
  useEffect(() => {
    const id = params.get("framework");
    if (id && frameworkSources.some((f) => f.id === id)) {
      setFramework(id);
      setGroup("All");
      setSelected(controls.find((c) => c.framework === id)!.id);
    }
  }, [params]);
  return (
    <>
      <Header eyebrow="Laboratory · 01" title="Control & Framework Explorer">
        <p>
          Connect outcomes, implementation and evidence. Build a scoped
          assessment for a fictional service.
        </p>
      </Header>
      <LabIntro
        objectives={[
          "Navigate version-aware framework structures",
          "Separate implementation assertions from tested effectiveness",
          "Document gaps, owners and follow-up assessment",
        ]}
        reference="risk-assessment"
      >
        <p>
          CSF includes the full 106-outcome Core. Other frameworks use clearly
          labelled teaching subsets. This workspace does not certify conformity
          or calculate an overall compliance percentage.
        </p>
      </LabIntro>
      <div className="xa-grid two">
        <Field label="Framework">
          <select
            value={framework}
            onChange={(e) => {
              setFramework(e.target.value);
              setGroup("All");
              setQuery("");
              setStatusFilter("All");
              choose(
                controls.find((item) => item.framework === e.target.value)!.id,
              );
            }}
          >
            {frameworkSources.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Find an outcome or control">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Identifier, title or family"
          />
        </Field>
      </div>
      <details className="xa-framework-source">
        <summary>
          {source.name} · {source.edition} · scope & authoritative source
        </summary>
        <p>{source.publisher} · Metadata reviewed 20 November 2026</p>
        <p className="xa-muted">
          {source.scope}. {source.limitation}
        </p>
        <Source href={source.url}>Official framework reference</Source>
      </details>
      <div className="xa-kpi-grid">
        <Kpi
          label="In this scope"
          value={summary.total}
          detail={source.name}
          onClick={() => {
            setGroup("All");
            setStatusFilter("All");
            explain(
              metricInsight(
                "Assessment scope",
                source.limitation,
                "Count of displayed framework items, with each item assessed separately.",
                "A scoped exercise cannot establish organisation-wide conformity.",
                "control",
              ),
            );
          }}
        />
        <Kpi
          label="Reviewed"
          value={summary.total - summary.unassessed}
          detail="Learner decisions recorded"
          tone="blue"
          onClick={() =>
            explain(
              metricInsight(
                "Assessment progress",
                "Items with a recorded status.",
                "Reviewed = total − Not assessed; includes justified exclusions.",
                "This measures exercise completion, not control effectiveness.",
                "control",
              ),
            )
          }
        />
        <Kpi
          label="Evidenced assertions"
          value={summary.evidenced}
          detail="References require verification"
          onClick={() => setStatusFilter("Implemented and evidenced")}
        />
        <Kpi
          label="Identified gaps"
          value={summary.gaps}
          detail="Partial or not implemented"
          tone="amber"
          onClick={() => {
            setGroup("All");
            setStatusFilter("Gaps");
            explain(
              metricInsight(
                "Identified gaps",
                "Partial or missing implementations need follow-up.",
                "Count of Partially implemented and Not implemented statuses.",
                "Prioritise by business exposure; click a status to inspect its records.",
                "control",
              ),
            );
          }}
        />
      </div>
      <div className="xa-dashboard-grid xa-framework-summary">
        <Panel
          title="Assessment by function"
          subtitle="Select a Function to explore its categories and outcomes"
        >
          <div className="xa-function-grid">
            {frameworkGroups(framework).map((name, index) => {
              const items = controls.filter(
                (c) => c.framework === framework && c.path[0] === name,
              );
              const done = items.filter(
                (c) =>
                  register[c.id] && register[c.id].status !== "Not assessed",
              ).length;
              const fn = csfFunctions.find((f) => f.title === name);
              return (
                <button
                  className="xa-function-card"
                  aria-label={`Explore ${name}`}
                  key={name}
                  aria-pressed={group === name}
                  onClick={() => {
                    setGroup(name);
                    setStatusFilter("All");
                    choose(items[0].id);
                    explain({
                      ...metricInsight(
                        name,
                        fn?.text || source.scope,
                        "Review each scoped outcome. Progress is recorded statuses / items in this group; exclusions count as reviewed. No maturity model is applied.",
                        `${done} of ${items.length} reviewed. Review evidence quality separately.`,
                        "control",
                      ),
                      technical:
                        fn?.categories
                          .map((c) => `${c.id}: ${c.title}`)
                          .join("; ") || items.map((c) => c.id).join(", "),
                      business: functionBusiness(fn?.id || ""),
                      sources: [{ title: source.name, url: source.url }],
                    });
                  }}
                >
                  <div>
                    <span className={`xa-function-icon color-${index % 6}`}>
                      {fn?.id || name.slice(0, 2)}
                    </span>
                    <strong>{name}</strong>
                    <small>
                      {done}/{items.length}
                    </small>
                  </div>
                  <p>{fn?.text || source.scope}</p>
                  <ProgressBar
                    value={(done / items.length) * 100}
                    label={`${name} review progress`}
                  />
                  <small>
                    {done} reviewed · {items.length - done} to assess
                  </small>
                </button>
              );
            })}
          </div>
        </Panel>
        <Panel
          title="Evidence & gaps"
          subtitle="Recorded statuses in the selected framework"
        >
          <Donut
            label="in scope"
            segments={[
              {
                label: "Evidenced",
                value: summary.evidenced,
                color: palette.Evidenced,
              },
              { label: "Gaps", value: summary.gaps, color: palette.Gaps },
              {
                label: "Unassessed",
                value: summary.unassessed,
                color: palette.Unassessed,
              },
              {
                label: "Excluded",
                value: summary.excluded,
                color: palette.Excluded,
              },
            ]}
            onSelect={(label) => {
              setGroup("All");
              setStatusFilter(
                (
                  {
                    Evidenced: "Implemented and evidenced",
                    Gaps: "Gaps",
                    Unassessed: "Not assessed",
                    Excluded: "Not applicable",
                  } as Record<string, string>
                )[label],
              );
              explain(
                metricInsight(
                  label,
                  "Select individual records to review their status and evidence.",
                  "Counts derive only from saved learner assessments.",
                  "Assertions require independent testing. Gaps include both partial and missing implementations.",
                  "control",
                ),
              );
            }}
          />
          <Link to={`${base}/knowledge-graph?node=framework`}>
            Explore connected concepts →
          </Link>
        </Panel>
      </div>
      <div className="xa-toolbar">
        <Field label="Function or family">
          <select value={group} onChange={(e) => setGroup(e.target.value)}>
            <option>All</option>
            {frameworkGroups(framework).map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </Field>
        <Field label="Filter assessment status">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All</option>
            <option>Gaps</option>
            {statuses.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </Field>
        <button
          onClick={() => {
            setGroup("All");
            setStatusFilter("All");
            setQuery("");
          }}
        >
          Clear filters
        </button>
        <Link to={`${base}/frameworks`}>Other framework references →</Link>
      </div>
      <div className="xa-workspace" style={{ marginTop: "1rem" }}>
        <nav className="xa-list" aria-label="Framework hierarchy">
          {[...new Set(visible.map((c) => c.path[1]))].map((category) => (
            <details key={category} open>
              <summary>{category}</summary>
              {visible
                .filter((c) => c.path[1] === category)
                .map((item) => (
                  <button
                    key={item.id}
                    aria-pressed={selected === item.id}
                    onClick={() => choose(item.id)}
                  >
                    <span>
                      <small>
                        {item.path[0]} → {item.path[1]}
                      </small>
                      <br />
                      {item.id} · {item.title}
                    </span>
                  </button>
                ))}
            </details>
          ))}
          {!visible.length && <p>No controls match. Try a broader search.</p>}
        </nav>
        <AssessmentEditor
          control={control}
          draft={draft}
          setDraft={setDraft}
          message={message}
          onSave={() => {
            const errors = validateAssessment(draft);
            if (errors.length) {
              setMessage(errors.join(" "));
              return;
            }
            setRegister((previous) => ({
              ...previous,
              [selected]: { ...draft },
            }));
            setMessage("Assessment saved for this session.");
          }}
        />
      </div>
      <section>
        <h2>Gap analysis & remediation register</h2>
        <div className="xa-statline">
          {Object.entries(summary).map(([key, value]) => (
            <div className="xa-stat" key={key}>
              <strong>{value}</strong>
              <span>{key}</span>
            </div>
          ))}
        </div>
        <p>
          Counts cover only the selected framework’s displayed scope. Unassessed
          items require scoping before any conclusion.
        </p>
        <div className="xa-table-scroll">
          <table>
            <caption>Saved assessment decisions</caption>
            <thead>
              <tr>
                <th>Item</th>
                <th>Status</th>
                <th>Owner</th>
                <th>Priority action</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(register)
                .filter(([id]) => visible.some((c) => c.id === id))
                .map(([id, row]) => (
                  <tr key={id}>
                    <td>{id}</td>
                    <td>{row.status}</td>
                    <td>{row.owner || "Unassigned"}</td>
                    <td>
                      {row.notes ||
                        (row.status === "Implemented and evidenced"
                          ? "Independently sample operating effectiveness"
                          : "Scope, assign and investigate the gap")}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="xa-panel">
        <h2>Comparison workspace</h2>
        <p>
          CSF describes risk outcomes. SP 800-53 provides detailed security and
          privacy controls. ISO 27001 specifies an ISMS. Similar concepts
          require contextual interpretation.
        </p>
        {mappings.map((item) => (
          <details key={item.from}>
            <summary>
              {item.from} ↔ {item.to} · {item.concept}
            </summary>
            <p>{item.rationale}</p>
            <p>
              {item.confidence}. Curated teaching relationship, reviewed 20
              November 2026. This is an author interpretation with a reference
              for mapping methodology.
            </p>
            <Source href={item.source}>
              NIST informative reference programme
            </Source>
          </details>
        ))}
      </section>
      <ExportPanel
        title="Framework assessment and gap roadmap"
        methodology="CSF full Core; other frameworks use selected teaching scopes. Status counts describe learner assertions. Gaps require risk-based prioritisation and independent follow-up. No overall conformity conclusion."
        results={{
          summary,
          records: controls
            .filter((c) => c.framework === framework)
            .map((c) => ({
              id: c.id,
              title: c.title,
              ...blank(),
              ...register[c.id],
            })),
          assessmentRegister: Object.fromEntries(
            Object.entries(register).filter(
              ([id]) =>
                controls.find((c) => c.id === id)?.framework === framework,
            ),
          ),
          framework: source.name,
          edition: source.edition,
          scope: source.limitation,
          followUp:
            "Validate scope, sample operating effectiveness and assign dated remediation milestones.",
        }}
        rows={controls
          .filter((c) => c.framework === framework)
          .map((c) => ({
            id: c.id,
            title: c.title,
            category: c.path.join(" / "),
            ...blank(),
            ...register[c.id],
          }))}
        ready={controls.some(
          (c) => c.framework === framework && register[c.id],
        )}
      />
      <Reset
        onClick={() => {
          const ids = new Set(
            controls.filter((c) => c.framework === framework).map((c) => c.id),
          );
          setRegister((previous) =>
            Object.fromEntries(
              Object.entries(previous).filter(([id]) => !ids.has(id)),
            ),
          );
          setAssessmentDrafts((previous) =>
            Object.fromEntries(
              Object.entries(previous).filter(([id]) => !ids.has(id)),
            ),
          );
          setMessage("Assessment reset for the selected framework only.");
        }}
      />
    </>
  );
}
