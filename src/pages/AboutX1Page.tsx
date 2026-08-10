import { CSSProperties, KeyboardEvent, SyntheticEvent, useState } from 'react';

const portraitUrl = 'https://media.licdn.com/dms/image/v2/D4D03AQHwOA1DG7VJZQ/profile-displayphoto-scale_200_200/B4DZm6CPbRHYAc-/0/1759762774254?e=2147483647&v=beta&t=yzSDalrj20Mgz4WtEfglrPHXInGV8qmiDTLSVTXVzOQ';

const radarCapabilities = [
  { name: 'Cyber Strategy & Governance', score: 4.5, alignment: 'Business Direction & Accountability', description: 'Connect security priorities, governance and investment to business direction and clear accountability.', focus: 'Strategy · Governance · Investment · Accountability · Enterprise risk' },
  { name: 'Risk & Assurance', score: 4.4, alignment: 'Risk Visibility & Confidence', description: 'Create visibility over material cyber exposure and confidence in whether controls are working as intended.', focus: 'Risk scenarios · Control assurance · Evidence · Residual risk · Executive reporting' },
  { name: 'Security Architecture & Controls', score: 4.1, alignment: 'Secure Design & Control Effectiveness', description: 'Translate risk and security requirements into coherent, scalable controls that work in practice.', focus: 'Architecture · Requirements · Control design · Technology patterns · Effectiveness' },
  { name: 'Identity, Privacy & Trust', score: 4.0, alignment: 'Access, Data & Digital Trust', description: 'Strengthen access, accountability and the protection of sensitive information across digital services.', focus: 'Identity governance · Privileged access · Privacy · Data protection · Accountability' },
  { name: 'Operational Resilience', score: 4.3, alignment: 'Continuity & Recovery', description: 'Improve the organisation’s ability to withstand disruption and recover its critical services.', focus: 'Critical services · Continuity · Recovery · Dependencies · Crisis readiness' },
  { name: 'AI Security & Governance', score: 3.9, alignment: 'Responsible Innovation', description: 'Support responsible AI adoption through practical governance, security and assurance.', focus: 'AI governance · Model risk · Security · Assurance · Responsible adoption' },
] as const;

const roadmap = [
  { id: 'understand', stage: 'Understand', shortLabel: 'Business context', title: 'Business Context & Critical Outcomes', purpose: 'Understand strategy, critical services, stakeholders, regulatory context and technology dependencies before defining the security response.', executiveQuestion: 'What must the organisation protect and enable?', decision: 'Protect', principle: 'Business Led', focus: 'Business strategy · Critical services · Stakeholders · Dependencies · Regulatory context · Risk appetite', outcome: 'Clear security mandate, scope and understanding of what matters most.' },
  { id: 'assess', stage: 'Assess', shortLabel: 'Risk & exposure', title: 'Risk, Exposure & Current Capability', purpose: 'Build an evidence based view of material cyber risk, control weaknesses and current capability.', executiveQuestion: 'Where are we exposed, and why does it matter?', decision: 'Prioritise', principle: 'Risk Informed', focus: 'Risk scenarios · Threat exposure · Control gaps · Dependencies · Residual risk', outcome: 'A defensible view of priority risks and capability gaps.' },
  { id: 'define', stage: 'Define', shortLabel: 'Strategic direction', title: 'Target State & Strategic Direction', purpose: 'Define the security posture and capabilities required to support business objectives.', executiveQuestion: 'What level of security and resilience does the organisation need?', decision: 'Decide', principle: 'Executive Ready', focus: 'Target state · Risk appetite · Strategic priorities · Capability objectives · Investment themes', outcome: 'An agreed direction connecting business ambition, cyber risk and security priorities.' },
  { id: 'transform', stage: 'Transform', shortLabel: 'Roadmap & controls', title: 'Roadmap, Controls & Operating Model', purpose: 'Translate priorities into governance, architecture, controls, ownership and sequenced initiatives.', executiveQuestion: 'What needs to change, in what sequence, and who owns it?', decision: 'Invest', principle: 'Technology Aware', focus: 'Roadmap · Architecture · Controls · Operating model · Ownership · Dependencies · Investment', outcome: 'A practical, owned and prioritised transformation roadmap.' },
  { id: 'assure', stage: 'Assure', shortLabel: 'Evidence & confidence', title: 'Evidence, Effectiveness & Confidence', purpose: 'Determine whether controls are implemented, effective and producing the intended reduction in risk.', executiveQuestion: 'Can management trust that our controls work?', decision: 'Assure', principle: 'Evidence Driven', focus: 'Evidence · Testing · Effectiveness · Residual risk · Audit readiness · Reporting', outcome: 'Clear confidence in control effectiveness, remaining exposure and required action.' },
  { id: 'evolve', stage: 'Evolve', shortLabel: 'Resilience & adaptation', title: 'Measurement, Resilience & Adaptation', purpose: 'Use metrics, incidents, intelligence, assurance findings and business change to adapt cybersecurity priorities.', executiveQuestion: 'Are we becoming more resilient as the organisation and threat environment evolve?', decision: 'Adapt', principle: 'Resilience Focused', focus: 'Metrics · KRIs · KPIs · Incidents · Threat intelligence · Recovery · Lessons learned', outcome: 'A cybersecurity capability that evolves with business and risk.' },
] as const;

