import type { Framework } from "./editions";
type Step = readonly [title: string, guidance: string, evidence: string];
type Lesson = {
  structure: string;
  terms: string;
  example: string;
  steps: readonly Step[];
};
export const lessons: Record<Framework, Lesson> = {
  "nist-800-53": {
    structure: "20 families, base controls and enhancements · SP 800-53A assessments · SP 800-53B baselines",
    terms: "Control, enhancement, security baseline, separate privacy baseline, overlay, inherited control, POA&M",
    example: "For a research system, the Moderate baseline is a starting inventory. Add the overlay controls your data and suppliers require, then record who implements and tests them.",
    steps: [
      ["Categorise", "Record system boundaries, information types and potential confidentiality, integrity and availability impacts.", "System boundary, impact rationale and responsible official"],
      ["Select and tailor", "Select an applicable starting baseline, review privacy separately, record inherited controls, and justify additions or exclusions.", "Baseline, overlay, control decisions and system security plan"],
      ["Assess", "Select applicable SP 800-53A objectives and scope examine, interview and test procedures to the system and assessment period.", "Assessment plan, evidence, results and limitations"],
      ["Remediate and monitor", "Track unresolved weaknesses in a POA&M, agree owners and due dates, and retest as systems and threats change.", "POA&M, retests and monitoring records"],
    ],
  },
  "nist-csf-2": {
    structure: "Six Functions · 22 Categories · 106 Subcategories · Profiles and Tiers",
    terms: "Core outcomes, Current Profile, Target Profile, Tiers, organisational context",
    example: "A plant maps weak vendor access to a selected Protect outcome and prioritises it against the service’s risk appetite and production impact.",
    steps: [
      ["Govern", "Set risk appetite, roles, supply chain responsibilities and review triggers.", "Governance charter, risk strategy and accountabilities"],
      ["Identify", "Inventory critical assets and dependencies. Record present capability in the Current Profile.", "Asset inventory, dependencies and Current Profile"],
      ["Protect", "Choose target safeguards that reflect the risk and operational constraints.", "Target Profile and approved safeguard changes"],
      ["Detect", "Monitor meaningful events and test alert ownership and escalation.", "Coverage map and examined alert records"],
      ["Respond", "Decide, contain, communicate and document actions under accountable authority.", "Incident decision log and coordination records"],
      ["Recover", "Confirm restoration and incorporate lessons in the next Profile revision.", "Restore evidence and a dated Profile comparison"],
    ],
  },
  "nist-ai-rmf": {
    structure: "Four Functions · 19 Categories · 72 Subcategories · separate voluntary Playbook",
    terms: "AI actor, context of use, trustworthiness, test, evaluation, verification and validation, Profile",
    example: "A payment fraud model improves detection but disproportionately flags one merchant cohort. Compare error rates, uncertainty and effects on merchants before changing the threshold or shipping.",
    steps: [
      ["GOVERN", "Set risk tolerance, accountable AI roles, review cadence and supplier governance. Apply GOVERN across the lifecycle.", "Ownership register, risk limits and release authority"],
      ["MAP", "Record intended purpose, users, context, affected groups, dependencies and reasonably foreseeable harms.", "Use-case inventory, data lineage and impact hypotheses"],
      ["MEASURE", "Test reliability, subgroup impact, privacy, explanations and uncertainty against criteria. Check results after deployment.", "Dated evaluation sets, metrics, thresholds and limitations"],
      ["MANAGE", "Prioritise residual risk, specify mitigations and rollback criteria, and monitor material changes.", "Treatment decisions, monitoring indicators and incident runbook"],
    ],
  },
  "iso-27001": {
    structure: "ISMS clauses 4–10 · four Annex A themes · 93 reference controls",
    terms: "ISMS, risk criteria, risk treatment, Statement of Applicability, internal audit, corrective action",
    example: "An energy company scopes its field-service systems, selects necessary supplier controls, then checks Annex A for omissions before approving the SoA.",
    steps: [
      ["Scope and lead", "Define boundaries and dependencies, interested parties and leadership accountability. Record applicable context issues.", "ISMS scope, security policy and context review"],
      ["Assess and treat", "Apply repeatable risk criteria. Identify necessary controls, compare with Annex A and record inclusion, implementation and exclusion rationale.", "Risk register, treatment plan and SoA"],
      ["Operate and evaluate", "Implement treatments and sample operating effectiveness through monitoring, audits and management review.", "Operating records, audit results and management minutes"],
      ["Improve", "Investigate nonconformities, assign corrective actions and verify they addressed the cause.", "Corrective actions, reassessment and improvement evidence"],
    ],
  },
  "pci-dss": {
    structure: "12 principal requirements · 63 objectives · 250 detailed identifiers in Requirements 1–12",
    terms: "PAN, sensitive authentication data, cardholder data environment, security-impacting system, SAQ, ROC",
    example: "An e-commerce merchant considers its payment provider and the scripts delivered to browsers. Outsourcing payment processing changes scope and responsibilities, so the merchant documents who secures each remaining component.",
    steps: [
      ["Trace payment data", "Map where payment account data is stored, processed or transmitted, plus systems that can affect its security.", "Account-data diagrams and scoped system inventory"],
      ["Allocate responsibility", "Review merchant and service-provider duties and applicable notes. Confirm the validation path with the receiving entity.", "Contract responsibility matrix and validation scope"],
      ["Verify safeguards", "Use the published testing procedures and sample configurations, events and evidence across the scoped population.", "Evidence and test results matched to exact identifiers"],
      ["Resolve and validate", "Correct gaps, retest, and use the approved validation materials for the selected path.", "Remediation register, retests, SAQ or ROC evidence"],
    ],
  },
  dora: {
    structure: "Nine chapters · 64 articles · applicable ICT resilience RTS and ITS",
    terms: "Critical or important function, ICT-related incident, register of information, TLPT, simplified ICT framework",
    example: "A regulated institution assesses a settlement provider outage. It classifies the event separately from its internal risk score and escalates under the applicable reporting procedure.",
    steps: [
      ["Confirm scope", "Identify the financial entity and documented obligations, including whether the simplified regime applies.", "Entity classification and legal applicability decision"],
      ["Map and protect", "Map critical functions to assets and ICT providers, contracts, dependencies and exit options.", "Service inventory, register of information and contract review"],
      ["Classify and report", "Apply applicable classification thresholds and report qualifying incidents using the current channels, timing and templates.", "Incident chronology, classification and submissions"],
      ["Exercise and recover", "Plan risk-based tests, check competent-authority TLPT designation as relevant and retest corrective actions.", "Test programme, recovery results and remediation evidence"],
    ],
  },
  gdpr: {
    structure: "11 chapters · 99 articles · principles, rights, controller and processor duties",
    terms: "Controller, processor, lawful basis, RoPA, DPIA, supervisory authority, rights and freedoms",
    example: "A support team proposes secondary analytics using ticket transcripts. Map the new purpose and lawful basis, check notices and retention, and assess consequences for individuals.",
    steps: [
      ["Map processing", "Identify jurisdiction, role, purposes, data, recipients, transfers and retention.", "RoPA, data flow and applicable contracts"],
      ["Establish safeguards", "Record lawful grounds, required notices and how applicable rights are fulfilled.", "Purpose and basis register, notices and request records"],
      ["Screen for DPIA", "Determine likely high risk before processing and document residual risk and consultation decisions when applicable.", "DPIA screening, signed DPIA and consultation evidence"],
      ["Respond and review", "Assess breach notification and individual communication thresholds separately and retain records.", "Risk rationale, incident chronology and notifications"],
    ],
  },
  "eu-ai-act": {
    structure: "13 chapters · consolidated article index · Annexes I–XIII and transition dates",
    terms: "Provider, deployer, intended purpose, prohibited practice, high risk, GPAI and systemic risk",
    example: "A recruitment deployer records intended use, role and relevant Annex III reference, determines the applicable date, and documents oversight and the conditions for an impact assessment.",
    steps: [
      ["Identify actor and use", "Capture the intended purpose and determine relevant roles, territorial scope and transition rules.", "System inventory, actor mapping and legal assessment"],
      ["Screen and classify", "Check Article 5 and the applicable Article 6 pathways, annexes and exceptions.", "Classification rationale and documented safeguards"],
      ["Apply role-specific duties", "Identify required technical records, oversight, transparency and any conformity or impact assessment duty.", "Technical file, instructions, oversight and risk records"],
      ["Monitor changes", "Track material changes, incidents, monitoring and dates that affect the applicable obligations.", "Change history, monitoring reports and response actions"],
    ],
  },
};
