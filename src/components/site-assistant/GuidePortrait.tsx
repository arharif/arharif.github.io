import { useId } from 'react';
import type { AssistantSectionKey } from './assistantContext';

export function guideFor(section: AssistantSectionKey) {
  return section === 'games' ? 'phantom' : ['insights','professional','personal'].includes(section) ? 'astronaut' : 'orb';
}
export function GuidePortrait({section}:{section:AssistantSectionKey}) {
  const kind=guideFor(section), id=useId().replace(/:/g,'');
  const fill=(name:string)=>'url(#'+id+name+')';
  return <svg viewBox="0 0 80 80" aria-hidden="true" className={'guide-portrait '+kind}>
    <defs>
      <radialGradient id={id+'glass'} cx=".39" cy=".28" r=".85"><stop stopColor="#415678"/><stop offset=".46" stopColor="#111837"/><stop offset=".8" stopColor="#181133"/><stop offset="1" stopColor="var(--agent-rim,#65dfff)"/></radialGradient>
      <linearGradient id={id+'rim'} x2=".8" y2="1"><stop stopColor="#efffff"/><stop offset=".25" stopColor="#50ddff"/><stop offset=".55" stopColor="var(--agent-rim,#829aff)"/><stop offset=".85" stopColor="#db98ff"/><stop offset="1" stopColor="#ffdb9f"/></linearGradient>
      <linearGradient id={id+'metal'} x2=".35" y2="1"><stop stopColor="#faf5ff"/><stop offset=".25" stopColor="#9fb7ea"/><stop offset=".47" stopColor="#635489"/><stop offset=".7" stopColor="#282243"/><stop offset="1" stopColor="#bcb6e3"/></linearGradient>
      <radialGradient id={id+'plasma'}><stop stopColor="#30114b"/><stop offset=".6" stopColor="#461461"/><stop offset=".85" stopColor="#8e33d6"/><stop offset="1" stopColor="#fa9cff"/></radialGradient>
    </defs>
    {kind==='orb' ? <><circle cx="40" cy="40" r="32" fill={fill('glass')} stroke={fill('rim')} strokeWidth="3"/><g className="character-eyes" fill="#fff"><ellipse cx="29" cy="37" rx="3" ry="3.6"/><ellipse cx="51" cy="37" rx="3" ry="3.6"/></g><path d="M33 45q7 10 14 0" fill="none" stroke="#fff2ee" strokeWidth="2.8" strokeLinecap="round"/></> :
    kind==='astronaut' ? <><path d="M18 77q3-19 22-19t22 19" fill={fill('metal')}/><ellipse cx="40" cy="61" rx="21" ry="7" fill={fill('metal')}/><rect x="9" y="11" width="62" height="51" rx="25" fill={fill('metal')} stroke={fill('rim')} strokeWidth="2.5"/><rect x="15" y="24" width="50" height="32" rx="16" fill={fill('glass')} stroke="#acb7fb" strokeWidth="2"/>{[4,69].map(x=><rect key={x} x={x} y="29" width="8" height="20" rx="4" fill={fill('metal')} stroke="#a59cce"/>)}<path d="M22 22q11-10 29-6" stroke="#faf9ff" strokeWidth="2" fill="none"/><g className="character-eyes visor-eyes" fill="#cfffff"><ellipse cx="30" cy="40" rx="3.8" ry="5"/><ellipse cx="50" cy="40" rx="3.8" ry="5"/></g></> :
    <g className="phantom-body"><path d="M6 46q10 3 13-10C20 10 52 7 58 32q2 8 11 2 8-4 6 4-2 8-13 9-1 2 1 7 3 6-4 5l-6-2q-4 0-5 7-3 8-8 1-4-7-8-1-5 7-8-1-1-7-6-6-5 4-8-1-2-3-6-4-5-4 2-6Z" fill={fill('plasma')} stroke="#f3afff" strokeWidth="2.7"/><g fill="#fff4ff" className="character-eyes"><ellipse cx="33" cy="37" rx="3.2" ry="4"/><ellipse cx="48" cy="37" rx="3.2" ry="4"/></g></g>}
  </svg>;
}
