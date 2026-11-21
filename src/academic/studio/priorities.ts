export const priorityStandards = [
  { id: "nist-csf-2", name: "NIST CSF 2.0", edition: "2.0" },
  { id: "iso-27001", name: "ISO/IEC 27001", edition: "2022; Amd 1:2024" },
  { id: "pci-dss", name: "PCI DSS", edition: "4.0.1" },
] as const;

export type PriorityId = (typeof priorityStandards)[number]["id"];

export function isPriority(id: string | null): id is PriorityId {
  return priorityStandards.some((standard) => standard.id === id);
}
