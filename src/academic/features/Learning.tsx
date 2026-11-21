import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { modules, tracks } from "../data/curriculum";
import { resources } from "../data/resources";
import { useAcademic } from "../app/context";
import { base, Field, Header, Source, download } from "../components/shared";
export function LearningCatalogue({ discipline }: { discipline?: string }) {
  return (
    <>
      <Header
        eyebrow="Learning academy"
        title={
          tracks.find((row) => row.id === discipline)?.title ??
          "Build understanding. Put it to work."
        }
      >
        <p>
          Follow a published module through explanation, activity, assessment
          and a practical outcome. Planned modules show the intended curriculum
          and are awaiting substantive content review.
        </p>
      </Header>
      {tracks
        .filter((track) => !discipline || track.id === discipline)
        .map((track) => (
          <section key={track.id}>
            <h2>{track.title}</h2>
            <p>{track.summary}</p>
            <div className="xa-grid two">
              {track.modules.map((title) => {
                const module = modules.find((row) => row.title === title);
                return module ? (
                  <Link
                    className="xa-card"
                    key={title}
                    to={`${base}/learning/${module.id}`}
                  >
                    <small>Published module · ready to study</small>
                    <h3>{title}</h3>
                    <p>{module.deliverable}</p>
                    <span className="xa-card-link">Open the module →</span>
                  </Link>
                ) : (
                  <article className="xa-card" key={title}>
                    <small>Planned · content review required</small>
                    <h3>{title}</h3>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
    </>
  );
}
const concepts = [
  [
    "Threat",
    "An event or actor with the potential to cause harm. Describe the event before choosing a treatment.",
  ],
  [
    "Vulnerability",
    "A weakness or exposure through which the threat may affect the service.",
  ],
  [
    "Risk",
    "Uncertainty about an event and its consequences for business objectives.",
  ],
  [
    "Control",
    "A safeguard selected to modify exposure under stated assumptions.",
  ],
  [
    "Evidence",
    "Traceable records and observations supporting an assessment within a defined scope and period.",
  ],
  [
    "Assessment",
    "A scoped evaluation of evidence against defined criteria. Record the period, sample, exceptions and limitations before reaching a conclusion.",
  ],
  [
    "Decision",
    "An accountable choice that considers evidence, uncertainty, cost and business objectives.",
  ],
];
const aiConcepts = [
  [
    "Model",
    "A defined scoring function transforms inputs into predictions. Its intended use limits appropriate interpretation.",
  ],
  [
    "Data",
    "Labels, sampling and provenance determine which evaluation question can be answered. Minimise personal information.",
  ],
  [
    "Threat",
    "Leakage, unauthorised changes and distribution shift can invalidate an apparently strong result.",
  ],
  [
    "Safeguard",
    "Separate training and evaluation information, validate access and monitor input changes.",
  ],
  [
    "Evaluation",
    "Calculate counts and metrics on representative data with declared thresholds and uncertainty.",
  ],
  [
    "Governance",
    "An accountable owner sets release conditions, monitoring triggers and reassessment responsibilities.",
  ],
];
export function ConceptExplorer() {
  const [selected, setSelected] = useState(0);
  const [mode, setMode] = useState("risk");
  const nodes = mode === "risk" ? concepts : aiConcepts;
  return (
    <div className="xa-panel">
      <h2>Trace the decision chain</h2>
      <Field label="Concept relationship map">
        <select
          value={mode}
          onChange={(e) => {
            setMode(e.target.value);
            setSelected(0);
          }}
        >
          <option value="risk">Threat to business decision</option>
          <option value="ai">Model to AI governance</option>
        </select>
      </Field>
      <div className="xa-flow" aria-label="Concept relationships">
        {nodes.map(([title], index) => (
          <button
            key={title}
            aria-pressed={index === selected}
            onClick={() => setSelected(index)}
          >
            {title}
            {index < nodes.length - 1 ? " →" : ""}
          </button>
        ))}
      </div>
      <p aria-live="polite">
        <strong>{nodes[selected][0]}</strong> · {nodes[selected][1]}
      </p>
      <Link
        to={`${base}/learning/${mode === "risk" ? "risk-assessment" : "detection-evaluation"}`}
      >
        Study this concept in context →
      </Link>
      <p>
        Reading alternative ·{" "}
        {nodes
          .map(([name, explanation]) => `${name} — ${explanation}`)
          .join(" ")}
      </p>
    </div>
  );
}
export default function Lesson() {
  const { id } = useParams();
  const module = modules.find((row) => row.id === id);
  const { progress, setProgress } = useAcademic();
  const [answer, setAnswer] = useState<number | null>(null),
    [feedback, setFeedback] = useState(false);
  const [activity, setActivity] = useState(""),
    [message, setMessage] = useState("");
  useEffect(() => {
    if (module)
      setProgress((previous) => ({ ...previous, currentModule: module.id }));
  }, [module?.id, setProgress]);
  if (!module)
    return (
      <>
        <Header eyebrow="Learning" title="Module unavailable" />
        <p>This module is awaiting publication or the identifier is invalid.</p>
        <Link to={`${base}/learning`}>Browse published learning</Link>
      </>
    );
  const resource = resources.find((row) => row.id === module.resource)!;
  const complete = () => {
    if (
      !feedback ||
      answer !== module.assessment.correct ||
      activity.trim().length < 80
    ) {
      setMessage(
        "Pass the knowledge check and record at least 80 characters of activity reasoning to complete this module.",
      );
      return;
    }
    setProgress((previous) => ({
      ...previous,
      completed: [...new Set([...previous.completed, module.id])],
      competencies: [...new Set([...previous.competencies, module.id])],
    }));
    setMessage(
      "Module complete. Completion records a passed check and submitted activity, with no independent certification of competence.",
    );
  };
  return (
    <div className="xa-reading">
      <Header
        eyebrow={tracks.find((track) => track.id === module.discipline)!.title}
        title={module.title}
      >
        <p>{module.deliverable}</p>
      </Header>
      <section className="xa-panel">
        <h2>Before you begin</h2>
        <p>{module.prerequisite}</p>
        <ul>
          {module.objectives.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
        <p>
          <strong>An everyday analogy</strong> · {module.analogy}
        </p>
      </section>
      {module.sections.map((section) => (
        <section key={section.title}>
          <h2>{section.title}</h2>
          <p>{section.text}</p>
        </section>
      ))}
      <ConceptExplorer />
      <section className="xa-panel">
        <h2>Practise and produce</h2>
        <p>{module.activity}</p>
        <Link className="xa-button primary" to={module.lab.startsWith("/")?`${base}${module.lab}`:`${base}/labs/${module.lab}`}>
          Open the related laboratory →
        </Link>
        <Field label="Activity reasoning · observations, assumptions and next action">
          <textarea
            value={activity}
            maxLength={5000}
            onChange={(e) => setActivity(e.target.value)}
          />
        </Field>
        <button
          disabled={activity.trim().length < 80}
          onClick={() =>
            download(
              `${module.id}-activity.json`,
              JSON.stringify(
                {
                  module: module.id,
                  generatedAt: new Date().toISOString(),
                  reasoning: activity,
                  provenance: "Learner-authored educational exercise",
                },
                null,
                2,
              ),
              "application/json",
            )
          }
        >
          Download my activity
        </button>
      </section>
      <section className="xa-panel">
        <h2>Knowledge check</h2>
        <fieldset>
          <legend>{module.assessment.prompt}</legend>
          {module.assessment.choices.map((choice, index) => (
            <label key={choice} className="xa-check">
              <input
                type="radio"
                name="assessment"
                checked={answer === index}
                onChange={() => {
                  setAnswer(index);
                  setFeedback(false);
                }}
              />
              {choice}
            </label>
          ))}
        </fieldset>
        <button
          disabled={answer === null}
          onClick={() => {
            setFeedback(true);
            setProgress((previous) => ({
              ...previous,
              attempts: {
                ...previous.attempts,
                [module.id]: Math.min(
                  10000,
                  (previous.attempts[module.id] ?? 0) + 1,
                ),
              },
            }));
          }}
        >
          Check answer
        </button>
        {feedback && (
          <p className="xa-feedback" role="status">
            {answer === module.assessment.correct
              ? "Correct. "
              : "Revisit the explanation. "}
            {module.assessment.explanation}
          </p>
        )}
      </section>
      <section>
        <h2>Common misconception</h2>
        <p>{module.misconception}</p>
        <h2>Revision sheet</h2>
        <ul>
          {module.revision.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
        <Source href={resource.url}>{resource.title}</Source>
        <p>
          Related learning ·{" "}
          {modules
            .filter((row) => row.id !== module.id)
            .map((row) => (
              <Link
                key={row.id}
                to={`${base}/learning/${row.id}`}
                style={{ display: "block" }}
              >
                {row.title}
              </Link>
            ))}
        </p>
      </section>
      <button className="primary" onClick={complete}>
        {progress.completed.includes(module.id)
          ? "Update completed activity"
          : "Complete module"}
      </button>
      <p role="status">{message}</p>
    </div>
  );
}
