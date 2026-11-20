import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { ControlAssessment } from "../data/types";
import type { RiskObservation } from "./RiskHistory";
import { useAcademic } from "../app/context";
import { scenarioRisks, type RiskRecord } from "./risk";
const Context = createContext<{
  assessments: Record<string, ControlAssessment>;
  setAssessments: React.Dispatch<
    React.SetStateAction<Record<string, ControlAssessment>>
  >;
  observations: RiskObservation[];
  setObservations: React.Dispatch<React.SetStateAction<RiskObservation[]>>;
  rows: RiskRecord[];
  setRows: React.Dispatch<React.SetStateAction<RiskRecord[]>>;
  analysed: RiskRecord[] | null;
  setAnalysed: React.Dispatch<React.SetStateAction<RiskRecord[] | null>>;
  provenance: string;
  setProvenance: (s: string) => void;
  asOf: string;
  setAsOf: (s: string) => void;
} | null>(null);
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { caseId } = useAcademic();
  const [assessments, setAssessments] = useState<
    Record<string, ControlAssessment>
  >({});
  const [observations, setObservations] = useState<RiskObservation[]>([]);
  const [rows, setRows] = useState(() => scenarioRisks(caseId)),
    [analysed, setAnalysed] = useState<RiskRecord[] | null>(null),
    [provenance, setProvenance] = useState("Fictional educational scenario"),
    [asOf, setAsOf] = useState("2026-11-20");
  useEffect(() => {
    setRows(scenarioRisks(caseId));
    setAssessments({});
    setObservations([]);
    setAnalysed(null);
    setProvenance("Fictional educational scenario");
  }, [caseId]);
  return (
    <Context.Provider
      value={{
        rows,
        setRows,
        assessments,
        setAssessments,
        observations,
        setObservations,
        analysed,
        setAnalysed,
        provenance,
        setProvenance,
        asOf,
        setAsOf,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useWorkspace() {
  const c = useContext(Context);
  if (!c) throw new Error("Workspace missing");
  return c;
}
