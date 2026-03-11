const certificationByFamily: Array<{ match: RegExp; value: string }> = [
  { match: /ciso|head of security|deputy ciso/i, value: 'CISSP + CISM, then CGEIT or CRISC' },
  { match: /grc/i, value: 'CRISC + CISM, plus ISO 27001 Lead Implementer / Lead Auditor' },
  { match: /dpo|privacy/i, value: 'CIPP/E + CIPM, then CIPT' },
  { match: /soc l1/i, value: 'Security+, then CySA+' },
  { match: /soc l2/i, value: 'CySA+ + GCIH' },
  { match: /soc l3|incident responder|ir lead/i, value: 'GCIH + GCFA' },
  { match: /threat hunter/i, value: 'GCIA + GCIH' },
  { match: /cloud security/i, value: 'CCSP + AWS Security – Specialty or Azure Security Engineer Associate' },
  { match: /devsecops/i, value: 'CCSP + CKS + AWS Security – Specialty' },
  { match: /application security|appsec|product security/i, value: 'CSSLP, then GWAPT or OSWE' },
  { match: /iam|pam/i, value: 'CISSP plus vendor identity certifications' },
  { match: /penetration tester|pentester/i, value: 'OSCP / OSCP+, then GPEN or OSEP' },
  { match: /red team/i, value: 'OSCP / OSCP+ + OSEP, then GXPN' },
  { match: /security auditor/i, value: 'CISA, then CISSP' },
  { match: /it auditor/i, value: 'CISA + CRISC' },
  { match: /ai security/i, value: 'AAISM, backed by CISSP or CISM' },
  { match: /ai governance|ai risk/i, value: 'AIGP + CRISC or AIGP + CIPP/E' },
];

export const getCertificationPath = (roleTitle: string) => {
  const found = certificationByFamily.find((rule) => rule.match.test(roleTitle));
  return found?.value || 'CISSP or CISM with role-specific specialization and hands-on domain practice';
};
