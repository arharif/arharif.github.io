import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Lightbulb, ArrowRight, Search, GitBranch } from "lucide-react";
import {
  standards,
  relationships,
  type StandardNode,
} from "../../data/standards";
import { teachingItems } from "./items";
import { useAcademic, useScenario } from "../../app/context";
import { useAssessments } from "./state";
import { validateAssessment, statuses, gapSummary } from "../../utils/engines";
import type { ControlAssessment, FrameworkControl } from "../../data/types";
import {
  useExplanation,
  metricExplanation,
} from "../../components/Explanation";
import {
  Header,
  Field,
  ExportPanel,
  Source,
  base,
} from "../../components/shared";
import { Metric, Panel, Donut, Bars } from "../../components/Analytics";
import ArchitectureDiagram from "./ArchitectureDiagram";
const blank = (): ControlAssessment => ({
  status: "Not assessed",
  notes: "",
  evidence: "",
  owner: "",
  justification: "",
});
export default function StandardsWorkspace() {
  const location = useLocation(),
    navigate = useNavigate(),
    { explain } = useExplanation(),
    { caseId, setCaseId } = useAcademic(),
    scenario = useScenario();
  const queryParameters = new URLSearchParams(location.search);
  const requested =
    queryParameters.get("framework") ??
    (location.pathname.includes("/frameworks/")
      ? location.pathname.split("/").pop()
      : "nist-csf-2");
  const standard =
    standards.find((row) => row.id === requested) ?? standards[0];
  const [selectedGroup, setSelectedGroup] = useState(standard.nodes[0].id),
    [selectedItem, setSelectedItem] = useState("");
  const [query, setQuery] = useState(""),
    [statusFilter, setStatusFilter] = useState(""),
    [tab, setTab] = useState(queryParameters.get("view") ?? "explore");
  const [allGroups, setAllGroups] = useState(false);
  const [draft, setDraft] = useState(blank),
    [message, setMessage] = useState("");
  const { register, setRegister, error } = useAssessments();
  const group =
    standard.nodes.find((row) => row.id === selectedGroup) ?? standard.nodes[0];
  const items = useMemo(
    () => standard.nodes.flatMap((row) => teachingItems(standard.id, row)),
    [standard.id],
  );
  const scopedId = (id: string) => `${caseId}:${standard.id}:${id}`;
  const scoped = Object.fromEntries(
    items
      .filter((row) => register[scopedId(row.id)])
      .map((row) => [row.id, register[scopedId(row.id)]]),
  );
  const summary = gapSummary(
    scoped,
    items.map((row) => row.id),
  );
  const covered = summary.total - summary.unassessed,
    coverage = summary.total ? Math.round((covered / summary.total) * 100) : 0;
  const groupItems = teachingItems(standard.id, group);
  const active = items.find((row) => row.id === selectedItem) ?? groupItems[0];
  useEffect(() => {
    setSelectedGroup(standard.nodes[0].id);
    setSelectedItem("");
    setDraft(blank());
    setMessage("");
    setQuery("");
    setStatusFilter("");
  }, [standard.id]);
  const chooseGroup = (id: string) => {
    const node = standard.nodes.find((row) => row.id === id)!;
    setSelectedGroup(id);
    setAllGroups(false);
    setSelectedItem("");
    setDraft(blank());
    explain({
      ...metricExplanation(
        node.title,
        standard.title,
        `${standard.kind}. ${standard.purpose}`,
        "assurance",
      ),
      id: `${standard.id}-${id}`,
      meaning: node.objective,
      technical: node.implementation,
      business: `For ${scenario.name}, connect this topic to ${scenario.process.toLowerCase()} and ${scenario.dependency.toLowerCase()}.`,
      interpretation: `Owner: ${node.owner}. Possible evidence: ${node.evidence}. Common mistake: ${node.mistake}`,
      actions: [
        node.implementation,
        `Assign ${node.owner.toLowerCase()}.`,
        "Open the scoped assessment and record supporting evidence.",
      ],
      sources: [{ title: standard.title, url: standard.source }],
    });
  };
  const chooseItem = (item: FrameworkControl) => {
    setSelectedItem(item.id);
    setDraft(scoped[item.id] ?? blank());
    explain({
      ...metricExplanation(item.id, item.title, item.methods, "assurance"),
      id: `control-${standard.id}-${item.id}`,
      meaning: item.explanation,
      technical: item.implementation,
      interpretation: `${item.evidence}. Common gap: ${item.gap}`,
      actions: [item.methods, `Confirm responsibility with ${item.roles}.`],
      sources: [{ title: standard.title, url: standard.source }],
    });
  };
  const visible = (allGroups ? items : groupItems).filter(
    (row) =>
      `${row.id} ${row.title}`.toLowerCase().includes(query.toLowerCase()) &&
      (!statusFilter ||
        (statusFilter === "Implementation gaps"
          ? ["Partially implemented", "Not implemented"].includes(
              scoped[row.id]?.status ?? "Not assessed",
            )
          : (scoped[row.id]?.status ?? "Not assessed") === statusFilter)),
  );
  const demo = () => {
    const next = { ...register };
    items.forEach((item, index) => {
      next[scopedId(item.id)] = {
        status:
          index % 4 === 0
            ? "Not implemented"
            : index % 4 === 1
              ? "Partially implemented"
              : "Implemented and evidenced",
        owner: scenario.owner,
        notes:
          index % 4 < 2
            ? `Prioritise ${item.title.toLowerCase()} and validate the operating sample.`
            : "Review effectiveness independently over the scoped period.",
        evidence:
          index % 4 >= 2
            ? `Fictional sample ${standard.id}-${index + 1} · educational period only`
            : "",
        justification: "",
      };
    });
    setRegister(next);
    setTab("results");
    setMessage(
      "Completed fictional assessment loaded. These are authored teaching assertions.",
    );
    explain(
      metricExplanation(
        "Completed educational demo",
        `${items.length} assessed teaching items`,
        "Authored fictional statuses are distributed to demonstrate gaps, evidence and planning. This is not organisational evidence or certification.",
        "assurance",
      ),
    );
  };
  useEffect(() => {
    if (new URLSearchParams(location.search).get("demo") === "1") demo();
  }, [standard.id, location.search]);
  return (
    <>
      <Header
        eyebrow="Explore standards · assess · implement"
        title="Explore Standards"
      >
        <p>
          Trace architecture, assess evidence and turn gaps into an
          implementation roadmap.
        </p>
      </Header>
      <div className="xa-standards-toolbar">
        <Field label="Select standard or regulation">
          <select
            value={standard.id}
            onChange={(event) =>
              navigate(`${location.pathname}?framework=${event.target.value}`)
            }
          >
            {standards.map((row) => (
              <option key={row.id} value={row.id}>
                {row.title} · {row.kind}
              </option>
            ))}
          </select>
        </Field>
        {!location.pathname.startsWith(`${base}/labs/`) && (
          <Field label="Assessment organisation">
            <select
              value={caseId}
              onChange={(event) =>
                setCaseId(event.target.value as typeof caseId)
              }
            >
              <option value="paysecure">X1 PaySecure · Banking</option>
              <option value="petroshield">X1 PetroShield · Oil & gas</option>
              <option value="smartfactory">
                X1 SmartFactory · Manufacturing
              </option>
            </select>
          </Field>
        )}
        <button className="primary" onClick={demo}>
          <Lightbulb size={16} />
          Try Completed Demo
        </button>
      </div>
      <div className="xa-standard-banner">
        <div>
          <p className="xa-eyebrow">
            {standard.family} · {standard.kind}
          </p>
          <h2>{standard.title}</h2>
          <p>{standard.purpose}</p>
          <small>{standard.edition}</small>
        </div>
        <div
          className="xa-coverage-ring"
          style={{
            background: `conic-gradient(var(--xa-accent) ${coverage}%,var(--xa-soft) 0)`,
          }}
        >
          <div>
            <strong>{coverage}%</strong>
            <span>Assessment coverage</span>
          </div>
        </div>
      </div>
      <p className="xa-chart-note">
        {standard.assessment} · {items.length} scoped teaching items. Coverage
        counts assessed items, including justified exclusions. It does not
        measure maturity, compliance or certification.
      </p>
      <details>
        <summary>Applicability, source status & educational scope</summary>
        <Source href={standard.source}>Publisher reference</Source>
        <p>{standard.applicability}</p>
        <p>
          {standard.verification} Metadata reviewed {standard.reviewed}.
          Summaries are original teaching material. Licensed standards text is
          required for formal interpretation.
        </p>
      </details>
      {error && <p role="alert">{error}</p>}
      <p role="status">{message}</p>
      <div className="xa-segmented" aria-label="Standards workspace view">
        {[
          ["explore", "Explore architecture"],
          ["assess", "Assess controls"],
          ["results", "Assessment dashboard"],
          ["relationships", "Relationships"],
        ].map(([id, label]) => (
          <button key={id} aria-pressed={tab === id} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>
      {tab === "explore" && (
        <>
          <div className="xa-standards-layout">
            <nav className="xa-standard-tree" aria-label="Framework hierarchy">
              <Field label="Search framework hierarchy">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Function, domain or category"
                />
              </Field>
              {standard.nodes
                .filter((row) =>
                  `${row.title} ${row.children?.map((child) => child.title).join(" ")}`
                    .toLowerCase()
                    .includes(query.toLowerCase()),
                )
                .map((row) => (
                  <details key={row.id} open={row.id === group.id}>
                    <summary
                      onClick={(event) => {
                        event.preventDefault();
                        chooseGroup(row.id);
                      }}
                    >
                      {row.title}
                    </summary>
                    <button onClick={() => chooseGroup(row.id)}>
                      Explain {row.title}
                    </button>
                    {row.children?.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => {
                          chooseGroup(row.id);
                          const item =
                            teachingItems(standard.id, row).find(
                              (value) => value.id === child.id,
                            ) ?? teachingItems(standard.id, row)[0];
                          chooseItem(item);
                          setTab("assess");
                        }}
                      >
                        {child.id} · {child.title}
                      </button>
                    ))}
                  </details>
                ))}
            </nav>
            <div>
              <ArchitectureDiagram
                key={standard.id}
                standard={standard}
                selected={group.id}
                onSelect={chooseGroup}
              />
              <section className="xa-control-detail">
                <p className="xa-eyebrow">Selected architecture area</p>
                <h2>{group.title}</h2>
                <p>{group.objective}</p>
                <p>{group.implementation}</p>
                <p>
                  <strong>Responsible roles</strong> · {group.owner}
                </p>
                <p>
                  <strong>Evidence examples</strong> · {group.evidence}
                </p>
                <p>
                  <strong>Common mistake</strong> · {group.mistake}
                </p>
                <div className="xa-actions">
                  <button
                    onClick={() => {
                      chooseItem(groupItems[0]);
                      setTab("assess");
                    }}
                  >
                    Assess this area <ArrowRight size={14} />
                  </button>
                  <Link
                    className="xa-button"
                    to={`${base}/knowledge-graph?concept=framework`}
                  >
                    Explore linked concepts
                  </Link>
                </div>
              </section>
            </div>
          </div>
        </>
      )}
      {tab === "assess" && (
        <>
          <div className="xa-function-grid">
            {standard.nodes.map((row) => (
              <button
                className="xa-function"
                key={row.id}
                aria-pressed={group.id === row.id}
                onClick={() => {
                  chooseGroup(row.id);
                  setSelectedItem(teachingItems(standard.id, row)[0].id);
                  setDraft(
                    scoped[teachingItems(standard.id, row)[0].id] ?? blank(),
                  );
                }}
              >
                <strong>{row.title}</strong>
                <small>
                  {
                    teachingItems(standard.id, row).filter(
                      (item) =>
                        scoped[item.id]?.status &&
                        scoped[item.id].status !== "Not assessed",
                    ).length
                  }
                  /{teachingItems(standard.id, row).length} assessed
                </small>
              </button>
            ))}
          </div>
          <div className="xa-grid two">
            <Field label="Filter control assessments">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </Field>
            <Field label="Control-state filter">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="">All statuses</option>
                <option>Implementation gaps</option>
                {statuses.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="xa-table-scroll">
            <table>
              <caption>
                {allGroups ? "All architecture areas" : group.title} · scoped
                teaching outcomes and topics
              </caption>
              <thead>
                <tr>
                  <th>Identifier / topic</th>
                  <th>Status</th>
                  <th>Owner</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <button
                        className="xa-record-link"
                        onClick={() => chooseItem(item)}
                      >
                        {item.id} · {item.title}
                      </button>
                    </td>
                    <td>{scoped[item.id]?.status ?? "Not assessed"}</td>
                    <td>{scoped[item.id]?.owner ?? "Unassigned"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!visible.length && (
            <p>No items match. Clear the search or status filter.</p>
          )}
          <article className="xa-panel xa-assessment-editor">
            <h2>
              {active.id} · {active.title}
            </h2>
            <p>{active.explanation}</p>
            <p>{active.implementation}</p>
            <details>
              <summary>Assessment method & evidence</summary>
              <p>{active.methods}</p>
              <p>{active.evidence}</p>
            </details>
            <div className="xa-grid two">
              <Field label="Assessment status">
                <select
                  value={draft.status}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      status: event.target.value as ControlAssessment["status"],
                    })
                  }
                >
                  {statuses.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </Field>
              <Field label="Action owner">
                <input
                  value={draft.owner}
                  maxLength={120}
                  onChange={(event) =>
                    setDraft({ ...draft, owner: event.target.value })
                  }
                />
              </Field>
            </div>
            <Field label="Evidence reference and assessment period">
              <input
                value={draft.evidence}
                maxLength={500}
                onChange={(event) =>
                  setDraft({ ...draft, evidence: event.target.value })
                }
              />
            </Field>
            <Field label="Notes and next action">
              <textarea
                value={draft.notes}
                maxLength={2000}
                onChange={(event) =>
                  setDraft({ ...draft, notes: event.target.value })
                }
              />
            </Field>
            {draft.status === "Not applicable" && (
              <Field label="Scope exclusion justification">
                <textarea
                  value={draft.justification}
                  maxLength={1000}
                  onChange={(event) =>
                    setDraft({ ...draft, justification: event.target.value })
                  }
                />
              </Field>
            )}
            <button
              className="primary"
              onClick={() => {
                const errors = validateAssessment(draft);
                if (errors.length) {
                  setMessage(errors.join(" "));
                  return;
                }
                setRegister({
                  ...register,
                  [scopedId(active.id)]: { ...draft },
                });
                setSelectedItem(active.id);
                setMessage(
                  `Assessment saved for ${active.id}. Evidence references remain learner assertions.`,
                );
              }}
            >
              Save assessment
            </button>
            <p className="xa-chart-note">
              Selected item records are saved locally. No evidence files are
              uploaded.
            </p>
          </article>
        </>
      )}
      {tab === "results" && (
        <>
          <div className="xa-metric-grid">
            <Metric
              label="Coverage"
              value={`${covered}/${summary.total}`}
              detail="Assessed teaching items"
              onClick={() =>
                explain(
                  metricExplanation(
                    "Assessment coverage",
                    `${coverage}%`,
                    "Assessed items divided by scoped teaching items. Exclusions require justification. Coverage is not an implementation or maturity score.",
                    "assurance",
                  ),
                )
              }
            />
            <Metric
              label="Evidenced assertions"
              value={summary.evidenced}
              detail="Independent testing remains necessary"
              onClick={() => {
                setStatusFilter("Implemented and evidenced");
                setAllGroups(true);
                setTab("assess");
                explain(
                  metricExplanation(
                    "Evidenced assertions",
                    String(summary.evidenced),
                    "Items marked implemented with a learner-supplied evidence reference. Independent validation has not occurred.",
                    "assurance",
                  ),
                );
              }}
            />
            <Metric
              label="Implementation gaps"
              value={summary.gaps}
              tone="amber"
              detail="Partial or missing implementation"
              onClick={() => {
                setStatusFilter("Implementation gaps");
                setAllGroups(true);
                setTab("assess");
              }}
            />
            <Metric
              label="Awaiting assessment"
              value={summary.unassessed}
              tone="violet"
              detail="Scope and ownership need review"
              onClick={() => {
                setStatusFilter("Not assessed");
                setAllGroups(true);
                setTab("assess");
              }}
            />
          </div>
          <div className="xa-dashboard-grid">
            <Panel
              title="Control-state distribution"
              subtitle="Authored or learner-entered assessment assertions"
            >
              <Donut
                label="items"
                entries={statuses.map((label, index) => ({
                  label,
                  value: items.filter(
                    (row) =>
                      (scoped[row.id]?.status ?? "Not assessed") === label,
                  ).length,
                  colour: [
                    "#8d9cad",
                    "#68b69b",
                    "#d8b96c",
                    "#df7b88",
                    "#a69bc4",
                  ][index],
                }))}
                onSelect={(label) => {
                  setStatusFilter(label);
                  setAllGroups(true);
                  setTab("assess");
                  explain(
                    metricExplanation(
                      label,
                      "Selected control-state records",
                      "Statuses describe scoped learner assertions. They do not establish conformity.",
                      "assurance",
                    ),
                  );
                }}
              />
            </Panel>
            <Panel
              title="Coverage by architecture area"
              subtitle="Select an area to review its outcomes"
            >
              <Bars
                label="Coverage by area"
                entries={standard.nodes.map((row) => ({
                  label: row.title,
                  value: teachingItems(standard.id, row).filter(
                    (item) =>
                      scoped[item.id]?.status &&
                      scoped[item.id].status !== "Not assessed",
                  ).length,
                }))}
                onSelect={(label) => {
                  chooseGroup(
                    standard.nodes.find((row) => row.title === label)!.id,
                  );
                  setTab("assess");
                }}
              />
            </Panel>
          </div>
          <Panel
            title="Current / target profile and remediation"
            subtitle="Target is the declared teaching objective, not a prescribed maturity rating"
          >
            <div className="xa-gap-grid">
              {standard.nodes.map((row) => {
                const scopedItems = teachingItems(standard.id, row);
                const gaps = scopedItems.filter((item) =>
                  [
                    "Not implemented",
                    "Partially implemented",
                    "Not assessed",
                  ].includes(scoped[item.id]?.status ?? "Not assessed"),
                ).length;
                return (
                  <button
                    key={row.id}
                    className={
                      gaps ? "xa-gap-cell needs-action" : "xa-gap-cell"
                    }
                    onClick={() => {
                      chooseGroup(row.id);
                      setTab("assess");
                    }}
                  >
                    <strong>{row.title}</strong>
                    <span>{gaps} follow-up items</span>
                    <small>
                      Target · assess and evidence the applicable outcomes
                    </small>
                  </button>
                );
              })}
            </div>
            <div className="xa-actions">
              <Link
                className="xa-button primary"
                to={`${base}/implement?framework=${standard.id}&gaps=1`}
              >
                Generate implementation roadmap →
              </Link>
              <button
                onClick={() => {
                  setRegister((previous) =>
                    Object.fromEntries(
                      Object.entries(previous).filter(
                        ([id]) => !id.startsWith(`${caseId}:${standard.id}:`),
                      ),
                    ),
                  );
                  setDraft(blank());
                  setMessage(
                    "Selected scenario and framework assessment reset.",
                  );
                }}
              >
                Reset assessment
              </button>
            </div>
          </Panel>
        </>
      )}
      {tab === "relationships" && (
        <Panel
          title="Cross-framework relationships"
          subtitle="Curated conceptual connections with declared limits"
        >
          {relationships
            .filter((row) => row[0] === standard.id || row[1] === standard.id)
            .map(([from, to, title, explanation]) => (
              <button
                className="xa-relationship"
                key={title}
                onClick={() =>
                  explain({
                    ...metricExplanation(
                      title,
                      "Conceptual overlap",
                      "Curated author interpretation, with no asserted one-to-one control equivalence. Review the linked publisher sources.",
                      "assurance",
                    ),
                    meaning: explanation,
                    technical: `${standards.find((row) => row.id === from)!.purpose} ${standards.find((row) => row.id === to)!.purpose}`,
                    interpretation: explanation,
                    sources: [
                      {
                        title: standards.find((row) => row.id === from)!.title,
                        url: standards.find((row) => row.id === from)!.source,
                      },
                      {
                        title: standards.find((row) => row.id === to)!.title,
                        url: standards.find((row) => row.id === to)!.source,
                      },
                    ],
                  })
                }
              >
                <GitBranch size={20} />
                <span>
                  <strong>
                    {standards.find((row) => row.id === from)!.title} ↔{" "}
                    {standards.find((row) => row.id === to)!.title}
                  </strong>
                  <small>{title}</small>
                </span>
              </button>
            ))}
          <p>
            Relationships are educational comparisons grounded in the purposes
            of the cited sources. They are not official control crosswalks.
          </p>
        </Panel>
      )}
      <ExportPanel
        title="Framework assessment and gap roadmap"
        methodology={`${standard.title}; ${standard.edition}. ${standard.assessment}. Coverage counts scoped assessment assertions. Independent effectiveness review and source verification remain necessary.`}
        results={{
          framework: standard.title,
          kind: standard.kind,
          source: standard.source,
          scope: scenario.process,
          summary,
          assessmentRegister: scoped,
          gaps: items
            .filter((row) =>
              ["Not implemented", "Partially implemented"].includes(
                scoped[row.id]?.status,
              ),
            )
            .map((row) => ({
              id: row.id,
              action: scoped[row.id]?.notes || row.implementation,
              owner: scoped[row.id]?.owner,
            })),
        }}
        rows={Object.entries(scoped).map(([id, value]) => ({ id, ...value }))}
        ready={Object.keys(scoped).length > 0}
      />
    </>
  );
}
