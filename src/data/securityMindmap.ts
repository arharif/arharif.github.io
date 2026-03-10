import { ApprovedTheme, ApprovedThemeOption, MindmapCategory, MindmapEdge, MindmapNode } from '@/components/security-mindmap/types';

export const categoryColors: Record<MindmapCategory, { fill: string; glow: string; ring: string; text: string }> = {
  journey: { fill: '#7dd3fc', glow: 'rgba(125,211,252,0.45)', ring: '#bae6fd', text: '#e0f2fe' },
  architecture: { fill: '#60a5fa', glow: 'rgba(96,165,250,0.40)', ring: '#93c5fd', text: '#dbeafe' },
  identity: { fill: '#38bdf8', glow: 'rgba(56,189,248,0.40)', ring: '#7dd3fc', text: '#e0f2fe' },
  operations: { fill: '#fbbf24', glow: 'rgba(251,191,36,0.38)', ring: '#fcd34d', text: '#fef3c7' },
  governance: { fill: '#34d399', glow: 'rgba(52,211,153,0.38)', ring: '#6ee7b7', text: '#d1fae5' },
  assurance: { fill: '#f59e0b', glow: 'rgba(245,158,11,0.36)', ring: '#fbbf24', text: '#fef3c7' },
  awareness: { fill: '#a78bfa', glow: 'rgba(167,139,250,0.36)', ring: '#c4b5fd', text: '#ede9fe' },
  career: { fill: '#22d3ee', glow: 'rgba(34,211,238,0.35)', ring: '#67e8f9', text: '#cffafe' },
  frameworks: { fill: '#818cf8', glow: 'rgba(129,140,248,0.34)', ring: '#a5b4fc', text: '#e0e7ff' },
  resilience: { fill: '#10b981', glow: 'rgba(16,185,129,0.35)', ring: '#6ee7b7', text: '#d1fae5' },
  appsec: { fill: '#fb7185', glow: 'rgba(251,113,133,0.34)', ring: '#fda4af', text: '#ffe4e6' },
  future: { fill: '#e2e8f0', glow: 'rgba(255,255,255,0.55)', ring: '#ffffff', text: '#f8fafc' },
  ai: { fill: '#60a5fa', glow: 'rgba(96,165,250,0.58)', ring: '#bfdbfe', text: '#eff6ff' },
};

const j = (id: string) => id;

