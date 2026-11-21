import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { GitBranch, ArrowRight } from "lucide-react";
import { base, Header, Field, Source, download } from "../components/shared";
import { useScenario } from "../app/context";
import { useWorkspace } from "../workspace/state";
import { standards, architectureFor, type Standard } from "./standards";
import {
  evidenceStates,
  newFinding,
  newTask,
  findingErrors,
  type Finding,
} from "./model";
import { recordFinding } from "./engines";
import { controls as officialControls } from "../workspace/frameworks";
import { metricInsight, useInsight } from "../workspace/insights";
import { Panel, Kpi, Bars, Donut, palette } from "../workspace/charts";
import { csv } from "../utils/engines";
import { relationships, type StandardNode } from "../data/standards";
import ArchitectureDiagram from "../features/standards/ArchitectureDiagram";
import AssessmentSummary from "./AssessmentSummary";
import AssessmentScope from "./AssessmentScope";
import GovernanceDashboard from "./GovernanceDashboard";
import DemoButton from "./DemoButton";
import { assessmentItems, type AssessmentItem } from "./assessmentCatalog";
import { isPriority } from "./priorities";
export default function StandardsAcademy({
  assessment = false,
}: {
  assessment?: boolean;
}) {
  const [params, setParams] = useSearchParams(),
    { studio, setStudio, demoId, provenance } = useWorkspace(),
    scenario = useScenario(),
    { explain, open, setOpen } = useInsight();
  const selected =
      params.get(assessment ? "standard" : "framework") ?? "nist-csf-2",
    s = standards.find((row) => row.id === selected) ?? standards[0],
    model = architectureFor(s.id);
  const primary = isPriority(s.id);
  const initialView =
    params.get("view") ??
    (assessment ? "overview" : demoId === s.id ? "results" : "architecture");
  const [controlQuery, setControlQuery] = useState("");
  const [controlGroup, setControlGroup] = useState("");
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState(""),
    [recordQuery, setRecordQuery] = useState(""),
    [groupId, setGroupId] = useState(""),
    [category, setCategory] = useState(""),
    [view, setView] = useState(initialView),
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
  const topics = assessmentItems(s.id);
  const controlGroups = [...new Set(topics.map((item) => item.group))];
  const filteredTopics = topics.filter(
    (item) =>
      (!controlGroup || item.group === controlGroup) &&
      `${item.id} ${item.title} ${item.explanation}`
        .toLowerCase()
        .includes(controlQuery.toLowerCase()),
  );
  const editItem = (item: AssessmentItem) => {
    setEditing(
      profile.find((row) => row.controlId === item.id) ??
        newFinding(item.id, item.title, item.group, s.id, s.edition),
    );
    setMessage("");
  };
  function addRemediation(finding: Finding) {
    if (finding.taskId) return;
    const task = {
      ...newTask(
        `finding:${finding.id}`,
        `Remediate ${finding.controlId}: ${finding.title}`.slice(0, 240),
      ),
      standard: s.id,
      subphase: "Assessment remediation",
      owner: finding.owner || scenario.owner,
      accountable: scenario.owner,
    };
    setStudio((previous) =>
      previous.findings.some((row) => row.id === finding.id && !row.taskId)
        ? {
            ...previous,
            tasks: [...previous.tasks, task],
            findings: previous.findings.map((row) =>
              row.id === finding.id ? { ...row, taskId: task.id } : row,
            ),
          }
        : previous,
    );
    setMessage(`Implementation action created for ${finding.controlId}.`);
  }
  const showRecords = (filter: string) => {
    setRecordQuery("");
    setStatus(filter);
    setView("results");
  };
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
  useEffect(() => {
    // Search links can change the framework without remounting this route.
    setEditing(null);
    setRecordQuery("");
    setView(initialView);
    if (model?.nodes[0]) {
      choose(model.nodes[0]);
      setOpen(open); // Refresh context without opening an unsolicited drawer.
    }
  }, [s.id, scenario.id]);
  useEffect(() => {
    if (editing)
      document
        .querySelector(".xa-finding-editor")
        ?.scrollIntoView({ block: "nearest" });
  }, [editing?.id]);
  const visible = profile.filter((row) => {
    if (
      !`${row.controlId} ${row.title} ${row.owner}`
        .toLowerCase()
        .includes(recordQuery.toLowerCase())
    )
      return false;
    if (status === "Assessed")
      return row.applicability === "Applicable" && row.current !== null;
    if (status === "At target")
      return (
        row.applicability === "Applicable" &&
        row.current !== null &&
        row.current >= row.target
      );
    if (status === "Partial")
      return (
        row.applicability === "Applicable" &&
        row.current !== null &&
        row.current > 0 &&
        row.current < row.target
      );
    if (status.startsWith("Category "))
      return (
        topics.find((item) => item.id === row.controlId)?.category ===
        status.slice(9)
      );
    if (status === "Gaps") return gaps.some((gap) => gap.id === row.id);
    if (status.startsWith("Gaps in "))
      return (
        row.group === status.slice(8) && gaps.some((gap) => gap.id === row.id)
      );
    if (status === "With evidence") return !!row.evidence;
    if (status === "Without evidence") return !row.evidence;
    if (status.startsWith("Level ")) return row.current === +status.slice(6);
    if (status.startsWith("Group ")) return row.group === status.slice(6);
    return true;
  });
  const metadata = (
    <details className="xa-panel xe-standard-metadata">
      <summary>
        <strong>{s.name}</strong> · {model?.kind ?? "Guidance"} · Source, scope
        & edition
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
  );
  const tabs = (
    <div className="xa-segment xa-assessment-views" aria-label="Standards view">
      {[
        ...(assessment
          ? [
              ["overview", "Functions & coverage"],
              ...(s.id === "nist-csf-2" ? [["governance", "Governance"]] : []),
              ["controls", "Controls"],
              ["results", "Findings"],
              ["gaps", "Gaps"],
              ["evidence", "Evidence"],
            ]
          : [
              ["architecture", "Architecture"],
              ["controls", "Controls"],
              ["results", "Assessment dashboard"],
              ["relationships", "Relationships"],
            ]),
      ].map(([id, label]) => (
        <button
          key={id}
          aria-pressed={
            view === id ||
            (view === "results" &&
              ((id === "gaps" && status === "Gaps") ||
                (id === "evidence" && status === "With evidence")))
          }
          onClick={() =>
            id === "gaps"
              ? showRecords("Gaps")
              : id === "evidence"
                ? showRecords("With evidence")
                : id === "results"
                  ? showRecords("All")
                  : setView(id)
          }
        >
          {label}
        </button>
      ))}
    </div>
  );
  return (
    <div className="xe-standards-workspace">
      {!assessment && (
        <Header
          eyebrow="Explore Standards · architecture, evidence & implementation"
          title="Explore Standards"
        >
          <p>
            Select a standard, understand its purpose and turn scoped assessment
            findings into an implementation roadmap.
          </p>
        </Header>
      )}
      <div
        className={`xe-standard-toolbar ${assessment ? "xa-assessment-toolbar" : ""}`}
      >
        {!assessment && (
          <Field label="Search standards">
            <input
              value={query}
              maxLength={240}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Privacy, resilience, NIST, ISO or regulation"
            />
          </Field>
        )}
        <Field label="Standard edition">
          <select
            value={s.id}
            onChange={(event) => {
              setParams({
                [assessment ? "standard" : "framework"]: event.target.value,
              });
              setQuery("");
              setRecordQuery("");
              setGroupId("");
              setEditing(null);
              setMessage("");
            }}
          >
            {standards
              .filter(
                (row) =>
                  ((!primary || isPriority(row.id)) &&
                    `${row.name} ${row.scope}`
                      .toLowerCase()
                      .includes(query.toLowerCase())) ||
                  row.id === s.id,
              )
              .map((row) => (
                <option key={row.id} value={row.id}>
                  {row.name} · {row.edition}
                </option>
              ))}
          </select>
        </Field>
        {!assessment && topics.length > 0 && <DemoButton id={s.id} />}
        {assessment && (
          <Link
            className="xa-button secondary"
            to={`${base}/standards?framework=${s.id}`}
          >
            Explore structure
          </Link>
        )}
        {!assessment && primary && (
          <Link to={`${base}/frameworks`}>More framework references</Link>
        )}
      </div>
      {!assessment && metadata}
      {message && (
        <p className="xe-standard-status" role="status">
          {message}
        </p>
      )}
      {view !== "overview" && tabs}
      {view === "overview" && (
        <AssessmentSummary
          standard={s}
          studio={studio}
          items={topics}
          findings={profile}
          onFilter={showRecords}
          tabs={tabs}
        />
      )}
      {view === "governance" && (
        <GovernanceDashboard
          studio={studio}
          items={topics}
          onFilter={showRecords}
        />
      )}
      {view === "controls" && (
        <Panel
          title={`${s.name} control register`}
          subtitle={`${filteredTopics.length} matching indexed items`}
        >
          <div className="xa-toolbar">
            <Field label="Search controls">
              <input
                type="search"
                value={controlQuery}
                onChange={(event) => {
                  setControlQuery(event.target.value);
                  setPage(0);
                }}
              />
            </Field>
            <Field label="Control area">
              <select
                value={controlGroup}
                onChange={(event) => {
                  setControlGroup(event.target.value);
                  setPage(0);
                }}
              >
                <option value="">All areas</option>
                {controlGroups.map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="xa-table-scroll">
            <table aria-label="Indexed controls">
              <thead>
                <tr>
                  <th>Control</th>
                  <th>Scope</th>
                  <th>Assessment</th>
                </tr>
              </thead>
              <tbody>
                {filteredTopics.slice(page * 20, page * 20 + 20).map((item) => {
                  const finding = profile.find(
                    (row) => row.controlId === item.id,
                  );
                  return (
                    <tr key={item.id}>
                      <td>
                        <button
                          className="xa-text-button"
                          onClick={() => editItem(item)}
                        >
                          {item.id} · {item.title}
                        </button>
                      </td>
                      <td>{item.group}</td>
                      <td>
                        {finding?.applicability === "Excluded"
                          ? "Excluded"
                          : finding?.current === null || !finding
                            ? "Unassessed"
                            : `${finding.current} / ${finding.target}`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="xa-actions">
            <button disabled={page === 0} onClick={() => setPage(page - 1)}>
              Previous page
            </button>
            <span>
              {page + 1} of {Math.max(1, Math.ceil(filteredTopics.length / 20))}
            </span>
            <button
              disabled={(page + 1) * 20 >= filteredTopics.length}
              onClick={() => setPage(page + 1)}
            >
              Next page
            </button>
          </div>
        </Panel>
      )}
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
              <Link
                className="xa-button primary"
                to={
                  primary
                    ? `${base}/assess?standard=${s.id}`
                    : `${base}${s.workspace}`
                }
              >
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
                  setRecordQuery("");
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
                  setRecordQuery("");
                  setStatus(`Gaps in ${label}`);
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
              <Field label="Search profile records">
                <input
                  type="search"
                  maxLength={240}
                  value={recordQuery}
                  onChange={(event) => setRecordQuery(event.target.value)}
                  placeholder="Outcome, topic or owner"
                />
              </Field>
              <Field label="Filter profile records">
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                >
                  {[
                    "All",
                    "Gaps",
                    "Assessed",
                    "At target",
                    "Partial",
                    ...(status.startsWith("Category ") ? [status] : []),
                    "With evidence",
                    "Without evidence",
                    ...studio.rubric.labels.map((_, index) => `Level ${index}`),
                    ...[...new Set(profile.map((row) => row.group))].map(
                      (group) => `Group ${group}`,
                    ),
                    ...[...new Set(profile.map((row) => row.group))].map(
                      (group) => `Gaps in ${group}`,
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
                    <th>Remediation</th>
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
                        <td>
                          {row.taskId ? (
                            <Link
                              to={`${base}/implement?standard=${s.id}&task=${row.taskId}`}
                            >
                              Open action
                            </Link>
                          ) : gaps.some((gap) => gap.id === row.id) ? (
                            <button onClick={() => addRemediation(row)}>
                              Create action
                            </button>
                          ) : (
                            "—"
                          )}
                        </td>
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
              <Link
                className="xa-button"
                to={`${base}/report?standard=${s.id}`}
              >
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
                        provenance: demoId
                          ? "Fictional completed demo"
                          : provenance,
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
                        provenance: demoId
                          ? "Fictional completed demo"
                          : provenance,
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
      {assessment && <AssessmentScope standard={s} />}
      {assessment && metadata}
      {assessment && (
        <div className="xa-actions xa-assess-actions">
          {s.id === "nist-csf-2" && (
            <Link to={`${base}/assess?mode=profile`}>Guided CSF profile</Link>
          )}
          <Link to={`${base}/implement?standard=${s.id}`}>
            Implementation plan
          </Link>
          <Link to={`${base}/risk-register`}>Risk register</Link>
          <Link to={`${base}/report?standard=${s.id}`}>Assessment report</Link>
        </div>
      )}
      {editing && (view === "results" || view === "controls") && (
        <Panel
          title={`Edit ${editing.controlId}`}
          className="xa-finding-editor"
        >
          <p>
            {topics.find((item) => item.id === editing.controlId)
              ?.explanation || editing.title}
          </p>
          <p className="xa-muted">
            {topics.find((item) => item.id === editing.controlId)?.evidence}
          </p>
          {message && <p role="status">{message}</p>}
          <Field label="Applicability">
            <select
              value={editing.applicability}
              onChange={(event) =>
                setEditing({
                  ...editing,
                  applicability: event.target.value as Finding["applicability"],
                })
              }
            >
              <option>Applicable</option>
              <option>Excluded</option>
            </select>
          </Field>
          {editing.applicability === "Excluded" && (
            <Field label="Exclusion rationale">
              <textarea
                value={editing.exclusion}
                onChange={(event) =>
                  setEditing({ ...editing, exclusion: event.target.value })
                }
              />
            </Field>
          )}
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
          <div className="xa-grid two">
            <Field label="Evidence verification">
              <select
                value={editing.verification}
                onChange={(event) =>
                  setEditing({
                    ...editing,
                    verification: event.target.value as Finding["verification"],
                  })
                }
              >
                {evidenceStates.map((state) => (
                  <option key={state}>{state}</option>
                ))}
              </select>
            </Field>
            <Field label="Evidence reviewer">
              <input
                value={editing.reviewer}
                onChange={(event) =>
                  setEditing({ ...editing, reviewer: event.target.value })
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
