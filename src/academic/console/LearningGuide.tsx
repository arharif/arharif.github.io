import { useState } from "react";
import { Download } from "lucide-react";
import { useProject } from "./context";
import { editions, frameworkMetadata } from "./editions";
import { cases } from "./catalogue";
import { lessons } from "./learningContent";
import { Panel } from "./ui";
import { download } from "../components/shared";

export function LearningGuide() {
  const { project } = useProject();
  const { framework } = project;
  const edition = editions[framework];
  const metadata = frameworkMetadata[framework];
  const lesson = lessons[framework];
  const [active, setActive] = useState(0);
  const step = lesson.steps[active];
  const scenario = cases[framework];
  function save() {
    const lines = [
      edition.name, edition.edition, "Verified " + metadata.verified, "", "Purpose", edition.description,
      "", "Structure", lesson.structure, "", "Applicability", edition.application, "", "Terminology", lesson.terms,
      "", "Practice example", lesson.example, "", "Implementation and evidence",
      ...lesson.steps.flatMap(([title, guidance, evidence]) => [title, guidance, "Example evidence · " + evidence, ""]),
      "Official sources", ...edition.sources.map(([title, url]) => title + " — " + url), "", metadata.reuse,
    ];
    download(framework + "-cheat-sheet.txt", lines.join("\n"), "text/plain;charset=utf-8");
  }
  return <Panel title="Framework cheat sheet">
    <div className="xc-toolbar"><button type="button" onClick={save}><Download size={16} /> Download cheat sheet</button></div>
    <p>{lesson.structure}</p>
    <p><strong>Key terms</strong> {lesson.terms}</p>
    {project.demo && <p><strong>SAMPLE DATA · {scenario.name}</strong> {scenario.scope}. Work through the steps using this fictional scope.</p>}
    <p>{lesson.example}</p>
    <figure className="xc-learning-figure">
      <figcaption>Explore the workflow and its evidence</figcaption>
      <ol aria-label="Framework workflow">
        {lesson.steps.map(([title], index) => <li key={title}>
          <button type="button" aria-pressed={index === active} onClick={() => setActive(index)}>{title}</button>
        </li>)}
      </ol>
      <div aria-live="polite" className="xc-learning-step">
        <h3>{step[0]}</h3>
        <p>{step[1]}</p>
        <p><strong>Example evidence</strong> {step[2]}</p>
      </div>
    </figure>
  </Panel>;
}