export const mindmapNodes: MindmapNode[] = [
  { id: j('curiosity'), label: 'Curiosity', category: 'journey', cluster: 'Journey', description: 'The drive to ask better questions.', whyItMatters: 'Curiosity is the origin of adaptive cybersecurity thinking.', related: [j('learning')], journeyStage: 1, emphasis: 'high', colorKey: 'journey', keywords: ['start', 'mindset'], x: 80, y: 250 },
  { id: j('learning'), label: 'Learning', category: 'journey', cluster: 'Journey', description: 'Building fundamentals through study and repetition.', whyItMatters: 'Learning compounds capability across all domains.', related: [j('experimentation')], journeyStage: 2, emphasis: 'high', colorKey: 'journey', keywords: ['study', 'fundamentals'], x: 210, y: 200 },
  { id: j('experimentation'), label: 'Experimentation', category: 'journey', cluster: 'Journey', description: 'Turning theory into practical proof.', whyItMatters: 'Experimentation creates practical judgement under uncertainty.', related: [j('technical-foundations')], journeyStage: 3, emphasis: 'high', colorKey: 'journey', keywords: ['labs', 'practice'], x: 340, y: 260 },
  { id: j('technical-foundations'), label: 'Technical Foundations', category: 'journey', cluster: 'Journey', description: 'Networks, systems, protocols, and engineering depth.', whyItMatters: 'Strong foundations prevent shallow decision making.', related: [j('cybersecurity')], journeyStage: 4, emphasis: 'high', colorKey: 'journey', keywords: ['systems', 'network', 'engineering'], x: 500, y: 205 },
  { id: j('cybersecurity'), label: 'Cybersecurity', category: 'journey', cluster: 'Journey', description: 'Security as a discipline of risk, trust, and resilience.', whyItMatters: 'Cybersecurity aligns technology with business continuity.', related: [j('specialization')], journeyStage: 5, emphasis: 'high', colorKey: 'journey', keywords: ['security core'], x: 650, y: 255 },
  { id: j('specialization'), label: 'Specialization', category: 'journey', cluster: 'Journey', description: 'Developing deep domain capabilities.', whyItMatters: 'Specialization builds high-confidence strategic execution.', related: [j('governance-node')], journeyStage: 6, emphasis: 'medium', colorKey: 'journey', keywords: ['depth', 'domains'], x: 810, y: 200 },
  { id: j('governance-node'), label: 'Governance', category: 'journey', cluster: 'Journey', description: 'From technical controls to accountable decision systems.', whyItMatters: 'Governance operationalizes trust across the enterprise.', related: [j('leadership')], journeyStage: 7, emphasis: 'high', colorKey: 'journey', keywords: ['governance', 'accountability'], x: 960, y: 250 },
  { id: j('leadership'), label: 'Leadership', category: 'journey', cluster: 'Journey', description: 'Influencing direction, priorities, and culture.', whyItMatters: 'Security outcomes depend on cross-functional leadership.', related: [j('strategy')], journeyStage: 8, emphasis: 'high', colorKey: 'journey', keywords: ['influence', 'ownership'], x: 1100, y: 195 },
  { id: j('strategy'), label: 'Strategy', category: 'journey', cluster: 'Journey', description: 'Translating risk into enterprise decisions.', whyItMatters: 'Strategy links investment to measurable resilience.', related: [j('ciso-service')], journeyStage: 9, emphasis: 'high', colorKey: 'journey', keywords: ['roadmap', 'priorities'], x: 1240, y: 250 },
  { id: j('ciso-service'), label: 'CISO as a Service', category: 'future', cluster: 'Future Vision', description: 'Fractional executive cybersecurity leadership.', whyItMatters: 'Delivers strategic security leadership with agility.', related: [j('advisory'), j('fractional-leadership')], journeyStage: 10, emphasis: 'high', futureVision: true, colorKey: 'future', keywords: ['ciso', 'fractional', 'leadership'], x: 1380, y: 210 },

  { id: j('security-architecture'), label: 'Security Architecture', category: 'architecture', cluster: 'Security Architecture', description: 'Secure-by-design enterprise architecture patterns.', whyItMatters: 'Architecture decisions set long-term security posture.', related: [j('network-design'), j('cloud-security'), j('data-protection')], colorKey: 'architecture', keywords: ['architecture', 'design'], x: 650, y: 460 },
  { id: j('network-design'), label: 'Network Design', category: 'architecture', cluster: 'Security Architecture', description: 'Segmentation, routing trust boundaries, and secure topology.', whyItMatters: 'Well-designed networks reduce blast radius.', related: [j('ddos-prevention')], colorKey: 'architecture', keywords: ['network', 'segmentation'], x: 500, y: 540 },
  { id: j('ddos-prevention'), label: 'DDoS Prevention', category: 'architecture', cluster: 'Security Architecture', description: 'Capacity and control strategies against volumetric attacks.', whyItMatters: 'Availability is a core executive risk metric.', related: [j('security-operations')], colorKey: 'architecture', keywords: ['ddos', 'availability'], x: 430, y: 620 },
  { id: j('cloud-security'), label: 'Cloud Security', category: 'architecture', cluster: 'Security Architecture', description: 'Control models for shared-responsibility platforms.', whyItMatters: 'Cloud velocity requires strong guardrails.', related: [j('container-security')], colorKey: 'architecture', keywords: ['cloud', 'guardrails'], x: 650, y: 620 },
  { id: j('data-protection'), label: 'Data Protection', category: 'architecture', cluster: 'Security Architecture', description: 'Classify, secure, and monitor sensitive data lifecycles.', whyItMatters: 'Data risk drives legal and reputational impact.', related: [j('encryption-standards')], colorKey: 'architecture', keywords: ['data', 'protection'], x: 820, y: 560 },
  { id: j('container-security'), label: 'Container Security', category: 'architecture', cluster: 'Security Architecture', description: 'Securing workload images, runtime, and orchestration.', whyItMatters: 'Modern software delivery depends on secure containers.', related: [j('appsec')], colorKey: 'architecture', keywords: ['container', 'kubernetes'], x: 760, y: 680 },

  { id: j('identity-trust'), label: 'Identity, Access & Trust', category: 'identity', cluster: 'Identity', description: 'Identity-centric control of enterprise access.', whyItMatters: 'Identity is the new perimeter.', related: [j('iam'), j('pam'), j('mfa-sso')], colorKey: 'identity', keywords: ['identity', 'trust'], x: 930, y: 470 },
  { id: j('iam'), label: 'IAM', category: 'identity', cluster: 'Identity', description: 'Lifecycle and policy management of identities.', whyItMatters: 'IAM anchors secure operations at scale.', related: [j('federated-identity')], colorKey: 'identity', keywords: ['iam'], x: 980, y: 600 },
  { id: j('pam'), label: 'Privileged Access Management', category: 'identity', cluster: 'Identity', description: 'Control and monitor privileged credentials.', whyItMatters: 'Privilege misuse has outsized business impact.', related: [j('vaulting')], colorKey: 'identity', keywords: ['pam', 'privilege'], x: 1120, y: 560 },
  { id: j('mfa-sso'), label: 'MFA & SSO', category: 'identity', cluster: 'Identity', description: 'Strong authentication with better user experience.', whyItMatters: 'Balancing security and productivity is a leadership mandate.', related: [j('certificate-management')], colorKey: 'identity', keywords: ['mfa', 'sso'], x: 870, y: 680 },
  { id: j('federated-identity'), label: 'Federated Identity', category: 'identity', cluster: 'Identity', description: 'Cross-domain trust and identity federation.', whyItMatters: 'Essential for modern multi-platform ecosystems.', related: [j('certificate-management')], colorKey: 'identity', keywords: ['federation'], x: 1030, y: 730 },
  { id: j('certificate-management'), label: 'Certificate Management', category: 'identity', cluster: 'Identity', description: 'PKI trust lifecycle operations.', whyItMatters: 'Certificate hygiene sustains trust infrastructure.', related: [j('encryption-standards')], colorKey: 'identity', keywords: ['pki', 'certificates'], x: 1180, y: 670 },
  { id: j('vaulting'), label: 'Vaulting & Secrets', category: 'identity', cluster: 'Identity', description: 'Secure storage and rotation of secrets/keys.', whyItMatters: 'Secret sprawl is a frequent breach catalyst.', related: [j('hsm')], colorKey: 'identity', keywords: ['vault', 'secrets'], x: 1230, y: 760 },
  { id: j('hsm'), label: 'HSM', category: 'identity', cluster: 'Identity', description: 'Hardware-backed cryptographic key assurance.', whyItMatters: 'Protects highest-value cryptographic assets.', related: [j('cryptography')], colorKey: 'identity', keywords: ['hsm', 'keys'], x: 1340, y: 700 },
  { id: j('encryption-standards'), label: 'Encryption Standards', category: 'identity', cluster: 'Identity', description: 'Applying approved cryptographic standards.', whyItMatters: 'Reduces legal and technical cryptographic risk.', related: [j('cryptography')], colorKey: 'identity', keywords: ['encryption'], x: 1330, y: 590 },
  { id: j('cryptography'), label: 'Cryptography', category: 'identity', cluster: 'Identity', description: 'Mathematical trust primitives for security.', whyItMatters: 'Cryptography underpins confidentiality and integrity.', related: [j('future-ai-security')], colorKey: 'identity', keywords: ['crypto'], x: 1430, y: 640 },

  { id: j('security-operations'), label: 'Security Operations', category: 'operations', cluster: 'Operations', description: 'Operational detection, response, and resilience.', whyItMatters: 'Operations determines real-world incident outcomes.', related: [j('soc'), j('incident-response'), j('threat-hunting')], colorKey: 'operations', keywords: ['soc', 'ops'], x: 680, y: 860 },
  { id: j('soc'), label: 'Security Operations Center', category: 'operations', cluster: 'Operations', description: 'Central coordination for monitoring and escalation.', whyItMatters: 'SOC quality is core to response maturity.', related: [j('siem')], colorKey: 'operations', keywords: ['soc'], x: 520, y: 940 },
  { id: j('incident-response'), label: 'Incident Response', category: 'operations', cluster: 'Operations', description: 'Preparation, containment, eradication, and recovery.', whyItMatters: 'IR speed and clarity reduce business impact.', related: [j('forensics')], colorKey: 'operations', keywords: ['response'], x: 700, y: 980 },
  { id: j('siem'), label: 'SIEM', category: 'operations', cluster: 'Operations', description: 'Telemetry aggregation and analytic detection.', whyItMatters: 'SIEM creates enterprise detection visibility.', related: [j('soar')], colorKey: 'operations', keywords: ['siem', 'logs'], x: 560, y: 1060 },
  { id: j('soar'), label: 'SOAR', category: 'operations', cluster: 'Operations', description: 'Automation for triage and incident workflows.', whyItMatters: 'Automation scales response with consistency.', related: [j('active-defense')], colorKey: 'operations', keywords: ['soar', 'automation'], x: 710, y: 1120 },
  { id: j('threat-hunting'), label: 'Threat Hunting', category: 'operations', cluster: 'Operations', description: 'Hypothesis-driven proactive adversary discovery.', whyItMatters: 'Hunting raises adversary detection confidence.', related: [j('threat-intelligence')], colorKey: 'operations', keywords: ['hunting'], x: 860, y: 1020 },
  { id: j('forensics'), label: 'Forensics', category: 'operations', cluster: 'Operations', description: 'Evidence-driven analysis for breach understanding.', whyItMatters: 'Forensics supports legal, strategic, and technical closure.', related: [j('breach-notification')], colorKey: 'operations', keywords: ['forensics'], x: 860, y: 1120 },
  { id: j('active-defense'), label: 'Active Defense', category: 'operations', cluster: 'Operations', description: 'Adaptive defense strategy and containment controls.', whyItMatters: 'Active defense improves adversary disruption.', related: [j('blue-team')], colorKey: 'operations', keywords: ['defense'], x: 980, y: 1180 },
  { id: j('blue-team'), label: 'Blue Team', category: 'operations', cluster: 'Operations', description: 'Defender-focused operations and hardening.', whyItMatters: 'Blue-team maturity drives defense reliability.', related: [j('red-team')], colorKey: 'operations', keywords: ['blue team'], x: 1120, y: 1120 },
  { id: j('red-team'), label: 'Red Team', category: 'operations', cluster: 'Operations', description: 'Adversarial simulation to validate resilience.', whyItMatters: 'Red-team insights sharpen detection and response.', related: [j('vulnerability-management')], colorKey: 'operations', keywords: ['red team'], x: 1220, y: 1030 },
  { id: j('vulnerability-management'), label: 'Vulnerability Management', category: 'operations', cluster: 'Operations', description: 'Prioritized remediation based on risk.', whyItMatters: 'Systematic remediation lowers exploitability.', related: [j('dast')], colorKey: 'operations', keywords: ['vulnerability', 'remediation'], x: 1270, y: 910 },
  { id: j('breach-notification'), label: 'Breach Notification', category: 'operations', cluster: 'Operations', description: 'Regulated communication and escalation paths.', whyItMatters: 'Notification quality impacts trust and legal exposure.', related: [j('laws-regulations')], colorKey: 'operations', keywords: ['notification'], x: 1010, y: 960 },

  { id: j('governance-risk'), label: 'Governance, Compliance & Oversight', category: 'governance', cluster: 'Governance', description: 'Decision structures for accountability and risk.', whyItMatters: 'Transforms technical security into executive assurance.', related: [j('risk-assessment'), j('kpi-kri')], colorKey: 'governance', keywords: ['governance', 'compliance'], x: 1060, y: 420 },
  { id: j('laws-regulations'), label: 'Laws & Regulations', category: 'governance', cluster: 'Governance', description: 'Regulatory obligations and jurisdictional requirements.', whyItMatters: 'Compliance prevents avoidable legal and brand damage.', related: [j('policy-standards')], colorKey: 'governance', keywords: ['law', 'regulation'], x: 1190, y: 360 },
  { id: j('policy-standards'), label: 'Policy, Procedure, Standard', category: 'governance', cluster: 'Governance', description: 'Documented governance controls and operating guidance.', whyItMatters: 'Clear standards reduce inconsistency and ambiguity.', related: [j('compliance-enforcement')], colorKey: 'governance', keywords: ['policy', 'standards'], x: 1310, y: 410 },
  { id: j('compliance-enforcement'), label: 'Compliance & Enforcement', category: 'governance', cluster: 'Governance', description: 'Operational verification and accountability mechanisms.', whyItMatters: 'Governance without enforcement is performative.', related: [j('executive-involvement')], colorKey: 'governance', keywords: ['enforcement'], x: 1360, y: 500 },
  { id: j('executive-involvement'), label: 'Executive Management Involvement', category: 'governance', cluster: 'Governance', description: 'Executive sponsorship for risk-informed decisions.', whyItMatters: 'Leadership engagement accelerates control maturity.', related: [j('strategy')], colorKey: 'governance', keywords: ['executive'], x: 1240, y: 320 },
  { id: j('kpi-kri'), label: 'KPI / KRI', category: 'governance', cluster: 'Governance', description: 'Performance and risk indicators for reporting.', whyItMatters: 'Metrics convert security posture into decision intelligence.', related: [j('reports-scorecards')], colorKey: 'governance', keywords: ['kpi', 'kri'], x: 1080, y: 320 },
  { id: j('reports-scorecards'), label: 'Reports & Scorecards', category: 'governance', cluster: 'Governance', description: 'Executive reporting for oversight and prioritization.', whyItMatters: 'Clear reporting creates cross-functional alignment.', related: [j('strategy-roadmap')], colorKey: 'governance', keywords: ['reporting', 'scorecards'], x: 1160, y: 250 },
  { id: j('risk-assessment'), label: 'Risk Assessment', category: 'governance', cluster: 'Governance', description: 'Risk identification and prioritization process.', whyItMatters: 'Risk assessment drives investment discipline.', related: [j('third-party-risk')], colorKey: 'governance', keywords: ['risk'], x: 980, y: 360 },
  { id: j('third-party-risk'), label: '3rd / 4th Party Risk', category: 'governance', cluster: 'Governance', description: 'Supplier ecosystem risk governance.', whyItMatters: 'Third-party exposure can bypass internal controls.', related: [j('enterprise-risk')], colorKey: 'governance', keywords: ['third party', 'supply chain'], x: 910, y: 430 },

  { id: j('appsec'), label: 'Application Security', category: 'appsec', cluster: 'Application Security', description: 'Embedding security into software lifecycle.', whyItMatters: 'Software risk is business risk.', related: [j('s-sdlc'), j('sast'), j('api-security')], colorKey: 'appsec', keywords: ['appsec'], x: 430, y: 780 },
  { id: j('s-sdlc'), label: 'S-SDLC & Shift Left', category: 'appsec', cluster: 'Application Security', description: 'Security integrated early in development.', whyItMatters: 'Earlier fixes are cheaper and more effective.', related: [j('ci-cd-security')], colorKey: 'appsec', keywords: ['sdlc', 'shift left'], x: 300, y: 860 },
  { id: j('ci-cd-security'), label: 'CI/CD Integration', category: 'appsec', cluster: 'Application Security', description: 'Pipeline-integrated security controls.', whyItMatters: 'Continuous delivery requires continuous security.', related: [j('source-code-scan')], colorKey: 'appsec', keywords: ['pipeline'], x: 220, y: 950 },
  { id: j('source-code-scan'), label: 'Source Code Scan', category: 'appsec', cluster: 'Application Security', description: 'Automated code-level weakness detection.', whyItMatters: 'Code scanning catches high-volume defects early.', related: [j('sast')], colorKey: 'appsec', keywords: ['code scan'], x: 310, y: 1040 },
  { id: j('sast'), label: 'SAST', category: 'appsec', cluster: 'Application Security', description: 'Static analysis for source/binary flaws.', whyItMatters: 'SAST supports repeatable secure coding standards.', related: [j('dast')], colorKey: 'appsec', keywords: ['sast'], x: 430, y: 1090 },
  { id: j('dast'), label: 'DAST', category: 'assurance', cluster: 'Testing & Assurance', description: 'Dynamic testing against running applications.', whyItMatters: 'Finds runtime vulnerabilities static analysis can miss.', related: [j('pen-testing')], colorKey: 'assurance', keywords: ['dast'], x: 520, y: 1160 },
  { id: j('api-security'), label: 'API Security', category: 'appsec', cluster: 'Application Security', description: 'Protecting APIs as critical integration surfaces.', whyItMatters: 'API exposure is central to modern attack surfaces.', related: [j('owasp')], colorKey: 'appsec', keywords: ['api'], x: 560, y: 820 },

  { id: j('pen-testing'), label: 'Penetration Testing', category: 'assurance', cluster: 'Testing & Assurance', description: 'Controlled adversarial testing to validate controls.', whyItMatters: 'Testing validates assumptions and reveals blind spots.', related: [j('asset-inventory')], colorKey: 'assurance', keywords: ['pentest'], x: 680, y: 1230 },
  { id: j('asset-inventory'), label: 'Asset Inventory', category: 'assurance', cluster: 'Testing & Assurance', description: 'Knowing what exists before securing it.', whyItMatters: 'Visibility is prerequisite to risk management.', related: [j('risk-monitoring')], colorKey: 'assurance', keywords: ['assets'], x: 820, y: 1240 },
  { id: j('risk-monitoring'), label: 'Risk Monitoring Services', category: 'assurance', cluster: 'Testing & Assurance', description: 'Continuous insight into evolving risk posture.', whyItMatters: 'Monitoring keeps control maturity current.', related: [j('enterprise-risk')], colorKey: 'assurance', keywords: ['monitoring'], x: 950, y: 1220 },

  { id: j('threat-intelligence'), label: 'Threat Intelligence', category: 'awareness', cluster: 'Awareness', description: 'Operational intelligence from internal/external signals.', whyItMatters: 'Contextual intelligence improves prioritization speed.', related: [j('ioc-sharing')], colorKey: 'awareness', keywords: ['intel'], x: 980, y: 860 },
  { id: j('ioc-sharing'), label: 'IOC Sharing', category: 'awareness', cluster: 'Awareness', description: 'Collaborative detection signal exchange.', whyItMatters: 'Shared indicators improve collective defense.', related: [j('tabletop')], colorKey: 'awareness', keywords: ['ioc'], x: 1110, y: 860 },
  { id: j('tabletop'), label: 'Cyber Tabletop Exercises', category: 'awareness', cluster: 'Awareness', description: 'Scenario rehearsals for executive and technical readiness.', whyItMatters: 'Exercises improve response cohesion under pressure.', related: [j('crisis-management')], colorKey: 'awareness', keywords: ['tabletop', 'exercise'], x: 1230, y: 860 },
  { id: j('user-education'), label: 'User Education & Awareness', category: 'awareness', cluster: 'Awareness', description: 'Behavior-focused human-layer risk reduction.', whyItMatters: 'User behavior is a critical control surface.', related: [j('career-development')], colorKey: 'awareness', keywords: ['training', 'awareness'], x: 930, y: 760 },

  { id: j('career-development'), label: 'Career Development', category: 'career', cluster: 'Growth', description: 'Continuous professional growth and capability building.', whyItMatters: 'Career growth sustains long-term cybersecurity leadership.', related: [j('certifications'), j('self-study')], colorKey: 'career', keywords: ['career'], x: 260, y: 420 },
  { id: j('certifications'), label: 'Certifications', category: 'career', cluster: 'Growth', description: 'Structured validation of cybersecurity knowledge.', whyItMatters: 'Certification pathways accelerate trust and progression.', related: [j('conferences')], colorKey: 'career', keywords: ['certifications'], x: 140, y: 500 },
  { id: j('conferences'), label: 'Conferences & Peer Groups', category: 'career', cluster: 'Growth', description: 'Community exposure to current tactics and trends.', whyItMatters: 'Peer networks improve strategic awareness.', related: [j('coaches')], colorKey: 'career', keywords: ['conferences', 'community'], x: 220, y: 610 },
  { id: j('self-study'), label: 'Self Study', category: 'career', cluster: 'Growth', description: 'Independent skill deepening and experimentation.', whyItMatters: 'Self-study sustains compounding mastery.', related: [j('coaches')], colorKey: 'career', keywords: ['learning'], x: 350, y: 520 },
  { id: j('coaches'), label: 'Coaches & Role Models', category: 'career', cluster: 'Growth', description: 'Mentorship and strategic perspective transfer.', whyItMatters: 'Mentorship compresses years of trial-and-error.', related: [j('leadership')], colorKey: 'career', keywords: ['mentorship'], x: 320, y: 640 },

  { id: j('frameworks'), label: 'Frameworks & Standards', category: 'frameworks', cluster: 'Frameworks', description: 'Common language for cybersecurity governance.', whyItMatters: 'Frameworks align technical and executive decisions.', related: [j('nist'), j('iso27001'), j('cis-controls'), j('mitre')], colorKey: 'frameworks', keywords: ['frameworks'], x: 780, y: 360 },
  { id: j('nist'), label: 'NIST CSF', category: 'frameworks', cluster: 'Frameworks', description: 'Outcome-oriented cybersecurity program model.', whyItMatters: 'NIST CSF supports board-level communication.', related: [j('governance-risk')], colorKey: 'frameworks', keywords: ['nist'], x: 760, y: 280 },
  { id: j('iso27001'), label: 'ISO 27001 / 27017 / 27018', category: 'frameworks', cluster: 'Frameworks', description: 'Formalized information security management controls.', whyItMatters: 'ISO enables scalable governance credibility.', related: [j('isms')], colorKey: 'frameworks', keywords: ['iso'], x: 870, y: 300 },
  { id: j('owasp'), label: 'OWASP Top 10', category: 'frameworks', cluster: 'Frameworks', description: 'Common web application risk model.', whyItMatters: 'OWASP aligns AppSec priorities quickly.', related: [j('appsec')], colorKey: 'frameworks', keywords: ['owasp'], x: 640, y: 730 },
  { id: j('cis-controls'), label: 'CIS Controls / Benchmarks', category: 'frameworks', cluster: 'Frameworks', description: 'Prioritized baseline controls and hardening guidance.', whyItMatters: 'CIS helps sequence controls pragmatically.', related: [j('security-architecture')], colorKey: 'frameworks', keywords: ['cis'], x: 730, y: 430 },
  { id: j('mitre'), label: 'MITRE ATT&CK', category: 'frameworks', cluster: 'Frameworks', description: 'Adversary behavior knowledge base for detection mapping.', whyItMatters: 'MITRE improves detection engineering realism.', related: [j('threat-hunting')], colorKey: 'frameworks', keywords: ['mitre'], x: 860, y: 470 },

  { id: j('enterprise-risk'), label: 'Enterprise Risk Management', category: 'resilience', cluster: 'Resilience', description: 'Enterprise-wide governance of cyber and operational risk.', whyItMatters: 'ERM aligns security decisions with business outcomes.', related: [j('risk-register'), j('risk-appetite')], colorKey: 'resilience', keywords: ['erm'], x: 1140, y: 620 },
  { id: j('isms'), label: 'ISMS', category: 'resilience', cluster: 'Resilience', description: 'Management system for continuous security improvement.', whyItMatters: 'ISMS sustains consistent governance maturity.', related: [j('iso27001')], colorKey: 'resilience', keywords: ['isms'], x: 1030, y: 540 },
  { id: j('risk-appetite'), label: 'Risk Appetite', category: 'resilience', cluster: 'Resilience', description: 'Executive threshold for acceptable exposure.', whyItMatters: 'Defines strategic boundaries for action.', related: [j('risk-register')], colorKey: 'resilience', keywords: ['appetite'], x: 1230, y: 580 },
  { id: j('risk-register'), label: 'Risk Register', category: 'resilience', cluster: 'Resilience', description: 'Structured inventory of assessed security risks.', whyItMatters: 'Enables transparent prioritization and accountability.', related: [j('risk-treatment')], colorKey: 'resilience', keywords: ['register'], x: 1250, y: 700 },
  { id: j('risk-treatment'), label: 'Risk Treatment Actions', category: 'resilience', cluster: 'Resilience', description: 'Mitigate, transfer, avoid, or accept risk with discipline.', whyItMatters: 'Risk treatment turns analysis into execution.', related: [j('risk-acceptance')], colorKey: 'resilience', keywords: ['treatment'], x: 1360, y: 760 },
  { id: j('risk-acceptance'), label: 'Risk Acceptance Statement', category: 'resilience', cluster: 'Resilience', description: 'Formal business-approved residual risk decisions.', whyItMatters: 'Clarifies ownership and governance accountability.', related: [j('strategy')], colorKey: 'resilience', keywords: ['acceptance'], x: 1450, y: 830 },
  { id: j('bcp-dr'), label: 'BCP / DR Plan', category: 'resilience', cluster: 'Resilience', description: 'Continuity and disaster recovery preparedness.', whyItMatters: 'Resilience planning protects critical operations.', related: [j('crisis-management')], colorKey: 'resilience', keywords: ['bcp', 'dr'], x: 1160, y: 810 },
  { id: j('crisis-management'), label: 'Crisis Management', category: 'resilience', cluster: 'Resilience', description: 'Coordinated executive response during high-impact incidents.', whyItMatters: 'Crisis maturity preserves trust under pressure.', related: [j('leadership')], colorKey: 'resilience', keywords: ['crisis'], x: 1300, y: 880 },

  { id: j('advisory'), label: 'Advisory', category: 'future', cluster: 'Future Vision', description: 'Strategic advisory services for cybersecurity transformation.', whyItMatters: 'Advisory translates expertise into strategic momentum.', related: [j('strategy-roadmap')], futureVision: true, colorKey: 'future', keywords: ['advisory'], x: 1500, y: 180 },
  { id: j('strategy-roadmap'), label: 'Security Roadmap', category: 'future', cluster: 'Future Vision', description: 'Sequenced execution plan from posture to performance.', whyItMatters: 'Roadmaps convert ambition into executable milestones.', related: [j('fractional-leadership')], futureVision: true, colorKey: 'future', keywords: ['roadmap'], x: 1550, y: 280 },
  { id: j('future-ai-security'), label: 'AI Security', category: 'future', cluster: 'Future Vision', description: 'Governance and protection for AI-enabled systems.', whyItMatters: 'AI adoption requires disciplined security controls.', related: [j('resilience-future')], futureVision: true, colorKey: 'future', keywords: ['ai', 'future'], x: 1590, y: 420 },
  { id: j('resilience-future'), label: 'Resilience', category: 'future', cluster: 'Future Vision', description: 'Adaptive resilience as a strategic differentiator.', whyItMatters: 'Resilience sustains enterprise confidence during disruption.', related: [j('fractional-leadership')], futureVision: true, colorKey: 'future', keywords: ['resilience', 'future'], x: 1520, y: 520 },
  { id: j('fractional-leadership'), label: 'Fractional Leadership', category: 'future', cluster: 'Future Vision', description: 'Executive-level cyber leadership on-demand.', whyItMatters: 'Enables strategic leadership for scaling organizations.', related: [j('ciso-service')], futureVision: true, colorKey: 'future', keywords: ['fractional', 'leadership'], x: 1600, y: 620 },
];

