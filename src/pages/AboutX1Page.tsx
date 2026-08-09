import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { SyntheticEvent, useState } from 'react';

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

const focusAreas = [
  ['01 — Cyber Strategy & Governance', 'Align security priorities, governance and investment with business objectives and enterprise risk.'],
  ['02 — Security Frameworks & Control Architecture', 'Translate NIST, ISO 27001, PCI DSS and other requirements into coherent, scalable and usable control environments.'],
  ['03 — Cyber Risk & Assurance', 'Create visibility over material cyber risks, control effectiveness, residual exposure and remediation priorities.'],
  ['04 — Identity, Privacy & Trust', 'Strengthen identity governance, privileged access, accountability and protection of sensitive information.'],
  ['05 — Operational & Technology Resilience', "Improve the organisation's ability to anticipate, withstand, respond to and recover from disruption."],
  ['06 — AI Security & Governance', 'Address emerging AI risk through practical governance, security, assurance and responsible adoption.'],
] as const;

const valueJourney = [
  ['01 — Frame', 'Connect cybersecurity priorities to business strategy, critical services and risk appetite.'],
  ['02 — Assess', 'Establish an evidence-based view of current capability, exposure and maturity.'],
  ['03 — Design', 'Translate requirements and risks into governance, controls and operating-model improvements.'],
  ['04 — Prioritise', 'Focus attention and investment on the risks and capabilities that matter most.'],
  ['05 — Transform', 'Build pragmatic roadmaps with clear ownership, dependencies and measurable outcomes.'],
  ['06 — Assure', 'Create transparency through evidence, metrics and executive-ready reporting.'],
] as const;

const principles = [
  ['Business-Led', 'Start with business objectives, critical services and strategic dependencies.'],
  ['Risk-Informed', 'Prioritise based on material exposure rather than treating every finding equally.'],
  ['Evidence-Driven', 'Build assurance on demonstrable control effectiveness rather than declarations of compliance.'],
  ['Technology-Aware', 'Understand how architecture, identity, cloud, infrastructure and emerging technologies influence enterprise risk.'],
  ['Resilience-Focused', 'Design security not only to prevent failure, but to maintain critical outcomes when disruption occurs.'],
  ['Executive-Ready', 'Translate technical complexity into concise choices, priorities and decisions leadership can act on.'],
] as const;

function InteractiveDetail({ title, text, supporting }: { title: string; text: string; supporting?: string }) {
  return <div className="executive-detail glass" aria-live="polite"><p className="academic-eyebrow">Selected perspective</p><h3>{title}</h3><p>{text}</p>{supporting && <p className="typical-focus"><strong>Typical focus</strong>{supporting}</p>}</div>;
}

function Selector({ items, active, onSelect, className }: { items: readonly (readonly string[])[]; active: number; onSelect: (index: number) => void; className: string }) {
  return <div className={className} role="list">{items.map(([name], index) => <div role="listitem" key={name}><button type="button" aria-pressed={active === index} className={active === index ? 'is-active' : ''} onClick={() => onSelect(index)} onPointerEnter={() => onSelect(index)}>{name}</button>{index < items.length - 1 && <ArrowDown aria-hidden="true" />}</div>)}</div>;
}

