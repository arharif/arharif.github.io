import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import StandardsLanding from "../console/StandardsLanding";

const Console = lazy(() => import("../console/Console"));
const LegacyAcademy = lazy(() => import("./LegacyAcademy"));
const base = "/x1-academic";
const primary = ["", "/explore", "/assess-simulate", "/implement-plan"];
const equivalent: Record<string, [string, string]> = {
  "/standards": ["explore", "profile"],
  "/knowledge-graph": ["explore", "graph"],
  "/assess": ["explore", "profile"],
  "/simulate": ["assess-simulate", "risk"],
  "/risk-register": ["assess-simulate", "matrix"],
  "/report": ["assess-simulate", "executive"],
  "/simulate/privacy": ["assess-simulate", "flow"],
  "/implement": ["implement-plan", "planner"],
};

export default function AcademicApp() {
  const location = useLocation(),
    navigate = useNavigate();
  const path = location.pathname.slice(base.length).replace(/\/+$/, ""),
    query = new URLSearchParams(location.search);
  const inConsole = primary.includes(path),
    destination = equivalent[path];
  const previous = useRef(false);
  const [hasPreviousSession, retainPreviousSession] = useState(false);
  // Detailed historic links (task IDs, case selections, graph nodes or other editions)
  // retain their original editors. A bookmarked dashboard opens its new counterpart.
  const compatible =
    (!query.has("standard") ||
      ["nist-csf-2", "iso-27001", "pci-dss"].includes(
        query.get("standard")!,
      )) &&
    Array.from(query.keys()).every((k) => k === "standard") &&
    !location.hash;
  const redirect = !inConsole && destination && compatible && !previous.current;
  useEffect(() => {
    if (inConsole) {
      previous.current = false;
      return;
    }
    if (redirect) return;
    previous.current = true;
    retainPreviousSession(true);
    if (destination && compatible) {
      const params = new URLSearchParams(location.search);
      params.set("previous", "1");
      navigate(
        {
          pathname: location.pathname,
          search: params.toString(),
          hash: location.hash,
        },
        { replace: true },
      );
    }
  }, [inConsole, redirect, destination, compatible, location, navigate]);
  if (redirect) {
    query.set("view", destination[1]);
    return <Navigate replace to={base + "/" + destination[0] + "?" + query} />;
  }
  const workspace = path ? <Console /> : <StandardsLanding />;
  return (
    <Suspense fallback={<main role="status">Opening X1 Academic…</main>}>
      {hasPreviousSession || !inConsole ? (
        <LegacyAcademy>{inConsole ? workspace : undefined}</LegacyAcademy>
      ) : (
        workspace
      )}
    </Suspense>
  );
}
