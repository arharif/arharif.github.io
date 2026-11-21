import { Link } from "react-router-dom";
import { base, Header } from "../components/shared";
export default function Simulate() {
  return (
    <>
      <Header
        eyebrow="SIMULATE / GUIDED EXPERIMENTS"
        title="Explore a decision. Explain the consequence."
      >
        <p>
          Choose a focused exercise, use a fictional organisation and keep
          assumptions, observed inputs and conclusions distinct.
        </p>
      </Header>
      <div className="xs-workspace-links xa-panel">
        {[
          [
            "Guided CSF & maturity assessment",
            "/assess",
            "Scope → current state → target → evidence → gap → action.",
          ],
          [
            "Privacy Risk & Governance",
            "/simulate/privacy",
            "Processing → individuals → problematic actions → harms → safeguards.",
          ],
          [
            "NIST system implementation",
            "/standards/800-53",
            "Information impacts → starting baselines → tailoring → assessment.",
          ],
          [
            "Risk Register & Simulator",
            "/labs/risk-decision",
            "Local spreadsheet → analysis snapshot → treatment options → report.",
          ],
          [
            "Cyber Incident Lab",
            "/labs/cyber-incident",
            "Synthetic observations → evidence chain → response proposals.",
          ],
          [
            "AI Experiment Studio",
            "/labs/ai-experiment",
            "Known labels → thresholds → metrics → reproducible comparisons.",
          ],
          [
            "CISO Boardroom",
            "/labs/ciso-boardroom",
            "Budget assumptions → delivery constraints → accountable recommendation.",
          ],
        ].map(([name, path, text]) => (
          <Link to={`${base}${path}`} key={path}>
            <strong>{name}</strong>
            <span>{text}</span>
            <span>Open →</span>
          </Link>
        ))}
      </div>
    </>
  );
}
