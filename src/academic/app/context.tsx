import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { CaseArtifact, CaseId, LearnerProgress } from "../data/types";
import { scenarios } from "../data/cases";
import { emptyProgress, parseProgress } from "../utils/progress";
const key = "x1-academic-progress-v1";
function readProgress() {
  try {
    return parseProgress(localStorage.getItem(key) || "null");
  } catch {
    return emptyProgress();
  }
}
const AcademicContext = createContext<{
  caseId: CaseId;
  setCaseId: (id: CaseId) => void;
  imported: CaseArtifact | null;
  setImported: (artifact: CaseArtifact | null) => void;
  progress: LearnerProgress;
  setProgress: React.Dispatch<React.SetStateAction<LearnerProgress>>;
  storageError: boolean;
} | null>(null);
export function AcademicProvider({ children }: { children: ReactNode }) {
  const [caseId, setCaseId] = useState<CaseId>("paysecure");
  const [imported, setImported] = useState<CaseArtifact | null>(null);
  const [progress, setProgress] = useState(readProgress);
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(progress));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [progress]);
  return (
    <AcademicContext.Provider
      value={{
        caseId,
        setCaseId,
        imported,
        setImported,
        progress,
        setProgress,
        storageError,
      }}
    >
      {children}
    </AcademicContext.Provider>
  );
}
export function useAcademic() {
  const context = useContext(AcademicContext);
  if (!context) throw new Error("Academic context required.");
  return context;
}
export function useScenario() {
  const { caseId } = useAcademic();
  return scenarios.find((row) => row.id === caseId)!;
}
