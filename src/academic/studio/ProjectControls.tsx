import { useState } from "react";
import { Save, FolderOpen, Download, Trash2 } from "lucide-react";
import { download } from "../components/shared";
import { useWorkspace } from "../workspace/state";
export default function ProjectControls() {
  const w = useWorkspace();
  const [consent, setConsent] = useState(false),
    [error, setError] = useState("");
  return (
    <details className="xa-project-controls">
      <summary>
        <Save size={14} aria-hidden="true" />{" "}
        {w.dirty
          ? "Unsaved project changes"
          : w.hasSaved && !w.savedAt
            ? "Saved project available — restore to continue"
            : "Project recovery & local save"}{" "}
        <span>
          {w.savedAt
            ? `Last saved ${new Date(w.savedAt).toLocaleString()}`
            : "Save or export before refreshing"}
        </span>
      </summary>
      <p className="xa-feedback">
        Use fictional educational data. Do not import confidential banking,
        personal or industrial information into an unapproved public
        application. Browser storage is accessible to scripts on this origin; it
        is not authentication or a trusted evidence repository.
      </p>
      <label className="xa-check">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />
        I understand this project is fictional and consent to storing a local
        copy that expires after 30 days and is deleted on my next academy visit.
      </label>
      <div className="xa-actions">
        <button disabled={!consent} onClick={w.saveProject}>
          <Save size={15} />
          Save fictional project
        </button>
        <button disabled={!w.hasSaved} onClick={() => w.restoreProject()}>
          <FolderOpen size={15} />
          Restore saved project
        </button>
        <button
          onClick={() => {
            try {
              download(
                "x1-project-v2.json",
                w.exportProject(),
                "application/json",
              );
              setError("");
            } catch (e) {
              setError(e instanceof Error ? e.message : "Export failed.");
            }
          }}
        >
          <Download size={15} />
          Export project JSON
        </button>
        <label className="xa-button secondary">
          Import project JSON
          <input
            aria-label="Import project JSON"
            type="file"
            accept=".json"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (file.size > 3_000_000) {
                setError("Project must be smaller than 3 MB.");
                return;
              }
              w.restoreProject(await file.text());
              e.target.value = "";
            }}
          />
        </label>
        <button onClick={w.deleteSavedProject}>
          <Trash2 size={15} />
          Delete saved copy
        </button>
        <button onClick={w.resetProject}>Reset open project</button>
      </div>
      <p role="status">{w.projectMessage}</p>
      {error && <p role="alert">{error}</p>}
      <p className="xa-muted">
        Save is explicit. Internal navigation and organisation switching retain
        open projects in this tab. Refresh clears edits made after the last
        save; restore the saved copy to recover. The existing learner-progress
        format is preserved.
      </p>
    </details>
  );
}
