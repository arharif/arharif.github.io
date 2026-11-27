// PCI DSS v4.0.1 requirement objectives. These are organisational aid labels,
// not PCI SSC requirement or testing-procedure text.
export const pciSections = [
  ["Network security", ["Processes", "Security control configuration", "CDE network access", "Trusted and untrusted network boundaries", "Devices connecting to both networks"]],
  ["Secure configurations", ["Processes", "System component configuration", "Wireless environment safeguards"]],
  ["Stored account data", ["Processes", "Minimising data storage", "Sensitive authentication data", "Access to displayed or copied PAN", "Unreadable stored PAN", "Key protection", "Key management lifecycle"]],
  ["Account data in transit", ["Processes", "Protecting PAN in transmission"]],
  ["Malicious software", ["Processes", "Malware prevention and detection", "Managing malware protection", "Phishing protection"]],
  ["Secure software and systems", ["Processes", "Bespoke and custom software", "Managing security vulnerabilities", "Public-facing application protections", "Secure changes"]],
  ["Access by business need", ["Processes", "Access provisioning and approvals", "Access control systems"]],
  ["Identity and authentication", ["Processes", "User and administrator accounts", "Authentication factors", "Multi-factor authentication", "MFA configuration", "System and application accounts"]],
  ["Physical access", ["Processes", "Physical access controls", "Personnel and visitor access", "Media handling", "Protecting payment interaction devices"]],
  ["Logging and monitoring", ["Processes", "Audit logs", "Protection of audit logs", "Log review", "Log retention", "Time synchronisation", "Detecting failures of security controls"]],
  ["Security testing", ["Processes", "Wireless access point testing", "Vulnerability scanning", "Penetration testing", "Network intrusion and covert-channel detection", "Detection of unauthorised changes"]],
  ["Policy and programmes", ["Security policy", "Acceptable use", "Risk management", "Compliance management", "Scope", "Awareness", "Personnel screening", "Third-party services", "Service provider duties", "Incident response"]],
] as const;

type PciExample = readonly [id: string, title: string, applicability: string, test: string, remediation: string];
export const pciExamples: readonly PciExample[] = [
  ["1.2.3", "Network boundary diagrams", "Include in-scope links to other networks and wireless networks.", "Compare the diagram with sampled network configurations.", "Reconcile the diagram with firewall zones and external links."],
  ["2.2.2", "Vendor default accounts", "Review vendor accounts on the in-scope components.", "Sample default accounts and compare their treatment with the secure configuration.", "Remove, disable or secure default accounts as appropriate."],
  ["3.3.1", "Sensitive authentication data after authorisation", "Review post-authorisation retention and check the applicable issuer provisions separately.", "Inspect data stores and retention flows for sensitive authentication data.", "Remove unauthorised retention and retest the data discovery results."],
  ["4.2.1", "Cryptography for PAN over public networks", "Applies where PAN traverses open, public networks.", "Check encryption protocols, certificate trust and sampled transmission paths.", "Enforce strong transport protection for the affected paths."],
  ["5.4.1", "Phishing safeguards", "Check the processes and technical measures protecting personnel.", "Inspect the measures and interview the responsible operator.", "Enable protective measures and record a safe detection exercise."],
  ["6.4.3", "Payment-page script management", "Review scripts loaded and run in consumers’ browsers on payment pages.", "Sample inventories for authorisation, integrity and written necessity.", "Inventory payment-page scripts and verify authorisation and integrity controls."],
  ["7.2.2", "Access assignments", "Review identity access grants for in-scope systems and account data.", "Sample access grants and compare job function and least privilege.", "Remove excessive grants and adjust the access approval workflow."],
  ["8.4.2", "MFA for CDE access", "Review access into the CDE and the exact exceptions in the standard.", "Walk through representative CDE access paths and examine MFA configuration.", "Close bypass paths and retest CDE sign-in."],
  ["9.5.1", "Payment interaction devices", "Check point-of-interaction devices used in card-present transactions.", "Inspect the device inventory and evidence of protection from tampering or substitution.", "Confirm device inventory, inspection ownership and escalation."],
  ["10.5.1", "Audit history retention", "Review retention for the applicable audit log history.", "Check at least 12 months of retention and at least three months immediately available for analysis.", "Correct collection and retention settings and retrieve a historical sample."],
  ["11.6.1", "Payment-page tamper detection", "Check payment page changes and HTTP headers as received by a consumer browser.", "Examine alert coverage, frequency and response evidence for safe test events.", "Add tamper alerts and document response ownership."],
  ["12.10.1", "Incident response readiness", "Apply the incident response plan to the scoped payment environment.", "Review the current plan, contact paths, roles and coverage for the relevant incident types.", "Update contact paths and rehearse a payment-data incident."],
];
