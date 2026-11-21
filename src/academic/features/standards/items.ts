import type { StandardNode } from "../../data/standards.ts";
import { standards } from "../../data/standards.ts";
import { controls } from "../../data/controls.ts";
import type { FrameworkControl } from "../../data/types.ts";
export function teachingItems(
  standardId: string,
  group: StandardNode,
): FrameworkControl[] {
  const existing = controls.filter(
    (row) =>
      row.framework === standardId &&
      (standardId === "nist-csf-2"
        ? row.path[0] === group.id
        : standardId === "nist-800-53"
          ? row.id.startsWith(`${group.id}-`)
          : false),
  );
  if (existing.length && !group.children?.length) return existing;
  const children = group.children?.length
    ? group.children
    : [{ id: `${group.id}-practice`, title: group.title }];
  return [
    ...existing,
    ...children
      .filter(
        (child) =>
          !existing.some(
            (row) => row.id === child.id || row.id.startsWith(`${child.id}-`),
          ),
      )
      .map((child) => ({
        id: child.id,
        framework: standardId,
        path: [group.title],
        title: child.title,
        explanation: group.objective,
        objective: group.objective,
        implementation: group.implementation,
        roles: group.owner,
        assets: "Selected business service and its dependencies",
        methods:
          "Examine records, interview accountable owners and test a scoped sample. Document period and limitations.",
        evidence: group.evidence,
        gap: group.mistake,
        risk: "Unaddressed service, governance, privacy or resilience exposure under the selected scope.",
        source: standards.find((row) => row.id === standardId)!.source,
        lesson:
          standardId.includes("ai") || standardId === "iso-42001"
            ? "detection-evaluation"
            : "risk-assessment",
      })),
  ];
}
