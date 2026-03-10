import { CategoryFamily, SecurityMapData, SecurityMapNode } from '@/components/security-map/types';

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const categoryFamilies: CategoryFamily[] = [
  {
    id: 'executive-governance',
    label: 'Executive Leadership & Governance',
    description: 'Executive decision-making, strategy, operating model, and board-level cyber leadership.',
    whyItMatters: 'Aligns cybersecurity priorities with business strategy, risk appetite, and accountability.',
    color: { fill: '#1d4ed8', ring: '#93c5fd', text: '#dbeafe', edge: 'rgba(59,130,246,0.45)' },
    subdomains: ['Cyber strategy', 'Security governance', 'Security operating model', 'Cyber budget & planning', 'Reporting to executives / board', 'Policy governance', 'Security steering committees', 'Cyber transformation'],
    roles: ['Chief Information Security Officer (CISO)', 'Deputy CISO', 'Group CISO / Regional CISO', 'Security Director', 'VP Cybersecurity', 'Head of Information Security', 'Cybersecurity Program Director', 'Cybersecurity Governance Manager', 'Security PMO Lead', 'Cybersecurity Strategy Manager', 'Security Metrics / KPI Manager', 'Board Cyber Advisor', 'Virtual CISO (vCISO)'],
  },
  {
    id: 'risk-grc-compliance-audit',
    label: 'Risk, GRC, Compliance & Audit',
    description: 'Cyber risk, compliance management, control assurance, and audit readiness.',
    whyItMatters: 'Provides measurable assurance that controls and regulatory obligations are effective.',
    color: { fill: '#15803d', ring: '#86efac', text: '#dcfce7', edge: 'rgba(34,197,94,0.4)' },
    subdomains: ['Enterprise risk management', 'Cyber risk assessment', 'Control testing', 'Third-party / fourth-party risk', 'Regulatory compliance', 'Audit readiness', 'Exception management', 'KPI / KRI / scorecards'],
    roles: ['Cyber Risk Manager', 'Information Security Risk Analyst', 'GRC Manager', 'GRC Analyst', 'Compliance Manager', 'Compliance Analyst', 'PCI DSS Specialist / QSA-style Consultant', 'ISO 27001 Lead Implementer / Lead Auditor', 'NIST CSF Program Lead', 'Security Control Assessor', 'Internal IT/Cyber Auditor', 'External Cyber Auditor', 'Third-Party Risk Manager', 'Vendor Risk Analyst', 'Policy & Standards Manager', 'Privacy Risk Analyst', 'Regulatory Affairs Cyber Lead'],
  },
  {
    id: 'security-architecture-engineering',
    label: 'Security Architecture & Engineering',
    description: 'Secure-by-design architecture patterns and platform engineering controls.',
    whyItMatters: 'Creates durable security outcomes through design decisions that scale.',
    color: { fill: '#2563eb', ring: '#93c5fd', text: '#dbeafe', edge: 'rgba(59,130,246,0.42)' },
    subdomains: ['Secure architecture', 'Security patterns', 'Zero Trust', 'Network segmentation', 'Secure baseline configuration', 'Hardening', 'Security design reviews', 'Cryptographic architecture'],
    roles: ['Security Architect', 'Enterprise Security Architect', 'Cybersecurity Architect', 'Infrastructure Security Architect', 'Cloud Security Architect', 'Zero Trust Architect', 'IAM Architect', 'PAM Architect', 'PKI / Cryptography Architect', 'Network Security Architect', 'Endpoint Security Architect', 'OT Security Architect', 'Application Security Architect', 'DevSecOps Architect', 'Security Engineer', 'Security Platform Engineer', 'Hardening Engineer', 'Secure Build Engineer'],
  },
  {
    id: 'iam',
    label: 'Identity & Access Management (IAM)',
    description: 'Identity lifecycle, privileged access, and access governance.',
    whyItMatters: 'Identity is the new perimeter and central to modern security control.',
    color: { fill: '#0891b2', ring: '#67e8f9', text: '#cffafe', edge: 'rgba(34,211,238,0.45)' },
    subdomains: ['IAM', 'IGA', 'PAM', 'SSO / Federation', 'MFA', 'RBAC / ABAC', 'Access recertification', 'Identity lifecycle'],
    roles: ['IAM Manager', 'IAM Engineer', 'IAM Analyst', 'Identity Architect', 'Access Management Specialist', 'SSO / Federation Engineer', 'MFA Engineer', 'Directory Services Engineer', 'Joiner-Mover-Leaver Process Lead', 'User Access Review Analyst', 'Role Mining Analyst', 'Identity Governance (IGA) Specialist', 'PAM Engineer', 'PAM Analyst', 'Secrets Management Engineer'],
  },
  {
    id: 'network-security',
    label: 'Network Security',
    description: 'Secure connectivity, segmentation, and network traffic controls.',
    whyItMatters: 'Protects critical communication paths and enterprise connectivity.',
    color: { fill: '#1d4ed8', ring: '#60a5fa', text: '#dbeafe', edge: 'rgba(56,189,248,0.42)' },
    subdomains: ['Firewalls', 'IDS/IPS', 'DDoS protection', 'Secure routing / segmentation', 'DNS security', 'Remote access', 'Network access control', 'Web security controls'],
    roles: ['Network Security Engineer', 'Firewall Engineer', 'Secure Network Architect', 'VPN / Remote Access Engineer', 'WAF Engineer', 'DDoS Protection Specialist', 'NAC Engineer', 'DNS Security Specialist', 'Proxy / SWG Engineer', 'SASE / SSE Engineer', 'NDR Engineer', 'Secure Connectivity Specialist'],
  },
  {
    id: 'cloud-security',
    label: 'Cloud Security',
    description: 'Cloud-native and multi-cloud security controls across workloads and identities.',
    whyItMatters: 'Reduces cloud exposure and increases resilience in distributed environments.',
    color: { fill: '#0284c7', ring: '#7dd3fc', text: '#e0f2fe', edge: 'rgba(14,165,233,0.45)' },
    subdomains: ['AWS / Azure / GCP security', 'CSPM / CWPP / CIEM / CNAPP', 'Container & Kubernetes security', 'Cloud posture management', 'Key management', 'Cloud logging & monitoring', 'Serverless security'],
    roles: ['Cloud Security Engineer', 'Cloud Security Architect', 'Cloud Security Analyst', 'CSPM Specialist', 'CWPP Specialist', 'CNAPP Engineer', 'Kubernetes Security Engineer', 'Container Security Engineer', 'DevSecOps Engineer', 'Multi-cloud Security Lead', 'SaaS Security Specialist', 'Cloud IAM Specialist'],
  },
  {
    id: 'appsec-product-security',
    label: 'Application Security & Product Security',
    description: 'Embedding security into software and product lifecycles.',
    whyItMatters: 'Prevents software vulnerabilities and reduces product risk at scale.',
    color: { fill: '#c2410c', ring: '#fdba74', text: '#ffedd5', edge: 'rgba(249,115,22,0.45)' },
    subdomains: ['AppSec', 'SSDLC', 'Threat modeling', 'Secure code review', 'SAST / DAST / IAST', 'Software composition analysis', 'API security', 'CI/CD security'],
    roles: ['Application Security Engineer', 'Product Security Engineer', 'Secure SDLC Lead', 'DevSecOps Engineer', 'Security Code Reviewer', 'SAST / DAST / SCA Specialist', 'API Security Engineer', 'Mobile App Security Engineer', 'Web App Security Engineer', 'Software Supply Chain Security Engineer', 'Secure Build Pipeline Engineer', 'Threat Modeling Specialist', 'Secure Coding Champion'],
  },
  {
    id: 'soc-detection-response',
    label: 'Security Operations / SOC / Detection & Response',
    description: 'Continuous monitoring, detection engineering, incident response, and forensics.',
    whyItMatters: 'Improves time to detect, respond, and recover from cyber incidents.',
    color: { fill: '#b45309', ring: '#fcd34d', text: '#fef3c7', edge: 'rgba(245,158,11,0.42)' },
    subdomains: ['SOC', 'SIEM', 'SOAR', 'Detection engineering', 'Incident response', 'Forensics', 'Malware analysis', 'Threat hunting'],
    roles: ['SOC Analyst L1 / L2 / L3', 'SOC Manager', 'Detection Engineer', 'SIEM Engineer', 'SOAR Engineer', 'Threat Hunter', 'Incident Responder', 'DFIR Analyst', 'Digital Forensics Specialist', 'Malware Analyst', 'Blue Team Operator', 'Breach Response Coordinator', 'Security Monitoring Engineer', 'Use Case Detection Analyst', 'Purple Team Lead'],
  },
  {
    id: 'offensive-security',
    label: 'Offensive Security',
    description: 'Adversary simulation and proactive security validation.',
    whyItMatters: 'Identifies exploitable gaps before adversaries do.',
    color: { fill: '#b91c1c', ring: '#fca5a5', text: '#fee2e2', edge: 'rgba(248,113,113,0.45)' },
    subdomains: ['Pentest', 'Red teaming', 'Adversary simulation', 'Social engineering', 'Exploit research', 'Security validation', 'Attack path analysis'],
    roles: ['Penetration Tester', 'Red Team Operator', 'Red Team Lead', 'Ethical Hacker', 'Adversary Emulation Specialist', 'Exploit Developer', 'Web App Pentester', 'Mobile Pentester', 'Cloud Pentester', 'Internal Infrastructure Pentester', 'Social Engineering Specialist', 'Physical Security Tester', 'Purple Team Specialist'],
  },
  {
    id: 'threat-intelligence-analysis',
    label: 'Threat Intelligence & Cyber Analysis',
    description: 'Threat actor, campaign, and behavior intelligence for decision support.',
    whyItMatters: 'Connects external adversary context to internal defensive priorities.',
    color: { fill: '#7c3aed', ring: '#c4b5fd', text: '#ede9fe', edge: 'rgba(167,139,250,0.45)' },
    subdomains: ['CTI', 'IOC analysis', 'TTP mapping', 'MITRE ATT&CK mapping', 'Campaign tracking', 'Intelligence sharing', 'Threat actor profiling'],
    roles: ['Threat Intelligence Analyst', 'Cyber Intelligence Analyst', 'CTI Lead', 'IOC / TTP Analyst', 'Strategic Intelligence Analyst', 'Tactical Intelligence Analyst', 'Operational Intelligence Analyst', 'Threat Researcher', 'Threat Landscape Analyst', 'Dark Web Analyst', 'Intelligence Fusion Analyst'],
  },
  {
    id: 'vulnerability-exposure-management',
    label: 'Vulnerability Management & Exposure Management',
    description: 'Continuous discovery, prioritization, and remediation of exposure.',
    whyItMatters: 'Reduces exploitability through disciplined exposure reduction programs.',
    color: { fill: '#65a30d', ring: '#bef264', text: '#f7fee7', edge: 'rgba(163,230,53,0.45)' },
    subdomains: ['Vulnerability scanning', 'Exposure management', 'Patch management', 'Asset inventory', 'Risk-based prioritization', 'External attack surface', 'Remediation tracking'],
    roles: ['Vulnerability Management Lead', 'Vulnerability Analyst', 'Exposure Management Analyst', 'Attack Surface Management Specialist', 'Patch Management Lead', 'Remediation Coordinator', 'Security Validation Analyst', 'Asset Discovery Specialist', 'VM Tool Administrator', 'Risk-Based Prioritization Analyst', 'Threat Exposure Analyst'],
  },
  {
    id: 'data-privacy-crypto',
    label: 'Data Security, Privacy & Cryptography',
    description: 'Data-centric protection, cryptography, privacy engineering, and key lifecycle.',
    whyItMatters: 'Safeguards sensitive data and supports trust, compliance, and resilience.',
    color: { fill: '#0f766e', ring: '#5eead4', text: '#ccfbf1', edge: 'rgba(45,212,191,0.45)' },
    subdomains: ['Data classification', 'DLP', 'Encryption', 'PKI', 'HSM', 'Key lifecycle', 'Database activity monitoring', 'Privacy by design'],
    roles: ['Data Security Manager', 'Data Protection Specialist', 'DLP Engineer', 'Database Security Specialist', 'PKI Engineer', 'Cryptography Specialist', 'Key Management Specialist', 'HSM Engineer', 'Secrets Management Engineer', 'Certificate Management Specialist', 'Privacy Engineer', 'Data Privacy Analyst', 'Privacy Program Manager', 'Data Governance Security Lead'],
  },
  {
    id: 'endpoint-platform-infrastructure',
    label: 'Endpoint, Platform & Infrastructure Security',
    description: 'Endpoint, host, platform, and infrastructure-level protection and hardening.',
    whyItMatters: 'Secures foundational systems that power business operations.',
    color: { fill: '#334155', ring: '#94a3b8', text: '#e2e8f0', edge: 'rgba(148,163,184,0.45)' },
    subdomains: ['Endpoint protection', 'EDR/XDR', 'OS hardening', 'Server security', 'Email security', 'Device control', 'Platform protection'],
    roles: ['Endpoint Security Engineer', 'EDR / XDR Engineer', 'Windows Security Engineer', 'Linux Security Engineer', 'Server Hardening Specialist', 'Platform Security Engineer', 'Virtualization Security Engineer', 'Email Security Engineer', 'MDM / UEM Engineer', 'Infrastructure Security Analyst'],
  },
  {
    id: 'ot-ics-iot-embedded',
    label: 'OT / ICS / IoT / Embedded Security',
    description: 'Industrial and embedded system cyber protection in safety-critical environments.',
    whyItMatters: 'Protects critical infrastructure and cyber-physical systems.',
    color: { fill: '#9a3412', ring: '#fdba74', text: '#ffedd5', edge: 'rgba(234,88,12,0.45)' },
    subdomains: ['Industrial control systems', 'OT network segregation', 'PLC / SCADA security', 'IoT firmware security', 'Safety-security integration', 'Industrial monitoring'],
    roles: ['OT Security Engineer', 'ICS Security Architect', 'Industrial Cybersecurity Analyst', 'IoT Security Engineer', 'Embedded Security Engineer', 'SCADA Security Specialist', 'IIoT Security Researcher', 'CPS Security Engineer'],
  },
  {
    id: 'resilience-bcp-dr',
    label: 'Resilience, BCP, DR & Crisis Management',
    description: 'Planning, testing, and governance for continuity and operational resilience.',
    whyItMatters: 'Ensures organizations can withstand and recover from disruption.',
    color: { fill: '#ca8a04', ring: '#fde68a', text: '#fef9c3', edge: 'rgba(250,204,21,0.45)' },
    subdomains: ['BCP', 'DRP', 'Crisis management', 'Tabletop exercises', 'Recovery validation', 'Operational resilience', 'RTO / RPO governance'],
    roles: ['Cyber Resilience Manager', 'Business Continuity Manager', 'Disaster Recovery Lead', 'Crisis Management Coordinator', 'Tabletop Exercise Lead', 'Recovery Testing Manager', 'Operational Resilience Analyst', 'Backup / Recovery Security Specialist'],
  },
  {
    id: 'awareness-training-culture',
    label: 'Security Awareness, Training & Culture',
    description: 'Human-centric cybersecurity behavior, training, and culture development.',
    whyItMatters: 'Reduces people-related risk and improves security outcomes across teams.',
    color: { fill: '#e11d48', ring: '#fda4af', text: '#ffe4e6', edge: 'rgba(244,63,94,0.42)' },
    subdomains: ['Awareness programs', 'Training', 'Phishing simulations', 'Security culture', 'Behavior change', 'Executive awareness'],
    roles: ['Security Awareness Manager', 'Cybersecurity Trainer', 'Security Culture Lead', 'Phishing Simulation Specialist', 'Security Communications Specialist', 'Cyber Exercise Facilitator', 'Learning & Development Cyber Lead'],
  },
  {
    id: 'cyber-law-privacy-trust-policy',
    label: 'Cyber Law, Privacy, Trust & Policy',
    description: 'Legal, privacy, policy, and trust governance for cyber risk.',
    whyItMatters: 'Connects security execution with legal obligations and digital trust.',
    color: { fill: '#6d28d9', ring: '#c4b5fd', text: '#ede9fe', edge: 'rgba(139,92,246,0.4)' },
    subdomains: ['Cyber law', 'Privacy regulation', 'Breach notification', 'Contractual security clauses', 'Policy drafting', 'Legal-risk coordination'],
    roles: ['Cyber Legal Counsel', 'Privacy Counsel', 'Data Protection Officer', 'Policy Manager', 'Cyber Regulatory Specialist', 'AI Governance Officer', 'Digital Trust Officer', 'eDiscovery / Legal Hold Specialist'],
  },
  {
    id: 'security-research-advanced-labs',
    label: 'Security Research & Advanced Labs',
    description: 'Research-driven security innovation and advanced experimentation.',
    whyItMatters: 'Generates new detection, analysis, and defensive techniques.',
    color: { fill: '#be185d', ring: '#f9a8d4', text: '#fce7f3', edge: 'rgba(236,72,153,0.42)' },
    subdomains: ['Research', 'Zero-day analysis', 'Malware reverse engineering', 'Novel detection methods', 'Security experimentation'],
    roles: ['Security Researcher', 'Malware Researcher', 'Applied Cryptography Researcher', 'Vulnerability Researcher', 'Exploit Researcher', 'Detection Researcher', 'Threat Research Scientist', 'AI Security Researcher'],
  },
  {
    id: 'ai-security-risk-genai',
    label: 'AI Security / AI Risk / GenAI Security',
    description: 'Security engineering, governance, and risk controls for AI/ML systems.',
    whyItMatters: 'Mitigates AI-specific threats while enabling safe AI adoption.',
    color: { fill: '#7c3aed', ring: '#a5b4fc', text: '#e0e7ff', edge: 'rgba(124,58,237,0.5)' },
    subdomains: ['Secure AI/ML lifecycle', 'LLM security', 'Prompt injection defense', 'Model theft / extraction defense', 'Data poisoning defense', 'Adversarial ML', 'Model access control', 'AI governance', 'Responsible AI controls', 'AI privacy', 'AI third-party model risk', 'RAG security', 'Agentic AI security', 'Model monitoring / drift / abuse detection'],
    roles: ['AI Security Engineer', 'AI Security Architect', 'AI Security Analyst', 'AI Red Team Specialist', 'LLM Security Engineer', 'Prompt Injection Tester', 'Model Risk Analyst', 'Adversarial ML Researcher', 'ML Security Engineer', 'AI Governance Lead', 'Responsible AI Security Officer', 'AI Privacy Engineer', 'Model Assurance / Model Validation Specialist', 'AI Supply Chain Security Analyst', 'AI Detection & Monitoring Engineer', 'AI Abuse / Misuse Investigator'],
  },
  {
    id: 'cross-functional-hybrid',
    label: 'Cross-functional / Hybrid Roles',
    description: 'Business-facing and hybrid leadership roles spanning multiple cyber functions.',
    whyItMatters: 'Bridges technical cybersecurity functions with business outcomes and delivery.',
    color: { fill: '#475569', ring: '#cbd5e1', text: '#f1f5f9', edge: 'rgba(148,163,184,0.5)' },
    subdomains: ['Program governance', 'Business alignment', 'Client security assurance', 'Transformation delivery'],
    roles: ['Security Consultant', 'Cybersecurity Analyst', 'Information Security Officer', 'Security Program Manager', 'Security Business Partner', 'Cyber Transformation Lead', 'Security Solutions Consultant', 'Client Security Assurance Manager', 'Security Operations Project Manager', 'Technical Security Account Manager', 'Cyber Product Manager'],
  },
];

