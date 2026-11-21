import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { findStandard } from "../../data/standards";
import type { ControlAssessment } from "../../data/types";
import { validateAssessment } from "../../utils/engines";
export type AssessmentRegister = Record<string, ControlAssessment>;
const storageKey = "x1-academic-assessments-v2";
export function parseAssessments(raw: string): AssessmentRegister {
  if (raw.length > 1_000_000)
    throw new Error("Assessment data exceeds supported size.");
  const input: unknown = JSON.parse(raw);
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new Error("Invalid assessment register.");
  const result: AssessmentRegister = {};
  for (const [id, value] of Object.entries(input)) {
    if (
      !/^(paysecure|petroshield|smartfactory):[a-z0-9-]+:[a-zA-Z0-9_.()\-]{1,100}$/.test(
        id,
      ) ||
      !findStandard(id.split(":")[1]) ||
      !value ||
      typeof value !== "object"
    )
      throw new Error("Invalid assessment record.");
    const row = value as ControlAssessment;
    if (
      !["notes", "evidence", "owner", "justification", "status"].every(
        (key) =>
          typeof row[key as keyof ControlAssessment] === "string" &&
          row[key as keyof ControlAssessment].length <= 4000,
      ) ||
      validateAssessment(row).length
    )
      throw new Error("Invalid assessment status or evidence.");
    result[id] = {
      status: row.status,
      notes: row.notes,
      evidence: row.evidence,
      owner: row.owner,
      justification: row.justification,
    };
  }
  return result;
}
const Context = createContext<{
  register: AssessmentRegister;
  setRegister: React.Dispatch<React.SetStateAction<AssessmentRegister>>;
  error: string;
} | null>(null);
export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [register, setRegister] = useState<AssessmentRegister>(() => {
    try {
      return parseAssessments(localStorage.getItem(storageKey) || "{}");
    } catch {
      return {};
    }
  });
  const [error, setError] = useState("");
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(register));
      setError("");
    } catch {
      setError(
        "Assessment persistence is unavailable. Export your register before leaving this session.",
      );
    }
  }, [register]);
  return (
    <Context.Provider value={{ register, setRegister, error }}>
      {children}
    </Context.Provider>
  );
}
export function useAssessments() {
  const context = useContext(Context);
  if (!context) throw new Error("Assessment context required.");
  return context;
}