const edge = (source: string, target: string, kind: MindmapEdge['kind'] = 'domain'): MindmapEdge => ({ id: `${source}-${target}`, source, target, kind });

export const mindmapEdges: MindmapEdge[] = [
  edge('curiosity', 'learning', 'journey'),
  edge('learning', 'experimentation', 'journey'),
  edge('experimentation', 'technical-foundations', 'journey'),
  edge('technical-foundations', 'cybersecurity', 'journey'),
  edge('cybersecurity', 'specialization', 'journey'),
  edge('specialization', 'governance-node', 'journey'),
  edge('governance-node', 'leadership', 'journey'),
  edge('leadership', 'strategy', 'journey'),
  edge('strategy', 'ciso-service', 'future'),

  edge('cybersecurity', 'security-architecture'),
  edge('cybersecurity', 'identity-trust'),
  edge('cybersecurity', 'security-operations'),
  edge('cybersecurity', 'governance-risk'),
  edge('cybersecurity', 'appsec'),
  edge('cybersecurity', 'frameworks'),
  edge('governance-node', 'governance-risk'),
  edge('strategy', 'governance-risk'),
  edge('strategy', 'enterprise-risk'),
  edge('leadership', 'executive-involvement'),

  edge('security-architecture', 'network-design'),
  edge('security-architecture', 'cloud-security'),
  edge('security-architecture', 'data-protection'),
  edge('cloud-security', 'container-security'),
  edge('data-protection', 'encryption-standards'),
  edge('network-design', 'ddos-prevention'),

  edge('identity-trust', 'iam'),
  edge('identity-trust', 'pam'),
  edge('identity-trust', 'mfa-sso'),
  edge('iam', 'federated-identity'),
  edge('pam', 'vaulting'),
  edge('vaulting', 'hsm'),
  edge('hsm', 'cryptography'),
  edge('mfa-sso', 'certificate-management'),
  edge('certificate-management', 'encryption-standards'),

  edge('security-operations', 'soc'),
  edge('security-operations', 'incident-response'),
  edge('security-operations', 'threat-hunting'),
  edge('soc', 'siem'),
  edge('siem', 'soar'),
  edge('incident-response', 'forensics'),
  edge('forensics', 'breach-notification'),
  edge('threat-hunting', 'threat-intelligence'),
  edge('soar', 'active-defense'),
  edge('active-defense', 'blue-team'),
  edge('blue-team', 'red-team'),
  edge('red-team', 'vulnerability-management'),
  edge('vulnerability-management', 'dast'),

  edge('governance-risk', 'laws-regulations'),
  edge('governance-risk', 'policy-standards'),
  edge('policy-standards', 'compliance-enforcement'),
  edge('governance-risk', 'risk-assessment'),
  edge('risk-assessment', 'third-party-risk'),
  edge('governance-risk', 'kpi-kri'),
  edge('kpi-kri', 'reports-scorecards'),
  edge('reports-scorecards', 'strategy-roadmap', 'future'),

  edge('appsec', 's-sdlc'),
  edge('s-sdlc', 'ci-cd-security'),
  edge('ci-cd-security', 'source-code-scan'),
  edge('source-code-scan', 'sast'),
  edge('appsec', 'api-security'),
  edge('api-security', 'owasp'),

  edge('dast', 'pen-testing'),
  edge('pen-testing', 'asset-inventory'),
  edge('asset-inventory', 'risk-monitoring'),

  edge('user-education', 'threat-intelligence'),
  edge('threat-intelligence', 'ioc-sharing'),
  edge('ioc-sharing', 'tabletop'),
  edge('tabletop', 'crisis-management'),

  edge('career-development', 'certifications'),
  edge('career-development', 'self-study'),
  edge('certifications', 'conferences'),
  edge('conferences', 'coaches'),
  edge('self-study', 'coaches'),
  edge('coaches', 'leadership'),

  edge('frameworks', 'nist'),
  edge('frameworks', 'iso27001'),
  edge('frameworks', 'cis-controls'),
  edge('frameworks', 'mitre'),
  edge('iso27001', 'isms'),
  edge('mitre', 'threat-hunting'),

  edge('enterprise-risk', 'isms'),
  edge('enterprise-risk', 'risk-appetite'),
  edge('enterprise-risk', 'risk-register'),
  edge('risk-register', 'risk-treatment'),
  edge('risk-treatment', 'risk-acceptance'),
  edge('enterprise-risk', 'bcp-dr'),
  edge('bcp-dr', 'crisis-management'),

  edge('ciso-service', 'advisory', 'future'),
  edge('advisory', 'strategy-roadmap', 'future'),
  edge('ciso-service', 'future-ai-security', 'future'),
  edge('future-ai-security', 'resilience-future', 'future'),
  edge('resilience-future', 'fractional-leadership', 'future'),
  edge('fractional-leadership', 'ciso-service', 'future'),

  edge('enterprise-risk', 'physical-security'),
  edge('physical-security', 'facility-access'),
  edge('physical-security', 'device-protection'),
  edge('device-protection', 'hardware-safeguards'),
  edge('facility-access', 'visitor-control'),
  edge('visitor-control', 'site-security'),
  edge('site-security', 'critical-infra-protection'),

  edge('future-ai-security', 'ai-security-governance', 'future'),
  edge('future-ai-security', 'model-security', 'future'),
  edge('future-ai-security', 'prompt-security', 'future'),
  edge('future-ai-security', 'adversarial-attacks', 'future'),
  edge('future-ai-security', 'data-poisoning', 'future'),
  edge('future-ai-security', 'model-theft', 'future'),
  edge('future-ai-security', 'llm-security', 'future'),
  edge('future-ai-security', 'ai-risk-management', 'future'),
  edge('future-ai-security', 'secure-ai-development', 'future'),
  edge('future-ai-security', 'ai-threat-detection', 'future'),
  edge('future-ai-security', 'ai-sec-operations', 'future'),
  edge('future-ai-security', 'responsible-ai', 'future'),
  edge('future-ai-security', 'privacy-in-ai', 'future'),
  edge('future-ai-security', 'ai-monitoring', 'future'),
  edge('future-ai-security', 'ai-red-teaming', 'future'),
];

