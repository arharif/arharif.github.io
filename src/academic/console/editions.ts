export const frameworkIds = ["nist-csf-2", "iso-27001", "pci-dss", "nist-800-53", "dora", "gdpr", "eu-ai-act"] as const;
export type Framework = (typeof frameworkIds)[number];
export const names: Record<Framework, string> = {
  "nist-csf-2": "NIST CSF 2.0",
  "iso-27001": "ISO/IEC 27001",
  "pci-dss": "PCI DSS",
  "nist-800-53": "NIST SP 800-53",
  dora: "DORA",
  gdpr: "GDPR",
  "eu-ai-act": "EU AI Act",
};
export const primaryStandards = ["nist-800-53", "dora", "gdpr", "eu-ai-act"] as const;
export const moreStandards = ["nist-csf-2", "iso-27001", "pci-dss"] as const;

export const editions = {
  "nist-800-53": {
    name: "Security and Privacy Controls for Information Systems and Organizations",
    edition: "Revision 5 · Release 5.2.0",
    description: "Select, tailor and assess security and privacy controls for the systems your organisation depends on.",
    category: "Control catalogue",
    application: "NIST issued Release 5.2.0 on 27 August 2025, including SA-15(13), SA-24 and SI-2(7), with corresponding assessment procedures in SP 800-53A. Check SP 800-53B for baseline selection, then tailor to the system and its mandates.",
    scenario: "A research platform treats control tailoring like a building plan. The base specification gives the design options, while the approved plan records what was selected and how the finished work will be inspected.",
    sources: [
      ["NIST SP 800-53 and Release 5.2.0", "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final"],
      ["NIST SP 800-53A assessment procedures", "https://csrc.nist.gov/pubs/sp/800/53/a/r5/final"],
      ["NIST SP 800-53B control baselines", "https://csrc.nist.gov/pubs/sp/800/53/b/upd1/final"],
      ["NIST machine-readable reference data", "https://csrc.nist.gov/projects/risk-management/sp800-53-controls/downloads"],
    ],
  },
  dora: {
    name: "Digital Operational Resilience Act",
    edition: "Regulation (EU) 2022/2554",
    description: "Connect ICT risk, incident reporting, resilience testing and supplier oversight in financial services.",
    category: "EU regulation",
    application: "DORA applies from 17 January 2025. Start with the entities and exclusions in Article 2, the simplified ICT risk regime in Article 16 and the applicable delegated and implementing acts.",
    scenario: "A credit institution loses its outsourced settlement link. The incident procedure, supplier register and recovery test work like the same flight checklist used by different teams: each establishes a handover and clear decision authority.",
    sources: [
      ["DORA legal text", "https://eur-lex.europa.eu/eli/reg/2022/2554/oj"],
      ["ICT risk management RTS · 2024/1774", "https://eur-lex.europa.eu/eli/reg_del/2024/1774/oj"],
      ["Incident classification RTS · 2024/1772", "https://eur-lex.europa.eu/eli/reg_del/2024/1772/oj"],
      ["Incident reporting content and timing RTS · 2025/301", "https://eur-lex.europa.eu/eli/reg_del/2025/301/oj"],
      ["Incident reporting forms ITS · 2025/302", "https://eur-lex.europa.eu/eli/reg_impl/2025/302/oj"],
      ["Register of information ITS · 2024/2956", "https://eur-lex.europa.eu/eli/reg_impl/2024/2956/oj"],
      ["Threat-led penetration testing RTS · 2025/1190", "https://eur-lex.europa.eu/eli/reg_del/2025/1190/oj"],
      ["ICT subcontracting RTS · 2025/532", "https://eur-lex.europa.eu/eli/reg_del/2025/532/oj"],
      ["Contractual risk policy RTS · 2024/1773", "https://eur-lex.europa.eu/eli/reg_del/2024/1773/oj"],
      ["Critical provider designation criteria · 2024/1502", "https://eur-lex.europa.eu/eli/reg_del/2024/1502/oj"],
      ["Oversight conditions RTS · 2025/295", "https://eur-lex.europa.eu/eli/reg_del/2025/295/oj"],
      ["Joint Examination Teams RTS · 2025/420", "https://eur-lex.europa.eu/eli/reg_del/2025/420/oj"],
    ],
  },
  gdpr: {
    name: "General Data Protection Regulation",
    edition: "Regulation (EU) 2016/679",
    description: "Understand lawful processing, individuals’ rights, privacy risk and accountability.",
    category: "EU regulation",
    application: "The GDPR has applied since 25 May 2018. Articles 2 and 3 govern material and territorial scope. Regulation (EU) 2025/2518 adds procedural rules for cross-border enforcement and applies from 2 April 2027.",
    scenario: "A customer support team wants to reuse ticket transcripts for analytics. Treat the processing record like a route map: every stop identifies a purpose, a lawful basis, a responsible party and a point where the information should be deleted.",
    sources: [
      ["GDPR legal text and document history", "https://eur-lex.europa.eu/eli/reg/2016/679/oj"],
      ["Cross-border enforcement procedure · 2025/2518", "https://eur-lex.europa.eu/eli/reg/2025/2518/oj"],
    ],
  },
  "eu-ai-act": {
    name: "Artificial Intelligence Act",
    edition: "Regulation (EU) 2024/1689 · amended 2026",
    description: "Classify AI uses, identify provider and deployer duties and build accountable oversight.",
    category: "EU regulation",
    application: "Most prohibitions and AI literacy apply from 2 February 2025. General-purpose AI obligations began applying on 2 August 2025. Models already on the market before that date have until 2 August 2027. General application began on 2 August 2026. Regulation (EU) 2026/1744 sets 2 December 2027 for Annex III high-risk systems and 2 August 2028 for high-risk AI in regulated products. New Article 5 prohibitions on generating non-consensual intimate material and child sexual abuse material apply from 2 December 2026. Check Article 113 and the relevant transitional provisions for exceptions.",
    scenario: "An employer introduces AI-assisted candidate ranking. A safety case approach asks what the system does, who may intervene, what evidence shows the safeguards work and which duties the provider and deployer each hold.",
    sources: [
      ["Consolidated Artificial Intelligence Act", "https://eur-lex.europa.eu/eli/reg/2024/1689/2026-07-27/eng"],
      ["Digital Omnibus on AI · 2026/1744", "https://eur-lex.europa.eu/eli/reg/2026/1744/oj"],
      ["European Commission application and enforcement timeline", "https://digital-strategy.ec.europa.eu/en/policies/enforcement-ai-act"],
    ],
  },
  "nist-csf-2": {
    name: "The NIST Cybersecurity Framework",
    edition: "CSF 2.0 · February 2024",
    description: "Map cybersecurity outcomes and use Current and Target Profiles to prioritise improvements.",
    category: "Framework",
    application: "Published 26 February 2024. Organisations of any size or sector can apply it. Profiles describe selected outcomes and Tiers characterise the rigour of risk governance and management practices.",
    scenario: "A manufacturer maps the gap between current safeguards and target outcomes for production telemetry. A Profile works like a service map with two overlays: today’s capabilities and the future operating state.",
    sources: [["NIST CSF 2.0 publication", "https://doi.org/10.6028/NIST.CSWP.29"]],
  },
  "iso-27001": {
    name: "Information security, cybersecurity and privacy protection — Information security management systems — Requirements",
    edition: "ISO/IEC 27001:2022 · Amd 1:2024",
    description: "Build and improve a risk-based information security management system.",
    category: "Management system standard",
    application: "The third edition was published in October 2022. Amendment 1:2024 adds climate change considerations to organisational context and interested parties. Use the licensed text when determining conformity.",
    scenario: "An energy company operates an ISMS for field services. Treat it like an operating system for security management: risk decisions, controls and assurance form a cycle of continuous improvement.",
    sources: [
      ["ISO/IEC 27001:2022", "https://www.iso.org/standard/27001"],
      ["ISO/IEC 27001 Amendment 1:2024", "https://www.iso.org/standard/88435.html"],
      ["ISO/IEC 27002:2022 implementation guidance", "https://www.iso.org/standard/75652.html"],
    ],
  },
  "pci-dss": {
    name: "Payment Card Industry Data Security Standard",
    edition: "PCI DSS v4.0.1",
    description: "Scope and protect the systems that handle payment account data or can affect its security.",
    category: "Industry standard",
    application: "PCI SSC published v4.0.1 in June 2024. Future-dated requirements took effect on 31 March 2025, subject to applicability. Confirm the validation pathway with the responsible acquirer or payment brand.",
    scenario: "An online merchant traces checkout traffic through its payment providers and internal services. Scoping works like tracing a protected circuit: every connected component that can influence its security needs a deliberate scope decision.",
    sources: [
      ["PCI SSC document library", "https://www.pcisecuritystandards.org/document_library/"],
      ["PCI SSC v4.0.1 release notes", "https://blog.pcisecuritystandards.org/just-published-pci-dss-v4-0-1"],
      ["PCI SSC current version consultation", "https://blog.pcisecuritystandards.org/request-for-comments-pci-data-security-standard-pci-dss-v4-0-1"],
    ],
  },
} satisfies Record<string, {name:string; edition:string; description:string; category:string; application:string; scenario:string; sources:[string,string][]}>;