export function AboutX1Page() {
  const [flow, setFlow] = useState(0);
  const [radar, setRadar] = useState(0);
  const [focus, setFocus] = useState(0);
  const [value, setValue] = useState(0);
  const [principle, setPrinciple] = useState(0);
  const [portraitFailed, setPortraitFailed] = useState(false);
  const imageFailed = (event: SyntheticEvent<HTMLImageElement>) => { event.currentTarget.hidden = true; setPortraitFailed(true); };

  return <article className="executive-about">
    <header className="executive-hero glass">
      <figure className={`executive-portrait ${portraitFailed ? 'has-fallback' : ''}`} aria-label="Professional portrait of Anass Rharif">
        <img src={portraitUrl} width="400" height="400" loading="eager" decoding="async" referrerPolicy="no-referrer" alt="Professional portrait of Anass Rharif" onError={imageFailed} />
        <span className="portrait-fallback" aria-hidden={!portraitFailed}>AR</span>
      </figure>
      <div><p className="academic-eyebrow">Cybersecurity Advisory</p><h1>Turning Cyber Risk into Business Resilience</h1><p>I work at the intersection of <strong>cybersecurity, business risk, governance and technology</strong>, translating complex threats, regulatory expectations and technology dependencies into <strong>clear priorities, resilient operating models and decision-ready action</strong>.</p><p>My perspective is simple: cybersecurity is not a collection of controls or compliance obligations. It is an <strong>enterprise capability</strong> that protects critical services, enables transformation and gives leadership confidence to make informed risk decisions.</p></div>
    </header>

    <section className="about-section" aria-labelledby="portfolio-title"><p className="academic-eyebrow">Areas of Focus</p><h2 id="portfolio-title">Cybersecurity as an Enterprise Capability</h2><div className="portfolio-intro"><h3>Cybersecurity Capability Portfolio</h3><strong>Security requires more than controls.</strong><p>Cybersecurity performance emerges from the interaction of strategy, risk, architecture, identity, resilience and emerging technology governance. My focus is on connecting these capabilities into a coherent enterprise security model.</p></div>
      <div className="radar-layout"><div className="radar-visual"><svg viewBox="0 0 500 500" role="img" aria-labelledby="radar-title radar-desc"><title id="radar-title">Cybersecurity enterprise capability map</title><desc id="radar-desc">Six interconnected enterprise cybersecurity domains across Awareness, Governance, Integration, Assurance and Transformation.</desc><g className="radar-rings"><polygon points="250,210 285,230 285,270 250,290 215,270 215,230"/><polygon points="250,170 319,210 319,290 250,330 181,290 181,210"/><polygon points="250,130 354,190 354,310 250,370 146,310 146,190"/><polygon points="250,90 389,170 389,330 250,410 111,330 111,170"/><polygon points="250,50 423,150 423,350 250,450 77,350 77,150"/></g><g className="radar-axes"><path d="M250 250V50M250 250L423 150M250 250L423 350M250 250V450M250 250L77 350M250 250L77 150"/></g><polygon className="radar-field" points="250,65 400,164 394,333 250,425 96,339 90,158"/><circle className="radar-core" cx="250" cy="250" r="72"/><text x="250" y="228" textAnchor="middle">CYBERSECURITY</text><text x="250" y="251" textAnchor="middle">ENTERPRISE</text><text x="250" y="274" textAnchor="middle">CAPABILITY</text></svg><ol className="maturity-legend" aria-label="Enterprise capability progression"><li>Awareness</li><li>Governance</li><li>Integration</li><li>Assurance</li><li>Transformation</li></ol></div>
        <div><div className="radar-selectors">{radarCapabilities.map(([name], index) => <button type="button" key={name} aria-pressed={radar === index} className={radar === index ? 'is-active' : ''} onClick={() => setRadar(index)} onPointerEnter={() => setRadar(index)}><span>{String(index + 1).padStart(2, '0')}</span>{name}</button>)}</div><InteractiveDetail title={radarCapabilities[radar][0]} text={radarCapabilities[radar][1]} supporting={radarCapabilities[radar][2]} /></div></div>
      <blockquote className="radar-objective"><strong>The objective is not maturity in isolated domains—it is the ability to connect them into an operating model that supports business decisions and resilience.</strong></blockquote>
    </section>

    <section className="about-section" aria-labelledby="decision-title"><p className="academic-eyebrow">The Decision Chain</p><h2 id="decision-title">From Business Context to Executive Action</h2><p className="section-intro">Effective cybersecurity starts with the business—not the framework.</p><p className="sr-only">Business Priorities → Critical Risks → Security Requirements → Controls → Evidence → Management Decisions</p><Selector items={decisionFlow} active={flow} onSelect={setFlow} className="decision-flow" /><InteractiveDetail title={decisionFlow[flow][0]} text={decisionFlow[flow][1]} /></section>

    <section className="about-section" aria-labelledby="focus-title"><p className="academic-eyebrow">Areas of Focus</p><h2 id="focus-title">Cybersecurity as an Enterprise Capability</h2><div className="focus-index"><div role="tablist" aria-label="Capability areas">{focusAreas.map(([name], index) => <button role="tab" key={name} aria-selected={focus === index} className={focus === index ? 'is-active' : ''} onClick={() => setFocus(index)}>{name}</button>)}</div><InteractiveDetail title={focusAreas[focus][0]} text={focusAreas[focus][1]} /></div></section>

    <section className="about-section" aria-labelledby="value-title"><p className="academic-eyebrow">How I Create Value</p><h2 id="value-title">From Complexity to Structured Transformation</h2><Selector items={valueJourney} active={value} onSelect={setValue} className="value-path" /><InteractiveDetail title={valueJourney[value][0]} text={valueJourney[value][1]} /></section>

    <section className="about-section leadership" aria-labelledby="leadership-title"><p className="academic-eyebrow">Leadership Perspective</p><h2 id="leadership-title">Security should make better business decisions possible.</h2><p>A mature cybersecurity function does more than prevent incidents.</p><p>It enables leadership to understand <strong>what matters, where the organisation is exposed, whether existing controls can be trusted, what should change and where investment will create the greatest reduction in risk</strong>.</p><p>That requires cybersecurity to connect strategy with execution:</p><div className="leadership-flow" aria-label="Strategy to executive decisions"><span>Strategy</span><span>Risk</span><span>Architecture</span><span>Controls</span><span>Operations</span><span>Assurance</span><strong>Executive Decisions</strong></div><p className="sr-only">Strategy → Risk → Architecture → Controls → Operations → Assurance → Executive Decisions</p></section>

    <section className="about-section" aria-labelledby="approach-title"><p className="academic-eyebrow">My Approach</p><h2 id="approach-title">Business-Led. Risk-Informed. Evidence-Driven. Resilience-Focused.</h2><div className="principle-model"><div className="principle-tabs" role="tablist" aria-label="Advisory principles">{principles.map(([name], index) => <button role="tab" aria-selected={principle === index} className={principle === index ? 'is-active' : ''} onClick={() => setPrinciple(index)} key={name}>{name}</button>)}</div><div className="principle-core" aria-hidden="true">Cybersecurity<br/>Advisory</div></div><InteractiveDetail title={principles[principle][0]} text={principles[principle][1]} /></section>

    <section className="about-section resources" aria-labelledby="resources-title"><p className="academic-eyebrow">Knowledge ecosystem</p><h2 id="resources-title">Explore Resources</h2><div className="resource-links"><a href="/academic-library"><span>X1 Academic Library</span><small>Courses · PDFs · Framework Guidance</small><ArrowUpRight aria-hidden="true" /></a><a href="https://payhip.com/CyberSecAIStore" target="_blank" rel="noopener noreferrer"><span>CyberSecAI Resources</span><small>Cybersecurity · AI Security · Practitioner Resources</small><ArrowUpRight aria-hidden="true" /></a></div></section>

    <footer className="executive-objective"><blockquote><strong>My objective: turn cyber risk into clearer decisions, stronger resilience and greater confidence in the organisation's ability to operate and transform securely.</strong></blockquote><div className="x1-signature"><b>X1</b><span>Cybersecurity • Risk • Governance • Technology</span></div></footer>
  </article>;
}
