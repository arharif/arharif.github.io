import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { HelpCircle, X } from "lucide-react";
import { base } from "../components/shared";
const steps = [
  {
    title: "Start with a service, not a score",
    text: "Choose a fictional organisation and define mission, critical services, scope and decision authority. An assessment cannot say more than its boundary supports.",
  },
  {
    title: "Record what is known and unknown",
    text: "Use a framework outcome, state the current and target position, then record rationale and evidence. Missing assessments are not zeros. CSF Tiers remain separate from the X1 educational rubric.",
  },
  {
    title: "Turn the gap into a task",
    text: "Link a risk, create a remediation action and set RACI, dates, dependencies and resource assumptions. Implementation progress does not automatically improve an assessment rating.",
  },
  {
    title: "Validate, report and recover",
    text: "Record test evidence and a reviewer. Generate an immutable report and reconcile its underlying inputs. Explicitly save a fictional local copy or export the project before refreshing.",
  },
];
export default function Tutorial() {
  const ref = useRef<HTMLDialogElement>(null),
    [step, setStep] = useState(0),
    [answer, setAnswer] = useState(""),
    [checked, setChecked] = useState(false);
  return (
    <>
      <button
        aria-label="Open interactive tutorial"
        onClick={() => ref.current?.showModal()}
      >
        <HelpCircle size={17} />
      </button>
      <dialog
        className="xs-tutorial"
        ref={ref}
        aria-labelledby="xs-tutorial-title"
      >
        <button
          className="xs-close"
          aria-label="Close tutorial"
          onClick={() => ref.current?.close()}
        >
          <X size={18} />
        </button>
        <p className="xa-eyebrow">INTERACTIVE GUIDE · STEP {step + 1} OF 4</p>
        <h2 id="xs-tutorial-title">{steps[step].title}</h2>
        <p>{steps[step].text}</p>
        <nav className="xs-stepper" aria-label="Tutorial steps">
          {steps.map((s, i) => (
            <button
              key={s.title}
              aria-current={i === step ? "step" : undefined}
              onClick={() => setStep(i)}
            >
              {i + 1}
            </button>
          ))}
        </nav>
        {step === 3 && (
          <fieldset>
            <legend>
              Knowledge check: does 100% task progress prove operating
              effectiveness?
            </legend>
            <label className="xa-check">
              <input
                type="radio"
                name="tutorial-check"
                checked={answer === "yes"}
                onChange={() => {
                  setAnswer("yes");
                  setChecked(false);
                }}
              />
              Yes
            </label>
            <label className="xa-check">
              <input
                type="radio"
                name="tutorial-check"
                checked={answer === "no"}
                onChange={() => {
                  setAnswer("no");
                  setChecked(false);
                }}
              />
              No; scope, test evidence and review are still needed
            </label>
            <button onClick={() => setChecked(true)}>
              Check tutorial answer
            </button>
            {checked && (
              <p role="status">
                {answer === "no"
                  ? "Correct. Implementation and independent effectiveness assessment are distinct."
                  : "Review the distinction: finishing a task alone does not establish control effectiveness."}
              </p>
            )}
          </fieldset>
        )}
        <div className="xa-actions">
          <button disabled={step === 0} onClick={() => setStep(step - 1)}>
            Previous tutorial step
          </button>
          {step < 3 ? (
            <button className="primary" onClick={() => setStep(step + 1)}>
              Next tutorial step
            </button>
          ) : (
            <Link
              className="xa-button primary"
              to={`${base}/assess`}
              onClick={() => ref.current?.close()}
            >
              Start a guided assessment
            </Link>
          )}
        </div>
      </dialog>
    </>
  );
}
