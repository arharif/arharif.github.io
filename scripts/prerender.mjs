import { readFile, mkdir, writeFile } from "node:fs/promises";
import { modules, tracks } from "../src/academic/data/curriculum.ts";
import { labLinks } from "../src/academic/data/cases.ts";
import { complianceFrameworks } from "../src/data/complianceFrameworks.ts";
import { academicPolicy } from "./academic-policy.mjs";
const base = "/x1-academic";
const pages = [
  {
    path: "",
    title: "X1 Academic",
    description:
      "Explore standards, assess and simulate risk, build implementation roadmaps and connect cybersecurity, privacy, resilience and AI through professional practice.",
  },
  ...["standards", "implement", "risk-register", "knowledge-graph"].map(
    (path) => ({
      path: `/${path}`,
      title:
        path === "standards"
          ? "Explore Standards"
          : path === "implement"
            ? "Implementation Roadmap Studio"
            : path === "risk-register"
              ? "Risk Intelligence Workspace"
              : "Interactive Knowledge Graph",
      description:
        "Connected educational workspaces for cybersecurity, governance, privacy, resilience and AI. Explore sources, assess evidence, practise decisions and implement a scoped roadmap.",
    }),
  ),
  ...tracks.map((row) => ({
    path: `/${row.id}`,
    title: row.title,
    description: row.summary,
  })),
  ...modules.flatMap((row) => [
    {
      path: `/learning/${row.id}`,
      title: row.title,
      description: row.objectives.join(". "),
      module: row,
    },
    {
      path: `/learning/${row.discipline}/${row.id}`,
      title: row.title,
      description: row.objectives.join(". "),
      module: row,
    },
  ]),
  ...labLinks.map((row) => ({
    path: `/labs/${row.id}`,
    title: row.title,
    description: row.detail,
  })),
  ...complianceFrameworks.map((row) => ({
    path: `/frameworks/${row.id}`,
    title: row.name,
    description: `Explore ${row.name} with source and verification metadata. Study risk assessment and evidence interpretation.`,
  })),
  ...[
    "learning",
    "standards/800-53",
    "simulate",
    "simulate/privacy",
    "assess",
    "report",
    "labs",
    "frameworks",
    "resources",
    "security-map",
    "certifications",
    "case-studies",
    "assistant",
    "progress",
  ].map((path) => ({
    path: `/${path}`,
    title: path.split("-").join(" "),
    description:
      "Source-linked learning, practical exercises and connected educational pathways in cybersecurity, risk and AI.",
  })),
];
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const template = await readFile("dist/index.html", "utf8");
for (const page of pages) {
  const url = `https://arharif.github.io${base}${page.path}`;
  let html = template
    .replace(
      "</head>",
      `<meta name="x1-academic-policy" content="v2"><meta name="referrer" content="no-referrer"><meta http-equiv="Content-Security-Policy" content="${escape(academicPolicy(process.env.VITE_SUPABASE_URL))}">` +
        "</head>",
    )
    .replace(
      /<title>.*?<\/title>/,
      `<title>${escape(page.title)} · X1 Academic</title>`,
    )
    .replace(
      /(<meta name="description" content=")[^"]*/,
      `$1${escape(page.description)}`,
    )
    .replace(/(<link rel="canonical" href=")[^"]*/, `$1${url}`)
    .replace(
      /(<meta property="(?:og:title|twitter:title)" content=")[^"]*/g,
      `$1${escape(page.title)} · X1 Academic`,
    )
    .replace(
      /(<meta property="(?:og:description|twitter:description)" content=")[^"]*/g,
      `$1${escape(page.description)}`,
    )
    .replace(/(<meta property="og:url" content=")[^"]*/, `$1${url}`);
  if (page.path === "/progress")
    html = html.replace(
      "index,follow,max-image-preview:large",
      "noindex,follow",
    );
  const reading = page.module
    ? page.module.sections
        .map(
          (row) =>
            `<section><h2>${escape(row.title)}</h2><p>${escape(row.text)}</p></section>`,
        )
        .join("")
    : "";
  const content = `<main><nav><a href="${base}">X1 Academic</a> · <a href="${base}/learning">Learning</a> · <a href="${base}/labs">Laboratories</a></nav><h1>${escape(page.title)}</h1><p>${escape(page.description)}</p>${reading}<p>Interactive exercises load with JavaScript.</p></main>`;
  html = html.replace(
    '<div id="root"></div>',
    `<div id="root">${content}</div>`,
  );
  if (page.module) {
    const structured = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "LearningResource",
      name: page.title,
      description: page.description,
      url,
      learningResourceType: "Lesson",
      inLanguage: "en",
      isAccessibleForFree: true,
    }).replace(/</g, "\\u003c");
    html = html.replace(
      "</head>",
      `<script type="application/ld+json">${structured}</script></head>`,
    );
  }
  const directory = `dist${base}${page.path}`;
  await mkdir(directory, { recursive: true });
  await writeFile(`${directory}/index.html`, html);
}
const existing = await readFile("public/sitemap.xml", "utf8");
const additional = pages
  .filter((page) => page.path !== "/progress")
  .map(
    (page) =>
      `<url><loc>https://arharif.github.io${base}${page.path}</loc></url>`,
  )
  .join("\n");
await writeFile(
  "dist/sitemap.xml",
  existing
    .replace(
      /<url>\s*<loc>https:\/\/arharif.github.io\/x1-academic<\/loc>[\s\S]*?<\/url>/g,
      "",
    )
    .replace("</urlset>", `${additional}\n</urlset>`),
);
console.log(
  `Prerendered ${pages.length} academic routes and extended the sitemap.`,
);