const checked = "2026-11-27";
const nistReuse = "NIST publication and OSCAL data. The publisher’s publication is authoritative. Evidence and recommendations labelled as examples are X1 guidance.";
const lawReuse = "Official Journal and consolidated references via EUR-Lex. X1 uses article identifiers and original educational summaries. Check authentic acts, corrigenda and applicable national measures.";
export const frameworkMetadata: Record<Framework, { verified: string; reuse: string; focus: string; scope: string; plan: [string, string, string]; risk: string }> = {
  "nist-800-53": { verified: checked, reuse: nistReuse, focus: "System categorisation, baseline selection and documented tailoring", scope: "System boundary, information types, impact categorisation, overlays and inherited controls", plan: ["Categorise the system and approve the baseline", "Specify selected and inherited safeguards", "Apply SP 800-53A procedures and update the POA&M"], risk: "Consider confidentiality, integrity and availability impacts, threat likelihood, inherited safeguards and residual exposure within the system boundary." },
  "nist-csf-2": { verified: checked, reuse: nistReuse, focus: "Current and Target Profiles", scope: "Organisational scope, stakeholders, risk appetite and relevant outcomes", plan: ["Define the Current Profile scope", "Agree a risk-prioritised Target Profile", "Verify outcomes and refresh the Current Profile"], risk: "Use business and cybersecurity objectives to judge the consequence of an outcome gap. CSF Tiers describe governance practices and are recorded separately." },
  "iso-27001": { verified: checked, reuse: "ISO/IEC retains copyright. X1 uses references and original summaries. Consult the licensed text for requirements, Annex A and conformity criteria.", focus: "ISMS risk treatment and Statement of Applicability", scope: "ISMS boundaries, relevant external and internal issues and interested parties, including applicable climate considerations", plan: ["Set ISMS scope and risk acceptance criteria", "Agree treatments and approve the Statement of Applicability", "Audit treatment evidence and obtain management review"], risk: "Use your approved ISMS risk criteria and document risk owners, treatment choices and residual risk acceptance. The X1 risk matrix is an optional local prioritisation method." },
  "pci-dss": { verified: checked, reuse: "PCI SSC retains copyright. X1 uses identifiers, brief topic summaries and original examples. Consult the official v4.0.1 document for requirements, applicability and testing procedures.", focus: "Payment environment scope, applicability and operating evidence", scope: "Account data flows, connected or security-impacting components, merchant or service-provider role and authorised validation path", plan: ["Validate cardholder data environment boundaries", "Agree requirement applicability and validation approach", "Collect test evidence for the applicable validation path"], risk: "Assess exposure of payment account data and dependencies. Use a targeted risk analysis only where the applicable PCI DSS requirement calls for it." },
  dora: { verified: checked, reuse: lawReuse, focus: "ICT resilience duties and applicable RTS/ITS", scope: "Article 2 entity type, Article 16 simplified regime, critical functions and any authority TLPT identification", plan: ["Confirm entity scope and map critical functions", "Agree ICT resilience, reporting and supplier remediation", "Validate recovery and reporting evidence"], risk: "Estimate disruption to critical or important functions and concentration exposure. Determine major ICT incident classification from the RTS criteria separately." },
  gdpr: { verified: checked, reuse: lawReuse, focus: "Role-specific obligations, RoPA and DPIA", scope: "Controller or processor roles, processing purposes, data categories, territorial scope and transfer destinations", plan: ["Identify processing, roles and lawful grounds", "Document safeguards and resolve DPIA decisions", "Review residual risks to individuals and record consultation where required"], risk: "Assess likelihood and severity of harm to individuals’ rights and freedoms. A local score cannot decide whether a DPIA, consultation or breach notification is legally required." },
  "eu-ai-act": { verified: checked, reuse: lawReuse, focus: "AI use classification and obligations by actor", scope: "Intended purpose, provider or deployer roles, applicable annex, high-risk classification and date of application", plan: ["Classify the intended AI use and identify responsible actors", "Agree actor-specific safeguards and documentation", "Verify oversight and applicable conformity or monitoring evidence"], risk: "Consider harms to health, safety and fundamental rights, foreseeable misuse and human oversight. Determine the Act’s legal classification separately." },
};
