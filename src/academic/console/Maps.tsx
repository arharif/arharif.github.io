import { useState } from "react";
import {
  Database,
  Layers,
  Minus,
  Plus,
  Search,
  Waypoints,
  ZoomIn,
} from "lucide-react";
import { useProject } from "./context";
import { catalogue, names } from "./catalogue";
import { flowStages, type Flow } from "./project";
import { ControlTable } from "./Controls";
import { Dialog, Empty } from "./ui";

type Node = {
  id: string;
  label: string;
  x: number;
  y: number;
  parent?: string;
  kind: "Framework" | "Group" | "Category" | "Control" | "Owner" | "Evidence";
  group?: string;
};
function keyActivate(e: React.KeyboardEvent, action: () => void) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    action();
  }
}
export function Knowledge() {
  const { project } = useProject(),
    { groups, items } = catalogue(project.framework);
  const [selected, select] = useState(project.framework as string),
    [query, search] = useState(""),
    [scale, zoom] = useState(1),
    [edit, setEdit] = useState(false);
  const root: Node = {
    id: project.framework,
    label: names[project.framework],
    x: 290,
    y: 195,
    kind: "Framework",
  };
  const nodes: Node[] = [root];
  groups.forEach((g, j) => {
    const angle = (j * 2 * Math.PI) / groups.length - 0.9,
      isPCI = project.framework === "pci-dss";
    const gx = isPCI ? 90 + (j % 3) * 195 : 290 + Math.cos(angle) * 175,
      gy = isPCI ? 85 + Math.floor(j / 3) * 195 : 195 + Math.sin(angle) * 110;
    const members = items.filter((c) => c.group === g.id),
      cats = [...new Set(members.map((c) => c.category))];
    nodes.push({
      id: g.id,
      label: g.title,
      x: gx,
      y: gy,
      kind: "Group",
      group: g.id,
      parent: root.id,
    });
    cats.forEach((cat, k) => {
      const a = angle + (k - (cats.length - 1) / 2) * 1.05,
        cx = gx + Math.cos(a) * 39,
        cy = gy + Math.sin(a) * 34;
      const catId = g.id + "/" + cat;
      nodes.push({
        id: catId,
        label: cat.split(" · ")[0],
        x: cx,
        y: cy,
        parent: g.id,
        kind: "Category",
        group: g.id,
      });
      const children = members.filter((c) => c.category === cat);
      children.forEach((c, i) => {
        const b = a + (i - (children.length - 1) / 2) * 0.4,
          r = 18 + (i % 3) * 7;
        nodes.push({
          id: c.id,
          label: c.id,
          x: cx + Math.cos(b) * r,
          y: cy + Math.sin(b) * r,
          parent: catId,
          kind: "Control",
          group: g.id,
        });
      });
    });
  });
  // Recorded owners and evidence states are shared across framework branches.
  const links: { from: string; to: string }[] = [];
  for (const relation of ["owner", "evidence"] as const) {
    const labels = [
      ...new Set(
        Object.values(project.assessments)
          .map((a) => a[relation])
          .filter(Boolean),
      ),
    ];
    labels.forEach((label, i) => {
      const id = relation + "/" + label,
        angle =
          (i / labels.length) * Math.PI * 2 +
          (relation === "owner" ? 0.48 : 1.15),
        radius = relation === "owner" ? 72 : 103;
      nodes.push({
        id,
        label,
        x: root.x + Math.cos(angle) * radius,
        y: root.y + Math.sin(angle) * radius * 0.75,
        kind: relation === "owner" ? "Owner" : "Evidence",
      });
      for (const c of items)
        if (project.assessments[c.id]?.[relation] === label)
          links.push({ from: c.id, to: id });
    });
  }
  const byId = new Map(nodes.map((n) => [n.id, n])),
    active = byId.get(selected) ?? root;
  const control = items.find((c) => c.id === active.id),
    group = groups.find((g) => g.id === active.group);
  const relevant = items.filter(
    (c) =>
      links.some((l) => l.to === active.id && l.from === c.id) ||
      active.kind === "Framework" ||
      c.id === active.id ||
      (active.kind === "Group" && c.group === active.id) ||
      (active.kind === "Category" && c.group + "/" + c.category === active.id),
  );
  const found = nodes.filter((n) =>
    (n.label + " " + n.id).toLowerCase().includes(query.toLowerCase()),
  );
  const branch = active.kind === "Group" ? active.id : active.group;
  const largeGraph = items.length > 160;
  const detailNodes = largeGraph ? nodes.filter((n) => n.kind === "Control" && n.group === branch) : [];
  const visible = largeGraph
    ? nodes.filter((n) => n.kind !== "Control" && (n.kind !== "Category" || n.group === branch))
      .concat(detailNodes.length > 24 ? [...detailNodes.slice(0, 23), ...detailNodes.filter(n => n.id === active.id && !detailNodes.slice(0, 23).includes(n))] : detailNodes)
    : nodes;
  const visibleIds = new Set(visible.map((n) => n.id));
  return (
    <div className="xc-knowledge">
      <aside>
        <h3>
          <Layers /> Explorer
        </h3>
        <label className="xc-searchlabel">
          <Search />
          <input
            aria-label="Search knowledge graph"
            value={query}
            onChange={(e) => search(e.target.value)}
            placeholder="Search nodes"
          />
        </label>
        <small>{query ? "Search results" : "Framework groups"}</small>
        {(query ? found.slice(0, 50) : nodes.filter((n) => n.kind === "Group")).map((n) => (
          <button
            key={n.id}
            aria-pressed={active.id === n.id}
            onClick={() => select(n.id)}
          >
            <i className="xc-dot" />
            {n.label}
          </button>
        ))}
      </aside>
      <section className="xc-graphcanvas">
        <header>
          <Waypoints /> Knowledge graph <span>{nodes.length} nodes</span>
        </header>
        <svg
          viewBox={[
            (580 - 580 / scale) / 2,
            (390 - 390 / scale) / 2,
            580 / scale,
            390 / scale,
          ].join(" ")}
          role="group"
          aria-label="Framework relationships"
        >
          {links.filter((link) => visibleIds.has(link.from) && visibleIds.has(link.to)).map((l) => {
            const a = byId.get(l.from)!,
              b = byId.get(l.to)!;
            return (
              <line
                key={l.from + l.to}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="#88d9eb"
                strokeWidth=".75"
                opacity={active.id === a.id || active.id === b.id ? 0.88 : 0.22}
              />
            );
          })}
          {visible
            .filter((n) => n.parent && visibleIds.has(n.parent))
            .map((n) => {
              const p = byId.get(n.parent!)!;
              return (
                <line
                  key={n.id}
                  x1={n.x}
                  y1={n.y}
                  x2={p.x}
                  y2={p.y}
                  stroke={
                    active.id === n.id || active.id === p.id
                      ? "#c5feff"
                      : "#75cbd7"
                  }
                  strokeOpacity={n.kind === "Control" ? 0.53 : 0.78}
                  strokeWidth={n.kind === "Group" ? 1.3 : 0.8}
                />
              );
            })}
          {visible.map((n) => {
            const primary =
                n.kind === "Framework" ||
                n.kind === "Group" ||
                n.kind === "Owner" ||
                n.kind === "Evidence",
              r =
                n.kind === "Framework"
                  ? 9
                  : primary
                    ? 6
                    : n.kind === "Category"
                      ? 3.7
                      : 2.3;
            return (
              <g
                key={n.id}
                role="button"
                aria-label={n.kind + " " + n.label}
                tabIndex={0}
                onClick={() => select(n.id)}
                onKeyDown={(e) => keyActivate(e, () => select(n.id))}
                className="xc-graphnode"
                opacity={query && !found.includes(n) ? 0.22 : 1}
              >
                <title>{n.label}</title>
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={r + 5}
                  fill="#64cfec"
                  opacity={primary ? 0.16 : 0.07}
                />
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={r}
                  fill={
                    active.id === n.id
                      ? "#fff4af"
                      : primary
                        ? "#bbf6fd"
                        : "#86cddd"
                  }
                />
                {(primary ||
                  n.kind === "Category" ||
                  active.id === n.id ||
                  (n.kind === "Control" && nodes.indexOf(n) % 3 === 0)) && (
                  <text
                    x={n.x}
                    y={n.y + r + 10}
                    textAnchor="middle"
                    className={primary ? "major" : ""}
                  >
                    {n.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        <footer>
          <span>{largeGraph ? "Selected branch · search for any control" : "Framework relationships"}</span>
          <button
            aria-label="Zoom out"
            disabled={scale <= 0.8}
            onClick={() => zoom(Math.max(0.8, scale - 0.2))}
          >
            <Minus />
          </button>
          <button aria-label="Reset graph zoom" onClick={() => zoom(1)}>
            {Math.round(scale * 100)}%
          </button>
          <button
            aria-label="Zoom in"
            disabled={scale >= 2}
            onClick={() => zoom(Math.min(2, scale + 0.2))}
          >
            <Plus />
          </button>
        </footer>
      </section>
      <aside className="xc-node-detail">
        <h3>
          <ZoomIn /> Inspector
        </h3>
        <small>{active.kind}</small>
        <h4>{active.label}</h4>
        <p>
          {control?.explanation ??
            group?.description ??
            catalogue(project.framework).source.purpose}
        </p>
        <h4>Connections</h4>
        {nodes
          .filter((n) => n.parent === active.id || n.id === active.parent)
          .map((n) => (
            <button key={n.id} onClick={() => select(n.id)}>
              {n.label}
            </button>
          ))}
        <button className="xc-primary" onClick={() => setEdit(true)}>
          Assess {relevant.length} controls
        </button>
      </aside>
      {edit && (
        <ControlTable
          title={active.label}
          ids={relevant.map((c) => c.id)}
          close={() => setEdit(false)}
        />
      )}
    </div>
  );
}

export function DataFlow() {
  const { project, change } = useProject(),
    [filter, setFilter] = useState("All data"),
    [editing, setEditing] = useState<Flow | null>(null);
  const visible =
    filter === "All data"
      ? project.flow
      : project.flow.filter(
          (n) =>
            n.field === filter ||
            n.next.some(
              (id) => project.flow.find((x) => x.id === id)?.field === filter,
            ) ||
            project.flow.some(
              (x) => x.field === filter && x.next.includes(n.id),
            ),
        );
  const cols = flowStages.map((s) => visible.filter((n) => n.stage === s)),
    height = Math.max(320, ...cols.map((c) => c.length * 87 + 30));
  const placed = cols.flatMap((col, i) =>
    col.map((n, j) => ({
      ...n,
      x: 20 + i * 182,
      y: ((j + 0.5) * height) / col.length - 28,
    })),
  );
  function save(n: Flow) {
    change((p) => ({
      ...p,
      flow: p.flow.some((f) => f.id === n.id)
        ? p.flow.map((f) => (f.id === n.id ? n : f))
        : [...p.flow, n],
    }));
    setEditing(null);
  }
  return (
    <div className="xc-flow">
      <aside>
        <Database />
        <b>Data inventory</b>
        {flowStages.map((s, i) => (
          <button
            key={s}
            onClick={() =>
              setEditing({
                id: crypto.randomUUID(),
                stage: s,
                name: "",
                field: "",
                owner: "",
                next: [],
              })
            }
          >
            <span>{s}</span>
            <b>{cols[i].length}</b>
          </button>
        ))}
      </aside>
      <section>
        <div className="xc-sectionhead">
          <h2>Data flow map</h2>
          <button
            onClick={() =>
              setEditing({
                id: crypto.randomUUID(),
                stage: "Collection",
                name: "",
                field: "",
                owner: "",
                next: [],
              })
            }
          >
            <Plus /> Add system
          </button>
        </div>
        <label>
          Data class{" "}
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            {["All data", ...new Set(project.flow.map((n) => n.field))].map(
              (s) => (
                <option key={s}>{s}</option>
              ),
            )}
          </select>
        </label>
        <div className="xc-flow-scroll">
          <div className="xc-flow-head">
            {flowStages.map((s) => (
              <b key={s}>{s}</b>
            ))}
          </div>
          <svg
            viewBox={"0 0 735 " + height}
            aria-label="Processing systems and data transfers"
            role="group"
          >
            {placed.flatMap((n) =>
              n.next.map((id) => {
                const d = placed.find((x) => x.id === id);
                return d ? (
                  <g key={n.id + id}>
                    <path
                      d={`M${n.x + 138} ${n.y + 26} C${n.x + 180} ${n.y + 26} ${d.x - 40} ${d.y + 26} ${d.x} ${d.y + 26}`}
                      fill="none"
                      stroke="#859db0"
                    />
                    <circle
                      cx={(n.x + 138 + d.x) / 2}
                      cy={(n.y + d.y) / 2 + 26}
                      r="3.6"
                      fill="#459bdf"
                    />
                  </g>
                ) : null;
              }),
            )}
            {placed.map((n) => (
              <g
                key={n.id}
                className="xc-flow-node"
                role="button"
                tabIndex={0}
                aria-label={"Edit " + n.name}
                onClick={() => setEditing(n)}
                onKeyDown={(e) => keyActivate(e, () => setEditing(n))}
              >
                <rect x={n.x} y={n.y} width="138" height="56" rx="3" />
                <rect
                  x={n.x}
                  y={n.y}
                  width="138"
                  height="7"
                  rx="2"
                  fill={
                    ["#718cb8", "#a46fa1", "#64a6aa", "#b18c57"][
                      flowStages.indexOf(n.stage)
                    ]
                  }
                />
                <text x={n.x + 8} y={n.y + 25}>
                  {n.name.slice(0, 20)}
                </text>
                <text x={n.x + 8} y={n.y + 43}>
                  {n.field.slice(0, 22)}
                </text>
              </g>
            ))}
          </svg>
        </div>
        {!placed.length && (
          <Empty>Add a system or load the fictional flow with Try Demo.</Empty>
        )}
      </section>
      {editing && (
        <Dialog title="Processing system" close={() => setEditing(null)}>
          <form
            className="xc-fields"
            onSubmit={(e) => {
              e.preventDefault();
              save(editing);
            }}
          >
            {(["name", "field", "owner"] as const).map((k) => (
              <label key={k}>
                {k === "field"
                  ? "Data class"
                  : k === "name"
                    ? "System name"
                    : "Owner"}
                <input
                  required
                  maxLength={240}
                  value={editing[k]}
                  onChange={(e) =>
                    setEditing({ ...editing, [k]: e.target.value })
                  }
                />
              </label>
            ))}
            <label>
              Stage
              <select
                value={editing.stage}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    stage: e.target.value as Flow["stage"],
                    next: [],
                  })
                }
              >
                {flowStages.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <fieldset>
              <legend>Transfers to</legend>
              {project.flow
                .filter((n) => n.id !== editing.id)
                .map((n) => (
                  <label key={n.id}>
                    <input
                      type="checkbox"
                      checked={editing.next.includes(n.id)}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          next: e.target.checked
                            ? [...editing.next, n.id]
                            : editing.next.filter((id) => id !== n.id),
                        })
                      }
                    />{" "}
                    {n.name}
                  </label>
                ))}
            </fieldset>
            <button className="xc-primary">Save system</button>
          </form>
        </Dialog>
      )}
    </div>
  );
}