export const approvedThemes: ApprovedThemeOption[] = [
  { id: 'all', label: 'All Themes' },
  { id: 'security-architecture', label: 'Security Architecture' },
  { id: 'application-security', label: 'Application Security' },
  { id: 'risk-assessment', label: 'Risk Assessment' },
  { id: 'enterprise-risk-management', label: 'Enterprise Risk Management' },
  { id: 'threat-intelligence', label: 'Threat Intelligence' },
  { id: 'user-awareness', label: 'User Awareness' },
  { id: 'security-operations', label: 'Security Operations' },
  { id: 'frameworks-and-standards', label: 'Frameworks and Standards' },
  { id: 'physical-security', label: 'Physical Security' },
  { id: 'career-development', label: 'Career Development' },
  { id: 'ai-security', label: 'AI & Security' },
];

const aiThemeIds = new Set([
  'future-ai-security', 'ai-security-governance', 'model-security', 'prompt-security', 'adversarial-attacks',
  'data-poisoning', 'model-theft', 'llm-security', 'ai-risk-management', 'secure-ai-development',
  'ai-threat-detection', 'ai-sec-operations', 'responsible-ai', 'privacy-in-ai', 'ai-monitoring', 'ai-red-teaming',
]);

export function resolveNodeTheme(node: MindmapNode): ApprovedTheme {
  if (aiThemeIds.has(node.id) || node.category === 'ai') return 'ai-security';
  if (node.id === 'risk-assessment' || node.id === 'risk-monitoring' || node.id === 'risk-identification' || node.id === 'risk-analysis' || node.id === 'risk-prioritization' || node.id === 'risk-scoring' || node.id === 'control-evaluation' || node.id === 'gap-analysis') return 'risk-assessment';
  if (node.id === 'enterprise-risk' || node.id === 'risk-register' || node.id === 'risk-treatment' || node.id === 'risk-appetite' || node.id === 'risk-acceptance' || node.id === 'bcp-dr' || node.id === 'crisis-management' || node.id === 'third-party-risk' || node.id === 'fourth-party-risk' || node.id === 'physical-security' || node.id === 'facility-access' || node.id === 'device-protection' || node.id === 'hardware-safeguards' || node.id === 'site-security' || node.id === 'visitor-control' || node.id === 'critical-infra-protection') return 'enterprise-risk-management';
  if (['architecture'].includes(node.category)) return 'security-architecture';
  if (['appsec'].includes(node.category)) return 'application-security';
  if (['operations'].includes(node.category)) return 'security-operations';
  if (['frameworks'].includes(node.category)) return 'frameworks-and-standards';
  if (['awareness'].includes(node.category)) return node.id === 'threat-intelligence' || node.id === 'ioc-sharing' ? 'threat-intelligence' : 'user-awareness';
  if (['career'].includes(node.category)) return 'career-development';
  if (node.id === 'threat-intelligence' || node.id === 'ioc-sharing') return 'threat-intelligence';
  if (node.id === 'physical-security') return 'physical-security';
  return 'all';
}

export const legend = [
  { key: 'journey', label: 'Personal Journey' },
  { key: 'architecture', label: 'Architecture & Engineering' },
  { key: 'operations', label: 'Security Operations' },
  { key: 'governance', label: 'Governance & Risk' },
  { key: 'appsec', label: 'Application Security' },
  { key: 'future', label: 'Future Vision' },
] as const;
