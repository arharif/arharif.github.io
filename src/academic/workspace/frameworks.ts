import catalog from "../data/csf-catalog.json";
import {
  controls as existing,
  frameworkSources as sources,
} from "../data/controls";
import type { FrameworkControl } from "../data/types";
export const frameworkSources = [
  ...sources.map((s) =>
    s.id === "nist-csf-2"
      ? {
          ...s,
          limitation:
            "Full Core: 6 Functions, 22 Categories, 106 outcomes. Assessment statuses are learner assertions, not certification. Current/Target Profiles and Tiers require organisational context.",
        }
      : s,
  ),
  {
    id: "pci-dss",
    name: "PCI DSS",
    publisher: "PCI Security Standards Council",
    edition: "v4.0.1, June 2024",
    url: "https://www.pcisecuritystandards.org/document_library/",
    scope: "Payment account data security",
    limitation:
      "12 high-level requirement summaries for education. This is not the full testing procedure catalogue, a SAQ, ROC or scope determination.",
  },
];
export const csfFunctions = catalog.functions;
const context: Record<
  string,
  { evidence: string; gap: string; business: string }
> = {
  GV: {
    evidence:
      "Approved risk strategy, responsibility matrix, policy review record, supplier oversight minutes and risk acceptance authority",
    gap: "Risk decisions lack an accountable owner or communicated policy",
    business:
      "A bank committee records payment-risk appetite and delegated acceptance authority. A plant includes operations and safety leadership in cyber risk governance.",
  },
  ID: {
    evidence:
      "Asset and dependency inventory, discovery reconciliation, scoped risk assessment and improvement log",
    gap: "Critical services, dependencies or vulnerabilities are missing from the risk view",
    business:
      "Reconcile a bank payment API or industrial gateway with its owner, supplier and recovery dependencies.",
  },
  PR: {
    evidence:
      "Access review samples, entitlement approvals, configuration records, training records and restore test results",
    gap: "A documented safeguard lacks implementation or operating evidence",
    business:
      "Time-bound supplier access protects payment routing and limits unauthorised industrial maintenance.",
  },
  DE: {
    evidence:
      "Time-aligned telemetry, coverage map, alert logic, investigation tickets and escalation tests",
    gap: "Telemetry is collected without review, correlation or a response owner",
    business:
      "Correlate supplier identity events with payment configuration changes or unusual OT gateway sessions.",
  },
  RS: {
    evidence:
      "Incident plan, triage decisions, preserved evidence, containment approvals and communication records",
    gap: "Response decisions lack evidence, authority or business coordination",
    business:
      "A bank coordinates fraud operations; a plant obtains operations approval before containment affects production.",
  },
  RC: {
    evidence:
      "Recovery criteria, trusted restoration samples, reconciliation results and stakeholder communication records",
    gap: "Recovery was declared without validating service integrity and dependencies",
    business:
      "A bank reconciles settlement after restoration. A factory validates safe operating conditions before restarting a line.",
  },
};
export const controls: FrameworkControl[] = [
  ...catalog.functions.flatMap((fn) =>
    fn.categories.flatMap((cat) =>
      cat.outcomes.map((outcome) => {
        const old = existing.find((c) => c.id === outcome.id);
        const ctx = context[fn.id];
        return {
          id: outcome.id,
          framework: "nist-csf-2",
          path: [fn.title, `${cat.id} · ${cat.title}`],
          title:
            old?.title ||
            outcome.text
              .replace(/<[^>]+>/g, "")
              .replace(/^(.{1,105})\s[\s\S]*$/, "$1…"),
          explanation: outcome.text.replace(/<[^>]+>/g, ""),
          objective: fn.text,
          implementation:
            outcome.guidance.map((g) => g.replace(/<[^>]+>/g, "")).join("\n") ||
            ctx.business,
          roles:
            old?.roles ||
            "Accountable risk owner, control owner and independent assessor",
          assets:
            "Define the service boundary, dependencies, population and assessment period.",
          methods:
            "Examine records, interview the accountable owner and test a risk-based sample. Record exceptions and limitations; these examples do not prescribe an assessment result.",
          evidence: old?.evidence || ctx.evidence,
          gap: old?.gap || ctx.gap,
          risk: ctx.business,
          source: "https://doi.org/10.6028/NIST.CSWP.29",
          lesson: "risk-assessment",
        };
      }),
    ),
  ),
  ...existing.filter((c) => c.framework !== "nist-csf-2"),
  ...[
    [
      "1",
      "Network security controls",
      "Restrict and review connectivity to the cardholder data environment.",
      "Network diagrams, rule reviews and configuration test samples",
    ],
    [
      "2",
      "Secure configurations",
      "Apply and maintain secure system configurations.",
      "Configuration standards, default-account checks and configuration samples",
    ],
    [
      "3",
      "Protect stored account data",
      "Minimise retention and protect stored account data under defined cryptographic and access controls.",
      "Retention schedule, data discovery, cryptographic key-management records",
    ],
    [
      "4",
      "Protect data in transit",
      "Protect cardholder data with strong cryptography during transmission over open, public networks.",
      "Protocol settings, certificate records and transmission tests",
    ],
    [
      "5",
      "Protect against malicious software",
      "Address malware threats across in-scope systems.",
      "Malware coverage, update logs and documented applicability evaluations",
    ],
    [
      "6",
      "Secure systems and software",
      "Maintain vulnerability management and secure development practices.",
      "Patch records, change approvals and application security tests",
    ],
    [
      "7",
      "Restrict access by business need",
      "Limit system and account-data access to legitimate business need.",
      "Role definitions, approvals and entitlement reviews",
    ],
    [
      "8",
      "Identify users and authenticate access",
      "Use accountable identities and strong authentication for system access.",
      "Identity inventory, MFA configuration and authentication test samples",
    ],
    [
      "9",
      "Restrict physical access",
      "Protect physical access to cardholder data and associated media.",
      "Visitor logs, media inventories and physical access samples",
    ],
    [
      "10",
      "Log and monitor access",
      "Collect and review logs for in-scope systems and cardholder data access.",
      "Log coverage, review tickets and retention configuration",
    ],
    [
      "11",
      "Test security regularly",
      "Test network and system security and address identified weaknesses.",
      "Authorised scan and test reports, remediation and retest records",
    ],
    [
      "12",
      "Support security with policies",
      "Maintain organisational policy, responsibilities, risk processes and incident readiness.",
      "Policy approval, responsibility records and incident exercises",
    ],
  ].map(
    ([id, title, explanation, evidence]): FrameworkControl => ({
      id: `PCI-${id}`,
      framework: "pci-dss",
      path: ["PCI DSS requirements", `Requirement ${id}`],
      title,
      explanation,
      objective: "Protect payment account data within a validated scope.",
      implementation: `Define an accountable owner and test ${title.toLowerCase()} across the scoped payment service.`,
      roles:
        "Merchant or service-provider control owner, assessor and payment-data risk owner",
      assets:
        "Cardholder data environment, connected systems and relevant third-party services",
      methods:
        "Use the official v4.0.1 requirement and testing procedures; record scope, samples and exceptions. High-level teaching summaries do not determine compliance.",
      evidence,
      gap: "Scope, implementation or operating evidence is incomplete",
      risk: "Payment data compromise, fraud and contractual exposure",
      source: "https://www.pcisecuritystandards.org/document_library/",
      lesson: "risk-assessment",
    }),
  ),
];
export function frameworkGroups(id: string) {
  return [
    ...new Set(
      controls.filter((c) => c.framework === id).map((c) => c.path[0]),
    ),
  ];
}
export function functionBusiness(id: string) {
  return (
    context[id]?.business ||
    "Define scope, accountable ownership, implementation evidence and review authority before making an assurance claim."
  );
}
