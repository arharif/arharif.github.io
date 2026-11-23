import type { AssistantSectionKey } from "./assistantContext";

export function guideFor(section: AssistantSectionKey) {
  if (section === "games") return "phantom";
  if (["insights", "professional", "personal"].includes(section))
    return "astronaut";
  return "orb";
}
export function GuidePortrait({ section }: { section: AssistantSectionKey }) {
  const guide = guideFor(section);
  if (guide === "orb")
    return (
      <span aria-hidden="true" className="guide-orb">
        X1
      </span>
    );
  if (guide === "astronaut")
    return (
      <svg
        viewBox="0 0 48 48"
        aria-hidden="true"
        className="guide-portrait astronaut"
      >
        <path
          d="m37 6 1.2 3.8L42 11l-3.8 1.2L37 16l-1.2-3.8L32 11l3.8-1.2Z"
          fill="var(--accent)"
        />
        <g transform="rotate(-10 23 25)">
          <path
            d="M10 29c-1-13 4-20 14-20s15 8 14 19l-3 8H15Z"
            fill="var(--text)"
            stroke="var(--surface)"
            strokeWidth="1.5"
          />
          <rect
            x="13"
            y="16"
            width="22"
            height="15"
            rx="7"
            fill="var(--surface)"
          />
          <path
            d="M16 22q4-6 12-4"
            stroke="var(--accent)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <path d="M14 34q9 5 21 0l-2 6q-9 3-17-1Z" fill="var(--accent)" />
        </g>
      </svg>
    );
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      className="guide-portrait phantom"
    >
      <path
        d="M7 38c4-4 2-12 4-20C15 1 38 4 38 23c0 8 2 11 5 14l-8-1-5 4-7-4-7 4-3-4Z"
        fill="#e6d9ff"
        stroke="#b385fa"
        strokeWidth="1.4"
      />
      <g className="phantom-eyes" fill="#2f1b56">
        <ellipse cx="20" cy="23" rx="2" ry="3" />
        <ellipse cx="30" cy="23" rx="2" ry="3" />
      </g>
      <path
        className="phantom-mouth"
        d="M21 29q4 5 8-1"
        stroke="#653b89"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
