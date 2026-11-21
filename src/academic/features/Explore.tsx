import { SecurityMindmapExperience } from "@/components/security-map/SecurityMindmapExperience";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { complianceFrameworks } from "@/data/complianceFrameworks";
import { securityRoles } from "@/data/securityRoles";
import { certifications } from "@/data/certifications";
import { frameworkSources } from "../data/controls";
import { labLinks, scenarios } from "../data/cases";
import { base, Header, Field, Source } from "../components/shared";
import { useAcademic } from "../app/context";
import { ConceptExplorer } from "./Learning";
export function Labs() {
  return (
    <>
      <Header
        eyebrow="Professional simulation laboratory"
        title="Practise a complete decision loop"
      >
        <p>
          Choose a case, inspect the evidence, make decisions and export your
          work. Case-state JSON can carry context from one laboratory into
          another.
        </p>
      </Header>
      <div className="xa-grid two">
        {labLinks.map((lab) => (
          <Link className="xa-card" to={`${base}/labs/${lab.id}`} key={lab.id}>
            <h2>{lab.title}</h2>
            <p>{lab.detail}</p>
            <span className="xa-card-link">{lab.label} →</span>
          </Link>
        ))}
      </div>
    </>
  );
}
const officialSources: Record<string, string> = {
  "iso-27002": "https://www.iso.org/standard/75652.html",
  "iso-27701": "https://www.iso.org/standard/iso-iec-27701",
  "iso-42001": "https://www.iso.org/standard/81230.html",
  "iso-22301": "https://www.iso.org/standard/75106.html",
  "nist-rmf": "https://csrc.nist.gov/projects/risk-management",
  "nist-ai-rmf": "https://www.nist.gov/itl/ai-risk-management-framework",
  "pci-dss": "https://www.pcisecuritystandards.org/",
  soc2: "https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-2",
  gdpr: "https://eur-lex.europa.eu/eli/reg/2016/679/oj",
  dora: "https://eur-lex.europa.eu/eli/reg/2022/2554/oj",
  "cis-controls": "https://www.cisecurity.org/controls",
  cobit: "https://www.isaca.org/resources/cobit",
};
export function Frameworks() {
  const { id } = useParams();
  const [query, setQuery] = useState("");
  const rows = complianceFrameworks.filter(
    (row) =>
      (!id || row.id === id) &&
      `${row.name} ${row.category} ${row.fullName}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <>
      <Header
        eyebrow="Knowledge & framework explorer"
        title="Purpose before mapping"
      >
        <p>
          Explore the established catalogue. Editions require verification
          against publisher records. Educational relationships do not establish
          equivalence or conformity.
        </p>
      </Header>
      <Field label="Filter frameworks">
        <input value={query} onChange={(e) => setQuery(e.target.value)} />
      </Field>
      {!rows.length && (
        <p>
          No matching framework.{" "}
          <Link to={`${base}/frameworks`}>Return to the catalogue</Link>.
        </p>
      )}
      <div className="xa-grid two">
        {rows.map((row) => {
          const source = frameworkSources.find((item) => item.id === row.id);
          return (
            <article className="xa-card" key={row.id}>
              <p className="xa-eyebrow">{row.category}</p>
              <h2>{row.name}</h2>
              <p>
                {row.id === "iso-27701"
                  ? "Privacy information management. This inherited catalogue record requires edition review. Its earlier description as an ISMS extension must not be applied to a later edition without verification."
                  : row.definition}
              </p>
              <dl>
                <dt>Scope & applicability</dt>
                <dd>{row.scope.map((item) => item.description).join(" ")}</dd>
                <dt>Core concepts</dt>
                <dd>
                  {row.domains
                    .map((item) => `${item.name} · ${item.description}`)
                    .join(". ")}
                </dd>
                <dt>Implementation</dt>
                <dd>
                  {row.keyRequirements
                    .map((item) => item.practicalMeaning)
                    .join(" ")}
                </dd>
              </dl>
              <p>
                <small>
                  {source?.edition ??
                    "Inherited edition. Current-release verification pending."}{" "}
                  Metadata review 2026-11-20. Publication date is supplied only
                  where recorded in the curated source metadata.
                </small>
              </p>
              {(source?.url || officialSources[row.id]) && (
                <Source href={source?.url || officialSources[row.id]}>
                  Publisher reference
                </Source>
              )}
              <p>
                <Link to={`${base}/learning/risk-assessment`}>
                  Study assessment and risk decisions →
                </Link>
              </p>
              {source && (
                <Link
                  className="xa-button"
                  to={`${base}/labs/framework-explorer`}
                >
                  Assess the curated subset
                </Link>
              )}
              <details>
                <summary>Revision & educational limitations</summary>
                <p>
                  2026-11-20 · Wrapped the existing catalogue with source and
                  verification status. Original records retained. Publication
                  and release validation is pending unless specifically
                  recorded. For SP 800-53, the teaching subset covers base
                  controls. Licensed ISO requirements are not reproduced.
                </p>
              </details>
            </article>
          );
        })}
      </div>
    </>
  );
}
export function Cases() {
  const { setCaseId, setImported } = useAcademic();
  return (
    <>
      <Header
        eyebrow="Connected case studies"
        title="Follow one service across the academy"
      >
        <p>
          These three authored organisations share stable service, identity,
          supplier and governance context across lessons and laboratories.
        </p>
      </Header>
      {scenarios.map((row) => (
        <section className="xa-panel" key={row.id}>
          <h2>{row.name}</h2>
          <p>
            {row.sector} · {row.process} · Owner {row.owner}
          </p>
          <p>{row.architecture}</p>
          <p>
            {row.threat} {row.exposure}
          </p>
          <p>{row.consequence}</p>
          <p>
            Control focus · supplier identity, activity monitoring and trusted
            recovery. Evidence samples are generated from the synthetic session,
            gateway and change records in the Incident Lab.
          </p>
          <p>{row.constraint}</p>
          <p className="xa-disclaimer">
            Fictional educational scenario — not real organisational evidence.
          </p>
          <div className="xa-actions">
            {labLinks.map((lab) => (
              <Link
                className="xa-button"
                key={lab.id}
                to={`${base}/labs/${lab.id}`}
                onClick={() => {
                  setCaseId(row.id);
                  setImported(null);
                }}
              >
                {lab.title}
              </Link>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
function RoleLearningMap() {
  const [selected, setSelected] = useState(securityRoles[0].id),
    [query, setQuery] = useState("");
  const role = securityRoles.find((row) => row.id === selected)!;
  const module = /ai/i.test(role.family)
    ? "detection-evaluation"
    : /govern|risk|assurance|leadership|pmo/i.test(role.family)
      ? "risk-assessment"
      : "incident-triage";
  return (
    <>
      <Header
        eyebrow="Careers & competencies"
        title="Connect the role to the work"
      >
        <p>
          Explore the existing role inventory through an accessible list and
          connect responsibilities to practical learning.
        </p>
      </Header>
      <Field label="Find a security role">
        <input value={query} onChange={(e) => setQuery(e.target.value)} />
      </Field>
      <div className="xa-workspace">
        <nav className="xa-list" aria-label="Security roles">
          {securityRoles
            .filter((row) =>
              `${row.title} ${row.family}`
                .toLowerCase()
                .includes(query.toLowerCase()),
            )
            .map((row) => (
              <button
                key={row.id}
                aria-pressed={selected === row.id}
                onClick={() => setSelected(row.id)}
              >
                {row.title}
              </button>
            ))}
        </nav>
        <article className="xa-panel">
          <p className="xa-eyebrow">{role.family}</p>
          <h2>{role.title}</h2>
          <p>{role.shortDescription}</p>
          <h3>Responsibilities</h3>
          <p>{role.mainResponsibilities}</p>
          <h3>Skills & competencies</h3>
          <ul>
            {role.mustHaveDomains.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
          <h3>Career progression</h3>
          <p>
            {role.careerPath.nMinus1} → {role.title} → {role.careerPath.nPlus1}
          </p>
          <h3>Practise the deliverable</h3>
          <p>
            Develop an evidence-backed{" "}
            {module === "risk-assessment"
              ? "risk recommendation and executive decision record"
              : module === "detection-evaluation"
                ? "model evaluation report"
                : "incident investigation report"}
            . Completion requires the lesson check and a written activity.
          </p>
          <Link className="xa-button primary" to={`${base}/learning/${module}`}>
            Open related module
          </Link>
          <p>
            Inherited certification guidance · {role.certification}. Check
            issuer requirements before selecting a programme.
          </p>
          <Link to={`${base}/certifications`}>
            Explore certification preparation
          </Link>
        </article>
      </div>
      <section>
        <ConceptExplorer />
        <p>
          <a href="/security-mindmap">
            Open the original interactive role and organisation map →
          </a>
        </p>
      </section>
    </>
  );
}
const issuers: Record<string, { name: string; url: string; title: string }> = {
  cissp: {
    name: "ISC2",
    url: "https://www.isc2.org/certifications/cissp",
    title: "Certified Information Systems Security Professional",
  },
  cism: {
    name: "ISACA",
    url: "https://www.isaca.org/credentialing/cism",
    title: "Certified Information Security Manager",
  },
  cisa: {
    name: "ISACA",
    url: "https://www.isaca.org/credentialing/cisa",
    title: "Certified Information Systems Auditor",
  },
  crisc: {
    name: "ISACA",
    url: "https://www.isaca.org/credentialing/crisc",
    title: "Certified in Risk and Information Systems Control",
  },
};
export function Certifications() {
  const [query, setQuery] = useState("");
  return (
    <>
      <Header
        eyebrow="Career preparation"
        title="Build capability before the credential"
      >
        <p>
          The established certification catalogue is retained. Official source
          enrichment begins with four programmes. Other entries carry inherited
          guidance and require issuer verification.
        </p>
      </Header>
      <Field label="Find a certification or skill">
        <input value={query} onChange={(e) => setQuery(e.target.value)} />
      </Field>
      <div className="xa-grid two">
        {certifications
          .filter((row) =>
            `${row.name} ${row.domains.join(" ")} ${row.category}`
              .toLowerCase()
              .includes(query.toLowerCase()),
          )
          .map((row) => (
            <article className="xa-card" key={row.id}>
              <h2>{row.name}</h2>
              <p>
                {issuers[row.id]?.title ?? row.definition ?? row.practicalValue}
              </p>
              <p>
                {row.level} · {row.bestFit}
              </p>
              <details>
                <summary>Skills and preparation route</summary>
                <ul>
                  {row.domains.map((domain) => (
                    <li key={domain}>{domain}</li>
                  ))}
                </ul>
                <p>{row.careerPath}</p>
                <p>
                  Start with the risk module, produce a control assessment and
                  practise an executive briefing. These activities supplement
                  official preparation.
                </p>
                <Link to={`${base}/learning/risk-assessment`}>
                  Study the assessment module →
                </Link>
              </details>
              {issuers[row.id] && (
                <Source href={issuers[row.id].url}>
                  {issuers[row.id].name} programme requirements
                </Source>
              )}
              <p>
                <small>
                  Eligibility, exam versions and prices require current official
                  verification. No current price or eligibility claim is made.
                  Metadata reviewed 2026-11-20. Programme verification pending.
                </small>
              </p>
            </article>
          ))}
      </div>
    </>
  );
}

export function SecurityMap() {
  const [view, setView] = useState("visual");
  return (
    <>
      <div className="xa-segmented" aria-label="Security mindmap view">
        <button
          aria-pressed={view === "visual"}
          onClick={() => setView("visual")}
        >
          Original interactive map
        </button>
        <button
          aria-pressed={view === "learning"}
          onClick={() => setView("learning")}
        >
          Role learning pathways
        </button>
      </div>
      {view === "visual" ? <SecurityMindmapExperience /> : <RoleLearningMap />}
    </>
  );
}
