import { Gamepad2, BookOpen, BrainCircuit, ShieldCheck, Network, Activity, Orbit, Sparkles } from 'lucide-react';
import { GuidePortrait } from './site-assistant/GuidePortrait';

const scenes = {
  arcade: {section:'games', art:'games', icons:[Gamepad2,Sparkles,Gamepad2]},
  insights: {section:'insights', art:'insights', icons:[BookOpen,Orbit,BrainCircuit]},
  academic: {section:'academic', art:'academic', icons:[Network,ShieldCheck,Activity]},
} as const;
export type Journey = keyof typeof scenes;
export const journeyMs = { arcade:3600, insights:4500, academic:3100 };
function Streets() {
  return <g>{[0,1,2,3].map((i)=><g key={i} transform={'translate('+[65,180,635,755][i]+' '+(85+i%2*55)+') scale('+(.7+i%2*.25)+')'}>
    <path d="M0 20h76l8 22-8 10-6 66 17 18v57H-3v-57l16-23-1-65Z"/><path d="M14 52h46l-3 52H17ZM10 129h63M14 155h47"/><circle cx="52" cy="120" r="3"/>
  </g>)}</g>;
}
export default function JourneyScene({world}:{world:Journey}) {
  const scene=scenes[world];
  return <div className={'journey-stage stage-'+world} aria-hidden="true">
    <div className="journey-land" style={{backgroundImage:'url(/art/'+scene.art+'.webp)'}}/>
    <div className="journey-stars"/><div className="journey-floor"/>
    <svg className="journey-diagram" viewBox="0 0 900 380" fill="none" stroke="currentColor" strokeWidth="2">
      {world==='arcade'? <Streets/> : world==='academic'? <g>{[45,155,605,715].map((x,i)=><g key={x} transform={'translate('+x+' '+(85+(i%2)*50)+')'}><rect width="134" height="77" rx="5"/><path d="M7 58l18-12 15 4 18-29 17 8 18-17 24 5M6 68h120M67 77v16m-27 0h54"/><circle cx="111" cy="16" r="4"/></g>)}</g> :
      <g><ellipse cx="696" cy="86" rx="99" ry="26" transform="rotate(-22 696 86)"/><circle cx="696" cy="86" r="36"/><text x="80" y="148" fill="currentColor" stroke="none" fontFamily="Georgia" fontSize="32">∫ f(x) dx</text><text x="610" y="248" fill="currentColor" stroke="none" fontFamily="Georgia" fontSize="28">E = mc²</text><path d="M95 229q46-20 79 2 36-24 85-12l-8 61q-44-12-79 5-31-18-82-3Zm78 2-1 54"/></g>}
    </svg>
    <div className="journey-symbols">{scene.icons.map((Icon,i)=><Icon key={i}/>)}</div>
    <div className="journey-ring"/><div className="journey-pilot"><GuidePortrait section={scene.section}/></div>
  </div>;
}
