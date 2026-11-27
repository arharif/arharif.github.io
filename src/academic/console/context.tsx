import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { blank, demoProject, parseProject, syncPlan, type Project } from "./project";
import type { Framework } from "./catalogue";

type Mode = "demo" | "work";
type Change = (p: Project) => Project;
type Context = {
  project: Project;
  change: (update: Change) => void;
  tryDemo: () => void;
  startBlank: (after?: () => void) => void;
  resetDemo: () => void;
  resume: () => void;
  importFile: (file: File) => Promise<void>;
  pending: { message: string; apply: () => void } | null;
  cancel: () => void;
  message: string;
  notify: (message: string) => void;
};
const Store = createContext<Context | null>(null);
export function ProjectProvider({
  framework,
  openDemo = false,
  children,
}: {
  framework: Framework;
  openDemo?: boolean;
  children: ReactNode;
}) {
  const key = "x1-academic-console-v1-" + framework;
  const cache = useRef<Partial<Record<Mode, Project>>>({});
  const last = useRef<Partial<Record<Mode, string | null>>>({});
  function read(mode: Mode) {
    if (cache.current[mode]) return cache.current[mode]!;
    let raw: string | null = null;
    try {
      raw = localStorage.getItem(key + "-" + mode);
    } catch {
      /* Continue in memory when storage is disabled. */
    }
    const p = raw
      ? parseProject(raw)
      : mode === "demo"
        ? demoProject(framework)
        : blank(framework);
    if (p.framework !== framework || p.demo !== (mode === "demo"))
      throw Error("The saved project does not match this workspace.");
    last.current[mode] = raw;
    return (cache.current[mode] = p);
  }
  const [initial] = useState(() => {
    try {
      return {
        p: read(openDemo || localStorage.getItem(key) === "demo" ? "demo" : "work"),
        notice: "",
      };
    } catch {
      return {
        p: blank(framework),
        notice:
          "Local storage could not be restored. Export changes to keep a copy.",
      };
    }
  });
  const [project, setProject] = useState(initial.p),
    [message, notify] = useState(initial.notice);
  const current = useRef(project);
  const [pending, setPending] = useState<Context["pending"]>(null);
  function commit(p: Project, notice = "") {
    const mode = p.demo ? "demo" : "work";
    cache.current[mode] = p;
    current.current = p;
    setProject(p);
    try {
      const stored = localStorage.getItem(key + "-" + mode);
      if (stored !== (last.current[mode] ?? null))
        throw Error(
          "The saved copy changed in another tab or could not be read. Export this copy before leaving.",
        );
      const raw = JSON.stringify(p);
      if (raw.length > 3000000)
        throw Error("Project exceeds the 3 MB storage limit.");
      localStorage.setItem(key + "-" + mode, raw);
      last.current[mode] = raw;
      localStorage.setItem(key, mode);
      notify(notice);
    } catch (e) {
      notify(
        e instanceof Error
          ? e.message
          : "Browser storage is unavailable. Export a copy.",
      );
    }
  }
  function switchMode(mode: Mode) {
    try {
      commit(
        read(mode),
        mode === "demo"
          ? "Fictional scenario ready. Changes are saved separately."
          : "Personal project opened.",
      );
    } catch {
      notify(
        "The saved project could not be read. Your stored copy is protected.",
      );
    }
  }
  const consumedDemoRequest = useRef(false);
  useEffect(() => {
    if (!openDemo) {
      consumedDemoRequest.current = false;
    } else if (!consumedDemoRequest.current) {
      consumedDemoRequest.current = true;
      if (!current.current.demo) switchMode("demo");
      else commit(current.current, "SAMPLE DATA · Fictional scenario ready.");
    }
  }, [openDemo]);

  function confirm(message: string, apply: () => void) {
    setPending({
      message,
      apply: () => {
        setPending(null);
        apply();
      },
    });
  }
  function startBlank(after?: () => void) {
    try {
      const existing = read("work");
      const hasWork =
        Object.keys(existing.assessments).length ||
        existing.risks.length ||
        existing.tasks.length ||
        existing.flow.length ||
        JSON.stringify(existing) !==
          JSON.stringify({ ...blank(framework), start: existing.start });
      if (hasWork)
        confirm(
          "Replace the personal project for this standard with a blank assessment? Export it first to keep a copy.",
          () => { commit(blank(framework), "Blank project created."); after?.(); },
        );
      else {
        commit(blank(framework), "Blank project ready.");
        after?.();
      }
    } catch {
      notify(
        "Your saved project could not be opened. Export the current project before leaving.",
      );
    }
  }
  async function importFile(file: File) {
    try {
      if (file.size > 3000000)
        throw Error("Choose a project smaller than 3 MB.");
      const p = parseProject(await file.text());
      if (p.framework !== framework)
        throw Error(
          "Select the matching standard before importing this project.",
        );
      read(p.demo ? "demo" : "work");
      confirm(
        "Import “" +
          p.name +
          "” into the " +
          (p.demo ? "fictional demo" : "personal project") +
          " slot for this standard?",
        () => commit(p, "Project imported."),
      );
    } catch (e) {
      notify(
        e instanceof Error && e.name !== "ZodError"
          ? e.message
          : "Invalid project file. Check the version and record values.",
      );
    }
  }
  return (
    <Store.Provider
      value={{
        project,
        change: (update) => {
          const before = current.current;
          const next = update(before);
          const result = next.assessments === before.assessments && next.risks === before.risks && next.scope === before.scope
            ? next
            : syncPlan(next, before);
          commit(result, result.planIssue === before.planIssue ? "" : result.planIssue);
        },
        message,
        notify,
        tryDemo: () => switchMode("demo"),
        resume: () => switchMode("work"),
        startBlank,
        resetDemo: () =>
          confirm("Reset the fictional scenario and replace its edits?", () =>
            commit(demoProject(framework), "Demo reset."),
          ),
        pending,
        cancel: () => setPending(null),
        importFile,
      }}
    >
      {children}
    </Store.Provider>
  );
}
export function useProject() {
  const state = useContext(Store);
  if (!state) throw Error("Missing project.");
  return state;
}
export function downloadProject(project: Project) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(project, null, 2)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download =
    project.framework + (project.demo ? "-demo" : "-project") + ".json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
