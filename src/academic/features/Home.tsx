import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ShieldCheck,
  Network,
  BrainCircuit,
  ArrowRight,
  Fingerprint,
  FlaskConical,
} from "lucide-react";
import { useScenario } from "../app/context";
import { base } from "../components/shared";
import {
  analyseRisks,
  band,
  residualScore,
  scenarioRisks,
  riskMethod,
} from "../workspace/risk";
import {
  Bars,
  Donut,
  Kpi,
  palette,
  Panel,
  RiskMatrix,
} from "../workspace/charts";
import { metricInsight, useInsight } from "../workspace/insights";
import { useWorkspace } from "../workspace/state";
import { labLinks } from "../data/cases";
import { modules } from "../data/curriculum";
export default function Home() {
  const scenario = useScenario(),
    { analysed, provenance, asOf } = useWorkspace(),
    { explain } = useInsight();
  const data = analysed ?? scenarioRisks(scenario.id),
    s = analyseRisks(data, asOf);
  const select = (title: string, method: string) =>
    explain(
      metricInsight(
        title,
        `Selected ${scenario.name} workspace. ${analysed ? provenance : "Fictional baseline"}.`,
        method,
        "Open the risk register to inspect the underlying records and change the scenario assumptions.",
      ),
    );
  return (
    <>
      <div className="xa-overview-heading">
        <div>
          <p className="xa-eyebrow">YOUR CONNECTED ACADEMIC WORKSPACE</p>
          <h1>
            Learn the system.
            <br />
            <em>Make better decisions.</em>
          </h1>
          <p className="xa-intro">
            Cybersecurity, governance and AI — connected through evidence,
            experiments and real-world judgement.
          </p>
        </div>
        <div className="xa-academy-emblem" aria-hidden="true">
          <div>
            <Fingerprint size={58} />
          </div>
          <span>EXPLAIN · EXPERIMENT · APPLY</span>
        </div>
      </div>
      <div className="xa-data-banner">
        <span className="xa-live-dot" />
        <strong>{analysed ? provenance : "Fictional scenario baseline"}</strong>
        <span>
          {scenario.name} · as of {asOf}
        </span>
        <Link to={`${base}/case-studies`}>
          Change context <ArrowUpRight size={13} />
        </Link>
      </div>
      <div className="xa-kpi-grid">
        <Kpi
          label="Active risk exposure"
          value={s.residual}
          detail={`${s.total} active risks · ordinal index sum`}
          onClick={() => select("Active risk exposure", riskMethod)}
        />
        <Kpi
          label="Critical exposures"
          value={s.distribution.Critical || 0}
          detail="Residual index 17–25"
          tone="rose"
          onClick={() => select("Critical exposures", riskMethod)}
        />
        <Kpi
          label="Evidence references"
          value={`${s.withEvidence}/${s.total}`}
          detail="Presence only · not verified"
          tone="blue"
          onClick={() =>
            select(
              "Evidence coverage",
              "Count active risks with nonempty evidence references; no assessment evidence is invented.",
            )
          }
        />
        <Kpi
          label="Overdue reviews"
          value={s.overdue.length}
          detail={`Review date before ${asOf}`}
          tone="amber"
          onClick={() =>
            select(
              "Overdue reviews",
              "Active risk with a review date earlier than the analysis date. Missing dates require separate follow-up.",
            )
          }
        />
      </div>
      <div className="xa-dashboard-grid">
        <Panel
          title="Cyber risk landscape"
          subtitle="Residual likelihood × impact · select a cell"
          action={
            <Link to={`${base}/labs/risk-decision`}>
              Open register <ArrowUpRight size={14} />
            </Link>
          }
        >
          <RiskMatrix
            counts={(l, i) =>
              s.active.filter(
                (r) => r.residualLikelihood === l && r.residualImpact === i,
              ).length
            }
            onSelect={(l, i) =>
              select(
                `Likelihood ${l} × impact ${i}`,
                `Residual index = ${l * i}. ${s.active.filter((r) => r.residualLikelihood === l && r.residualImpact === i).length} active risks occupy this cell. ${riskMethod}`,
              )
            }
          />
        </Panel>
        <Panel
          title="Exposure distribution"
          subtitle="Understand what needs attention"
        >
          <Donut
            label="active risks"
            segments={(["Critical", "High", "Medium", "Low"] as const).map(
              (b) => ({
                label: b,
                value: s.distribution[b] || 0,
                color: palette[b],
              }),
            )}
            onSelect={(b) =>
              select(
                `${b} exposure`,
                `${s.active.filter((r) => band(residualScore(r)) === b).length} active risk records in this residual category. ${riskMethod}`,
              )
            }
          />
        </Panel>
      </div>
      <div className="xa-grid two">
        <Link
          to={`${base}/labs/framework-explorer`}
          className="xa-feature-card"
        >
          <div className="xa-feature-icon">
            <ShieldCheck size={23} />
            <span className="xa-pill">PRIORITY WORKSPACE</span>
          </div>
          <h2>
            From framework
            <br />
            to defensible evidence.
          </h2>
          <p>
            Navigate all six CSF Functions, assess 106 outcomes and build your
            gap roadmap.
          </p>
          <div className="xa-mini-functions">
            {["GV", "ID", "PR", "DE", "RS", "RC"].map((f, i) => (
              <span className={`color-${i}`} key={f}>
                {f}
              </span>
            ))}
          </div>
          <span>
            Open Framework Explorer <ArrowRight size={15} />
          </span>
        </Link>
        <Panel
          title="Your decision chain"
          subtitle="A connected view of risk, evidence and action"
        >
          <div className="xa-chain">
            {[
              ["Business objective", "process"],
              ["Asset & exposure", "asset"],
              ["Control & evidence", "control"],
              ["Executive decision", "decision"],
            ].map(([label, node], i) => (
              <Link to={`${base}/knowledge-graph?node=${node}`} key={node}>
                <span>0{i + 1}</span>
                {label}
                <ArrowUpRight size={14} />
              </Link>
            ))}
          </div>
          <Link to={`${base}/knowledge-graph`} className="xa-button secondary">
            <Network size={15} /> Explore the knowledge graph
          </Link>
        </Panel>
      </div>
      <div className="xa-section-heading">
        <h2>Choose your next experiment</h2>
        <span className="xa-muted">Learn by making a decision</span>
      </div>
      <div className="xa-grid">
        {labLinks
          .filter((l) =>
            ["cyber-incident", "ai-experiment", "ciso-boardroom"].includes(
              l.id,
            ),
          )
          .map((l, i) => {
            const Icon = [ShieldCheck, BrainCircuit, FlaskConical][i];
            return (
              <Link key={l.id} to={`${base}/labs/${l.id}`} className="xa-card">
                <Icon className="xa-accent" size={22} />
                <h3>{l.title}</h3>
                <p>{l.detail}</p>
                <span className="xa-card-link">Enter workspace →</span>
              </Link>
            );
          })}
      </div>
      <div className="xa-grid two">
        <Panel
          title="Treatment ownership"
          subtitle="Active risks by accountable owner"
        >
          <Bars
            items={s.owners}
            onSelect={(owner) =>
              select(
                owner,
                `Count of active risk records assigned to ${owner}. Missing owners appear as Unassigned.`,
              )
            }
          />
        </Panel>
        <Panel
          title="Build your foundations"
          subtitle="Explain → visualise → interact → apply"
        >
          {modules.map((m, i) => (
            <Link
              className="xa-lesson-row"
              key={m.id}
              to={`${base}/learning/${m.id}`}
            >
              <span>0{i + 1}</span>
              <div>
                <strong>{m.title}</strong>
                <small>Guided lesson · exercise · knowledge check</small>
              </div>
              <ArrowUpRight size={15} />
            </Link>
          ))}
          <Link to={`${base}/resources`}>
            Authoritative resources & professional templates →
          </Link>
        </Panel>
      </div>
    </>
  );
}
