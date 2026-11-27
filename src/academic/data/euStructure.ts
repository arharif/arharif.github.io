type Chapter = {
  id: string;
  title: string;
  first: number;
  last: number;
  sections?: ReadonlyArray<readonly [title: string, first: number, last: number]>;
};
export const euStructure = {
  dora: [
    { id: "I", title: "General provisions", first: 1, last: 4 },
    { id: "II", title: "ICT risk management", first: 5, last: 16, sections: [
      ["Organisation and governance", 5, 5], ["ICT risk management framework", 6, 16],
    ] },
    { id: "III", title: "ICT incident management", first: 17, last: 23 },
    { id: "IV", title: "Digital operational resilience testing", first: 24, last: 27 },
    { id: "V", title: "ICT third-party risk", first: 28, last: 44, sections: [
      ["Management of ICT third-party risk", 28, 30], ["Oversight of critical ICT providers", 31, 44],
    ] },
    { id: "VI", title: "Information sharing", first: 45, last: 45 },
    { id: "VII", title: "Competent authorities", first: 46, last: 56 },
    { id: "VIII", title: "Delegated acts", first: 57, last: 57 },
    { id: "IX", title: "Transitional and final provisions", first: 58, last: 64 },
  ],
  gdpr: [
    { id: "I", title: "General provisions", first: 1, last: 4 },
    { id: "II", title: "Processing principles", first: 5, last: 11 },
    { id: "III", title: "Rights of the data subject", first: 12, last: 23, sections: [
      ["Transparency and modalities", 12, 12], ["Information and access", 13, 15], ["Rectification and erasure", 16, 20],
      ["Objection and automated decision-making", 21, 22], ["Restrictions", 23, 23],
    ] },
    { id: "IV", title: "Controller and processor", first: 24, last: 43, sections: [
      ["General obligations", 24, 31], ["Processing security", 32, 34], ["Impact assessment and consultation", 35, 36],
      ["Data protection officer", 37, 39], ["Codes of conduct and certification", 40, 43],
    ] },
    { id: "V", title: "International transfers", first: 44, last: 50 },
    { id: "VI", title: "Independent supervisory authorities", first: 51, last: 59 },
    { id: "VII", title: "Cooperation and consistency", first: 60, last: 76 },
    { id: "VIII", title: "Remedies, liability and penalties", first: 77, last: 84 },
    { id: "IX", title: "Specific processing situations", first: 85, last: 91 },
    { id: "X", title: "Delegated and implementing acts", first: 92, last: 93 },
    { id: "XI", title: "Final provisions", first: 94, last: 99 },
  ],
  "eu-ai-act": [
    { id: "I", title: "General provisions", first: 1, last: 4 },
    { id: "II", title: "Prohibited AI practices", first: 5, last: 5 },
    { id: "III", title: "High-risk AI systems", first: 6, last: 49, sections: [
      ["Classification", 6, 7], ["High-risk system requirements", 8, 15], ["Providers, deployers and other actors", 16, 27],
      ["Notifying authorities and notified bodies", 28, 39], ["Standards, conformity assessment and registration", 40, 49],
    ] },
    { id: "IV", title: "Transparency for certain AI systems", first: 50, last: 50 },
    { id: "V", title: "General-purpose AI models", first: 51, last: 56, sections: [
      ["Systemic risk classification", 51, 52], ["Provider obligations", 53, 54],
      ["Additional systemic-risk obligations", 55, 55], ["Codes of practice", 56, 56],
    ] },
    { id: "VI", title: "Measures in support of innovation", first: 57, last: 63 },
    { id: "VII", title: "Governance", first: 64, last: 70 },
    { id: "VIII", title: "EU database for high-risk AI systems", first: 71, last: 71 },
    { id: "IX", title: "Monitoring, information sharing and market surveillance", first: 72, last: 94 },
    { id: "X", title: "Codes of conduct and guidelines", first: 95, last: 96 },
    { id: "XI", title: "Delegated and implementing acts", first: 97, last: 98 },
    { id: "XII", title: "Penalties", first: 99, last: 101 },
    { id: "XIII", title: "Final provisions", first: 102, last: 113 },
  ],
} satisfies Record<string, readonly Chapter[]>;

export const aiAnnexes = [
  ["I", "Union product legislation relevant to Article 6(1)"],
  ["II", "Offences referenced for specified biometric identification conditions"],
  ["III", "Use cases for high-risk classification under Article 6(2)"],
  ["IV", "Technical documentation for high-risk systems"],
  ["V", "EU declaration of conformity"],
  ["VI", "Internal-control conformity assessment"],
  ["VII", "Notified-body conformity assessment"],
  ["VIII", "Information for high-risk system registration"],
  ["IX", "Information for real-world testing registration"],
  ["X", "Union acts on large-scale IT systems in freedom, security and justice"],
  ["XI", "Technical documentation for general-purpose AI models"],
  ["XII", "Information for downstream AI system providers"],
  ["XIII", "Criteria for designating general-purpose AI models with systemic risk"],
] as const;
