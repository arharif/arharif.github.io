import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useAcademic } from "../app/context";
import type { CaseId } from "../data/types";
import {
  createWorkspace,
  encodeProject,
  parseProject,
  projectKey,
  isExpired,
  type WorkspaceData,
} from "../studio/persistence";
type Setters = {
  [K in keyof WorkspaceData as `set${Capitalize<K>}`]: Dispatch<
    SetStateAction<WorkspaceData[K]>
  >;
};
type API = WorkspaceData &
  Setters & {
    saveProject: () => void;
    restoreProject: (raw?: string) => void;
    deleteSavedProject: () => void;
    resetProject: () => void;
    exportProject: () => string;
    savedAt: string;
    projectMessage: string;
    hasSaved: boolean;
    dirty: boolean;
  };
const Context = createContext<API | null>(null);
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { caseId, setCaseId } = useAcademic();
  const [projects, setProjects] = useState<Record<CaseId, WorkspaceData>>(
    () => ({
      paysecure: createWorkspace("paysecure"),
      petroshield: createWorkspace("petroshield"),
      smartfactory: createWorkspace("smartfactory"),
    }),
  );
  const [savedAt, setSavedAt] = useState<Record<string, string>>({}),
    [savedDigest, setSavedDigest] = useState<Record<string, string>>({}),
    [projectMessage, setMessage] = useState(
      "Projects stay in tab memory until you explicitly save or export.",
    );
  const [initialDigest] = useState(() =>
    Object.fromEntries(
      Object.entries(projects).map(([id, p]) => [id, JSON.stringify(p)]),
    ),
  );
  useEffect(() => {
    let removed = false;
    for (const id of ["paysecure", "petroshield", "smartfactory"] as const) {
      try {
        const raw = localStorage.getItem(projectKey(id));
        if (raw && isExpired(parseProject(raw).savedAt)) {
          localStorage.removeItem(projectKey(id));
          removed = true;
        }
      } catch {
        /* Invalid saved data is never auto-restored. */
      }
    }
    if (removed)
      setMessage(
        "Expired local projects were deleted on this visit. The 30-day expiry is checked when you return or restore.",
      );
  }, []);
  const data = projects[caseId];
  const setters = Object.fromEntries(
    (Object.keys(data) as (keyof WorkspaceData)[]).map((key) => [
      `set${key[0].toUpperCase()}${key.slice(1)}`,
      (value: unknown) =>
        setProjects((previous) => {
          const p = previous[caseId];
          const next =
            typeof value === "function"
              ? (value as (v: unknown) => unknown)(p[key])
              : value;
          return {
            ...previous,
            [caseId]: {
              ...p,
              [key]: next,
              ...(key === "analysed" && next ? { analysedAsOf: p.asOf } : {}),
            },
          };
        }),
    ]),
  ) as Setters;
  function saveProject() {
    try {
      const raw = encodeProject(data, caseId);
      if (raw.length > 3_000_000)
        throw new Error("Project exceeds 3 MB; export individual registers.");
      localStorage.setItem(projectKey(caseId), raw);
      const envelope = parseProject(raw);
      setSavedAt((p) => ({ ...p, [caseId]: envelope.savedAt }));
      setSavedDigest((p) => ({ ...p, [caseId]: JSON.stringify(data) }));
      setMessage(
        "Fictional project saved on this device for 30 days. It is not an authenticated evidence store.",
      );
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message
          : "Save failed; export the project instead.",
      );
    }
  }
  function restoreProject(raw?: string) {
    try {
      const source = raw ?? localStorage.getItem(projectKey(caseId));
      if (!source) throw new Error("No saved project for this organisation.");
      const e = parseProject(source);
      if (!raw && isExpired(e.savedAt)) {
        localStorage.removeItem(projectKey(caseId));
        throw new Error("Saved project expired after 30 days and was deleted.");
      }
      setProjects((p) => ({ ...p, [e.caseId]: e.data }));
      setCaseId(e.caseId);
      setSavedAt((p) => ({ ...p, [e.caseId]: e.savedAt }));
      setSavedDigest((p) => ({ ...p, [e.caseId]: JSON.stringify(e.data) }));
      setMessage(
        raw
          ? "Project imported and validated. Local saving remains an explicit action."
          : "Saved project restored. Evidence verification values remain learner records, not independently authenticated facts.",
      );
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Restore failed.");
    }
  }
  function deleteSavedProject() {
    try {
      localStorage.removeItem(projectKey(caseId));
      setSavedAt((p) => ({ ...p, [caseId]: "" }));
      setSavedDigest((p) => ({ ...p, [caseId]: "" }));
      setMessage(
        "Saved copy deleted from this device. The open project remains available.",
      );
    } catch {
      setMessage("Browser storage is unavailable.");
    }
  }
  let hasSaved = false;
  try {
    hasSaved = !!localStorage.getItem(projectKey(caseId));
  } catch {}
  return (
    <Context.Provider
      value={{
        ...data,
        ...setters,
        saveProject,
        restoreProject,
        deleteSavedProject,
        resetProject: () => {
          setProjects((p) => ({ ...p, [caseId]: createWorkspace(caseId) }));
          setMessage(
            "Open project reset for this organisation only. Any saved copy remains until deleted.",
          );
        },
        exportProject: () => encodeProject(data, caseId),
        savedAt: savedAt[caseId] || "",
        projectMessage,
        hasSaved,
        dirty:
          JSON.stringify(data) !==
          (savedDigest[caseId] ?? initialDigest[caseId]),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useWorkspace() {
  const value = useContext(Context);
  if (!value) throw new Error("Workspace provider missing.");
  return value;
}
export function useLabState<T>(
  lab: string,
  key: string,
  initial: T | (() => T),
): [T, Dispatch<SetStateAction<T>>] {
  const { labDrafts, setLabDrafts } = useWorkspace();
  const value =
    (labDrafts[lab]?.[key] as T | undefined) ??
    (typeof initial === "function" ? (initial as () => T)() : initial);
  return [
    value,
    (next) =>
      setLabDrafts((previous) => ({
        ...previous,
        [lab]: {
          ...previous[lab],
          [key]:
            typeof next === "function"
              ? (next as (v: T) => T)(
                  (previous[lab]?.[key] as T | undefined) ?? value,
                )
              : next,
        },
      })),
  ];
}
