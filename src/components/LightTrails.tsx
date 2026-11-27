import { useId } from "react";

const orbits = Array.from({ length: 10 }, (_, lane) => {
  const y = 44 + lane * 7;
  return `M0 ${y + 54} C100 ${y + 36} 135 ${y + 83} 225 ${y + 39} S328 ${y - 26} 418 ${y + 9} S532 ${y + 39} 640 ${y - 25}`;
});
export function LightTrails({ className }: { className: string }) {
  const gradient = useId();
  return (
    <svg className={className} viewBox="0 0 640 180" preserveAspectRatio="xMidYMid slice"
      fill="none" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={gradient}>
          <stop stopColor="var(--trail-violet, #8768d4)" stopOpacity="0" />
          <stop offset=".32" stopColor="var(--trail-violet, #8768d4)" />
          <stop offset=".67" stopColor="var(--trail-blue, #659de6)" />
          <stop offset="1" stopColor="var(--trail-violet, #8768d4)" stopOpacity=".65" />
        </linearGradient>
      </defs>
      {orbits.map((path, i) => <path key={path} d={path} stroke={`url(#${gradient})`} strokeWidth={i % 3 === 0 ? 1.25 : .75} strokeDasharray={i % 3 ? "1 3" : undefined} opacity={1 - i * .065} />)}
      <g fill="var(--trail-blue, #659de6)">
        <circle cx="257" cy="67" r="2.3" /><circle cx="314" cy="50" r="2.6" /><circle cx="464" cy="81" r="2" /><circle cx="534" cy="80" r="2.1" />
      </g>
    </svg>
  );
}
