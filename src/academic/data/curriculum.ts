import type { Discipline, LearningModule } from "./types";
export const tracks: {
  id: Discipline;
  title: string;
  summary: string;
  modules: string[];
}[] = [
  {
    id: "cybersecurity",
    title: "Cybersecurity",
    summary:
      "Understand systems, investigate signals and build operational resilience.",
    modules: [
      "Cybersecurity Principles and Enterprise Threats",
      "Networking and Security Architecture",
      "Operating Systems and Endpoint Security",
      "Identity, Authentication and Zero Trust",
      "Threat Intelligence and Threat Modelling",
      "Security Monitoring, SIEM and Telemetry",
      "Incident Detection and Response",
      "Vulnerability and Exposure Management",
      "Cloud Security and Shared Responsibility",
      "Application Security and DevSecOps",
      "OT/ICS and Industrial Cybersecurity",
      "Resilience and Cybersecurity Operations",
    ],
  },
  {
    id: "grc",
    title: "Governance, Risk & Compliance",
    summary:
      "Connect business objectives to defensible risk decisions and assurance.",
    modules: [
      "Cybersecurity Governance Foundations",
      "Enterprise Risk and Cyber Risk Assessment",
      "NIST CSF 2.0",
      "NIST SP 800-53 and Control Assessment",
      "ISO/IEC 27001 and ISMS Implementation",
      "IT Audit and Security Assurance",
      "Evidence Management and Control Effectiveness",
      "Regulatory, Contractual and Payment Compliance",
      "Third-Party and Supply-Chain Risk",
      "Business Continuity and Operational Resilience",
      "Cybersecurity Programme and PMO Leadership",
      "Executive Risk Communication and CISO Governance",
    ],
  },
  {
    id: "artificial-intelligence",
    title: "Artificial Intelligence",
    summary:
      "Evaluate model behaviour, understand uncertainty and govern AI use.",
    modules: [
      "Artificial Intelligence Foundations",
      "Machine Learning Fundamentals",
      "Deep Learning Concepts",
      "Natural Language Processing and LLMs",
      "Generative AI Systems",
      "AI Agents and Agentic Architecture",
      "Machine Learning for Cybersecurity",
      "Trustworthy AI and Explainability",
      "AI Privacy and Data Leakage",
      "Adversarial AI and Model Security",
      "NIST AI RMF and ISO/IEC 42001",
      "AI Assurance, Evaluation and Governance",
    ],
  },
];
export const modules: LearningModule[] = [
  {
    id: "incident-triage",
    discipline: "cybersecurity",
    title: "Incident Detection and Response",
    prerequisite:
      "Recognise an account, an asset and a timestamp. Review the scenario architecture before starting.",
    objectives: [
      "Separate observation from hypothesis",
      "Correlate identity and service telemetry",
      "Choose proportionate containment and preserve evidence",
    ],
    analogy:
      "An alert is a smoke alarm. Confirming smoke, locating its source and protecting occupants are separate decisions. Silencing the alarm does not establish safety.",
    sections: [
      {
        title: "From signal to a testable hypothesis",
        text: "A failed login alone rarely establishes compromise. Combine the identity, source, time window, successful sessions and subsequent actions. Write a hypothesis that could be contradicted by new evidence. For PaySecure, a supplier login followed by a routing-policy change warrants investigation even when the source address is unfamiliar but authorised.",
      },
      {
        title: "Confidence, severity and priority",
        text: "Confidence describes how strongly evidence supports a hypothesis. Severity describes potential harm. Priority also considers urgency, service criticality and available response capacity. A low-confidence event on a critical service can warrant rapid collection without immediate shutdown. Record the affected service owner and notification authority.",
      },
      {
        title: "Containment with operational context",
        text: "Prefer a reversible and targeted restriction when supported by evidence. Preserve session and audit records first when operationally safe. PetroShield requires production and safety approval before industrial isolation. A cyber analyst cannot infer safe plant operation from network logs alone. Coordinate legal, business and technical decisions through an incident commander.",
      },
      {
        title: "Recovery and learning",
        text: "Recovery requires known-good state, revoked malicious access and monitoring for recurrence. An absence of alerts is insufficient when telemetry is incomplete. Record what was observed, what remains uncertain and which tests would increase assurance. A post-incident review turns missing evidence and delayed decisions into accountable improvements.",
      },
    ],
    activity:
      "In the Incident Lab, mark at least two corroborating events. Record a competing hypothesis, preserve evidence and choose a response. Explain which finding would change your decision.",
    deliverable:
      "An incident report separating observed events, selected actions and unverified assumptions.",
    misconception:
      "A successful login proves the person was legitimate. A credential can be valid while its use is unauthorised.",
    revision: [
      "Correlate identity, time and action",
      "Preserve evidence and collection scope",
      "Contain proportionately with business approval",
      "Validate recovery and remaining uncertainty",
    ],
    assessment: {
      prompt:
        "A supplier session changes payment routing after a new-device login. What is the strongest first step?",
      choices: [
        "Shut down every payment service",
        "Correlate session and change logs, preserve records and contact the service owner",
        "Declare the supplier malicious",
      ],
      correct: 1,
      explanation:
        "Correlated evidence and owner context support proportionate containment. A new device is an investigative signal and attribution remains uncertain.",
    },
    lab: "cyber-incident",
    resource: "incident",
  },
  {
    id: "risk-assessment",
    discipline: "grc",
    title: "Enterprise Risk and Cyber Risk Assessment",
    prerequisite:
      "Understand the service, its owner and the distinction between a threat and a vulnerability.",
    objectives: [
      "Write a business-linked risk scenario",
      "Explain inherent and residual estimates",
      "Produce an accountable treatment recommendation",
    ],
    analogy:
      "A bridge inspection separates a hazard, the bridge’s condition and the consequence of failure. Installing a barrier is a treatment claim. Inspection and load testing provide evidence about its operation.",
    sections: [
      {
        title: "Write a cause–event–consequence statement",
        text: "A risk statement connects an exposure to an uncertain event and a business effect. PaySecure has broad supplier privileges. Stolen supplier credentials could change routing and cause payment fraud or disruption. The service owner supplies consequence context. A vulnerability list alone omits the business decision.",
      },
      {
        title: "Choose a transparent analysis method",
        text: "Ordinal 1–5 ratings provide discussion structure. Their product is an educational prioritisation index, not expected financial loss or a probability. Likelihood ratings need a time horizon and rationale. Impact ratings require a defined consequence. Compare assumptions before comparing scores. A conservative maximum-rating model is available to illustrate how methodology changes decisions.",
      },
      {
        title: "Claims, evidence and residual exposure",
        text: "Inherent exposure is estimated before the selected treatment. Residual exposure is a separate judgement under stated control assumptions. An access policy does not demonstrate enforcement. Sample access reviews, privilege removal records and independent tests increase confidence. The simulator requires an explicit residual estimate and never subtracts an arbitrary control percentage.",
      },
      {
        title: "Treatment and accountable acceptance",
        text: "Mitigation changes likelihood or consequence. Avoidance changes the activity. Sharing transfers some financial or operational responsibility while retaining accountability. Acceptance requires an authorised owner, scope, expiry and monitoring trigger. A score above appetite prompts escalation. A numerical threshold cannot authorise acceptance by itself.",
      },
    ],
    activity:
      "Assess PaySecure, choose controls and state a residual estimate. Defend a treatment against the committee rubric, then export a decision record for the boardroom.",
    deliverable:
      "A risk register entry, treatment plan and management decision request with assumptions.",
    misconception:
      "A control marked implemented is independently effective. Implementation and effectiveness require different evidence.",
    revision: [
      "Describe asset, event and consequence",
      "Declare the rating model and time horizon",
      "Justify residual estimates with evidence",
      "Name an authority and review trigger",
    ],
    assessment: {
      prompt:
        "Residual risk is above tolerance and the deadline is tomorrow. Who can accept it?",
      choices: [
        "The analyst because the score was calculated",
        "The authorised risk owner under the organisation’s governance process",
        "The software automatically",
      ],
      correct: 1,
      explanation:
        "The analyst recommends. The accountable authority considers evidence, remaining exposure, constraints and an expiry or review trigger.",
    },
    lab: "risk-decision",
    resource: "csf",
  },
  {
    id: "detection-evaluation",
    discipline: "artificial-intelligence",
    title: "Machine Learning for Cybersecurity",
    prerequisite:
      "Understand binary labels, proportions and the distinction between training and evaluation data.",
    objectives: [
      "Calculate precision, recall and F1 from counts",
      "Explain prevalence and threshold effects",
      "Recognise leakage and distribution shift",
    ],
    analogy:
      "A screening checkpoint can catch more prohibited items by inspecting more bags. Extra inspections also delay innocent travellers. The right policy depends on how common the items are and the cost of each mistake.",
    sections: [
      {
        title: "Define the evaluation question",
        text: "Here positive means a synthetic security event labelled suspicious. A true positive is correctly flagged. A false negative is missed. Precision is TP/(TP+FP), recall is TP/(TP+FN), and F1 is their harmonic mean. Undefined ratios are displayed as zero under the studio convention and flagged by the counts. These metrics do not establish real-world business value.",
      },
      {
        title: "Threshold and class imbalance",
        text: "Lowering the threshold usually finds more positives while adding false alarms. With rare attacks, even a modest false-positive rate can overwhelm analysts. Compare the confusion-matrix counts as well as F1. A detector with excellent accuracy can miss every attack in an imbalanced dataset. Select thresholds against operational costs and a held-out protocol.",
      },
      {
        title: "Shift, features and generalisation",
        text: "SmartFactory opens a new production line. Its changed telemetry may move normal and suspicious scores closer together. The studio models this explicitly through a deterministic score transformation. Useful features separate classes up to a defined limit. Extra features add holdout noise. These causal assumptions illustrate concepts and are not measured performance of a trained model.",
      },
      {
        title: "Privacy and leakage",
        text: "Training-set evaluation is optimistic. A feature derived from an incident’s final analyst label leaks the answer into the prediction. Personnel identifiers also raise minimisation and access concerns. Remove post-outcome information, split by time or entity when appropriate, and evaluate representative future data. A good score cannot demonstrate privacy or fairness.",
      },
    ],
    activity:
      "Save a baseline, lower prevalence and compare false-positive burden. Add shift, then compare training and holdout settings. Explain which configuration warrants further evaluation.",
    deliverable:
      "A reproducible evaluation report with seed, parameters, counts, limitations and a threshold recommendation.",
    misconception:
      "High F1 proves the model is secure. Security, privacy, robustness and deployment context require additional evaluation.",
    revision: [
      "Count TP, FP, TN and FN",
      "Report class prevalence and threshold",
      "Keep training and holdout interpretation separate",
      "Document shift, leakage and privacy limitations",
    ],
    assessment: {
      prompt:
        "Attacks become much rarer while sensitivity and false-positive rate stay similar. What often happens?",
      choices: [
        "Precision falls because normal events dominate false alarms",
        "Recall must become 100%",
        "False positives disappear",
      ],
      correct: 0,
      explanation:
        "The base-rate effect can reduce the fraction of alerts that are true positives. Examine actual counts and operational capacity.",
    },
    lab: "ai-experiment",
    resource: "ml",
  },
];
