import { SyntheticEvent, useId, useState } from 'react';

const portraitUrl = 'https://media.licdn.com/dms/image/v2/D4D03AQHwOA1DG7VJZQ/profile-displayphoto-scale_200_200/B4DZm6CPbRHYAc-/0/1759762774254?e=2147483647&v=beta&t=yzSDalrj20Mgz4WtEfglrPHXInGV8qmiDTLSVTXVzOQ';

const decisionFlow = [
  ['Business Priorities', 'Understand strategic objectives, critical services, technology dependencies and stakeholder expectations before defining the security response.'],
  ['Critical Risks', 'Identify the scenarios that could materially affect operations, trust, customers, regulatory obligations or strategic objectives.'],
  ['Security Requirements', 'Translate risk, regulatory and contractual expectations into clear security outcomes.'],
  ['Controls', 'Design proportionate governance, process and technology measures with explicit ownership.'],
  ['Evidence', 'Establish confidence through measurable, defensible evidence of control design and effectiveness.'],
  ['Management Decisions', 'Turn cyber information into clear choices around risk, investment, remediation, acceptance and transformation priorities.'],
] as const;

const radarCapabilities = [
  ['Cyber Strategy & Governance', 'Align security priorities, governance and investment with business objectives and enterprise risk.', 'Strategy · Governance · Investment · Enterprise risk'],
  ['Risk & Assurance', 'Create visibility over material cyber risks, control effectiveness, residual exposure and remediation priorities.', 'Risk assessment · Control assurance · Evidence · Residual risk · Executive reporting'],
  ['Security Architecture & Controls', 'Translate frameworks, risk and security requirements into coherent, scalable and usable control environments.', 'Architecture · Frameworks · Requirements · Control design'],
  ['Identity, Privacy & Trust', 'Strengthen identity governance, privileged access, accountability and protection of sensitive information.', 'Identity governance · Privileged access · Privacy · Accountability'],
  ['Operational Resilience', "Improve the organisation's ability to anticipate, withstand, respond to and recover from disruption.", 'Critical services · BCP/DR · Dependencies · Crisis readiness · Recovery assurance'],
  ['AI Security & Governance', 'Address emerging AI risk through practical governance, security, assurance and responsible adoption.', 'AI governance · Security · Assurance · Responsible adoption'],
] as const;

const capabilities = [
  ['Cyber Strategy & Governance', 'Align security priorities, governance and investment with business objectives and enterprise risk.'],
  ['Security Frameworks & Control Architecture', 'Translate NIST, ISO 27001, PCI DSS and other requirements into coherent, scalable and usable control environments.'],
  ['Cyber Risk & Assurance', 'Create visibility over material cyber risks, control effectiveness, residual exposure and remediation priorities.'],
  ['Identity, Privacy & Trust', 'Strengthen identity governance, privileged access, accountability and protection of sensitive information.'],
  ['Operational & Technology Resilience', "Improve the organisation's ability to anticipate, withstand, respond to and recover from disruption."],
  ['AI Security & Governance', 'Address emerging AI risk through practical governance, security, assurance and responsible adoption.'],
] as const;

const transformation = [
  ['Frame', 'Connect cybersecurity priorities to business strategy, critical services and risk appetite.'],
  ['Assess', 'Establish an evidence-based view of current capability, exposure and maturity.'],
  ['Design', 'Translate requirements and risks into governance, controls and operating-model improvements.'],
  ['Prioritise', 'Focus attention and investment on the risks and capabilities that matter most.'],
  ['Transform', 'Build pragmatic roadmaps with clear ownership, dependencies and measurable outcomes.'],
  ['Assure', 'Create transparency through evidence, metrics and executive-ready reporting.'],
] as const;

const principles = [
  ['Business-Led', 'Start with business objectives, critical services and strategic dependencies.'],
  ['Risk-Informed', 'Prioritise based on material exposure rather than treating every finding equally.'],
  ['Evidence-Driven', 'Build assurance on demonstrable control effectiveness rather than declarations of compliance.'],
  ['Technology-Aware', 'Understand how architecture, identity, cloud, infrastructure and emerging technologies influence enterprise risk.'],
  ['Resilience-Focused', 'Design security not only to prevent failure, but to maintain critical outcomes when disruption occurs.'],
  ['Executive-Ready', 'Translate technical complexity into concise choices, priorities and decisions leadership can act on.'],
] as const;

