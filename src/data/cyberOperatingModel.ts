import { OrgSection } from '@/types/securityRoles';

export const cyberOperatingModelSections: OrgSection[] = [
  {
    title: 'Board / Executive Committee',
    root: {
      title: 'CISO',
      children: [
        { title: 'Deputy CISO / Head of Security' },
        {
          title: 'Head of GRC / Compliance / Privacy',
          children: [
            {
              title: 'GRC Manager / Senior GRC',
              children: [
                { title: 'GRC Analyst' },
                { title: 'Third-Party Risk Analyst' },
                { title: 'Cybersecurity Program Manager' },
                { title: 'Security Awareness Lead' },
              ],
            },
            { title: 'Compliance Manager' },
            { title: 'DPO / Privacy Officer', children: [{ title: 'Privacy Analyst' }] },
          ],
        },
        {
          title: 'Head of Cyber Defense',
          children: [
            {
              title: 'SOC Manager / SOC Lead',
              children: [{ title: 'SOC L3 / Senior Incident Responder / IR Lead', children: [{ title: 'SOC L2 Analyst', children: [{ title: 'SOC L1 Analyst' }] }] }],
            },
            { title: 'Threat Hunter' },
            { title: 'Threat Intelligence Analyst' },
            { title: 'Digital Forensics Analyst' },
            { title: 'Vulnerability Management Lead', children: [{ title: 'Vulnerability Management Analyst' }] },
            { title: 'Purple Team Specialist' },
          ],
        },
        {
          title: 'Head of Security Architecture / Security Engineering',
          children: [
            { title: 'Enterprise Security Architect' },
            { title: 'Security Architect' },
            { title: 'Cloud Security Lead', children: [{ title: 'Cloud Security Engineer' }] },
            { title: 'Network Security Lead', children: [{ title: 'Network Security Engineer' }] },
            { title: 'Endpoint Security Lead', children: [{ title: 'Endpoint Security Engineer' }] },
            { title: 'Data Security Lead', children: [{ title: 'Data Security Specialist' }] },
            { title: 'OT / ICS Security Lead', children: [{ title: 'OT / ICS Security Engineer' }] },
          ],
        },
        {
          title: 'Head of IAM',
          children: [
            { title: 'IAM Manager / IAM Lead', children: [{ title: 'IAM Engineer / IAM Analyst' }, { title: 'Access Governance / UAR Analyst' }] },
            { title: 'PAM Lead', children: [{ title: 'PAM Specialist' }] },
          ],
        },
        {
          title: 'Head of AppSec / Product Security',
          children: [
            { title: 'Application Security Lead', children: [{ title: 'Application Security Engineer' }] },
            { title: 'DevSecOps Lead', children: [{ title: 'DevSecOps Engineer' }] },
            { title: 'Product Security Lead', children: [{ title: 'Product Security Engineer' }] },
          ],
        },
        {
          title: 'Head of Offensive Security',
          children: [
            { title: 'Red Team Lead', children: [{ title: 'Red Teamer' }] },
            { title: 'Offensive Security Lead', children: [{ title: 'Penetration Tester' }] },
            { title: 'Security Research Lead', children: [{ title: 'Security Researcher' }] },
            { title: 'Purple Team Specialist' },
          ],
        },
        {
          title: 'Head of AI Security / AI Governance',
          children: [
            { title: 'AI Security Lead', children: [{ title: 'AI Security Specialist' }] },
            { title: 'AI Governance Lead', children: [{ title: 'AI Governance / AI Risk Officer' }] },
          ],
        },
        { title: 'Head of Security Transformation / PMO', children: [{ title: 'Cybersecurity Program Manager' }] },
      ],
    },
  },
  {
    title: 'Independent Assurance / Internal Audit',
    root: {
      title: 'Chief Audit Executive / Head of Internal Audit',
      children: [
        { title: 'Head of IT Audit', children: [{ title: 'IT Audit Manager / Senior IT Auditor', children: [{ title: 'IT Auditor' }] }] },
        { title: 'Head of Security Audit / Assurance', children: [{ title: 'Security Audit Manager / Senior Security Auditor', children: [{ title: 'Security Auditor' }] }] },
      ],
    },
  },
];
