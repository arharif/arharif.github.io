import { useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ChevronRight,
  CircleAlert,
  FileInput,
  Flame,
  ListChecks,
  Plus,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Timer,
} from "lucide-react";
import { useProject } from "./context";
import { stats } from "./project";
import { ControlTable } from "./Controls";
import {
  Columns,
  Dialog,
  Empty,
  Panel,
  Ring,
  Trend,
  bands,
  dot,
  fmtDate,
  palette,
} from "./ui";
import { today } from "../studio/model";
import {
  analyseRisks,
  autoMapping,
  band,
  blankRisk,
  inherentScore,
  residualScore,
  riskStatuses,
  validateRisk,
  validateRiskRows,
  type RiskRecord,
} from "../workspace/risk";
import { readSpreadsheet } from "../workspace/spreadsheets";

export function RiskRegister({
  ids,
  title,
  close,
}: {
  ids?: string[];
  title: string;
  close: () => void;
}) {
  const { project, change } = useProject(),
    [draft, setDraft] = useState<RiskRecord | null>(null),
    [error, fail] = useState(""),
    [busy, loading] = useState(false),
    [query, search] = useState("");
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const rows = project.risks.filter(
    (r) =>
      (!ids || ids.includes(r.id)) &&
      (r.id + " " + r.threat + " " + r.asset)
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  async function upload(file: File) {
    loading(true);
    fail("");
    try {
      const sheet = await readSpreadsheet(file);
      if (!mounted.current) return;
      change((p) => {
        const v = validateRiskRows(
          sheet.rows,
          autoMapping(sheet.headers),
          p.risks,
        );
        if (v.errors.length)
          throw Error("Row " + v.errors[0].row + " · " + v.errors[0].message);
        return { ...p, risks: [...p.risks, ...v.records] };
      });
    } catch (e) {
      fail(e instanceof Error ? e.message : "Import failed.");
    } finally {
      loading(false);
    }
  }
  function save() {
    if (!draft) return;
    const existing = project.risks.find((r) => r.id === draft.id);
    const v = validateRisk(
      { ...draft },
      new Set(
        project.risks
          .filter((r) => r !== existing)
          .map((r) => r.id.toLowerCase()),
      ),
    );
    if (v.errors.length) {
      fail(v.errors.join(" · "));
      return;
    }
    if (!existing && project.risks.length >= 2000) {
      fail("Maximum 2000 risks per project.");
      return;
    }
    change((p) => ({
      ...p,
      risks: existing
        ? p.risks.map((r) => (r.id === draft.id ? v.record : r))
        : [...p.risks, v.record],
    }));
    setDraft(null);
    fail("");
  }
  return (
    <Dialog title={draft ? "Edit risk" : title} close={close} wide>
      {draft ? (
        <form
          className="xc-fields"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <small>{draft.id}</small>
          {(
            [
              "asset",
              "threat",
              "owner",
              "controls",
              "treatment",
              "evidence",
            ] as const
          ).map((k) => (
            <label key={k}>
              {k}
              <input
                maxLength={3000}
                required={k === "asset" || k === "threat"}
                value={draft[k]}
                onChange={(e) => setDraft({ ...draft, [k]: e.target.value })}
              />
            </label>
          ))}
          <div className="xc-formgrid">
            {(
              [
                "likelihood",
                "impact",
                "residualLikelihood",
                "residualImpact",
              ] as const
            ).map((k) => (
              <label key={k}>
                {k.replace("residual", "Residual ")}
                <select
                  value={draft[k]}
                  onChange={(e) => setDraft({ ...draft, [k]: +e.target.value })}
                >
                  {[1, 2, 3, 4, 5].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </label>
            ))}
            <label>
              Status
              <select
                value={draft.status}
                onChange={(e) => setDraft({ ...draft, status: e.target.value })}
              >
                {riskStatuses.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
            <label>
              Review date
              <input
                type="date"
                value={draft.reviewDate}
                onChange={(e) =>
                  setDraft({ ...draft, reviewDate: e.target.value })
                }
              />
            </label>
          </div>
          <div className="xc-toolbar">
            <button className="xc-primary">Save risk</button>
            <button
              type="button"
              onClick={() => {
                setDraft(null);
                fail("");
              }}
            >
              Back to register
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="xc-toolbar">
            <input
              aria-label="Search risk register"
              placeholder="Search risks…"
              value={query}
              onChange={(e) => search(e.target.value)}
            />
            <button
              onClick={() =>
                setDraft({
                  ...blankRisk(),
                  id: "R-" + crypto.randomUUID().slice(0, 8),
                  openedDate: today(),
                })
              }
            >
              <Plus /> Add risk
            </button>
            <label className="xc-file">
              <FileInput />
              {busy ? "Reading…" : "Import CSV / Excel"}
              <input
                type="file"
                accept=".csv,.xlsx"
                disabled={busy}
                aria-label="Import risk spreadsheet"
                onChange={(e) => {
                  if (e.target.files?.[0]) void upload(e.target.files[0]);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
          <p className="xc-hint">
            Required columns are id, asset, threat, likelihood and impact.
            Ratings use 1–5. Imports append to the register.
          </p>
          <div className="xc-scroll-table">
            <table>
              <thead>
                <tr>
                  <th>Risk</th>
                  <th>Asset</th>
                  <th>Owner</th>
                  <th>Residual</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <button
                        className="xc-record"
                        onClick={() => {
                          setDraft(r);
                          fail("");
                        }}
                      >
                        <b>{r.id}</b>
                        {r.threat}
                      </button>
                    </td>
                    <td>{r.asset}</td>
                    <td>{r.owner || "Unassigned"}</td>
                    <td>{residualScore(r)}</td>
                    <td>{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!rows.length && <Empty>No risks match this selection.</Empty>}
        </>
      )}
      {error && <p role="alert">{error}</p>}
    </Dialog>
  );
}
export function Heatmap({
  risks,
  onPick,
}: {
  risks: RiskRecord[];
  onPick: (label: string, risks: RiskRecord[]) => void;
}) {
  return (
    <div className="xc-heat">
      <small>Likelihood ↑</small>
      <div>
        {[5, 4, 3, 2, 1].flatMap((l) =>
          [1, 2, 3, 4, 5].map((i) => {
            const rows = risks.filter(
                (r) => r.residualLikelihood === l && r.residualImpact === i,
              ),
              score = l * i;
            return (
              <button
                key={l + "-" + i}
                style={{ background: palette[bands.indexOf(band(score))] }}
                aria-label={
                  "Likelihood " +
                  l +
                  ", impact " +
                  i +
                  ", " +
                  rows.length +
                  " risks"
                }
                onClick={() => onPick("Residual " + l + " × " + i, rows)}
              >
                {rows.length || "·"}
              </button>
            );
          }),
        )}
      </div>
      <small>Impact →</small>
    </div>
  );
}
type Drill = { kind: "risk" | "control"; title: string; ids?: string[] };
export function RiskDashboard({
  view,
}: {
  view: "risk" | "matrix" | "executive";
}) {
  const { project, change } = useProject(),
    a = analyseRisks(project.risks, today()),
    s = stats(project);
  const [drill, select] = useState<Drill | null>(null),
    [simulation, simulate] = useState(false),
    [reduction, reduce] = useState(1),
    [closeCount, setCloseCount] = useState(0),
    [point, setPoint] = useState<number | null>(null);
  const openRisk = (title: string, rows?: RiskRecord[]) =>
    select({ kind: "risk", title, ids: rows?.map((r) => r.id) });
  const openControls = (title: string, rows = s.rows) =>
    select({ kind: "control", title, ids: rows.map((c) => c.id) });
  const dist = bands.map((b) => a.distribution[b]),
    top = [...a.active].sort((x, y) => residualScore(y) - residualScore(x));
  const history = [
    ...project.history.filter((h) => h.date < today()),
    { date: today(), counts: dist },
  ]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-8);
  const legend = (
    <div className="xc-legend">
      {bands.map((b, i) => (
        <button
          key={b}
          onClick={() =>
            openRisk(
              b + " risks",
              a.active.filter((r) => band(residualScore(r)) === b),
            )
          }
        >
          {dot(palette[i])}
          {b}
        </button>
      ))}
    </div>
  );
  const trend = (
    <>
      <Trend
        series={bands.map((_, i) => history.map((h) => h.counts[i]))}
        labels={history.map((h) => fmtDate(h.date))}
        onPick={setPoint}
      />
      {legend}
    </>
  );
  const heat = <Heatmap risks={a.active} onPick={openRisk} />;
  const percent = s.scored.length
    ? Math.round((100 * s.met) / s.scored.length)
    : 0;
  const distribution = (
    <div className="xc-donutrow">
      <Ring
        values={dist}
        center={a.total}
        caption="active risks"
        labels={bands}
        onPick={(i) =>
          i < 0
            ? openRisk("Active risk register", a.active)
            : openRisk(
                bands[i] + " risks",
                a.active.filter((r) => band(residualScore(r)) === bands[i]),
              )
        }
      />
      <div>
        {bands.map((b, i) => (
          <button
            key={b}
            onClick={() =>
              openRisk(
                b + " risks",
                a.active.filter((r) => band(residualScore(r)) === b),
              )
            }
          >
            {dot(palette[i])}
            {b}
            <b>{dist[i]}</b>
          </button>
        ))}
      </div>
    </div>
  );
  const table = (rows: RiskRecord[]) =>
    rows.length ? (
      <table className="xc-mini">
        <thead>
          <tr>
            <th>Risk description</th>
            <th>Level</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>
                <button onClick={() => openRisk(r.threat, [r])}>
                  {r.threat}
                </button>
              </td>
              <td>
                <i
                  className={
                    "xc-pill level-" + band(residualScore(r)).toLowerCase()
                  }
                >
                  {band(residualScore(r))}
                </i>
              </td>
              <td>{residualScore(r)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <Empty>Add a risk or load a demo.</Empty>
    );
  const bandKpis = (
    <div className="xc-riskkpis">
      {bands.map((b, i) => {
        const Icon = [Flame, CircleAlert, Timer, ShieldCheck][i];
        return (
          <button
            key={b}
            onClick={() =>
              openRisk(
                b + " risks",
                a.active.filter((r) => band(residualScore(r)) === b),
              )
            }
            style={{ borderTopColor: palette[i] }}
          >
            <Icon style={{ color: palette[i] }} />
            <div>
              <b>{dist[i]}</b>
              <small>{b} risks</small>
            </div>
          </button>
        );
      })}
    </div>
  );
  const bars = (
    <div className="xc-bars">
      {s.profiles.map((g) => (
        <button
          key={g.id}
          onClick={() =>
            openControls(
              g.title,
              s.applicable.filter((c) => c.group === g.id),
            )
          }
        >
          <span>{g.title}</span>
          <i>
            <i style={{ width: g.current * 25 + "%", background: g.colour }} />
          </i>
          <b>{Math.round(g.current * 25)}%</b>
        </button>
      ))}
    </div>
  );
  const evidence = (
    <div className="xc-donutrow">
      <Ring
        values={[s.reviewed.length, s.outstanding.length]}
        colors={["var(--chart-low)", "var(--chart-target)"]}
        center={s.applicable.length ? Math.round((s.verified / s.applicable.length) * 100) + "%" : "—"}
        caption="reviewed"
        labels={["Reviewed evidence", "Outstanding evidence"]}
        onPick={(i) =>
          openControls(
            "Evidence status",
            i < 0 ? s.applicable : i === 0 ? s.reviewed : s.outstanding,
          )
        }
      />
      <div>
        <button
          onClick={() =>
            openControls(
              "Reviewed evidence",
              s.reviewed,
            )
          }
        >
          {dot("var(--chart-low)")}Reviewed <b>{s.verified}</b>
        </button>
        <button
          onClick={() =>
            openControls(
              "Evidence outstanding",
              s.outstanding,
            )
          }
        >
          {dot("var(--chart-target)")}Outstanding <b>{s.outstanding.length}</b>
        </button>
      </div>
    </div>
  );
  const tools = (
    <div className="xc-toolbar risk-tools">
      <button onClick={() => openRisk("Risk register")}>
        <ListChecks /> Risk register
      </button>
      <button onClick={() => simulate(true)}>
        <SlidersHorizontal /> Simulate treatment
      </button>
      <button onClick={() => openControls("Control assessment")}>
        <Shield /> Assess controls
      </button>
    </div>
  );
  const gain = [...s.gaps]
    .map((c) => c.target - c.current!)
    .sort((a, b) => b - a)
    .slice(0, closeCount)
    .reduce((n, v) => n + v, 0);
  const gauge = (value: number, caption: string) => (
    <button className="xc-gauge" onClick={() => simulate(true)}>
      <svg viewBox="0 0 100 60">
        <path
          d="M8 49 A42 42 0 0 1 92 49"
          pathLength="100"
          stroke="var(--line)"
          fill="none"
          strokeWidth="9"
        />
        <path
          d="M8 49 A42 42 0 0 1 92 49"
          pathLength="100"
          stroke="var(--chart-current)"
          fill="none"
          strokeWidth="9"
          strokeDasharray={value + " 100"}
        />
        <text x="50" y="49" textAnchor="middle">
          {value}%
        </text>
      </svg>
      <small>{caption}</small>
    </button>
  );
  return (
    <div className={"xc-riskboard " + view}>
      <div className="xc-boardtitle">
        <span>
          <Activity />
          {view === "risk"
            ? "Cybersecurity risk assessment"
            : view === "matrix"
              ? "Risk management"
              : "Cybersecurity GRC dashboard"}
        </span>
        {tools}
      </div>
      {view === "risk" ? (
        <div className="xc-cybergrid">
          <Panel
            title="Risk score"
            className="xc-score-panel"
            action={() => openRisk("Active risk register", a.active)}
          >
            <Ring
              values={a.total ? [4, 5, 7, 9] : []}
              colors={[...palette].reverse()}
              labels={[...bands].reverse()}
              indicator={a.total ? (100 * a.residual) / (25 * a.total) : 0}
              center={
                a.total ? Math.round((100 * a.residual) / (25 * a.total)) : "—"
              }
              caption="Exposure / 100"
              onPick={(i) =>
                openRisk(
                  "Residual exposure",
                  i < 0
                    ? a.active
                    : a.active.filter(
                        (r) => band(residualScore(r)) === bands[3 - i],
                      ),
                )
              }
            />
            <div className="xc-score-actions">
              <button onClick={() => openRisk("Risk register")}>
                <ListChecks />
                Register
              </button>
              <button onClick={() => simulate(true)}>
                <SlidersHorizontal />
                Simulate
              </button>
              <button onClick={() => openControls("Control assessment")}>
                <Shield />
                Controls
              </button>
            </div>
            <div className="xc-score-notes">
              <small>
                Inherent exposure <b>{a.inherent}</b>
              </small>
              <small>
                Residual exposure <b>{a.residual}</b>
              </small>
              <h4>Exposure by risk</h4>
              <div className="xc-score-bars">
                {top.slice(0, 5).map((r) => (
                  <button
                    key={r.id}
                    title={r.threat}
                    aria-label={"Inspect " + r.threat}
                    onClick={() => openRisk(r.threat, [r])}
                  >
                    <i style={{ height: inherentScore(r) * 4 + "%" }} />
                    <i style={{ height: residualScore(r) * 4 + "%" }} />
                  </button>
                ))}
              </div>
            </div>
          </Panel>
          <Panel title="Critical issues">
            {bandKpis}
            <h4>Risk heat map</h4>
            <div className="xc-heat-pair">
              <div className="xc-risktiles">
                {bands.map((b, i) => (
                  <button
                    key={b}
                    onClick={() =>
                      openRisk(
                        b + " risks",
                        a.active.filter((r) => band(residualScore(r)) === b),
                      )
                    }
                    style={{ background: `color-mix(in srgb, ${palette[i]} 19%, var(--surface1))`, borderInlineStart: `3px solid ${palette[i]}` }}
                  >
                    {b}
                    <b>{dist[i]}</b>
                  </button>
                ))}
              </div>
              {heat}
            </div>
          </Panel>
          <Panel title="Risk history">{trend}</Panel>
          <Panel
            title="Risk breakdown"
            action={() => openRisk("Risk register")}
          >
            {table(top.slice(0, 5))}
          </Panel>
          <Panel
            title="Priority treatments"
            action={() => openRisk("Treatment register", top)}
          >
            {top.slice(0, 4).map((r) => (
              <button
                className="xc-lineitem"
                key={r.id}
                onClick={() => openRisk(r.threat, [r])}
              >
                <span>{r.treatment || r.threat}</span>
                <ChevronRight />
              </button>
            ))}
            {!top.length && <Empty>No active treatments.</Empty>}
          </Panel>
          <Panel
            title="Control profile"
            action={() => openControls("Control profile")}
          >
            {evidence}
          </Panel>
        </div>
      ) : view === "matrix" ? (
        <>
          {bandKpis}
          <div className="xc-matrixgrid">
            <Panel title="Risk matrix">{heat}</Panel>
            <Panel title="Risk aging">
              <div className="xc-bubbles">
                {a.ageing.map((g, i) => (
                  <button
                    key={g.label}
                    style={{
                      bottom:
                        12 +
                        (g.ids.length /
                          Math.max(1, ...a.ageing.map((g) => g.ids.length))) *
                          49 +
                        "%",
                      left: 5 + i * 24 + "%",
                      background: palette[3 - i],
                    }}
                    onClick={() =>
                      openRisk(
                        g.label,
                        a.active.filter((r) => g.ids.includes(r.id)),
                      )
                    }
                  >
                    {g.ids.length}
                    <small>{g.label}</small>
                  </button>
                ))}
              </div>
            </Panel>
            <Panel title="Inherent and residual exposure">
              <div className="xc-gauges">
                {gauge(
                  a.total ? Math.round((a.inherent / (25 * a.total)) * 100) : 0,
                  "Inherent",
                )}
                {gauge(
                  a.total ? Math.round((a.residual / (25 * a.total)) * 100) : 0,
                  "Residual",
                )}
              </div>
            </Panel>
            <Panel title="Risk mitigation trend" className="span2">
              {trend}
            </Panel>
            <Panel title="Risk distribution">{distribution}</Panel>
          </div>
        </>
      ) : (
        <div className="xc-execgrid">
          <Panel title="Executive overview">
            <div className="xc-execnums">
              {[
                [a.total, "Active risks"],
                [percent + "%", "At target"],
                [s.gaps.length, "Open gaps"],
                [s.verified, "Reviewed"],
              ].map(([n, label], i) => (
                <button
                  key={label}
                  onClick={() =>
                    i === 0
                      ? openRisk("Active risks", a.active)
                      : openControls(
                          String(label),
                          i === 2
                            ? s.gaps
                            : i === 1
                              ? s.scored.filter((r) => r.current! >= r.target)
                              : s.reviewed,
                        )
                  }
                >
                  <small>{label}</small>
                  <b>{n}</b>
                </button>
              ))}
            </div>
            <div className="xc-overview-chart">
              <Ring
                values={dist}
                center={a.total}
                caption="risks"
                labels={bands}
                onPick={(i) =>
                  i < 0
                    ? openRisk("Active risks", a.active)
                    : openRisk(
                        bands[i],
                        a.active.filter(
                          (r) => band(residualScore(r)) === bands[i],
                        ),
                      )
                }
              />
              <div>{trend}</div>
            </div>
          </Panel>
          <Panel
            title="Risk management"
            action={() => openRisk("Risk register")}
          >
            <div className="xc-split">
              {heat}
              {table(top.slice(0, 5))}
            </div>
          </Panel>
          <Panel
            title="Compliance profile"
            action={() => openControls("Control profile")}
          >
            <div className="xc-execpair">
              <Columns
                rows={s.profiles.map((g) => ({
                  label: g.id.startsWith("pci-") ? g.title.split(" ")[0] : g.id,
                  value: Math.round(g.current * 25),
                  colour: g.colour,
                }))}
                onPick={(i) =>
                  openControls(
                    s.profiles[i].title,
                    s.applicable.filter((c) => c.group === s.profiles[i].id),
                  )
                }
              />
              {bars}
            </div>
          </Panel>
          <Panel
            title="Control effectiveness"
            action={() => openControls("Evidence status")}
          >
            <div className="xc-execpair">
              <Ring
                values={[s.met, s.gaps.length, s.applicable.length - s.scored.length]}
                colors={["#44ba8f", "#ecaf50", "#6c85b5"]}
                center={percent + "%"}
                caption="at target"
                labels={["At target controls", "Below target controls", "Unassessed controls"]}
                onPick={(i) =>
                  openControls(
                    "Control status",
                    i === 0
                      ? s.scored.filter((c) => c.current! >= c.target)
                      : i === 1
                        ? s.gaps
                        : i === 2
                          ? s.applicable.filter((c) => c.current === null)
                          : s.applicable,
                  )
                }
              />
              <table className="xc-mini">
                <thead>
                  <tr>
                    <th>Control</th>
                    <th>Evidence</th>
                  </tr>
                </thead>
                <tbody>
                  {s.applicable.slice(0, 4).map((c) => (
                    <tr key={c.id}>
                      <td>
                        <button onClick={() => openControls(c.id, [c])}>
                          {c.id}
                        </button>
                      </td>
                      <td>{c.evidence}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
          <Panel title="Risk and vulnerability trends">
            <div className="xc-execpair">
              <div>{trend}</div>
              <Columns
                rows={bands.map((label, i) => ({
                  label,
                  value: dist[i],
                  colour: palette[i],
                }))}
                onPick={(i) =>
                  openRisk(
                    bands[i],
                    a.active.filter((r) => band(residualScore(r)) === bands[i]),
                  )
                }
              />
            </div>
          </Panel>
          <Panel title="Governance and audit">
            <div className="xc-execpair">
              <Columns
                rows={[4, 3, 2, 1].map((v, i) => ({
                  label: "Gap " + v,
                  value: s.gaps.filter((c) => c.target - (c.current ?? 0) === v)
                    .length,
                  colour: palette[i],
                }))}
                onPick={(i) =>
                  openControls(
                    "Maturity gap " + (4 - i),
                    s.gaps.filter((c) => c.target - (c.current ?? 0) === 4 - i),
                  )
                }
              />
              <div className="xc-findings">
                {s.gaps.slice(0, 4).map((c) => (
                  <button key={c.id} onClick={() => openControls(c.id, [c])}>
                    <span>
                      {c.id} · {c.title}
                    </span>
                    <b>−{c.target - c.current!}</b>
                  </button>
                ))}
                {!s.gaps.length && <Empty>No assessed gaps.</Empty>}
              </div>
            </div>
          </Panel>
        </div>
      )}
      {drill?.kind === "risk" && (
        <RiskRegister {...drill} close={() => select(null)} />
      )}
      {drill?.kind === "control" && (
        <ControlTable
          title={drill.title}
          ids={drill.ids ?? []}
          close={() => select(null)}
        />
      )}
      {point !== null && (
        <Dialog
          title={"Observation · " + fmtDate(history[point].date)}
          close={() => setPoint(null)}
        >
          {history[point].counts.map((n, i) => (
            <p className="xc-lineitem" key={i}>
              {dot(palette[i])}
              {bands[i]} <b>{n}</b>
            </p>
          ))}
          <button
            className="xc-primary"
            onClick={() => {
              change((p) => ({
                ...p,
                history: [
                  ...p.history.filter((h) => h.date !== today()),
                  { date: today(), counts: dist },
                ].slice(-120),
              }));
              setPoint(null);
            }}
          >
            Save today's observation
          </button>
        </Dialog>
      )}
      {simulation && (
        <Dialog title="Treatment simulation" close={() => simulate(false)}>
          <p>
            Model a reduction in residual likelihood across active risks. Impact
            stays at its recorded level.
          </p>
          <label>
            Likelihood reduction · {reduction}
            <input
              type="range"
              min="0"
              max="4"
              value={reduction}
              onChange={(e) => reduce(+e.target.value)}
            />
          </label>
          <div className="xc-simresult">
            <b>{a.residual}</b>
            <ArrowDownRight />
            <b>
              {a.active.reduce(
                (n, r) =>
                  n +
                  Math.max(1, r.residualLikelihood - reduction) *
                    r.residualImpact,
                0,
              )}
            </b>
          </div>
          <small>Recorded and projected exposure · ordinal index</small>
          <h3>Remediation impact</h3>
          <label>
            Close the largest gaps · {Math.min(closeCount, s.gaps.length)} of{" "}
            {s.gaps.length}
            <input
              aria-label="Number of gaps to close"
              type="range"
              min="0"
              max={s.gaps.length}
              value={Math.min(closeCount, s.gaps.length)}
              onChange={(e) => setCloseCount(+e.target.value)}
            />
          </label>
          <p>
            Projected maturity{" "}
            <b>
              {s.scored.length
                ? (s.current + gain / s.scored.length).toFixed(2)
                : "Unrated"}
            </b>{" "}
            / 4. Each selected control reaches its recorded target.
          </p>
          <button
            className="xc-primary"
            onClick={() => {
              simulate(false);
              openRisk("Review treatment assumptions", a.active);
            }}
          >
            Review individual risks
          </button>
        </Dialog>
      )}
    </div>
  );
}
