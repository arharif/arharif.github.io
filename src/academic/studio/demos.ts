import type { CaseId, AIConfiguration } from "../data/types";
import { scenarios } from "../data/cases";
import { blankRisk } from "../workspace/risk";
import { incidentFeedback, metrics, predictions } from "../utils/engines";
import { assessmentItems } from "./assessmentCatalog";
import { addDays, schedule } from "./engines";
import {
  newFinding,
  today,
  type ProcessingActivity,
  type PrivacyRisk,
  type Task,
} from "./model";
import { createWorkspace, type WorkspaceData } from "./persistence";
import { generateImplementation } from "./planning";
import { standards } from "./standards";

export function createDemo(
  caseId: CaseId,
  id: string,
  date = today(),
): WorkspaceData {
  const scenario = scenarios.find((row) => row.id === caseId)!;
  const data = createWorkspace(caseId, date);
  const projectStart = addDays(date, -36);
  const standard = standards.find((row) => row.id === id);
  const linkedId = `DEMO-${caseId.toUpperCase()}-01`;
  const riskExamples = [
    [
      scenario.asset,
      "Supplier account misuse",
      "Missing periodic entitlement review",
      5,
      5,
      4,
      5,
      "Identity assurance",
      28,
    ],
    [
      "Payment service recovery",
      "Service outage",
      "Restore dependencies remain untested",
      4,
      5,
      3,
      5,
      "Service resilience",
      54,
    ],
    [
      "Operations telemetry",
      "Delayed escalation",
      "Some events lack a responder",
      4,
      4,
      3,
      3,
      "Security operations",
      16,
    ],
    [
      "Evidence archive",
      "Loss of audit trail",
      "Manual retention checks",
      3,
      3,
      2,
      2,
      "Governance",
      8,
    ],
    [
      "Release approvals",
      "Unreviewed change",
      "Owner sign-off is inconsistent",
      3,
      4,
      2,
      3,
      "Platform engineering",
      36,
    ],
    [
      "Data exchange",
      "Unexpected data reuse",
      "Purpose and access reviews are incomplete",
      3,
      5,
      3,
      4,
      "Privacy office",
      67,
    ],
    [
      "Supplier recovery",
      "Extended recovery time",
      "Supplier handover remains untested",
      5,
      5,
      5,
      4,
      "Service resilience",
      43,
    ],
    [
      "Staff portal",
      "Unauthorised export",
      "Bulk actions have limited oversight",
      3,
      4,
      3,
      2,
      "Identity assurance",
      22,
    ],
    [
      "Internal knowledge base",
      "Unexpected content access",
      "Default access review is pending",
      3,
      3,
      1,
      2,
      "Governance",
      10,
    ],
    [
      "Operational queue",
      "Missed follow-up",
      "Alert handover depends on one role",
      3,
      4,
      4,
      3,
      "Security operations",
      34,
    ],
    [
      "Archive service",
      "Old records retained",
      "Deletion sampling is incomplete",
      4,
      4,
      2,
      4,
      "Privacy office",
      48,
    ],
    [
      "Partner connectivity",
      "Unexpected route change",
      "Joint change windows are incomplete",
      5,
      4,
      4,
      4,
      "Platform engineering",
      63,
    ],
  ] as const;
  data.rows = riskExamples.map(
    (
      [
        asset,
        threat,
        vulnerability,
        likelihood,
        impact,
        residualLikelihood,
        residualImpact,
        unit,
        age,
      ],
      index,
    ) => ({
      ...blankRisk(),
      id:
        index === 0
          ? linkedId
          : `DEMO-${caseId.toUpperCase()}-${String(index + 1).padStart(2, "0")}`,
      asset,
      threat,
      vulnerability,
      likelihood,
      impact,
      residualLikelihood,
      residualImpact,
      unit,
      businessImpact: scenario.consequence,
      owner: index === 0 ? scenario.owner : unit,
      status: index % 2 ? "In progress" : "Open",
      openedDate: addDays(date, -age),
      reviewDate: addDays(date, index % 2 ? 14 : -3),
      controls: "Sample design review and owner sign-off",
      treatment: "Review coverage and test a representative sample",
      evidence: index % 3 ? `Fictional risk review ${index + 1}` : "",
    }),
  );
  data.analysed = data.rows;
  data.provenance = "Fictional completed demo";
  data.observations = data.rows.flatMap((risk, index) =>
    [36, 20, 8]
      .filter((age) => addDays(date, -age) >= risk.openedDate)
      .map((age) => ({
        riskId: risk.id,
        date: addDays(date, -age),
        likelihood: age > 20 ? risk.likelihood : risk.residualLikelihood,
        impact: risk.residualImpact,
        note: `Fictional observation for ${risk.asset} (${index + 1})`,
      })),
  );
  const studio = data.studio;
  studio.scope = {
    ...studio.scope,
    mission: `Maintain ${scenario.process.toLowerCase()} with accountable security decisions.`,
    services: scenario.process,
    boundary:
      id === "pci-dss"
        ? "The payment application, gateway interfaces and systems that can affect the fictional cardholder data environment."
        : "Service owners, supporting systems and selected supplier interfaces.",
    stakeholders: `${scenario.owner}, service operations and the risk committee`,
    tolerance:
      "Escalate residual scores of 16 or above and all overdue critical actions.",
    informationTypes: "Fictional service records and operational events",
    start: projectStart,
    periodStart: projectStart,
    periodEnd: date,
  };

  if (standard && id !== "nist-800-53") {
    studio.framework = id;
    studio.edition = standard.edition;
    studio.findings = assessmentItems(id).map((item, index) => {
      const level = [3, 2, 3, 1, 4, 3, 0, 2, 3, 4][
        (index + Math.floor(index / 7)) % 10
      ];
      return {
        ...newFinding(item.id, item.title, item.group, id, standard.edition),
        current: level,
        target: index % 6 === 0 ? 4 : 3,
        owner: scenario.owner,
        rationale:
          "Fictional worked example. The rating reflects the example's documented coverage and exceptions.",
        currentState:
          level < 3
            ? "Coverage is partial or operating evidence is outstanding."
            : "The example includes documented ownership and a repeatable process.",
        targetState:
          "Define ownership and confirm that the process operates across the agreed scope.",
        periodStart: projectStart,
        periodEnd: date,
        evidence: level ? `Fictional evidence reference ${item.id}` : "",
        verification: level ? "Learner assertion" : "None",
        confidence: "Medium",
        riskId: index === 1 ? linkedId : "",
      };
    });
    // Schedule the framework roadmap by workstream. The full assessment can
    // contain hundreds of findings, so only explicitly selected gaps get tasks.
    const planned = generateImplementation(
      { ...studio, findings: studio.findings.slice(0, 3) },
      scenario,
    );
    const linked = new Map(
      planned.findings.map((finding) => [finding.id, finding]),
    );
    planned.findings = studio.findings.map(
      (finding) => linked.get(finding.id) ?? finding,
    );
    planned.tasks = planned.tasks.map(
      (task, index): Task => ({
        ...task,
        progress:
          index < 4 ? 100 : index % 5 === 0 ? 55 : index % 7 === 0 ? 35 : 0,
        status:
          index < 4
            ? "Implemented"
            : index % 7 === 0
              ? "Blocked"
              : index % 5 === 0
                ? "In progress"
                : "Planned",
        deadline: addDays(projectStart, 7 + index * 2),
      }),
    );
    const baseline = schedule(
      planned.tasks,
      planned.resources,
      projectStart,
      planned.calendar,
    );
    planned.baseline = baseline.rows.map((row) => ({
      id: row.task.id,
      start: row.start,
      end: row.end,
      cost: row.cost,
    }));
    data.studio = planned;
    if (id === "nist-csf-2") data.labDrafts["guided-assessment"] = { step: 2 };
    data.assessments = Object.fromEntries(
      studio.findings.slice(0, 6).map((finding) => [
        `${id}:${finding.controlId}`,
        {
          status: finding.current ? "Partially implemented" : "Not implemented",
          notes: finding.rationale,
          evidence: finding.evidence,
          owner: finding.owner,
          justification: "",
        },
      ]),
    );
  }

  if (id === "privacy" || id === "privacy-draft") {
    const edition = id === "privacy-draft" ? "pf-1.1-ipd" : "pf-1.0";
    studio.privacyEdition = edition;
    const base: ProcessingActivity = {
      id: "demo-privacy-payment",
      name: "Payment fraud review",
      purpose: "Review flagged payments with human oversight.",
      dataSubjects: "Customers and payment recipients",
      categories: "Transaction metadata, customer reference",
      collection: "Customer checkout",
      sharing: "Restricted payment gateway",
      use: "Fraud analysis queue",
      retentionDays: 90,
      deletion: "Scheduled deletion with sampled logs",
      recordedOn: addDays(date, -18),
      controller: scenario.name,
      processor: "Fictional gateway provider",
      jurisdiction: "Example jurisdiction",
      legalReview: "Review required",
      obligations: "Review transparency and processor terms",
      necessity: "Flag anomalous payments",
      proportionality: "Store only required event fields",
      rights: "Queue review and correction requests",
      minimisation: "Use a pseudonymous account reference",
    };
    studio.activities = [
      base,
      {
        ...base,
        id: "demo-privacy-support",
        name: "Customer support",
        categories: "Contact details, case metadata",
        collection: "Support intake",
        sharing: "Customer service queue",
        use: "Case resolution",
        retentionDays: 180,
        recordedOn: addDays(date, -25),
      },
      {
        ...base,
        id: "demo-privacy-access",
        name: "Supplier access review",
        categories: "Audit log, supplier identifier",
        collection: "Access gateway",
        sharing: "Restricted audit pipeline",
        use: "Access review",
        retentionDays: 365,
        recordedOn: addDays(date, -8),
      },
    ];
    studio.privacyRisks = studio.activities.map(
      (activity, index): PrivacyRisk => ({
        id: `demo-privacy-risk-${index}`,
        activityId: activity.id,
        edition,
        event: [
          "Transaction metadata reused beyond fraud review",
          "A contact record remains after a case closes",
          "Supplier logs expose identifiers to excess readers",
        ][index],
        harm: [
          "Unfair service exclusion",
          "Loss of control over contact information",
          "Unwanted disclosure and monitoring",
        ][index],
        likelihood: 4,
        impact: 4,
        residualLikelihood: index + 1,
        residualImpact: 3,
        controls: "Purpose restriction and role review",
        assumptions:
          "Illustrative ratings based on a fictional design review; operating evidence remains untested.",
        owner: "Privacy officer",
        escalation: "Review with accountable owner",
        taskId: "",
      }),
    );
    data.labDrafts.privacy = { selectedActivity: base.id, activity: base };
  }
  if (id === "ai") {
    const base: AIConfiguration = {
      threshold: 0.5,
      prevalence: 20,
      shift: 0,
      features: 4,
      split: "holdout",
      seed: 42,
    };
    const config = { ...base, threshold: 0.38, shift: 4 };
    data.labDrafts.ai = {
      config,
      experiment: 4,
      comparison: [base, config].map((row) => ({
        config: row,
        result: metrics(predictions(row), row.threshold),
      })),
    };
  }
  if (id === "incident")
    data.labDrafts.incident = {
      marked: ["E01", "E03", "E04", "E06"],
      hypothesis: "Possible supplier account compromise",
      classification: "Suspected account compromise",
      severity: "High",
      reviewed: true,
      notes:
        "Fictional timeline ties the supplier login to an unexpected configuration change. Confirm the identity and preserve the logs.",
      actions: [
        incidentFeedback("preserve", 4),
        incidentFeedback("restrict", 4),
      ],
    };
  if (id === "boardroom")
    data.labDrafts.boardroom = {
      budget: scenario.budget,
      situation: 0,
      selected: ["identity"],
      owner: scenario.owner,
      strategy: "Stage delivery with explicit gates",
      assurance: "Independent risk-based sampling",
      decision: "Escalate material residual exposure",
      evaluated: true,
      brief:
        "Approve a limited identity workstream, review supplier entitlements, and sample operating evidence at the next risk committee.",
    };
  if (id === "risk")
    data.labDrafts["risk-decision"] = {
      riskId: linkedId,
      likelihood: 5,
      impact: 5,
      residualL: 4,
      residualI: 5,
      evaluated: true,
      statement:
        "A supplier account can be misused against the selected service.",
      evidence: "Fictional access review and exception log",
      owner: scenario.owner,
      reason: "Prioritise removal of standing privileged access.",
      review: date,
    };
  if (id === "nist-800-53") {
    studio.sp.categorisation =
      "Fictional low-impact customer-facing system. Review availability assumptions before selecting the baseline.";
    studio.sp.privacyRationale =
      "The sample uses fictional access logs with pseudonymous identifiers. Reassess any real processing separately.";
    studio.sp.decisions["ac-2"] = {
      reviewed: true,
      applicable: true,
      rationale: "Accounts provide direct access to the scoped system.",
      responsibility: "System-specific",
      provider: "",
      status: "Implemented",
      evidence: "Fictional account population and approval sample",
      assessmentMethod: "Examine",
      objective: "Accounts have assigned owners and approvals",
      procedure: "Sample account approval and recertification records.",
      finding: "One supplier record awaits independent review.",
      owner: scenario.owner,
    };
  }
  return data;
}
