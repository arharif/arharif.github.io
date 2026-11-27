import { Link } from "react-router-dom";
import { newTask } from "../studio/model";
import type { ReactNode } from "react";
import { useMemo, useState, useSyncExternalStore } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCheck,
  ClipboardCheck,
  FileText,
  ListFilter,
  PanelRightClose,
  PanelRightOpen,
  ShieldCheck,
} from "lucide-react";
import { useProject } from "./context";
import { baselineMembership, cases, catalogue, names } from "./catalogue";
import { editions, frameworkMetadata } from "./editions";
import { NistDetails } from "./NistDetails";
import { FrameworkScope } from "./FrameworkScope";
import { aiAnnexes, euStructure } from "../data/euStructure";
import articles from "../data/eu-article-index.json";
import { pciSections } from "../data/pci401";
import { evidenceStates, stats, unassessed, type Assessment } from "./project";
import { Dialog, Empty, Panel, Radar, dot } from "./ui";

const controlViewport = "(max-width: 640px)";
function subscribeToControlViewport(listener: () => void) {
  const media = window.matchMedia(controlViewport);
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}
const compactControlEditor = () => window.matchMedia(controlViewport).matches;

export function ControlTable({
  ids,
  title,
  close,
}: {
  ids: string[];
  title: string;
  close: () => void;
}) {
  const { project, change } = useProject(),
    { items, source } = catalogue(project.framework);
  const compact = useSyncExternalStore(subscribeToControlViewport, compactControlEditor);
  const [query, setQuery] = useState(""),
    [open, setOpen] = useState(ids[0] ?? ""),
    [page, setPage] = useState(0);
  const allowed = new Set(ids),
    rows = items.filter(
      (c) =>
        allowed.has(c.id) &&
        (c.id + " " + c.title + " " + c.category)
          .toLowerCase()
          .includes(query.toLowerCase()),
    );
  const perPage = 24;
  const lastPage = Math.max(0, Math.ceil(rows.length / perPage) - 1);
  const pageNumber = Math.min(page, lastPage);
  const visibleRows = rows.slice(pageNumber * perPage, (pageNumber + 1) * perPage);
  const control = visibleRows.find((c) => c.id === open) ?? visibleRows[0];
  function patch(id: string, changes: Partial<Assessment>) {
    change((p) => ({
      ...p,
      assessments: {
        ...p.assessments,
        [id]: { ...(p.assessments[id] ?? unassessed), ...changes },
      },
    }));
  }
  const selected = control && (project.assessments[control.id] ?? unassessed);
  function fields(id: string) {
    const value = project.assessments[id] ?? unassessed;
    const excluded = value.applicability === "Excluded";
    return [
      {
        label: "Applicability",
        input: <select aria-label={"Applicability " + id} value={value.applicability}
          onChange={(event) => patch(id, { applicability: event.target.value as Assessment["applicability"] })}>
          <option>Applicable</option><option>Excluded</option>
        </select>,
      },
      ...(["current", "target"] as const).map((key) => ({
        label: key === "current" ? "Current" : "Target",
        input: <select disabled={excluded} aria-label={key + " " + id} value={value[key] ?? ""}
          onChange={(event) => patch(id, { [key]: event.target.value === "" ? null : Number(event.target.value) })}>
          {key === "current" && <option value="">Unrated</option>}
          {[0, 1, 2, 3, 4].map((level) => <option key={level}>{level}</option>)}
        </select>,
      })),
      {
        label: "Evidence",
        input: <select disabled={excluded} aria-label={"Evidence status " + id} value={value.evidence}
          onChange={(event) => patch(id, { evidence: event.target.value as Assessment["evidence"] })}>
          {evidenceStates.map((status) => <option key={status}>{status}</option>)}
        </select>,
      },
    ];
  }
  return (
    <Dialog title={title} close={close} wide>
      <input
        className="xc-search"
        aria-label="Find control"
        placeholder="Find a control or category…"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setPage(0); }}
      />
      {compact ? (
        <section className="xc-mobile-assessment">
          {control && <>
            <label>Choose control
              <select value={control.id} onChange={(event) => setOpen(event.target.value)}>
                {visibleRows.map((row) => <option key={row.id} value={row.id}>{row.id} · {row.title}</option>)}
              </select>
            </label>
            <div>
              {fields(control.id).map(({ label, input }) => <label key={label}>{label}{input}</label>)}
            </div>
          </>}
        </section>
      ) : (
        <div className="xc-scroll-table">
          <table>
            <thead><tr>
              <th>Control</th><th>Applicability</th><th>Current</th><th>Target</th><th>Evidence</th>
            </tr></thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr key={row.id} className={control?.id === row.id ? "selected" : ""}>
                  <td><button className="xc-record" onClick={() => setOpen(row.id)}><b>{row.id}</b>{row.title}</button></td>
                  {fields(row.id).map(({label, input}) => <td key={label}>{input}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {lastPage > 0 && <nav className="xc-toolbar" aria-label="Assessment results pages">
        <button disabled={pageNumber === 0} onClick={() => setPage(pageNumber - 1)}>Previous</button>
        <span>Page {pageNumber + 1} of {lastPage + 1}</span>
        <button disabled={pageNumber === lastPage} onClick={() => setPage(pageNumber + 1)}>Next</button>
      </nav>}
      {!rows.length && <Empty>No controls match this selection.</Empty>}
      {control && selected && (
        <section className="xc-control-detail">
          <small>{control.category}</small>
          <h3>
            {control.id} · {control.title}
          </h3>
          <p>{control.explanation}</p>
          <p><strong>Assessment question</strong> What evidence shows your project meets {control.id} for the scoped activity?</p>
          {project.framework === "nist-800-53" && control.locator && <NistOnOpen key={control.id} locator={control.locator} />}
          <details>
            <summary>Implementation example and evidence</summary>
            <p>{control.example}</p>
            <p>{control.evidence}</p>
            <a href={source.source} target="_blank" rel="noreferrer">
              Publisher source ↗
            </a>
          </details>
          <div className="xc-fields">
            {selected.applicability === "Excluded" && (
              <label>Exclusion rationale
                <textarea maxLength={3000} value={selected.exclusion}
                  onChange={(event) => patch(control.id, { exclusion: event.target.value })} />
              </label>
            )}
            {project.framework === "nist-800-53" && <>
              <label>Implementation responsibility
                <select value={selected.selection} onChange={(event) => patch(control.id, { selection: event.target.value as Assessment["selection"] })}>
                  <option>System-specific</option><option>Inherited</option><option>Shared</option>
                </select>
              </label>
              <label>Tailoring and parameter decisions
                <textarea maxLength={3000} value={selected.tailoring} onChange={(event) => patch(control.id, { tailoring: event.target.value })} />
              </label>
            </>}
            {control.id.startsWith("A.") && project.framework === "iso-27001" && <>
              <label>Statement of Applicability decision
                <select value={selected.soa} onChange={(event) => patch(control.id, { soa: event.target.value as Assessment["soa"] })}>
                  <option>Pending</option><option>Included</option><option>Excluded</option>
                </select>
              </label>
              <label>Risk treatment decision
                <select value={selected.treatment} onChange={(event) => patch(control.id, { treatment: event.target.value as Assessment["treatment"] })}>
                  <option>Undecided</option><option>Modify</option><option>Avoid</option><option>Share</option><option>Retain</option>
                </select>
              </label>
              <label>SoA justification and risk reference
                <textarea maxLength={3000} value={selected.tailoring} onChange={(event) => patch(control.id, { tailoring: event.target.value })} />
              </label>
            </>}
            <label>
              Control owner
              <input
                maxLength={240}
                value={selected.owner}
                onChange={(e) => patch(control.id, { owner: e.target.value })}
              />
            </label>
            <label>
              Evidence reference
              <input
                maxLength={3000}
                value={selected.note}
                onChange={(e) => patch(control.id, { note: e.target.value })}
              />
            </label>
            {(["unit", "location", "asset"] as const).map((k) => (
              <label key={k}>
                {k === "unit"
                  ? "Business unit"
                  : k === "asset"
                    ? "Asset"
                    : "Location"}
                <input
                  maxLength={240}
                  value={selected[k]}
                  onChange={(e) => patch(control.id, { [k]: e.target.value })}
                />
              </label>
            ))}
            <label>
              Finding
              <textarea
                maxLength={3000}
                value={selected.finding}
                onChange={(e) => patch(control.id, { finding: e.target.value })}
              />
            </label>
          </div>
          {selected.applicability === "Applicable" && selected.current !== null && selected.current < selected.target && (
            <div className="xc-toolbar">
              {project.tasks.some((t) => t.sourceIds.includes(control.id)) ? (
                <Link
                  to={
                    "/x1-academic/implement-plan?standard=" + project.framework
                  }
                >
                  Open remediation plan ↗
                </Link>
              ) : (
                <button
                  onClick={() => {
                    if (project.tasks.length >= 500) return;
                    const t = newTask(
                      control.id,
                      "Close " + control.id + " gap",
                      "IMPLEMENT",
                    );
                    change((p) => ({
                      ...p,
                      tasks: [
                        ...p.tasks,
                        {
                          ...t,
                          owner: selected.owner || "Control owner",
                          accountable: selected.owner || "Control owner",
                        },
                      ],
                    }));
                  }}
                >
                  Create remediation task
                </button>
              )}
            </div>
          )}
        </section>
      )}
    </Dialog>
  );
}
type Selection = { title: string; ids: string[] };
export function Profile() {
  const { project } = useProject(),
    s = useMemo(() => stats(project), [project]),
    { source } = catalogue(project.framework);
  const [selection, pick] = useState<Selection | null>(null),
    [guide, setGuide] = useState(true);
  const open = (title: string, rows: { id: string }[]) =>
    pick({ title, ids: rows.map((c) => c.id) });
  const cards = [
    {
      title: "Controls assessed",
      n: s.scored.length,
      rows: s.scored,
      icon: ClipboardCheck,
      colour: "#7394f7",
    },
    {
      title: "At target",
      n: s.met,
      rows: s.scored.filter((c) => c.current! >= c.target),
      icon: CheckCheck,
      colour: "#36b992",
    },
    {
      title: "Below target",
      n: s.gaps.length,
      rows: s.gaps,
      icon: ListFilter,
      colour: "#dfa23a",
    },
    {
      title: "Evidence reviewed",
      n: s.verified,
      rows: s.reviewed,
      icon: ShieldCheck,
      colour: "#bc83d5",
    },
  ];
  const axes = s.profiles.map((g) => ({
    ...g,
    label: g.id.startsWith("pci") ? g.title.split(" ")[0] : g.id,
  }));
  return (
    <div className={"xc-profile " + (guide ? "" : "guide-off")}>
      <div>
        <section className="xc-profile-banner">
          <div>
            <small>
              <ShieldCheck size={15} /> Framework assessment
            </small>
            <h2>{names[project.framework]}</h2>
            <p>
              {project.name} <span> / </span> {s.rows.length} controls
            </p>
            {project.demo && <p>{cases[project.framework].scope}. Assessment values and evidence references are fictional.</p>}
          </div>
          <div className="xc-maturity">
            <b>{s.scored.length ? s.current.toFixed(1) : "—"}</b>
            <small>X1 implementation / 4</small>
          </div>
        </section>
        <FrameworkScope />
        <p>{s.scored.length} rated of {s.applicable.length} applicable items · {s.rows.length - s.applicable.length} excluded</p>
        <nav className="xc-profile-actions" aria-label="Assessment outputs">
          <Link to={`/x1-academic/assess-simulate?standard=${project.framework}&view=matrix`}>Open risk heatmap</Link>
          <Link to={`/x1-academic/assess-simulate?standard=${project.framework}&view=executive`}>Executive dashboard</Link>
          <Link to={`/x1-academic/implement-plan?standard=${project.framework}`}>Remediation schedule</Link>
        </nav>
        <div className="xc-kpis">
          {cards.map((c) => (
            <button key={c.title} onClick={() => open(c.title, c.rows)}>
              <c.icon style={{ color: c.colour }} />
              <b>{c.n}</b>
              <small>{c.title}</small>
              <i style={{ background: c.colour }} />
            </button>
          ))}
        </div>
        <div className="xc-sectionhead">
          <h3>
            {project.framework === "nist-csf-2"
              ? "Functions"
              : project.framework === "iso-27001"
                ? "ISMS clauses and Annex A"
                : project.framework === "nist-800-53"
                  ? "Control families"
                  : project.framework === "pci-dss" ? "Requirements" : "Chapters"}
          </h3>
          <button onClick={() => open("Control assessment", s.rows)}>
            All controls <ArrowRight />
          </button>
          <button
            className="xc-icon"
            aria-label="Toggle assessment insights"
            aria-expanded={guide}
            onClick={() => setGuide(!guide)}
          >
            {guide ? <PanelRightClose /> : <PanelRightOpen />}
          </button>
        </div>
        <div className="xc-groupgrid">
          {s.profiles.map((g, i) => (
            <button
              key={g.id}
              onClick={() =>
                open(
                  g.title,
                  s.rows.filter((c) => c.group === g.id),
                )
              }
            >
              <div>
                <span className="xc-monogram" style={{ background: g.colour }}>
                  {project.framework === "nist-csf-2" || project.framework === "nist-800-53" ? g.id : i + 1}
                </span>
                <strong>{g.title}</strong>
                <b>{g.assessed ? g.current.toFixed(1) : "—"}</b>
              </div>
              <small>{g.description}</small>
              <div className="xc-meter">
                <i
                  style={{ width: g.current * 25 + "%", background: g.colour }}
                />
              </div>
              <small>
                {g.assessed} of {g.total} assessed
              </small>
            </button>
          ))}
        </div>
      </div>
      {guide && (
        <aside className="xc-insight">
          <h3>
            <BookOpen /> Assessment insights
          </h3>
          <section>
            <small>Profile analysis</small>
            <p>
              {s.scored.length
                ? "The current profile averages " +
                  s.current.toFixed(2) +
                  " out of 4. " +
                  s.gaps.length +
                  " assessed controls fall below their target."
                : "Rate a control or try the fictional scenario to build a current profile."}
            </p>
            <button onClick={() => open("Control gaps", s.gaps)}>
              Inspect gaps <ArrowRight />
            </button>
          </section>
          <Panel title="Implementation by group">
            <Radar
              axes={axes}
              onPick={(id) =>
                open(
                  "Group controls",
                  s.applicable.filter((c) => c.group === id),
                )
              }
            />
          </Panel>
          <details>
            <summary>Scoring and source</summary>
            <p>
              The current index averages user-entered ratings for rated applicable items. The target index includes applicable items. X1 uses 0 absent, 1 planned, 2 partial, 3 operating and 4 consistently operating. Evidence coverage, risk and legal determinations are tracked separately.
            </p>
            <a href={source.source}>Publisher guidance ↗</a>
          </details>
        </aside>
      )}
      {selection && <ControlTable {...selection} close={() => pick(null)} />}
    </div>
  );
}
export function Governance() {
  const { project } = useProject(),
    s = stats(project);
  const [dimension, setDimension] = useState<"unit" | "location" | "asset">(
      "unit",
    ),
    [scope, setScope] = useState("all"),
    [selection, pick] = useState<Selection | null>(null);
  const filtered = s.applicable.filter(
    (c) => scope === "all" || (c[dimension] || "Unassigned") === scope,
  );
  function axis(id: string, label: string, rows: typeof filtered) {
    const rated = rows.filter((c) => c.current !== null);
    return {
      id,
      label,
      current: rated.reduce((n, c) => n + c.current!, 0) / (rated.length || 1),
      target: rows.reduce((n, c) => n + c.target, 0) / (rows.length || 1),
      rows,
    };
  }
  const categories = [...new Set(s.rows.map((c) => c.category))];
  const byCategory = categories.map((cat, i) =>
    axis(
      cat,
      project.framework === "nist-csf-2" ? cat.split(" ")[0] : String(i + 1),
      filtered.filter((c) => c.category === cat),
    ),
  );
  const byGroup = s.profiles.map((g) =>
    axis(
      g.id,
      project.framework === "nist-csf-2" ? g.title : g.id,
      filtered.filter((c) => c.group === g.id),
    ),
  );
  const [activeGroup, setActiveGroup] = useState(s.profiles[0].id);
  const charts = [
    { name: "Control families", axes: byCategory },
    {
      name:
        project.framework === "nist-csf-2"
          ? "CSF functions"
          : "Framework groups",
      axes: byGroup,
    },
    {
      name: "Category detail",
      axes: byCategory.map((a) =>
        a.rows.some((r) => r.group === activeGroup)
          ? a
          : { ...a, current: 0, target: 0 },
      ),
    },
  ];
  return (
    <div className="xc-govern">
      <h2>Governance dashboards</h2>
      <div className="xc-segments">
        {(["unit", "location", "asset"] as const).map((v, i) => (
          <button
            key={v}
            aria-pressed={v === dimension}
            onClick={() => {
              setDimension(v);
              setScope("all");
            }}
          >
            {["Business unit", "Location", "Assets"][i]}
          </button>
        ))}
        <select
          aria-label="Governance scope"
          value={scope}
          onChange={(e) => setScope(e.target.value)}
        >
          <option value="all">All records</option>
          {[...new Set(s.applicable.map((c) => c[dimension] || "Unassigned"))].map(
            (v) => (
              <option key={v}>{v}</option>
            ),
          )}
        </select>
      </div>
      <div className="xc-radargrid">
        {charts.map((c, i) => (
          <Panel
            key={c.name}
            title={c.name}
            action={() =>
              pick({ title: c.name, ids: filtered.map((r) => r.id) })
            }
          >
            <Radar
              axes={c.axes}
              polar={i === 2}
              tooltip
              onPick={(id) => {
                const a = c.axes.find((a) => a.id === id)!;
                pick({ title: a.label, ids: a.rows.map((r) => r.id) });
              }}
            />
            {i === 2 && (
              <select
                aria-label="Category detail group"
                value={activeGroup}
                onChange={(e) => setActiveGroup(e.target.value)}
              >
                {s.profiles.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </select>
            )}
          </Panel>
        ))}
      </div>
      <div className="xc-legend">
        {dot("var(--chart-target)")} Target score {dot("var(--chart-current)")} Current score
      </div>
      {selection && <ControlTable {...selection} close={() => pick(null)} />}
    </div>
  );
}

function RequirementDisclosure({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <details onToggle={(event) => setOpen(event.currentTarget.open)}>
    <summary>{title}</summary>
    {open && children}
  </details>;
}

function NistOnOpen({ locator }: { locator: string }) {
  // A closed native disclosure does not need to fetch the full OSCAL asset.
  const [open, setOpen] = useState(false);
  return <details onToggle={(event) => setOpen(event.currentTarget.open)}>
    <summary>NIST text and assessment procedures</summary>
    {open && <NistDetails locator={locator} />}
  </details>;
}

const resources = [
  ["Security Mindmap", "/security-mindmap", "Trace relevant roles, safeguards and dependencies."],
  ["Compliance Frameworks", "/compliance-frameworks", "Compare related regimes and assurance approaches."],
  ["Academic Library", "/academic-library", "Find further readings and publisher materials."],
];

export function Learn() {
  const { project } = useProject();
  const { groups, items, source } = catalogue(project.framework);
  const edition = editions[project.framework];
  const metadata = frameworkMetadata[project.framework];
  const [groupId, setGroup] = useState(groups[0].id);
  const [search, setSearch] = useState("");
  const group = groups.find((entry) => entry.id === groupId) ?? groups[0];
  const law = project.framework === "dora" || project.framework === "gdpr" || project.framework === "eu-ai-act" ? project.framework : undefined;
  const chapter = law ? (euStructure[law] as readonly {id: string; sections?: ReadonlyArray<readonly [string, number, number]>}[]).find(entry => entry.id === group.id) : undefined;
  const legalRows = law ? [...articles[law].articles, ...(law === "eu-ai-act" ? articles[law].inserted : [])]
    .filter(([, section]) => section === group.id).sort(([a], [b]) => a.localeCompare(b, "en", { numeric: true })) : [];
  const term = search.trim().toLowerCase();
  const groupItems = items.filter((item) => item.group === group.id);
  const matches = (item: typeof items[number]) => (item.id + " " + item.title).toLowerCase().includes(term);
  const byId = new Map(groupItems.map((item) => [item.id, item]));
  const visible = new Set<string>();
  if (term) {
    for (const item of groupItems) {
      const lineage = [item];
      let parent = item.parent ? byId.get(item.parent) : undefined;
      while (parent) {
        lineage.push(parent);
        parent = parent.parent ? byId.get(parent.parent) : undefined;
      }
      if (lineage.some(matches)) for (const entry of lineage) visible.add(entry.id);
    }
  }
  const relevantItems = term ? groupItems.filter((item) => visible.has(item.id)) : groupItems;
  const showItem = (item: typeof items[number]) => (
    <RequirementDisclosure key={item.id} title={`${item.id} · ${item.title}${item.withdrawn ? " · Withdrawn" : ""}`}>
      {project.framework === "nist-800-53" && item.locator
        ? <>
          {item.parent && <p>Enhancement of {item.parent}.</p>}
          <p>SP 800-53B starting baselines {baselineMembership(item.id).join(", ") || "None listed"}.</p>
          <NistOnOpen locator={item.locator} />
        </>
        : <p>{item.explanation}</p>}
      {!item.withdrawn && <dl>
        <div><dt>Implementation example</dt><dd>{item.example}</dd></div>
        <div><dt>Evidence to examine</dt><dd>{item.evidence}</dd></div>
      </dl>}
      {relevantItems.some((child) => child.parent === item.id) && <div className="xc-enhancements">
        <h4>{project.framework === "pci-dss" ? "Subrequirements" : "Control enhancements"}</h4>
        {relevantItems.filter((child) => child.parent === item.id).map(showItem)}
      </div>}
    </RequirementDisclosure>
  );
  return (
    <div className="xc-learn">
      <Panel title={edition.name}>
        <p className="xc-learn-edition">{edition.edition} · {edition.category}</p>
        <p>{source.applicability}</p>
        <p>{edition.application}</p>
        <h3>{metadata.focus}</h3>
        <p>{metadata.scope}.</p>
        <h3>Practical example</h3>
        <p>{edition.scenario}</p>
      </Panel>
      <Panel title="Framework architecture">
        <p>Select an area to explore its requirements, evidence and implementation examples.</p>
        <div className="xc-learn-groups" role="group" aria-label="Framework architecture areas">
          {groups.map((entry) => (
            <button aria-pressed={entry.id === group.id} key={entry.id} onClick={() => { setGroup(entry.id); setSearch(""); }}>
              {entry.title}
            </button>
          ))}
        </div>
        <section className="xc-learn-detail" key={group.id} aria-labelledby="xc-learn-group">
          <h3 id="xc-learn-group">{group.title}</h3>
          <p>{group.description}</p>
          {chapter?.sections && <ul>{chapter.sections.map(([title, first, last]) => <li key={first}>{title} · {first === last ? `Article ${first}` : `Articles ${first}–${last}`}</li>)}</ul>}
          {law && <details><summary>Official article index ({legalRows.length})</summary><ul>
            {legalRows.map(([id, , title]) => <li key={id}><a href={articles[law].source + (law === "eu-ai-act" ? "" : "#art_" + id)} target="_blank" rel="noreferrer">Article {id} · {title}</a></li>)}
          </ul></details>}
          {project.framework === "eu-ai-act" && ["III", "V", "XIII"].includes(group.id) && <details>
            <summary>Annexes I–XIII</summary><ul>{aiAnnexes.map(([id, title]) => <li key={id}>Annex {id} · {title}</li>)}</ul>
          </details>}
          {project.framework === "pci-dss" && <details>
            <summary>Requirement objectives and testing</summary>
            <ul>{pciSections[Number(group.id.slice(4)) - 1][1].map((title, index) => <li key={title}>{group.id.slice(4)}.{index + 1} · {title}</li>)}</ul>
            <p>Use the PCI SSC v4.0.1 testing procedures for each applicable requirement, verify the scoped population and retain examine, observe and interview records as directed. Review Appendices A1, A2 and A3 separately if they apply.</p>
          </details>}
          {project.framework === "nist-csf-2" && <p>Outcomes are grouped by category. The four Tiers describe the practices of the organisation. Record Current and Target Profiles and Tiers in Assess &amp; Simulate.</p>}
          {groupItems.length > 12 && <input className="xc-search" type="search" aria-label="Search within this framework area" placeholder="Search identifiers and titles" value={search} onChange={event => setSearch(event.target.value)} />}
          {project.framework === "nist-csf-2"
            ? [...new Set(relevantItems.map((item) => item.category))].map((category) => <details key={category}><summary>{category}</summary>{relevantItems.filter((item) => item.category === category).map(showItem)}</details>)
            : relevantItems.filter((item) => !item.parent).map(showItem)}
          {term && !relevantItems.length && <p role="status">No identifiers or titles match.</p>}
        </section>
      </Panel>
      <Panel title="Official references">
        <p>Publisher references verified <time dateTime={metadata.verified}>{metadata.verified}</time>. {metadata.reuse}</p>
        {project.framework === "nist-800-53" && <p><Link to="/x1-academic/standards/800-53">Open the advanced NIST implementation workspace</Link></p>}
        <ul>{edition.sources.map(([label, url]) => <li key={url}><a href={url} target="_blank" rel="noreferrer">{label}</a></li>)}</ul>
      </Panel>
      <Panel title="Related learning resources">
        <ul>{resources.map(([title, path, text]) => <li key={path}><Link to={path}>{title}</Link> · {text}</li>)}</ul>
      </Panel>
    </div>
  );
}
