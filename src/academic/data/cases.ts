import type { Scenario } from "./types";
export const scenarios: Scenario[] = [
  {
    id: "paysecure",
    name: "X1 PaySecure",
    sector: "Banking & payments",
    process: "Cloud payment authorisation",
    asset: "Payment API and settlement identity",
    owner: "Head of Payments",
    architecture:
      "Customer gateway → cloud API → token vault → acquiring bank. Administrative identities cross a separate management boundary.",
    threat: "A stolen supplier identity alters payment routing.",
    exposure:
      "Supplier support accounts retain broad access and weak review evidence.",
    consequence:
      "Fraudulent transactions, processing interruption and contractual notification obligations.",
    dependency:
      "Identity provider, immutable audit logs and tested settlement recovery",
    supplier: "Fictional CloudBridge support provider",
    constraint:
      "A bank client requests an evidence-backed review within 30 days. PCI applicability requires explicit scope analysis.",
    budget: 100,
    tolerance: 9,
  },
  {
    id: "petroshield",
    name: "X1 PetroShield",
    sector: "Oil & gas",
    process: "Remote production monitoring",
    asset: "OT vendor access gateway",
    owner: "Production Operations Director",
    architecture:
      "Enterprise IT → industrial DMZ → monitored access gateway → control network. Safety systems have an independent operational authority.",
    threat: "Unauthorised vendor activity disrupts production monitoring.",
    exposure: "Legacy gateways and incomplete session monitoring.",
    consequence:
      "Loss of visibility, controlled production slowdown and safety escalation.",
    dependency:
      "OT engineering approval, segmentation and safe recovery procedures",
    supplier: "Fictional FieldLink maintenance partner",
    constraint:
      "Changes require a scheduled maintenance window and safety review. Never isolate control equipment without operations approval.",
    budget: 80,
    tolerance: 6,
  },
  {
    id: "smartfactory",
    name: "X1 SmartFactory",
    sector: "Manufacturing & IIoT",
    process: "Connected production quality monitoring",
    asset: "IIoT telemetry broker and detection model",
    owner: "Plant Technology Director",
    architecture:
      "Device identities → segmented production network → telemetry broker → analytics workspace. Supplier maintenance uses a controlled gateway.",
    threat: "Compromised device identities distort operational telemetry.",
    exposure:
      "Shared device credentials and a model evaluated only on old production conditions.",
    consequence:
      "Missed anomalies, unnecessary line stoppages and loss of product quality.",
    dependency:
      "Device inventory, trusted telemetry and human review of model alerts",
    supplier: "Fictional SensorWorks device provider",
    constraint:
      "A new production line changes telemetry distributions. Personnel identifiers require minimisation.",
    budget: 90,
    tolerance: 8,
  },
];
export const labLinks = [
  {
    id: "framework-explorer",
    title: "Control & Framework Explorer",
    detail: "Inspect outcomes, assess evidence and turn gaps into actions.",
    label: "Assess controls",
    discipline: "grc",
  },
  {
    id: "risk-decision",
    title: "Risk Register & Simulator",
    detail: "Import a register, analyse exposure and defend treatment decisions.",
    label: "Make a risk decision",
    discipline: "grc",
  },
  {
    id: "cyber-incident",
    title: "Cyber Incident Lab",
    detail: "Correlate synthetic events and document a response.",
    label: "Investigate an incident",
    discipline: "cybersecurity",
  },
  {
    id: "ai-experiment",
    title: "AI Experiment Studio",
    detail: "Test detection trade-offs with reproducible predictions.",
    label: "Run an experiment",
    discipline: "artificial-intelligence",
  },
  {
    id: "ciso-boardroom",
    title: "CISO Boardroom",
    detail: "Allocate a constrained budget and brief the committee.",
    label: "Prepare a briefing",
    discipline: "grc",
  },
];
export const disclaimer =
  "Fictional educational scenario — not real organisational evidence.";
