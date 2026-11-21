import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Lightbulb, GitBranch, ArrowRight } from "lucide-react";
import { base, Header, Field, Source, download } from "../components/shared";
import { useScenario } from "../app/context";
import { useWorkspace } from "../workspace/state";
import { standards, architectureFor, type Standard } from "./standards";
import { newFinding, findingErrors, type Finding } from "./model";
import { recordFinding } from "./engines";
import { controls as officialControls } from "../workspace/frameworks";
import { metricInsight, useInsight } from "../workspace/insights";
import { Panel, Kpi, Bars, Donut, palette } from "../workspace/charts";
import { csv } from "../utils/engines";
import { relationships, type StandardNode } from "../data/standards";
import ArchitectureDiagram from "../features/standards/ArchitectureDiagram";
export default function StandardsAcademy() {
  const [params, setParams] = useSearchParams(),
    { studio, setStudio } = useWorkspace(),
    scenario = useScenario(),
    { explain } = useInsight();
  const selected = params.get("framework") ?? "nist-csf-2",
    s = standards.find((row) => row.id === selected) ?? standards[0],
    model = architectureFor(s.id);
  const [query, setQuery] = useState(""),
    [groupId, setGroupId] = useState(""),
    [category, setCategory] = useState(""),
    [view, setView] = useState(params.get("view") ?? "architecture"),
    [status, setStatus] = useState("All"),
    [message, setMessage] = useState(""),
    [editing, setEditing] = useState<Finding | null>(null);
  const group =
    model?.nodes.find((row) => row.id === groupId) ?? model?.nodes[0];
  const profile = studio.findings.filter((row) => row.framework === s.id),
    assessed = profile.filter(
      (row) => row.current !== null && row.applicability === "Applicable",
    ),
    gaps = profile.filter(
      (row) =>
        row.applicability === "Applicable" &&
        (row.current === null || row.current < row.target),
    );
  const topics =
    s.id === "nist-csf-2"
      ? officialControls
          .filter((row) => row.framework === "nist-csf-2")
          .map((row) => ({ id: row.id, title: row.title, group: row.path[0] }))
      : (model?.nodes.flatMap((node) =>
          (node.children?.length
            ? node.children
            : [{ id: `X1-${node.id}`, title: node.title }]
          ).map((child) => ({
            id: child.id,
            title: child.title,
            group: node.title,
          })),
        ) ?? []);
  const choose = (node: StandardNode, standard: Standard = s) => {
    setGroupId(node.id);
    setCategory(node.children?.[0]?.id ?? "");
    explain({
      ...metricInsight(
        node.title,
        node.objective,
        node.implementation,
        `Responsible roles: ${node.owner}. Evidence examples: ${node.evidence}. Common mistake: ${node.mistake}`,
        "control",
      ),
      technical: node.implementation,
      business: `${scenario.name} applies this topic to ${scenario.process.toLowerCase()} and ${scenario.dependency.toLowerCase()}.`,
      actions: [
        node.implementation,
        `Assign ${node.owner.toLowerCase()}.`,
        "Review the publisher source and assessment boundary.",
      ],
      sources: [{ title: standard.name, url: standard.url }],
      path:
        standard.id === "nist-ai-rmf" || standard.id === "iso-42001"
          ? "/learning/detection-evaluation"
          : "/learning/risk-assessment",
    });
  };
  const completeDemo = () => {
    const findings = topics.map((topic, index) => ({
      ...newFinding(topic.id, topic.title, topic.group, s.id, s.edition),
      current: index % 5,
      target: 3,
      owner: scenario.owner,
      rationale:
        "Fictional educational scenario. Authored level assignments illustrate the declared X1 rubric and require real-world evidence before operational use.",
      currentState: `Authored teaching state ${index % 5}`,
      targetState: "Scoped and evidenced operation with accountable review",
      evidence:
        index % 3 === 0
          ? ""
          : `Fictional example ${s.id}-${index + 1} · not organisational evidence`,
      verification:
        index % 3 === 0 ? ("None" as const) : ("Learner assertion" as const),
      confidence: "Medium" as const,
      periodStart: studio.scope.periodStart,
      periodEnd: studio.scope.periodEnd,
    }));
    setStudio((previous) => ({
      ...previous,
      framework: s.id,
      edition: s.edition,
      scope: {
        ...previous.scope,
        services: previous.scope.services || scenario.process,
        boundary:
          previous.scope.boundary ||
          `${scenario.name} selected service, supplier interfaces and recovery dependencies`,
      },
      findings: [
        ...previous.findings,
        ...findings.filter(
          (record) =>
            !previous.findings.some(
              (existing) =>
                existing.framework === record.framework &&
                existing.controlId === record.controlId,
            ),
        ),
      ],
    }));
    setView("results");
    setStatus("All");
    setMessage(
      `Fictional demo loaded; existing findings are retained. Scope includes ${findings.length} ${s.id === "nist-csf-2" ? "official CSF outcomes" : "selected educational topics"}.`,
    );
  };
  const visible = profile.filter((row) => {
    if (
      !`${row.controlId} ${row.title} ${row.owner}`
        .toLowerCase()
        .includes(query.toLowerCase())
    )
      return false;
    if (status === "Gaps")
      return row.current === null || row.current < row.target;
    if (status === "With evidence") return !!row.evidence;
    if (status === "Without evidence") return !row.evidence;
    if (status.startsWith("Level ")) return row.current === +status.slice(6);
    if (status.startsWith("Group ")) return row.group === status.slice(6);
    return true;
  });
  return (
    <div className="xe-standards-workspace">
      <Header
        eyebrow="Explore Standards · architecture, evidence & implementation"
        title="Explore Standards"
      >
        <p>
          Select a standard, understand its purpose and turn scoped assessment
          findings into an implementation roadmap.
        </p>
      </Header>
      <div className="xe-standard-toolbar">
        <Field label="Search standards">
          <input
            value={query}
            maxLength={240}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Privacy, resilience, NIST, ISO or regulation"
          />
        </Field>
        <Field label="Standard edition">
          <select
            value={s.id}
            onChange={(event) => {
              setParams({ framework: event.target.value });
              setQuery("");
              setGroupId("");
              setEditing(null);
              setMessage("");
              const next = standards.find(
                (row) => row.id === event.target.value,
              )!;
              const nextModel = architectureFor(next.id);
              if (nextModel?.nodes[0]) choose(nextModel.nodes[0], next);
            }}
          >
            {standards
              .filter(
                (row) =>
                  `${row.name} ${row.scope}`
                    .toLowerCase()
                    .includes(query.toLowerCase()) || row.id === s.id,
              )
              .map((row) => (
                <option key={row.id} value={row.id}>
                  {row.name} · {row.edition}
                </option>
              ))}
          </select>
        </Field>
        <button
          className="primary"
          onClick={completeDemo}
          disabled={!topics.length}
        >
          <Lightbulb size={16} />
          Try Completed Demo
        </button>
      </div>
      <details className="xa-panel xe-standard-metadata">
        <summary>
          <strong>{s.name}</strong> · {model?.kind ?? "Guidance"} · Source,
          scope & edition
        </summary>
        <p>
          {s.authority} · {s.edition}
        </p>
        <div className="xa-tags">
          <span>
            {model?.kind ?? "Guidance"} ·{" "}
            {model?.family ?? "Security and privacy"}
          </span>
          <span>Publication / application · {s.publicationDate}</span>
        </div>
        <p>{s.scope}</p>
        <h2>Applicability and educational boundaries</h2>
        <p>{s.scoping}</p>
        <p>
          <strong>Publisher architecture context</strong> · {s.architecture}
        </p>
        <p>{s.reviewStatus}</p>
        <p>{s.limitations}</p>
        <Source href={s.url}>Authoritative publisher reference</Source>
      </details>
      <p className="xe-standard-status" role="status">
        {message}
      </p>
      <div className="xa-segment" aria-label="Standards view">
        {[
          ["architecture", "Architecture"],
          ["results", "Assessment dashboard"],
          ["relationships", "Relationships"],
        ].map(([id, label]) => (
          <button
            key={id}
            aria-pressed={view === id}
            onClick={() => setView(id)}
          >
            {label}
          </button>
        ))}
      </div>
      {view === "architecture" && model && group && (
        <>
          <div className="xe-standards-layout">
            <nav
              className="xe-standard-tree"
              aria-label="Framework architecture hierarchy"
            >
              {model.nodes.map((node) => (
                <details key={node.id} open={node.id === group.id}>
                  <summary
                    onClick={(event) => {
                      event.preventDefault();
                      choose(node);
                    }}
                  >
                    {node.title}
                  </summary>
                  <button onClick={() => choose(node)}>
                    Explain {node.title}
                  </button>
                  {node.children?.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => {
                        choose(node);
                        setCategory(child.id);
                        explain({
                          ...metricInsight(
                            child.id,
                            child.title,
                            node.implementation,
                            `Parent area: ${node.title}. Review the official structure and scoped evidence.`,
                            "control",
                          ),
                          sources: [{ title: s.name, url: s.url }],
                        });
                      }}
                    >
                      {child.id} · {child.title}
                    </button>
                  ))}
                </details>
              ))}
            </nav>
            <ArchitectureDiagram
              key={s.id}
              standard={model}
              selected={group.id}
              onSelect={(id) =>
                choose(model.nodes.find((node) => node.id === id)!)
              }
            />
          </div>
          <Panel
            title={group.title}
            subtitle="Original educational interpretation"
          >
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
            {s.id === "nist-csf-2" && category && (
              <details open>
                <summary>{category} · Official Core outcomes</summary>
                <div className="xe-outcome-list">
                  {officialControls
                    .filter(
                      (row) =>
                        row.framework === "nist-csf-2" &&
                        row.id.startsWith(`${category}-`),
                    )
                    .map((row) => (
                      <button
                        key={row.id}
                        onClick={() =>
                          explain({
                            ...metricInsight(
                              row.id,
                              row.explanation,
                              row.methods,
                              "Official outcome text is distinguished from original implementation and evidence guidance.",
                              "control",
                            ),
                            technical: row.implementation,
                            actions: [row.evidence, row.methods],
                            sources: [{ title: s.name, url: s.url }],
                          })
                        }
                      >
                        {row.id} · {row.title}
                      </button>
                    ))}
                </div>
                <Link
                  className="xa-button"
                  to={`${base}/assess?function=${group.id}&category=${category}`}
                >
                  Assess selected category →
                </Link>
              </details>
            )}
            <div className="xa-actions">
              <Link className="xa-button primary" to={`${base}${s.workspace}`}>
                Open assessment or simulation →
              </Link>
              <Link
                className="xa-button"
                to={`${base}/implement?standard=${s.id}`}
                onClick={() =>
                  setStudio((previous) => ({
                    ...previous,
                    framework: s.id,
                    edition: s.edition,
                  }))
                }
              >
                Build implementation project →
              </Link>
              <Link className="xa-button" to={`${base}/knowledge-graph`}>
                Explore linked concepts
              </Link>
            </div>
          </Panel>
        </>
      )}
      {view === "architecture" && !model && (
        <Panel title="Purpose and implementation context">
          <p>{s.architecture}</p>
          <p>{s.scoping}</p>
          <Link className="xa-button" to={`${base}${s.workspace}`}>
            Open the source-linked workspace →
          </Link>
        </Panel>
      )}
      {view === "results" && (
        <>
          <div className="xa-kpi-grid">
            <Kpi
              label="Profile records"
              value={profile.length}
              detail={`${topics.length} teaching scope items available`}
              onClick={() => setStatus("All")}
            />
            <Kpi
              label="Assessed records"
              value={assessed.length}
              detail="Applicable with a recorded current level"
              onClick={() =>
                explain(
                  metricInsight(
                    "Assessment coverage",
                    `${assessed.length} of ${profile.length} recorded items`,
                    "Count records with a current level. The denominator is the selected profile, not an automatic whole-standard conformity scope.",
                    "Inspect omitted, excluded and unassessed topics.",
                    "control",
                  ),
                )
              }
            />
            <Kpi
              label="Target gaps"
              value={gaps.length}
              detail="Current below target or unknown"
              tone="amber"
              onClick={() => setStatus("Gaps")}
            />
            <Kpi
              label="Evidence references"
              value={profile.filter((row) => row.evidence).length}
              detail="Learner assertions require validation"
              onClick={() => setStatus("With evidence")}
            />
          </div>
          <div className="xa-chart-grid">
            <Panel
              title="Current level distribution"
              subtitle={`Declared educational rubric ${studio.rubric.version}; no certification conclusion`}
            >
              <Donut
                label="Profile levels"
                segments={studio.rubric.labels.map((label, index) => ({
                  label,
                  value: profile.filter((row) => row.current === index).length,
                  color: [
                    palette.High,
                    palette.Medium,
                    palette.Neutral,
                    palette.Low,
                    palette.Evidenced,
                  ][index],
                }))}
                onSelect={(label) => {
                  const level = studio.rubric.labels.indexOf(label);
                  explain(
                    metricInsight(
                      label,
                      `${profile.filter((row) => row.current === level).length} recorded assertions`,
                      "A declared X1 0–4 educational level is assigned by the learner or authored fictional demo. It is not a NIST-prescribed compliance or certification percentage.",
                      "Review the matching records, rationale, evidence and uncertainty.",
                      "control",
                    ),
                  );
                  setQuery("");
                  setStatus(`Level ${level}`);
                }}
              />
            </Panel>
            <Panel
              title="Gaps by architecture area"
              subtitle="Select a group to inspect its recorded findings"
            >
              <Bars
                items={[...new Set(profile.map((row) => row.group))].map(
                  (label) => ({
                    label,
                    value: gaps.filter((row) => row.group === label).length,
                  }),
                )}
                onSelect={(label) => {
                  setStatus(`Group ${label}`);
                  explain(
                    metricInsight(
                      label,
                      "Selected architecture group",
                      "Records are grouped by their source architecture area.",
                      "Review owner, target and supporting evidence.",
                      "control",
                    ),
                  );
                }}
              />
            </Panel>
          </div>
          <Panel
            title="Profile register and remediation"
            subtitle="Every aggregate links back to these source records"
          >
            <div className="xa-toolbar">
              <Field label="Filter profile records">
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                >
                  {[
                    "All",
                    "Gaps",
                    "With evidence",
                    "Without evidence",
                    ...studio.rubric.labels.map((_, index) => `Level ${index}`),
                    ...[...new Set(profile.map((row) => row.group))].map(
                      (group) => `Group ${group}`,
                    ),
                  ].map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="xa-table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Topic / outcome</th>
                    <th>Current / target</th>
                    <th>Owner</th>
                    <th>Evidence</th>
                  </tr>
                </thead>
                <tbody>
                  {visible
                    .filter((row) =>
                      status.startsWith("Level ")
                        ? row.current === +status.slice(6)
                        : status.startsWith("Group ")
                          ? row.group === status.slice(6)
                          : true,
                    )
                    .map((row) => (
                      <tr key={row.id}>
                        <td>
                          <button
                            className="xa-text-button"
                            onClick={() => {
                              setEditing({ ...row });
                              explain({
                                ...metricInsight(
                                  row.controlId,
                                  row.title,
                                  row.rationale,
                                  "Current and target levels are declared learner judgements.",
                                  "control",
                                ),
                                technical: row.currentState,
                                actions: [
                                  row.targetState,
                                  "Review evidence and implement a scoped action.",
                                ],
                                sources: [{ title: s.name, url: s.url }],
                              });
                            }}
                          >
                            {row.controlId} · {row.title}
                          </button>
                        </td>
                        <td>
                          {row.current ?? "Unknown"} / {row.target}
                        </td>
                        <td>{row.owner || "Unassigned"}</td>
                        <td>{row.evidence || "No reference"}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            {!profile.length && (
              <p>
                Load the completed fictional demo or open the guided assessment
                to create profile findings.
              </p>
            )}
            <div className="xa-actions">
              <Link
                className="xa-button primary"
                to={`${base}/implement?standard=${s.id}`}
              >
                Generate implementation roadmap →
              </Link>
              <Link className="xa-button" to={`${base}/report`}>
                Open connected report centre →
              </Link>
              <button
                disabled={!profile.length}
                onClick={() =>
                  download(
                    "standards-assessment.csv",
                    csv(
                      profile.map((row) => ({
                        ...row,
                        method: studio.rubric.version,
                        scope: studio.scope.services,
                        organisation: scenario.name,
                        scenarioId: scenario.id,
                        generatedAt: new Date().toISOString(),
                        provenance: "Learner or authored fictional assessment",
                      })),
                    ),
                    "text/csv;charset=utf-8",
                  )
                }
              >
                Export assessment CSV
              </button>
              <button
                disabled={!gaps.length}
                onClick={() =>
                  download(
                    "standards-gaps.csv",
                    csv(
                      gaps.map((row) => ({
                        ...row,
                        organisation: scenario.name,
                        scenarioId: scenario.id,
                        generatedAt: new Date().toISOString(),
                        method: studio.rubric.version,
                        scope: studio.scope.services,
                        provenance:
                          "Fictional educational scenario; no conformity determination",
                      })),
                    ),
                    "text/csv;charset=utf-8",
                  )
                }
              >
                Export gap CSV
              </button>
              <button
                disabled={!profile.length}
                onClick={() =>
                  download(
                    "standards-assessment.json",
                    JSON.stringify(
                      {
                        framework: s.id,
                        edition: s.edition,
                        source: s.url,
                        organisation: scenario.name,
                        scenarioId: scenario.id,
                        scope: studio.scope,
                        method: studio.rubric,
                        findings: profile,
                        generatedAt: new Date().toISOString(),
                        disclaimer:
                          "Fictional educational assessment; no conformity or legal determination.",
                      },
                      null,
                      2,
                    ),
                    "application/json",
                  )
                }
              >
                Export assessment JSON
              </button>
            </div>
          </Panel>
        </>
      )}
      {editing && view === "results" && (
        <Panel title={`Edit ${editing.controlId}`}>
          <div className="xa-grid two">
            <Field label="Current educational level">
              <select
                value={editing.current ?? ""}
                onChange={(event) =>
                  setEditing({
                    ...editing,
                    current:
                      event.target.value === "" ? null : +event.target.value,
                  })
                }
              >
                <option value="">Unknown</option>
                {studio.rubric.labels.map((label, index) => (
                  <option key={index} value={index}>
                    {index} · {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Target educational level">
              <select
                value={editing.target}
                onChange={(event) =>
                  setEditing({ ...editing, target: +event.target.value })
                }
              >
                {studio.rubric.labels.map((label, index) => (
                  <option key={index} value={index}>
                    {index} · {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Finding owner">
              <input
                value={editing.owner}
                maxLength={240}
                onChange={(event) =>
                  setEditing({ ...editing, owner: event.target.value })
                }
              />
            </Field>
            <Field label="Evidence reference">
              <input
                value={editing.evidence}
                maxLength={4000}
                onChange={(event) =>
                  setEditing({ ...editing, evidence: event.target.value })
                }
              />
            </Field>
          </div>
          <Field label="Assessment rationale">
            <textarea
              value={editing.rationale}
              maxLength={4000}
              onChange={(event) =>
                setEditing({ ...editing, rationale: event.target.value })
              }
            />
          </Field>
          <button
            onClick={() => {
              const errors = findingErrors(editing);
              if (errors.length) {
                setMessage(errors.join(" "));
                return;
              }
              setStudio((previous) => ({
                ...previous,
                findings: recordFinding(
                  previous.findings,
                  editing,
                  previous.scope,
                ),
              }));
              setEditing(null);
              setMessage("Profile finding updated in the connected project.");
            }}
          >
            Save profile finding
          </button>
          <button onClick={() => setEditing(null)}>Cancel edit</button>
        </Panel>
      )}
      {view === "relationships" && (
        <Panel
          title="Cross-framework relationship explorer"
          subtitle="Curated conceptual relationships; direct control equivalence is not asserted"
        >
          {relationships
            .filter((row) => row[0] === s.id || row[1] === s.id)
            .map(([from, to, title, text]) => (
              <button
                className="xe-relationship"
                key={title}
                onClick={() =>
                  explain({
                    ...metricInsight(
                      title,
                      text,
                      "Author interpretation comparing purposes and shared concepts.",
                      "The linked publisher sources define scope and obligations; this is not an official one-to-one crosswalk.",
                      "control",
                    ),
                    sources: [
                      {
                        title: from,
                        url:
                          standards.find((row) => row.id === from)?.url ??
                          s.url,
                      },
                      {
                        title: to,
                        url:
                          standards.find((row) => row.id === to)?.url ?? s.url,
                      },
                    ],
                  })
                }
              >
                <GitBranch size={20} />
                <span>
                  <strong>
                    {from} ↔ {to}
                  </strong>
                  <small>{title}</small>
                </span>
              </button>
            ))}
          <p>
            Shared concepts do not establish interchangeability or universal
            applicability. Review the source text and qualified legal or
            assurance advice where relevant.
          </p>
        </Panel>
      )}
    </div>
  );
}