export const featuredCoreRoles = new Set([
  'chief-information-security-officer-ciso', 'security-architect', 'security-engineer', 'grc-analyst', 'cyber-risk-manager',
  'compliance-manager', 'iam-engineer', 'pam-analyst', 'cloud-security-engineer', 'application-security-engineer',
  'devsecops-engineer', 'soc-analyst-l1-l2-l3', 'incident-responder', 'threat-hunter', 'dfir-analyst', 'penetration-tester',
  'red-team-operator', 'threat-intelligence-analyst', 'vulnerability-analyst', 'data-protection-specialist',
  'cryptography-specialist', 'privacy-engineer', 'ot-security-engineer', 'business-continuity-manager',
  'security-awareness-manager', 'ai-security-engineer', 'ai-governance-lead', 'llm-security-engineer',
]);

const colLeft = 460;
const colCenter = 1020;
const colRight = 1580;
const rowGap = 320;
const subStep = 34;
const roleStep = 30;

export function buildSecurityMapData(): SecurityMapData {
  const nodes: SecurityMapNode[] = [];
  const edges: SecurityMapData['edges'] = [];

  categoryFamilies.forEach((category, idx) => {
    const baseY = 180 + idx * rowGap;
    const categoryId = `category-${category.id}`;

    nodes.push({
      id: categoryId,
      label: category.label,
      type: 'category',
      categoryId: category.id,
      x: colCenter,
      y: baseY,
      description: category.description,
      relatedIds: [],
    });

    category.subdomains.forEach((sub, sIdx) => {
      const id = `subdomain-${category.id}-${slugify(sub)}`;
      nodes.push({
        id,
        label: sub,
        type: 'subdomain',
        categoryId: category.id,
        x: colLeft,
        y: baseY - ((category.subdomains.length - 1) * subStep) / 2 + sIdx * subStep,
        description: `${sub} within ${category.label}.`,
        relatedIds: [categoryId],
      });
      edges.push({ id: `${categoryId}-${id}`, source: categoryId, target: id, categoryId: category.id });
    });

    category.roles.forEach((role, rIdx) => {
      const id = `role-${category.id}-${slugify(role)}`;
      nodes.push({
        id,
        label: role,
        type: 'role',
        categoryId: category.id,
        x: colRight,
        y: baseY - ((category.roles.length - 1) * roleStep) / 2 + rIdx * roleStep,
        description: `${role} role in ${category.label}.`,
        relatedIds: [categoryId],
        coreRole: featuredCoreRoles.has(slugify(role)),
      });
      edges.push({ id: `${categoryId}-${id}`, source: categoryId, target: id, categoryId: category.id });
    });
  });

  const categoryNodes = nodes.filter((n) => n.type === 'category');
  for (let i = 0; i < categoryNodes.length - 1; i += 1) {
    edges.push({
      id: `category-chain-${i}`,
      source: categoryNodes[i].id,
      target: categoryNodes[i + 1].id,
      categoryId: categoryNodes[i].categoryId,
    });
  }

  return { categories: categoryFamilies, nodes, edges };
}

export const securityMapData = buildSecurityMapData();
