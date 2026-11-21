import { controls } from "../workspace/frameworks";
import { architectureFor } from "./standards";
import { isoItems } from "./isoIndex";
import { pciRequirementIds } from "./pciIndex";

export interface AssessmentItem {
  id: string;
  title: string;
  group: string;
  category: string;
  explanation: string;
  evidence: string;
}

const pciSupplemental: Record<string, [string, string]> = {
  A1: [
    "Multi-tenant provider requirements",
    "Check applicability for a multi-tenant service provider and trace tenant isolation, incident support and access boundaries.",
  ],
  A2: [
    "Legacy payment terminal connections",
    "Confirm whether an eligible payment terminal connection uses legacy SSL or early TLS before assessing this appendix.",
  ],
  A3: [
    "Designated entity supplemental validation",
    "Confirm designation and scope with the relevant party before assessing supplemental validation obligations.",
  ],
};

const pciExamples: Record<string, string> = {
  "1.2.1": "Network-control configuration standards",
  "3.3.1": "Sensitive authentication data after authorisation",
  "6.4.3": "Payment-page script inventory and authorisation",
  "8.4.2": "Multi-factor authentication into the cardholder data environment",
  "11.6.1": "Payment-page change and tamper detection",
  "12.3.1": "Targeted risk analysis for defined assessment frequencies",
};

export function assessmentItems(standard: string): AssessmentItem[] {
  if (standard === "iso-27001") return isoItems;
  if (standard === "pci-dss")
    return Object.entries(pciRequirementIds).flatMap(([group, ids]) => {
      const control = controls.find(
        (row) => row.framework === standard && row.id === `PCI-${group}`,
      );
      const supplement = pciSupplemental[group];
      const title = control?.title ?? supplement[0];
      const explanation = control?.explanation ?? supplement[1];
      return ids.map((id) => ({
        id,
        title: pciExamples[id] ?? title,
        group: `${group} · ${title}`,
        category: id.split(".").slice(0, 2).join("."),
        explanation: `${explanation} Consult the official requirement ${id} for its exact scope and testing method.`,
        evidence:
          control?.evidence ??
          "Record the applicability decision and collect evidence for the exact subsection from the publisher's testing guide.",
      }));
    });
  if (standard === "nist-csf-2")
    return controls
      .filter((row) => row.framework === standard)
      .map((row) => ({
        id: row.id,
        title: row.title,
        group: row.path[0],
        category: row.id.split("-")[0],
        explanation: row.explanation,
        evidence: row.evidence,
      }));

  return (
    architectureFor(standard)?.nodes.flatMap((node) =>
      (node.children?.length
        ? node.children
        : [{ id: `X1-${node.id}`, title: node.title }]
      ).map((child) => ({
        id: child.id,
        title: child.title,
        group: node.title,
        category: node.id,
        explanation: node.implementation,
        evidence: node.evidence,
      })),
    ) ?? []
  );
}
