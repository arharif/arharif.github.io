import { Lightbulb } from "lucide-react";
import { useWorkspace } from "../workspace/state";

export default function DemoButton({ id }: { id: string }) {
  const { demoId, demoLoading, openDemo, closeDemo, projectMessage } =
    useWorkspace();
  return (
    <div className="xa-demo-action">
      {demoId && (
        <span role="status" className="xa-demo-label">
          <span aria-hidden="true" /> Fictional demo
        </span>
      )}
      {demoId && (
        <button type="button" onClick={closeDemo}>
          Return to my project
        </button>
      )}
      {demoId !== id && (
        <button
          type="button"
          className="primary"
          disabled={demoLoading}
          onClick={() => void openDemo(id)}
        >
          <Lightbulb size={16} aria-hidden="true" />
          {demoLoading ? "Loading demo…" : "Load Completed Demo"}
        </button>
      )}
      {!demoId &&
        !demoLoading &&
        /could not be loaded|Invalid demo/.test(projectMessage) && (
          <span role="alert">{projectMessage}</span>
        )}
    </div>
  );
}
