import { readFile, mkdir, writeFile, unlink } from "node:fs/promises";
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
  ...[
    ["explore", "Explore Standards"],
    ["assess-simulate", "Assess & Simulate"],
    ["implement-plan", "Implement & Plan"],
  ].map(([path, title]) => ({
    path: "/" + path,
    title,
    description:
      "Interactive NIST CSF 2.0, ISO/IEC 27001 and PCI DSS workspaces with editable assessments and fictional demonstration projects.",
  })),
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
const manifestPath = "dist/.vite/manifest.json";
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
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
// Give shared destinations their own Pages documents and social metadata.
const publicPages = [
  ["/insights-innovation", "X1 Insights & Innovation", "Articles on technology, philosophy, human behaviour and emerging trends.", "insights"],
  ["/about-x1", "Cybersecurity Advisory · Anass Rharif", "Anass Rharif’s approach to cybersecurity governance, enterprise risk and advisory.", "academic"],
  ["/games", "X1 Arcade", "Play browser games, classic puzzles and quizzes in the Neon Arcade.", "games"],
  ["/submitting", "Contribute to X1", "Email your completed article to X1 for editorial review.", "insights"],
];
function publicEntry([path, title, description, art]) {
  const url = "https://arharif.github.io" + path;
  return template
    .replace(/<title>.*?<\/title>/, `<title>${escape(title)}</title>`)
    .replace(/(<meta property="(?:og:title|twitter:title)" content=")[^"]*/g, `$1${escape(title)}`)
    .replace(/(<meta (?:name="description"|property="(?:og:description|twitter:description)") content=")[^"]*/g, `$1${escape(description)}`)
    .replace(/(<link rel="canonical" href=")[^"]*/, `$1${url}`)
    .replace(/(<meta property="og:url" content=")[^"]*/, `$1${url}`)
    .replace(/(<meta property="(?:og:image|twitter:image)" content=")[^"]*/g, `$1https://arharif.github.io/art/${art}.webp`)
    .replace(/(<meta property="og:image:alt" content=")[^"]*/, `$1${escape(title + " artwork")}`);
}
const headlineFont = '<link rel="preload" as="font" href="/fonts/dm-serif-text-latin.woff" type="font/woff" crossorigin>';
const insightsRoute = manifest["src/pages/Insights.tsx"];
const insightsEntryAssets = [
  '<link rel="preload" as="image" href="/art/cosmos-small.webp">',
  headlineFont,
  ...insightsRoute.css.map((file) => `<link rel="stylesheet" href="/${file}">`),
  `<link rel="modulepreload" href="/${insightsRoute.file}" crossorigin>`,
].join("");
for (const page of publicPages) {
  const directory = "dist" + page[0];
  await mkdir(directory, { recursive: true });
  let html = publicEntry(page);
  if (page[0] === "/insights-innovation") html = html.replace("</head>", insightsEntryAssets + "</head>");
  await writeFile(directory + "/index.html", html);
}

// This image is immediately visible and otherwise discoverable only after React starts.
const heroPreload = '<link rel="preload" as="image" imagesrcset="/art/academic-small.webp 448w, /art/academic.webp 768w" imagesizes="(max-width: 650px) calc(100vw - 40px), (max-width: 1260px) 32vw, 400px" fetchpriority="high">';
await writeFile("dist/index.html", template.replace("</head>", heroPreload + headlineFont + "</head>"));
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

await unlink(manifestPath);
