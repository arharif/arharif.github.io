import familySnapshot from "../data/sp80053-families.json" with { type: "json" };
import { standards as architectureModels } from "../data/standards.ts";
import type { StandardNode } from "../data/standards.ts";
export interface Standard {
  id: string;
  name: string;
  authority: string;
  edition: string;
  publicationDate: string;
  reviewStatus: string;
  scope: string;
  url: string;
  audience: string;
  architecture: string;
  scoping: string;
  scenario: string;
  limitations: string;
  workspace: string;
}
const records: [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
][] = [
  [
    "nist-csf-2",
    "NIST CSF 2.0",
    "NIST",
    "2.0",
    "2024-02-26",
    "https://doi.org/10.6028/NIST.CSWP.29",
    "Outcomes for managing cybersecurity risk across sectors.",
    "Six Functions → 22 Categories → 106 outcomes; Current and Target Profiles; separate governance/management Tiers.",
    "Select critical services, organisational boundaries, stakeholders and applicable outcomes. A profile is contextual, not certification.",
    "A payment service reviews supplier authority and recovery dependencies.",
    "/assess",
  ],
  [
    "nist-800-53",
    "NIST SP 800-53",
    "NIST",
    "Rev. 5 / release 5.2.0",
    "2025-08-27",
    "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final",
    "Security and privacy control catalogue for systems and organisations.",
    "20 control families, base controls and enhancements; organisation-defined parameters; separate implementation and assessment.",
    "Categorise confidentiality, integrity and availability based on information/system impacts, then select and tailor a starting baseline. Sector alone does not determine impact.",
    "A plant documents the availability impact of its monitoring system before tailoring controls.",
    "/standards/800-53",
  ],
  [
    "nist-800-53a",
    "NIST SP 800-53A",
    "NIST",
    "Rev. 5 / release 5.2.0",
    "2025-08-27",
    "https://csrc.nist.gov/pubs/sp/800/53/a/r5/final",
    "Assessment objectives and procedures for security/privacy controls.",
    "Control-linked determination statements and examine, interview and test methods.",
    "Select depth, coverage, objects and samples for the scoped assessment. Record evidence, findings and assessor limitations.",
    "An assessor samples supplier account removals and tests enforcement.",
    "/standards/800-53",
  ],
  [
    "nist-800-53b",
    "NIST SP 800-53B",
    "NIST",
    "2020 publication / 5.2.0 baseline representation",
    "2020-10",
    "https://csrc.nist.gov/pubs/sp/800/53/b/upd1/final",
    "Starting Low, Moderate, High security baselines and a separate privacy baseline.",
    "Baseline membership → tailoring → scoped selected controls and enhancements.",
    "Security baseline follows categorisation and authorisation context. Privacy applicability is evaluated separately, not selected by CIA impact.",
    "A bank documents information types and legal context before reviewing security/privacy selections.",
    "/standards/800-53",
  ],
  [
    "pf-1.0",
    "NIST Privacy Framework",
    "NIST",
    "1.0 — published",
    "2020-01-16",
    "https://www.nist.gov/privacy-framework/privacy-framework",
    "Managing privacy risk arising from data processing, including harms without a security breach.",
    "Identify-P, Govern-P, Control-P, Communicate-P, Protect-P; Core, Profiles and Implementation Tiers.",
    "Define processing purposes, data subjects, data actions, ecosystem roles and problematic data actions. Legal applicability remains a reviewed input.",
    "Excessive employee monitoring can harm workers even if stored securely.",
    "/simulate/privacy",
  ],
  [
    "pf-1.1-ipd",
    "Privacy Framework 1.1 draft track",
    "NIST",
    "1.1 initial public draft — not final",
    "2025-04-14",
    "https://www.nist.gov/privacy-framework/new-projects/privacy-framework-version-11",
    "Separate draft-learning track; never merged silently with 1.0 records.",
    "Draft revision with alignment work; this lab uses original educational processing/risk exercises, not a complete draft Core.",
    "Use only for draft comparison learning. Review publisher status before relying on a draft.",
    "Compare the same fictional processing activity with separately labelled draft findings.",
    "/simulate/privacy?edition=pf-1.1-ipd",
  ],
  [
    "iso-27001",
    "ISO/IEC 27001",
    "ISO/IEC",
    "2022; Amd 1:2024",
    "2022-10",
    "https://www.iso.org/standard/27001",
    "Information security management-system requirements.",
    "Management-system clauses; risk assessment/treatment; Statement of Applicability; Annex A reference controls.",
    "Define the ISMS boundary, interfaces and interested parties. Control selection follows risk treatment; consult licensed requirements.",
    "An industrial supplier defines plant/service boundaries and internal-audit independence.",
    "/labs/framework-explorer?framework=iso-27001",
  ],
  [
    "iso-27002",
    "ISO/IEC 27002",
    "ISO/IEC",
    "2022",
    "2022-02",
    "https://www.iso.org/standard/75652.html",
    "Information security control guidance supporting risk treatment.",
    "93 controls in organisational, people, physical and technological themes, with attributes.",
    "Select relevant guidance based on risk and context; 27002 is not an ISMS certification standard.",
    "A payment provider defines supplier-access controls and evidence tests.",
    "/implement?standard=iso-27002",
  ],
  [
    "pci-dss",
    "PCI DSS",
    "PCI SSC",
    "4.0.1",
    "2024-06",
    "https://www.pcisecuritystandards.org/document_library/",
    "Security requirements for payment account data.",
    "12 high-level requirements with detailed requirements and testing procedures in the official document.",
    "Determine the cardholder data environment, connected systems and third-party responsibilities with qualified scope review.",
    "Trace a merchant payment flow and responsibilities before choosing an assessment form.",
    "/labs/framework-explorer?framework=pci-dss",
  ],
  [
    "nist-ai-rmf",
    "NIST AI RMF",
    "NIST",
    "1.0",
    "2023-01-26",
    "https://www.nist.gov/itl/ai-risk-management-framework",
    "AI risk governance and trustworthy AI practices.",
    "Govern, Map, Measure and Manage; context-specific profiles and use-case risk.",
    "Define intended use, affected parties, evaluation conditions and release decisions.",
    "A factory re-evaluates an anomaly detector when telemetry changes.",
    "/labs/ai-experiment",
  ],
  [
    "iso-42001",
    "ISO/IEC 42001",
    "ISO/IEC",
    "2023",
    "2023-12",
    "https://www.iso.org/standard/81230.html",
    "AI management-system requirements.",
    "Management-system lifecycle, impact/risk processes and governance controls.",
    "Define roles, AI-system boundaries, interested parties and intended use; consult licensed text.",
    "An organisation sets approval gates for high-impact AI changes.",
    "/implement?standard=iso-42001",
  ],
  [
    "iso-27701",
    "ISO/IEC 27701",
    "ISO/IEC",
    "2025 — publisher edition review required",
    "2025",
    "https://www.iso.org/standard/iso-iec-27701",
    "Privacy information management-system reference learning.",
    "Privacy governance and accountable processing responsibilities; edition-specific licensed requirements.",
    "Confirm the applicable edition and its relationship to other management systems rather than assuming the older 2019 extension model.",
    "A processor defines customer responsibilities and deletion evidence.",
    "/simulate/privacy",
  ],
  [
    "iso-22301",
    "ISO 22301",
    "ISO",
    "2019; amendment applicability to be reviewed",
    "2019",
    "https://www.iso.org/standard/75106.html",
    "Business continuity management-system requirements.",
    "Business impact analysis, continuity strategy, plans, exercises and continual improvement.",
    "Determine critical activities and dependencies; validate recovery objectives with business owners.",
    "A manufacturer tests recovery dependencies before restarting a line.",
    "/implement?standard=iso-22301",
  ],
  [
    "gdpr",
    "GDPR",
    "European Union",
    "Regulation (EU) 2016/679",
    "2016-04-27; applicable 2018-05-25",
    "https://eur-lex.europa.eu/eli/reg/2016/679/oj",
    "EU personal-data protection law, with territorial and material scope conditions.",
    "Principles, lawful processing, individual rights, controller/processor duties and risk-based safeguards.",
    "Legal scope, lawful basis, transfers and Article 35 DPIA conditions require competent review. The simulator never declares conformity.",
    "A payment company evaluates profiling harms and rights handling.",
    "/simulate/privacy",
  ],
  [
    "dora",
    "DORA",
    "European Union",
    "Regulation (EU) 2022/2554",
    "2022-12-14; applicable 2025-01-17",
    "https://eur-lex.europa.eu/eli/reg/2022/2554/oj",
    "Digital operational resilience obligations for in-scope financial entities.",
    "ICT risk management, incident reporting, testing, third-party risk and information sharing.",
    "Determine entity applicability, relevant technical standards and contractual obligations with competent legal/regulatory review.",
    "A financial entity identifies critical ICT service dependencies and test evidence.",
    "/implement?standard=dora",
  ],
  [
    "cis-controls",
    "CIS Controls",
    "CIS",
    "v8.1",
    "2024-06",
    "https://www.cisecurity.org/controls/v8-1",
    "Prioritised cybersecurity safeguards.",
    "18 Controls; Implementation Groups guide selection by context and resources.",
    "Implementation Groups are not automatically certification or maturity levels; select safeguards using risk and enterprise characteristics.",
    "A small manufacturer starts with foundational asset and identity safeguards.",
    "/implement?standard=cis-controls",
  ],
];
const existingStandards: Standard[] = records.map(
  ([
    id,
    name,
    authority,
    edition,
    publicationDate,
    url,
    scope,
    architecture,
    scoping,
    scenario,
    workspace,
  ]) => ({
    id,
    name,
    authority,
    edition,
    publicationDate,
    url,
    scope,
    architecture,
    scoping,
    scenario,
    workspace,
    audience:
      "Business/risk owners, implementers, assessors and learners; applicability depends on the standard.",
    reviewStatus:
      id === "nist-800-53" || id === "nist-800-53a" || id === "nist-800-53b"
        ? "Official OSCAL snapshot imported 2026-11-20; hashes retained."
        : id === "nist-csf-2"
          ? "Official full Core snapshot retained; source and 106 IDs validated."
          : id === "pf-1.1-ipd"
            ? "Publisher page describes the initial public draft; kept separate from published 1.0."
            : "Publisher-linked educational metadata; consult the current authoritative document before operational use.",
    limitations:
      authority.includes("ISO") || authority === "PCI SSC"
        ? "Original educational summaries only. Restricted requirements are not reproduced; licensed/authorised documents and qualified review are required."
        : "Educational implementation guidance is distinguished from authoritative text. No certification or legal conclusion is produced.",
  }),
);
const additionalStandards: Standard[] = architectureModels
  .filter(
    (model) =>
      !existingStandards.some(
        (row) =>
          row.id === model.id ||
          (model.id === "nist-privacy" && row.id === "pf-1.0") ||
          (model.id === "cis-v8-1" && row.id === "cis-controls"),
      ),
  )
  .map((model) => ({
    id: model.id,
    name: model.title,
    authority: model.id.startsWith("iso")
      ? "ISO / IEC"
      : model.id.startsWith("nist")
        ? "NIST"
        : ["nis2", "gdpr", "dora", "eu-ai-act"].includes(model.id)
          ? "European Union"
          : "Publisher",
    edition: model.edition,
    publicationDate: "Current publication date verification pending",
    reviewStatus: model.verification,
    scope: model.purpose,
    url: model.source,
    audience: "Business and risk owners, implementers, assessors and learners.",
    architecture: model.nodes.map((node) => node.title).join(" → "),
    scoping: model.applicability,
    scenario:
      "Apply the selected architecture to a fictional payment or industrial service.",
    limitations:
      "Original educational architecture and selected-topic assessment. This is not a full requirements catalogue, conformity assessment or legal determination.",
    workspace:
      model.family === "Privacy & data protection"
        ? "/simulate/privacy"
        : "/implement?standard=" + model.id,
  }));
