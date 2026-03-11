import { OperatingModelSection } from '@/types/securityRoles';

export const cyberOperatingModelSections: OperatingModelSection[] = [
  {
    title: 'Board / Executive Committee',
    groups: [
      {
        title: 'CISO',
        units: [
          { title: 'Deputy CISO / Head of Security' },
          {
            title: 'Head of GRC / Compliance / Privacy',
            roles: [
              'GRC Manager / Senior GRC',
              'GRC Analyst',
              'Third-Party Risk Analyst',
              'Cybersecurity Program Manager',
              'Security Awareness Lead',
              'Compliance Manager',
              'DPO / Privacy Officer',
              'Privacy Analyst',
            ],
          },
          {
            title: 'Head of Cyber Defense',
            roles: [
              'SOC Manager / SOC Lead',
              'SOC L3 / Senior Incident Responder / IR Lead',
              'SOC L2 Analyst',
              'SOC L1 Analyst',
              'Threat Hunter',
              'Threat Intelligence Analyst',
              'Digital Forensics Analyst',
              'Vulnerability Management Lead',
              'Vulnerability Management Analyst',
              'Purple Team Specialist',
            ],
          },
          {
            title: 'Head of Security Architecture / Security Engineering',
            roles: [
              'Enterprise Security Architect',
              'Security Architect',
              'Cloud Security Lead',
              'Cloud Security Engineer',
              'Network Security Lead',
              'Network Security Engineer',
              'Endpoint Security Lead',
              'Endpoint Security Engineer',
              'Data Security Lead',
              'Data Security Specialist',
              'OT / ICS Security Lead',
              'OT / ICS Security Engineer',
            ],
          },
          {
            title: 'Head of IAM',
            roles: ['IAM Manager / IAM Lead', 'IAM Engineer / IAM Analyst', 'Access Governance / UAR Analyst', 'PAM Lead', 'PAM Specialist'],
          },
          {
            title: 'Head of AppSec / Product Security',
            roles: [
              'Application Security Lead',
              'Application Security Engineer',
              'DevSecOps Lead',
              'DevSecOps Engineer',
              'Product Security Lead',
              'Product Security Engineer',
            ],
          },
          {
            title: 'Head of Offensive Security',
            roles: [
              'Red Team Lead',
              'Red Teamer',
              'Offensive Security Lead',
              'Penetration Tester',
              'Security Research Lead',
              'Security Researcher',
              'Purple Team Specialist',
            ],
          },
          {
            title: 'Head of AI Security / AI Governance',
            roles: ['AI Security Lead', 'AI Security Specialist', 'AI Governance Lead', 'AI Governance / AI Risk Officer'],
          },
          {
            title: 'Head of Security Transformation / PMO',
            roles: ['Cybersecurity Program Manager'],
          },
        ],
      },
    ],
  },
  {
    title: 'Independent Assurance / Internal Audit',
    groups: [
      {
        title: 'Chief Audit Executive / Head of Internal Audit',
        units: [
          { title: 'Head of IT Audit', roles: ['IT Audit Manager / Senior IT Auditor', 'IT Auditor'] },
          { title: 'Head of Security Audit / Assurance', roles: ['Security Audit Manager / Senior Security Auditor', 'Security Auditor'] },
        ],
      },
    ],
  },
];
