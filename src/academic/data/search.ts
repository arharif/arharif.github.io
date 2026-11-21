import { modules, tracks } from "./curriculum";
import { labLinks } from "./cases";
import { resources } from "./resources";
import { standards } from "./standards";
export const searchIndex = [
  {
    title: "Explore Standards",
    description:
      "Interactive standards, privacy, resilience and regulatory architecture",
    path: "/standards",
    type: "Workspace",
  },
  {
    title: "Implementation roadmap and Gantt",
    description: "Editable tasks, dependencies and calendar-day scheduling",
    path: "/implement",
    type: "Workspace",
  },
  {
    title: "Professional risk register",
    description: "Excel and CSV import, risk analytics and treatment decisions",
    path: "/risk-register",
    type: "Workspace",
  },
  {
    title: "Interactive knowledge graph",
    description:
      "Business processes, controls, evidence and AI governance relationships",
    path: "/knowledge-graph",
    type: "Workspace",
  },
  ...modules.map((row) => ({
    title: row.title,
    description: row.objectives.join(" · "),
    path: `/learning/${row.id}`,
    type: "Lesson",
  })),
  ...tracks.map((row) => ({
    title: row.title,
    description: row.summary,
    path: `/${row.id}`,
    type: "Pathway",
  })),
  ...labLinks.map((row) => ({
    title: row.title,
    description: row.detail,
    path: `/labs/${row.id}`,
    type: "Laboratory",
  })),
  ...resources.map((row) => ({
    title: row.title,
    description: row.description,
    path: "/resources",
    type: "Resource",
  })),
  ...standards.map((row) => ({
    title: row.title,
    description: row.purpose,
    path: `/standards?framework=${row.id}`,
    type: "Framework",
  })),
  {
    title: "Security roles & competency map",
    description: "Career responsibilities, skills and related learning",
    path: "/security-map",
    type: "Careers",
  },
  {
    title: "Certification explorer",
    description: "Preparation routes and issuer verification",
    path: "/certifications",
    type: "Careers",
  },
];
export function academicSearch(query: string) {
  const terms = query
    .toLowerCase()
    .trim()
    .slice(0, 240)
    .split(/\s+/)
    .filter(Boolean);
  if (!terms.length) return [];
  return searchIndex
    .map((item) => ({
      ...item,
      rank: terms.reduce(
        (sum, term) =>
          sum +
          (item.title.toLowerCase().includes(term)
            ? 3
            : item.description.toLowerCase().includes(term)
              ? 1
              : 0),
        0,
      ),
    }))
    .filter((item) => item.rank > 0)
    .sort((a, b) => b.rank - a.rank)
    .slice(0, 8);
}
