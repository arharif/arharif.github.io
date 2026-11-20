import { useState } from "react";
import { Link } from "react-router-dom";
import { useAcademic } from "../app/context";
import { modules } from "../data/curriculum";
import { resources } from "../data/resources";
import { base, Header, Field, download } from "../components/shared";
import { emptyProgress, parseProgress } from "../utils/progress";
export default function Progress() {
  const { progress, setProgress, storageError } = useAcademic();
  const [message, setMessage] = useState("");
  const [confirm, setConfirm] = useState(false);
  return (
    <>
      <Header
        eyebrow="Anonymous learner workspace"
        title="Progress backed by your work"
      >
        <p>
          Records stay in this browser. Completion requires a passed knowledge
          check and a submitted written activity. It records participation and
          does not establish a professional credential.
        </p>
      </Header>
      {storageError && (
        <p role="alert">
          Browser storage is unavailable. Your current session works, and you
          can export a backup.
        </p>
      )}
      <div className="xa-grid two">
        {modules.map((module) => (
          <article key={module.id} className="xa-panel">
            <h2>{module.title}</h2>
            <p>
              {progress.completed.includes(module.id)
                ? "Completed activity and knowledge check"
                : "Available to study"}
            </p>
            <p>{progress.attempts[module.id] ?? 0} assessment attempts</p>
            <Link to={`${base}/learning/${module.id}`}>
              {progress.currentModule === module.id
                ? "Resume module"
                : "Open module"}{" "}
              →
            </Link>
          </article>
        ))}
      </div>
      <section className="xa-panel">
        <h2>Bookmarked resources</h2>
        {!progress.bookmarks.length && (
          <p>Bookmark a source in the resource library to save it here.</p>
        )}
        {resources
          .filter((row) => progress.bookmarks.includes(row.id))
          .map((row) => (
            <p key={row.id}>
              {row.title} · <Link to={`${base}/resources`}>Open library</Link>
            </p>
          ))}
        <h3>Saved lab configuration</h3>
        <p>
          {progress.savedExperiment
            ? `AI experiment · threshold ${progress.savedExperiment.threshold}, seed ${progress.savedExperiment.seed}`
            : "No experiment configuration saved."}
        </p>
        <Link to={`${base}/labs/ai-experiment`}>
          Open the experiment studio →
        </Link>
      </section>
      <section className="xa-panel">
        <h2>Manage local learner data</h2>
        <div className="xa-actions">
          <button
            onClick={() =>
              download(
                "x1-learner-progress.json",
                JSON.stringify(progress, null, 2),
                "application/json",
              )
            }
          >
            Export learner data
          </button>
          <button onClick={() => setConfirm(true)}>Reset local progress</button>
        </div>
        {confirm && (
          <p>
            Clear all lesson records, bookmarks and the saved experiment?{" "}
            <button
              onClick={() => {
                setProgress(emptyProgress());
                setConfirm(false);
                setMessage("Local learner data reset.");
              }}
            >
              Confirm reset
            </button>{" "}
            <button onClick={() => setConfirm(false)}>Keep records</button>
          </p>
        )}
        <Field label="Restore learner-data JSON">
          <input
            type="file"
            accept=".json,application/json"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                if (file.size > 100000) throw new Error("File exceeds 100 KB.");
                setProgress(parseProgress(await file.text()));
                setMessage("Learner data restored.");
              } catch (error) {
                setMessage(
                  error instanceof Error
                    ? error.message
                    : "Unable to restore data.",
                );
              }
              e.target.value = "";
            }}
          />
        </Field>
        <p role="status">{message}</p>
      </section>
    </>
  );
}