const views = ['Decision Chain', 'Capability Model', 'Transformation', 'Leadership Principles'] as const;
const shortCapabilities = ['Strategy', 'Frameworks', 'Risk', 'Identity', 'Resilience', 'AI'];

function Detail({ title, text, supporting }: { title: string; text: string; supporting?: string }) {
  return <div className="executive-detail" aria-live="polite"><h3>{title}</h3><p>{text}</p>{supporting && <p className="typical-focus"><strong>Typical focus</strong>{supporting}</p>}</div>;
}

function CompactSelector({ items, active, onSelect, labels }: { items: readonly (readonly string[])[]; active: number; onSelect: (index: number) => void; labels?: readonly string[] }) {
  return <div className="model-selector">{items.map(([name], index) => <button type="button" aria-pressed={active === index} className={active === index ? 'is-active' : ''} onClick={() => onSelect(index)} key={name}><span>{String(index + 1).padStart(2, '0')}</span>{labels?.[index] ?? name}</button>)}</div>;
}

export function AboutX1Page() {
  const [radar, setRadar] = useState(0);
  const [view, setView] = useState(0);
  const [selections, setSelections] = useState([0, 0, 0, 0]);
  const [portraitFailed, setPortraitFailed] = useState(false);
  const tabId = useId();
  const select = (index: number) => setSelections((current) => current.map((value, position) => position === view ? index : value));
  const imageFailed = (event: SyntheticEvent<HTMLImageElement>) => { event.currentTarget.hidden = true; setPortraitFailed(true); };

  const modelContent = view === 0 ? <><h3 className="model-heading">From Business Context to Executive Action</h3><p className="section-intro">Effective cybersecurity starts with the business—not the framework.</p><CompactSelector items={decisionFlow} active={selections[0]} onSelect={select} /><Detail title={decisionFlow[selections[0]][0]} text={decisionFlow[selections[0]][1]} /></>
    : view === 1 ? <><h3 className="model-heading">The meaning behind the capability portfolio</h3><CompactSelector items={capabilities} labels={shortCapabilities} active={selections[1]} onSelect={select} /><Detail title={`${String(selections[1] + 1).padStart(2, '0')} — ${capabilities[selections[1]][0]}`} text={capabilities[selections[1]][1]} /></>
    : view === 2 ? <><h3 className="model-heading">A consulting transformation lifecycle</h3><CompactSelector items={transformation} active={selections[2]} onSelect={select} /><Detail title={`${String(selections[2] + 1).padStart(2, '0')} — ${transformation[selections[2]][0]}`} text={transformation[selections[2]][1]} /></>
    : <><h3 className="leadership-statement">Security should make better business decisions possible.</h3><p className="leadership-copy">A mature cybersecurity function connects strategy with execution, enabling leadership to understand what matters, where the organisation is exposed, whether controls can be trusted and where investment creates the greatest reduction in risk.</p><div className="leadership-flow" aria-label="Strategy to executive decisions"><span>Strategy</span><span>Risk</span><span>Architecture</span><span>Controls</span><span>Operations</span><span>Assurance</span><strong>Executive Decisions</strong></div><CompactSelector items={principles} active={selections[3]} onSelect={select} /><Detail title={principles[selections[3]][0]} text={principles[selections[3]][1]} /></>;

  return <article className="executive-about">
    <header className="executive-hero glass">
      <figure className={`executive-portrait ${portraitFailed ? 'has-fallback' : ''}`}>
        <img src={portraitUrl} width="96" height="96" loading="eager" decoding="async" referrerPolicy="no-referrer" alt="Professional portrait of Anass Rharif" onError={imageFailed} />
        <span className="portrait-fallback" aria-hidden={!portraitFailed}>AR</span>
      </figure>
      <div><p className="academic-eyebrow">Cybersecurity Advisory</p><h1>Turning Cyber Risk into Business Resilience</h1><p>I work at the intersection of <strong>cybersecurity, business risk, governance and technology</strong>, translating complex threats, regulatory expectations and technology dependencies into <strong>clear priorities, resilient operating models and decision-ready action</strong>.</p><p>My perspective is simple: cybersecurity is not a collection of controls or compliance obligations. It is an <strong>enterprise capability</strong> that protects critical services, enables transformation and gives leadership confidence to make informed risk decisions.</p></div>
    </header>

    <section className="about-section" aria-labelledby="portfolio-title"><p className="academic-eyebrow">Areas of Focus</p><h2 id="portfolio-title">Cybersecurity as an Enterprise Capability</h2><div className="portfolio-intro"><h3>Cybersecurity Capability Portfolio</h3><strong>Security requires more than controls.</strong><p>Cybersecurity performance emerges from the interaction of strategy, risk, architecture, identity, resilience and emerging technology governance. My focus is on connecting these capabilities into a coherent enterprise security model.</p></div>
      <div className="radar-layout"><div className="radar-visual"><svg viewBox="0 0 500 500" role="img" aria-labelledby="radar-title radar-desc"><title id="radar-title">Cybersecurity enterprise capability map</title><desc id="radar-desc">Six interconnected enterprise cybersecurity domains across Awareness, Governance, Integration, Assurance and Transformation.</desc><g className="radar-rings"><polygon points="250,210 285,230 285,270 250,290 215,270 215,230"/><polygon points="250,170 319,210 319,290 250,330 181,290 181,210"/><polygon points="250,130 354,190 354,310 250,370 146,310 146,190"/><polygon points="250,90 389,170 389,330 250,410 111,330 111,170"/><polygon points="250,50 423,150 423,350 250,450 77,350 77,150"/></g><g className="radar-axes"><path d="M250 250V50M250 250L423 150M250 250L423 350M250 250V450M250 250L77 350M250 250L77 150"/></g><polygon className="radar-field" points="250,65 400,164 394,333 250,425 96,339 90,158"/><circle className="radar-core" cx="250" cy="250" r="72"/><text x="250" y="228" textAnchor="middle">CYBERSECURITY</text><text x="250" y="251" textAnchor="middle">ENTERPRISE</text><text x="250" y="274" textAnchor="middle">CAPABILITY</text></svg><ol className="maturity-legend" aria-label="Enterprise capability progression"><li>Awareness</li><li>Governance</li><li>Integration</li><li>Assurance</li><li>Transformation</li></ol></div>
        <div><div className="radar-selectors">{radarCapabilities.map(([name], index) => <button type="button" key={name} aria-pressed={radar === index} className={radar === index ? 'is-active' : ''} onClick={() => setRadar(index)}><span>{String(index + 1).padStart(2, '0')}</span>{name}</button>)}</div><Detail title={radarCapabilities[radar][0]} text={radarCapabilities[radar][1]} supporting={radarCapabilities[radar][2]} /></div></div>
      <blockquote className="radar-objective"><strong>The objective is not maturity in isolated domains—it is the ability to connect them into an operating model that supports business decisions and resilience.</strong></blockquote>
    </section>

    <section className="about-section advisory-model" aria-labelledby="advisory-title"><p className="academic-eyebrow">Cybersecurity Advisory Model</p><h2 id="advisory-title">From Business Context to Resilient Outcomes</h2>
      <div className="model-tabs" role="tablist" aria-label="Advisory model perspectives">{views.map((name, index) => <button id={`${tabId}-tab-${index}`} aria-controls={`${tabId}-panel`} role="tab" aria-selected={view === index} tabIndex={view === index ? 0 : -1} className={view === index ? 'is-active' : ''} onClick={() => setView(index)} onKeyDown={(event) => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { const next = (index + (event.key === 'ArrowRight' ? 1 : 3)) % 4; setView(next); document.getElementById(`${tabId}-tab-${next}`)?.focus(); } }}>{String(index + 1).padStart(2, '0')} <span>{name}</span></button>)}</div>
      <div id={`${tabId}-panel`} role="tabpanel" aria-labelledby={`${tabId}-tab-${view}`} className="model-panel">{modelContent}</div>
    </section>

    <footer className="executive-objective"><blockquote><strong>My objective: turn cyber risk into clearer decisions, stronger resilience and greater confidence in the organisation's ability to operate and transform securely.</strong></blockquote><div className="x1-signature"><b>X1</b><span>Cybersecurity • Risk • Governance • Technology</span></div></footer>
  </article>;
}