const axes = ['M250 250V50', 'M250 250L423 150', 'M250 250L423 350', 'M250 250V450', 'M250 250L77 350', 'M250 250L77 150'];
const radarPoint = (score: number, index: number) => {
  const angle = -Math.PI / 2 + index * Math.PI / 3;
  const radius = 200 * score / 5;
  return [250 + Math.cos(angle) * radius, 250 + Math.sin(angle) * radius] as const;
};
const vertices = radarCapabilities.map(({ score }, index) => radarPoint(score, index));
const radarPoints = vertices.map(([x, y]) => `${x},${y}`).join(' ');

function selectWithArrows(event: KeyboardEvent<HTMLButtonElement>, current: number, total: number, select: (index: number) => void) {
  const delta = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;
  if (!delta) return;
  event.preventDefault();
  const next = (current + delta + total) % total;
  select(next);
  event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('button')[next]?.focus();
}

export function AboutX1Page() {
  const [radar, setRadar] = useState(0);
  const [stage, setStage] = useState(0);
  const [portraitFailed, setPortraitFailed] = useState(false);
  const imageFailed = (event: SyntheticEvent<HTMLImageElement>) => { event.currentTarget.hidden = true; setPortraitFailed(true); };
  const capability = radarCapabilities[radar];
  const [activeX, activeY] = vertices[radar];
  const currentStage = roadmap[stage];

  return <article className="executive-about">
    <header className="executive-hero glass">
      <figure className={`executive-portrait ${portraitFailed ? 'has-fallback' : ''}`}><img src={portraitUrl} width="96" height="96" loading="eager" decoding="async" referrerPolicy="no-referrer" alt="Professional portrait of Anass Rharif" onError={imageFailed} /><span className="portrait-fallback" aria-hidden={!portraitFailed}>AR</span></figure>
      <div><p className="academic-eyebrow">Cybersecurity Advisory</p><h1>Turning Cyber Risk into Business Resilience</h1><p>I work across <strong>cybersecurity, business risk, governance and technology</strong>, helping turn complex threats, regulatory expectations and technical realities into clear priorities, practical operating models and informed decisions.</p><p>I approach cybersecurity as an enterprise management capability. The objective is not simply to add more controls, but to understand material exposure, strengthen accountability, build confidence in what is working and help the organisation transform securely.</p></div>
    </header>

    <section className="about-section" aria-labelledby="capability-title"><p className="academic-eyebrow">Enterprise Cybersecurity Model</p><h2 id="capability-title">Cybersecurity is a System of Connected Capabilities</h2><div className="section-copy"><p>Effective cybersecurity depends on how strategy, risk, architecture, identity, resilience and emerging technology work together.</p><p>My focus is on connecting these disciplines so security supports business priorities, informed risk decisions and resilient operations.</p></div>
      <div className="radar-layout"><div className="radar-visual"><div className="radar-heading"><span>Cyber capability</span><i aria-hidden="true">↔</i><span>Business / risk alignment</span></div><svg viewBox="0 0 500 500" role="img" aria-labelledby="radar-title radar-desc"><title id="radar-title">Enterprise cybersecurity capability model</title><desc id="radar-desc">Six connected cybersecurity capabilities mapped to strategic business and risk outcomes. The selected axis is {capability.name} at {capability.score} out of 5.</desc><g className="radar-rings"><polygon points="250,210 285,230 285,270 250,290 215,270 215,230"/><polygon points="250,170 319,210 319,290 250,330 181,290 181,210"/><polygon points="250,130 354,190 354,310 250,370 146,310 146,190"/><polygon points="250,90 389,170 389,330 250,410 111,330 111,170"/><polygon points="250,50 423,150 423,350 250,450 77,350 77,150"/></g><g className="radar-axes">{axes.map((path) => <path key={path} d={path} />)}</g><polygon className="radar-field" points={radarPoints}/><line className="radar-active-axis" x1="250" y1="250" x2={activeX} y2={activeY}/><g className="radar-vertices">{vertices.map(([cx, cy], index) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={radar === index ? 8 : 5} className={radar === index ? 'is-active' : ''} />)}</g><circle className="radar-core" cx="250" cy="250" r="68"/><text x="250" y="242" textAnchor="middle">CONNECTED</text><text x="250" y="264" textAnchor="middle">CAPABILITIES</text></svg></div>
        <div><div className="radar-selectors" aria-label="Explore enterprise cybersecurity capabilities">{radarCapabilities.map(({ name }, index) => <button type="button" key={name} aria-pressed={radar === index} className={radar === index ? 'is-active' : ''} onClick={() => setRadar(index)} onKeyDown={(event) => selectWithArrows(event, index, radarCapabilities.length, setRadar)}><span>{String(index + 1).padStart(2, '0')}</span>{name}<small>{radar === index ? 'Selected' : 'Select capability'}</small></button>)}</div><div className="executive-detail" aria-live="polite"><p className="academic-eyebrow">Selected capability</p><h3>{capability.name}</h3><p>{capability.description}</p><dl><div><dt>Strategic alignment</dt><dd>{capability.alignment}</dd></div><div><dt>Typical focus</dt><dd>{capability.focus}</dd></div></dl></div></div></div>
      <p className="journey-transition">Connected capabilities establish the foundation. The next step is turning them into better risk and business decisions.</p>
    </section>

    <section className="about-section advisory-journey" aria-labelledby="journey-title"><p className="academic-eyebrow">Cybersecurity Advisory Journey</p><h2 id="journey-title">From Business Context to Resilient Outcomes</h2><p className="section-copy">A six-stage journey from business context and risk insight to transformation, assurance and resilience.</p><p className="journey-cue">Select a stage to explore its decision, focus and outcome.</p>
      <div className="roadmap" role="tablist" aria-label="Cybersecurity advisory journey" style={{ '--journey-progress': `${stage / (roadmap.length - 1) * 100}%` } as CSSProperties}>
        <svg className="journey-path" viewBox="0 0 1000 240" preserveAspectRatio="none" aria-hidden="true" focusable="false"><defs><linearGradient id="journey-gradient"><stop stopColor="var(--accent)"/><stop offset="1" stopColor="var(--accent-2)"/></linearGradient></defs><path className="journey-path-base" pathLength="5" d="M83 120 C140 120 190 160 250 160 S355 80 417 80 S522 160 583 160 S688 80 750 80 S855 160 917 160"/><path className="journey-path-progress" pathLength="5" strokeDasharray={`${Math.min(5, stage + 0.12)} 5`} d="M83 120 C140 120 190 160 250 160 S355 80 417 80 S522 160 583 160 S688 80 750 80 S855 160 917 160"/></svg>
        {roadmap.map((item, index) => <button id={`stage-${item.id}`} key={item.id} type="button" role="tab" aria-selected={stage === index} aria-current={stage === index ? 'step' : undefined} aria-controls="journey-detail" className={stage === index ? 'is-active' : ''} onClick={() => setStage(index)} onKeyDown={(event) => selectWithArrows(event, index, roadmap.length, setStage)}><span className="milestone-copy"><b>{String(index + 1).padStart(2, '0')}</b><strong>{item.stage}</strong><small>{item.shortLabel}</small>{stage === index && <em>Selected</em>}</span><i className="milestone-node" aria-hidden="true" /></button>)}
      </div>
      <div id="journey-detail" role="tabpanel" aria-labelledby={`stage-${currentStage.id}`} className="journey-detail" tabIndex={0}><div className="journey-primary"><p className="stage-number">Stage {String(stage + 1).padStart(2, '0')} · {currentStage.stage}</p><h3>{currentStage.title}</h3><p>{currentStage.purpose}</p><div className="journey-signals"><span><small>Decision</small>{currentStage.decision}</span><span><small>Leadership principle</small>{currentStage.principle}</span></div></div><dl><div><dt>Executive question</dt><dd>{currentStage.executiveQuestion}</dd></div><div><dt>Typical focus</dt><dd>{currentStage.focus}</dd></div><div><dt>Outcome</dt><dd>{currentStage.outcome}</dd></div></dl></div>
    </section>

    <footer className="executive-objective"><blockquote><strong>My objective is to turn cyber risk into clearer decisions, stronger resilience and greater confidence in the organisation’s ability to operate and transform securely.</strong></blockquote></footer>
  </article>;
}
