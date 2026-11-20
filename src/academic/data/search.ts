import { modules, tracks } from "./curriculum";
import { labLinks } from "./cases";
import { resources } from "./resources";
import { frameworkSources } from "./controls";
export const searchIndex = [
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
  ...frameworkSources.map((row) => ({
    title: row.name,
    description: row.scope,
    path: `/frameworks/${row.id}`,
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
