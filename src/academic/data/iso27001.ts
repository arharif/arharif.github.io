// ISO/IEC 27001:2022 Annex A / ISO/IEC 27002:2022, clauses 5–8.
// These short topic labels are X1 paraphrases. Normative text remains with ISO.
export const annexA = [
  { section: 5, title: "Organisational controls", topics: [
    "Policy governance", "Security responsibility assignments", "Separation of conflicting responsibilities",
    "Management oversight", "Relationships with authorities", "Security community contacts", "Threat intelligence",
    "Security in project delivery", "Asset and information inventory", "Rules for appropriate use", "Asset return",
    "Information classification", "Applying classification labels", "Information transfers", "Access policy",
    "Identity lifecycle", "Handling authentication information", "Access entitlement reviews",
    "Supplier security", "Security terms in supplier contracts", "ICT supply chain oversight",
    "Monitoring and changing supplier services", "Cloud service security", "Incident preparation",
    "Triage of security events", "Incident response", "Learning after incidents", "Preserving evidence",
    "Security during disruption", "ICT capabilities for continuity", "Identifying external obligations",
    "Intellectual property protection", "Records protection", "Privacy and personal information",
    "Independent security review", "Checking policy adherence", "Documented operating instructions",
  ] },
  { section: 6, title: "People controls", topics: [
    "Pre-employment screening", "Employment security terms", "Security education and awareness",
    "Disciplinary arrangements", "Duties after role changes or departure", "Confidentiality commitments",
    "Working remotely", "Reporting security events",
  ] },
  { section: 7, title: "Physical controls", topics: [
    "Physical zone boundaries", "Entry controls", "Securing work locations", "Monitoring premises",
    "Environmental and physical hazards", "Procedures in secure areas", "Unattended desks and screens",
    "Safe equipment placement", "Equipment outside company sites", "Storage media handling",
    "Supporting utilities", "Protection of cables", "Equipment servicing", "Secure reuse and disposal",
  ] },
  { section: 8, title: "Technological controls", topics: [
    "End-user devices", "Administrative privileges", "Limiting information access", "Protecting source code",
    "Secure sign-in", "Capacity planning", "Malware defences", "Technical vulnerability management",
    "Configuration governance", "Information deletion", "Masking sensitive values", "Preventing data leaks",
    "Recoverable backups", "Redundant processing", "Recording security events", "Monitoring activity",
    "Time synchronisation", "Privileged utilities", "Software installation in production", "Network protection",
    "Securing network services", "Network segmentation", "Filtering web access", "Cryptography and keys",
    "Secure development lifecycle", "Application security requirements", "Secure architecture and engineering",
    "Secure coding practices", "Development and acceptance security tests", "Outsourced development",
    "Separation of delivery environments", "Change governance", "Test information protection", "Safeguards during audits",
  ] },
] as const;
export const annexAIds = annexA.flatMap(({ section, topics }) => topics.map((_, i) => `A.${section}.${i + 1}`));
