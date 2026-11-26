import { useId } from "react";
import type { AssistantSectionKey } from "./assistantContext";
import { GuidePortrait, guideFor } from "./GuidePortrait";

export function assistantIdentity(section: AssistantSectionKey) {
  return section === "landing" || section === "academic" ? "face" : guideFor(section);
}

export function AssistantPortrait({ section }: { section: AssistantSectionKey }) {
  if (assistantIdentity(section) !== "face") return <GuidePortrait section={section} />;

  return <LivingFace />;
}

function LivingFace() {
  const mouth = useId();
  return (
    <svg className="living-face" viewBox="0 0 48 44" aria-hidden="true">
      <defs>
        <g id={mouth} fill="none">
          <path className="face-smile" d="M15 30c4 5 12 6 18-2" />
          <path className="face-ponder" d="M20 32q4 1 9-2" />
          <path className="face-reassure" d="M16 32q4-4 8-1t8-1" />
        </g>
      </defs>
      <g className="face-features" strokeLinecap="round">
        <g className="face-brows" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M8 13q3-3 7-2" />
          <path d="M31 11q4-2 8 1" />
        </g>
        <g className="face-gaze">
          <g className="face-lids" fill="currentColor" stroke="var(--bg)" strokeWidth="1.5" paintOrder="stroke fill">
            <ellipse cx="13" cy="20" rx="3.25" ry="4.5" />
            <ellipse cx="34" cy="19.5" rx="3.25" ry="4.5" />
            <g fill="var(--surface)" stroke="none">
              <circle cx="14" cy="18.5" r="1" />
              <circle cx="35" cy="18" r="1" />
            </g>
          </g>
        </g>
        <use href={`#${mouth}`} stroke="var(--bg)" strokeWidth="4.1" />
        <use href={`#${mouth}`} stroke="currentColor" strokeWidth="2.6" />
      </g>
    </svg>
  );
}
