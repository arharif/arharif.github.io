import { cases, catalogue, names } from "./catalogue";
import { editions, frameworkMetadata } from "./editions";
import { riskControls, stats, type Project } from "./project";
import { band, inherentScore, residualScore } from "../workspace/risk";
import { isoClauses } from "../data/isoClauses";
import legislation from "../data/eu-article-index.json";
import { download } from "../components/shared";

const mime = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
type Cell = string | number | null | undefined;
const safeCell = (value: Cell) => typeof value === "string" && /^[\s\u0000-\u001f]*[=+\-@]/.test(value) ? "'" + value : value ?? null;

export async function createAssessmentWorkbook(project: Project) {
  const { default: ExcelJS } = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "X1 Academic";
  const edition = editions[project.framework];
  const metadata = frameworkMetadata[project.framework];
  const { rows, applicable, scored, current, target, reviewed, gaps, met } = stats(project);
  const { items } = catalogue(project.framework);
  const risks = project.risks;
  const law = project.framework === "gdpr" || project.framework === "dora" || project.framework === "eu-ai-act"
    ? project.framework : undefined;
  const officialReferences = law
    ? [...legislation[law].articles, ...(law === "eu-ai-act" ? legislation[law].inserted : [])]
        .map(([id, group, title]) => ["Article " + id, title, group, "Publisher index", null, "Reference", legislation[law].source])
    : project.framework === "iso-27001"
      ? Object.entries(isoClauses).flatMap(([group, clauses]) =>
          clauses.map(([id, prompt]) => ["Clause " + id, prompt, group, "Publisher clause reference", null, "Reference", edition.sources[0][1]]))
      : [];
  const label = project.demo ? "SAMPLE DATA · " + cases[project.framework].name : project.name;
  const scope = project.scope;
  const scopeDetails: Cell[][] = [["Scope", scope.context], ["Scope decision", scope.decision]];
  if (scope.decisionType) scopeDetails.push(["Applicability outcome", scope.decisionType]);
  if (scope.evidenceRef) scopeDetails.push(["Scope evidence", scope.evidenceRef]);
  if (project.framework === "nist-800-53") scopeDetails.push(
    ["SP 800-53B starting baseline", scope.baseline], ["Include privacy baseline", scope.privacy ? "Yes" : "No"],
    ["Overlay reference", scope.overlay], ["Tailored control additions", scope.added.join(", ")],
  );
  if (project.framework === "nist-csf-2") scopeDetails.push(["Current Tier", scope.tier], ["Target Tier", scope.targetTier]);
  function sheet(name: string, headers: string[], data: Cell[][]) {
    const tab = workbook.addWorksheet(name, { views: [{ state: "frozen", ySplit: 2 }] });
    tab.mergeCells(1, 1, 1, headers.length);
    tab.getCell("A1").value = safeCell(`${names[project.framework]} · ${label}`);
    tab.getRow(1).height = 24;
    tab.getRow(1).font = { color: { argb: "FFFFFFFF" }, bold: true, size: 13 };
    tab.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF192039" } };
    tab.addRow(headers);
    const header = tab.getRow(2);
    header.font = { bold: true, color: { argb: "FFFFFFFF" } };
    header.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF374569" } };
    data.forEach(values => tab.addRow(values.map(safeCell)));
    tab.autoFilter = { from: { row: 2, column: 1 }, to: { row: 2, column: headers.length } };
    tab.columns.forEach((column, index) => {
      const width = Math.max(headers[index].length + 3, ...data.map(row => String(row[index] ?? "").length + 2));
      column.width = Math.min(58, Math.max(16, width));
      column.alignment = { vertical: "top", wrapText: true };
    });
    return tab;
  }
  sheet("Assessment Summary", ["Metric", "Value"], [
    ["Project", label], ["Edition", edition.edition], ...scopeDetails,
    ["Applicable items", applicable.length], ["Excluded items", rows.length - applicable.length],
    ["Rated applicable items", scored.length], ["Below target", gaps.length], ["At or above target", met],
    ["Evidence reviewed or tested", reviewed.length], ["Mean X1 implementation index", scored.length ? current : null],
    ["Mean target index", applicable.length ? target : null],
    ["Recorded risks", risks.length], ["Verified source date", metadata.verified],
  ]);
  sheet("Framework Requirements", ["Identifier", "Title", "Group", "Category", "Parent", "Status", "Publisher"],
    [
      ...items.map(row => [row.id, row.title, row.group, row.category, row.parent,
        row.withdrawn ? "Withdrawn" : row.id.startsWith("PCI-") ? "Legacy aggregate" : "Assessment item", edition.sources[0][1]]),
      ...officialReferences.filter(([id]) => !items.some(item => item.id.replace("Art. ", "Article ") === id)),
    ]);
  sheet("Applicability and Status", ["Identifier", "Item", "Applicability", "Exclusion rationale", "Current", "Target", "Owner", "SoA decision", "Treatment", "Tailoring rationale", "Implementation responsibility", "Business unit", "Location", "Asset"],
    rows.map(row => [row.id, row.title, row.applicability, row.exclusion, row.current, row.target, row.owner, row.soa, row.treatment, row.tailoring, row.selection, row.unit, row.location, row.asset]));
  sheet("Evidence Register", ["Identifier", "Evidence status", "Evidence reference", "Owner"],
    rows.filter(row => row.note || row.evidence !== "Missing").map(row => [row.id, row.evidence, row.note, row.owner]));
  sheet("Gaps and Findings", ["Identifier", "Item", "Current", "Target", "Gap", "Finding", "Recommendation", "Linked risk IDs"],
    rows.filter(row => row.finding || (row.applicability === "Applicable" && row.current !== null && row.current < row.target)).map(row => [
      row.id, row.title, row.current, row.target, row.applicability === "Applicable" && row.current !== null ? Math.max(0, row.target - row.current) : null,
      row.finding, row.example, risks.filter(risk => riskControls(risk.controls).includes(row.id)).map(risk => risk.id).join(", "),
    ]));
  sheet("Risk Register", ["Risk ID", "Asset", "Scenario", "Impact rationale", "Inherent", "Residual", "Band", "Requirements", "Treatment", "Owner", "Status", "Evidence", "Inherent likelihood", "Inherent impact", "Residual likelihood", "Residual impact", "Vulnerability", "Business unit", "Opened", "Review date"],
    risks.map(risk => [risk.id, risk.asset, risk.threat, risk.businessImpact, inherentScore(risk), residualScore(risk), band(residualScore(risk)), risk.controls, risk.treatment, risk.owner, risk.status, risk.evidence, risk.likelihood, risk.impact, risk.residualLikelihood, risk.residualImpact, risk.vulnerability, risk.unit, risk.openedDate, risk.reviewDate]));
  sheet("Method and Sources", ["Topic", "Method or source"], [
    ["Implementation scale", "0 absent, 1 planned, 2 partial, 3 operating, 4 consistently operating. Ratings are user assertions."],
    ["Implementation index", "Arithmetic mean of rated applicable entries. Withdrawn, excluded and unrated entries are omitted."],
    ["Target index", "Arithmetic mean of target ratings for all applicable entries."],
    ["Gap", "Applicable and rated entries only. Gap = max(0, target minus current)."],
    ["Risk score", "Likelihood × impact on separate integer scales from 1 to 5. Residual ratings are separately recorded."],
    ["Risk bands", "Scores 1–4 are Low, 5–9 Medium, 10–16 High and 17–25 Critical."],
    ["Interpretation", "Implementation ratings, evidence coverage and risk are distinct measures. Publisher and legal criteria govern formal assurance."],
    ["Applicability", edition.application], ["Use and licence", metadata.reuse], ["Version", edition.edition],
    ["Source verification", metadata.verified], ...edition.sources,
  ]);
  return workbook;
}

export async function downloadAssessment(project: Project) {
  const workbook = await createAssessmentWorkbook(project);
  const bytes = await workbook.xlsx.writeBuffer();
  download(`${project.framework}-${project.demo ? "sample-" : ""}assessment.xlsx`, new Blob([bytes], { type: mime }), mime);
}