export const standards: Standard[] = [
  ...existingStandards,
  ...additionalStandards,
];
export function architectureFor(id: string) {
  if (id === "nist-800-53a") {
    const base = architectureModels.find(
      (model) => model.id === "nist-800-53",
    )!;
    const nodes: StandardNode[] = [
      {
        id: "scope",
        title: "Scope & assessment plan",
        objective:
          "Define the controls, assessment objectives, objects and assessment boundary.",
        implementation:
          "Choose depth and coverage, evidence sources and responsible assessors before collecting observations.",
        owner: "Assessment lead and system owner",
        evidence:
          "Approved assessment plan, selected objectives and sampling rationale",
        mistake: "Treating catalogue coverage as proof that controls work.",
      },
      {
        id: "examine",
        title: "Examine",
        objective:
          "Review relevant assessment objects against the selected determination statements.",
        implementation:
          "Inspect policy, configuration and dated operating records; record object provenance, period and exceptions.",
        owner: "Control assessor",
        evidence:
          "Referenced documents, configuration samples and examination results",
        mistake:
          "Accepting a policy document as evidence of consistent operation.",
      },
      {
        id: "interview",
        title: "Interview",
        objective:
          "Understand responsibilities and practice through structured discussions.",
        implementation:
          "Interview responsible staff against selected objectives, retaining questions and corroboration needs.",
        owner: "Control assessor and relevant personnel",
        evidence: "Interview record, role context and corroborating records",
        mistake:
          "Treating an interview assertion as independently tested operation.",
      },
      {
        id: "test",
        title: "Test",
        objective:
          "Exercise selected mechanisms or activities under a controlled assessment plan.",
        implementation:
          "Define expected outcomes and authorised safe procedures, preserve results and document limitations.",
        owner: "Authorised assessor and operational owner",
        evidence: "Test procedure, observed results, timestamps and scope",
        mistake:
          "Performing disruptive tests without authority or operational coordination.",
      },
      {
        id: "findings",
        title: "Findings & follow-up",
        objective:
          "Record determination results and communicate deficiencies with uncertainty.",
        implementation:
          "Reconcile observations to objectives, assign actions and agree follow-up assessment activities.",
        owner: "Assessment lead and accountable risk owner",
        evidence:
          "Assessment report, deficiency register and remediation tracking",
        mistake:
          "Confusing remediation progress with a validated control outcome.",
      },
    ];
    return {
      ...base,
      id,
      title: "NIST SP 800-53A",
      kind: "Guidance" as const,
      layout: "flow" as const,
      nodes,
    };
  }
  if (id === "nist-800-53") {
    const base = architectureModels.find(
      (model) => model.id === "nist-800-53",
    )!;
    return {
      ...base,
      nodes: familySnapshot.families.map((family) => {
        const detailed = base.nodes.find((node) => node.id === family.id);
        return detailed
          ? { ...detailed, children: family.examples }
          : {
              id: family.id,
              title: family.title,
              objective: `Understand and tailor the ${family.title.toLowerCase()} control family.`,
              implementation: `Review the official ${family.id} base controls and enhancements in the scoped system. Select, tailor and assign implementation and assessment responsibilities.`,
              owner: "System owner and relevant control owners",
              evidence:
                "Tailoring rationale, implementation records and scoped examine/interview/test results",
              mistake:
                "Treating a family selection or baseline as proof of effective control operation.",
              children: family.examples,
            };
      }),
    };
  }
  const model = architectureModels.find(
    (model) =>
      model.id ===
      (id === "cis-controls"
        ? "cis-v8-1"
        : id === "pf-1.0" || id === "pf-1.1-ipd"
          ? "nist-privacy"
          : id),
  );
  if (id === "pf-1.0" && model) {
    const privacyFunction = (
      id: string,
      title: string,
      objective: string,
      implementation: string,
      evidence: string,
    ): StandardNode => ({
      id,
      title,
      objective,
      implementation,
      evidence,
      owner: "Accountable privacy and processing owners",
      mistake:
        "Confusing privacy risk to individuals with information-security risk alone.",
    });
    return {
      ...model,
      layout: "pillars" as const,
      nodes: [
        privacyFunction(
          "ID-P",
          "Identify-P",
          "Understand processing and the privacy risks it can create for individuals.",
          "Map processing purposes, data actions, ecosystem roles and potential problematic data actions.",
          "Processing inventory, ecosystem map and privacy risk assessment",
        ),
        privacyFunction(
          "GV-P",
          "Govern-P",
          "Establish privacy values, policies, accountability and review.",
          "Define risk-management strategy, roles, policy and monitoring with legal applicability reviewed separately.",
          "Privacy strategy, accountable roles, policy and review records",
        ),
        privacyFunction(
          "CT-P",
          "Control-P",
          "Enable appropriate management of data processing and its granularity.",
          "Review data management and disassociated processing needs within the declared purpose and context.",
          "Processing controls, minimisation decisions and data-management records",
        ),
        privacyFunction(
          "CM-P",
          "Communicate-P",
          "Support reliable understanding of processing and its risks.",
          "Review transparency mechanisms and communication with individuals, partners and accountable stakeholders.",
          "Notices, communication decisions and stakeholder feedback",
        ),
        privacyFunction(
          "PR-P",
          "Protect-P",
          "Manage privacy risks arising from cybersecurity events.",
          "Connect data protection needs to access control, safeguards, maintenance and protective technology.",
          "Access reviews, safeguarding records and scoped protection tests",
        ),
      ],
    };
  }
  return model;
}
export const stageGuidance = [
  {
    id: "FRAME",
    title: "Scope & mobilise",
    activities:
      "Define mission, boundaries, interested parties, legal context, authority and project governance.",
    evidence: "Approved scope, charter and accountable RACI.",
  },
  {
    id: "DIAGNOSE",
    title: "Understand current state",
    activities:
      "Inventory services/information, examine current controls, identify risks and collect scoped evidence.",
    evidence:
      "Current Profile, inventory, risk criteria and evidence requests.",
  },
  {
    id: "DESIGN",
    title: "Define target outcomes",
    activities:
      "Choose target outcomes, select/tailor controls and record gaps and assumptions.",
    evidence: "Target Profile, tailoring decisions and gap register.",
  },
  {
    id: "PLAN",
    title: "Prioritise & resource",
    activities:
      "Assign owners, effort/rates, dependencies, milestones and realistic dates.",
    evidence:
      "Task register, resource plan, RAID, budget assumptions and baseline.",
  },
  {
    id: "IMPLEMENT",
    title: "Deliver changes",
    activities:
      "Implement policies, processes and technical safeguards under change authority.",
    evidence:
      "Approved changes, configuration/policy records and progress updates.",
  },
  {
    id: "ASSURE",
    title: "Test & validate",
    activities:
      "Define examine/interview/test procedures, sample operation and record independent findings.",
    evidence: "Validation plan, test results, reviewer and unresolved POA&M.",
  },
  {
    id: "EMBED",
    title: "Monitor & improve",
    activities:
      "Set review cadence, risk-owner decisions, measurement and continual-improvement responsibilities.",
    evidence:
      "Management reviews, acceptance expiry, monitoring and improvement backlog.",
  },
] as const;
