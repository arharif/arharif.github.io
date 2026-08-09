import { SyntheticEvent, useState } from 'react';

const portraitUrl = 'https://media.licdn.com/dms/image/v2/D4D03AQHwOA1DG7VJZQ/profile-displayphoto-scale_200_200/B4DZm6CPbRHYAc-/0/1759762774254?e=2147483647&v=beta&t=yzSDalrj20Mgz4WtEfglrPHXInGV8qmiDTLSVTXVzOQ';

const radarCapabilities = [
  ['Cyber Strategy & Governance', 'Align security priorities, governance and investment with business objectives and enterprise risk.', 'Strategy · Governance · Investment · Enterprise risk'],
  ['Risk & Assurance', 'Establish visibility over material cyber risks, control effectiveness, residual exposure and remediation priorities.', 'Risk assessment · Control assurance · Evidence · Residual risk · Executive reporting'],
  ['Security Architecture & Controls', 'Translate risk and security requirements into coherent, scalable and usable control environments.', 'Architecture · Requirements · Control design · Technology patterns'],
  ['Identity, Privacy & Trust', 'Strengthen identity governance, privileged access, accountability and protection of sensitive information.', 'Identity governance · Privileged access · Privacy · Accountability'],
  ['Operational Resilience', 'Strengthen the organisation’s ability to anticipate, withstand, respond to and recover from disruption.', 'Critical services · BCP/DR · Dependencies · Crisis readiness · Recovery assurance'],
  ['AI Security & Governance', 'Address emerging AI risk through practical governance, security, assurance and responsible adoption.', 'AI governance · Model risk · Security · Assurance · Responsible adoption'],
] as const;

const maturity = ['Foundation', 'Governed', 'Integrated', 'Assured', 'Adaptive'] as const;

const stages = [
  ['Understand', 'Business Context & Critical Outcomes', 'Understand strategy, critical services, stakeholders, regulatory expectations and technology dependencies.', 'What must the organisation protect and enable?', 'Clear security mandate and business context.'],
  ['Assess', 'Risk, Exposure & Current Capability', 'Identify material cyber scenarios, control weaknesses, dependencies and current-state capability.', 'Where are we exposed, and why does it matter?', 'Evidence-based view of risk and capability.'],
  ['Define', 'Target State & Strategic Priorities', 'Establish the desired security posture, risk tolerance and capability priorities.', 'What level of security and resilience do we need?', 'Target state and strategic priorities.'],
  ['Transform', 'Roadmap, Controls & Operating Model', 'Translate priorities into governance, architecture, controls, ownership, initiatives and investment decisions.', 'What needs to change, in what sequence, and who owns it?', 'Prioritised transformation roadmap.'],
  ['Assure', 'Evidence, Effectiveness & Confidence', 'Determine whether controls are implemented, operating effectively and producing the intended risk reduction.', 'Can management trust that our controls work?', 'Decision-ready assurance and residual-risk visibility.'],
  ['Evolve', 'Measurement, Resilience & Adaptation', 'Use metrics, incidents, threat intelligence, assurance findings and business change to continuously adapt priorities.', 'Are we becoming more resilient as the organisation and threat environment evolve?', 'Continuous, risk-informed improvement.'],
] as const;

const decisions = [['Protect', 'What matters most?'], ['Prioritise', 'Where should we focus?'], ['Invest', 'Where will resources reduce material risk?'], ['Accept', 'Which residual risks are tolerable?'], ['Transform', 'Which capabilities need to change?'], ['Assure', 'Where do we have sufficient confidence?']] as const;
const principles = [
  ['Business-Led', 'Begin with strategic objectives, critical services and business context.'],
  ['Risk-Informed', 'Prioritise according to material exposure rather than treating every finding equally.'],
  ['Technology-Aware', 'Understand how architecture, cloud, identity, infrastructure and emerging technologies shape risk.'],
  ['Evidence-Driven', 'Base assurance on demonstrable implementation and effectiveness.'],
  ['Resilience-Focused', 'Design security to withstand disruption as well as prevent it.'],
  ['Executive-Ready', 'Translate technical complexity into clear choices, priorities and decisions.'],
] as const;

function Detail({ title, text, supporting }: { title: string; text: string; supporting: string }) {
  return <div className="executive-detail" aria-live="polite"><h3>{title}</h3><p>{text}</p><p className="typical-focus"><strong>Typical focus</strong>{supporting}</p></div>;
}

export function AboutX1Page() {
  const [radar, setRadar] = useState(0);
  const [stage, setStage] = useState(0);
  const [portraitFailed, setPortraitFailed] = useState(false);
  const imageFailed = (event: SyntheticEvent<HTMLImageElement>) => { event.currentTarget.hidden = true; setPortraitFailed(true); };
  const currentStage = stages[stage];

  return <article className="executive-about">
    <header className="executive-hero glass">
      <figure className={`executive-portrait ${portraitFailed ? 'has-fallback' : ''}`}><img src={portraitUrl} width="96" height="96" loading="eager" decoding="async" referrerPolicy="no-referrer" alt="Professional portrait of Anass Rharif" onError={imageFailed} /><span className="portrait-fallback" aria-hidden={!portraitFailed}>AR</span></figure>
      <div><p className="academic-eyebrow">Cybersecurity Advisory</p><h1>Turning Cyber Risk into Business Resilience</h1><p>I work at the intersection of <strong>cybersecurity, business risk, governance and technology</strong>, translating complex threats, regulatory expectations and technology dependencies into <strong>clear priorities, resilient operating models and decision-ready action</strong>.</p><p>Cybersecurity is an <strong>enterprise capability</strong> connecting strategic objectives, critical services, technology, controls and evidence—enabling transformation and informed executive decisions.</p></div>
    </header>

    <section className="about-section" aria-labelledby="capability-title"><p className="academic-eyebrow">Enterprise Cybersecurity Model</p><h2 id="capability-title">Cybersecurity is a System of Connected Capabilities</h2><div className="section-copy"><p>Sustainable security depends on how effectively strategy, risk, architecture, identity, resilience and emerging technology governance operate together.</p><p>My focus is on connecting these capabilities into an enterprise model that supports risk decisions, transformation and measurable resilience.</p></div>
      <div className="radar-layout"><div className="radar-visual"><svg viewBox="0 0 500 500" role="img" aria-labelledby="radar-title radar-desc"><title id="radar-title">Enterprise cybersecurity capability model</title><desc id="radar-desc">Six connected cybersecurity capabilities viewed through five organisational maturity levels, from Foundation to Adaptive. This is not a personal proficiency score.</desc><g className="radar-rings"><polygon points="250,210 285,230 285,270 250,290 215,270 215,230"/><polygon points="250,170 319,210 319,290 250,330 181,290 181,210"/><polygon points="250,130 354,190 354,310 250,370 146,310 146,190"/><polygon points="250,90 389,170 389,330 250,410 111,330 111,170"/><polygon points="250,50 423,150 423,350 250,450 77,350 77,150"/></g><g className="radar-axes"><path d="M250 250V50M250 250L423 150M250 250L423 350M250 250V450M250 250L77 350M250 250L77 150"/></g><polygon className="radar-field" points="250,72 392,168 387,329 250,417 104,334 97,162"/><circle className="radar-core" cx="250" cy="250" r="68"/><text x="250" y="232" textAnchor="middle">ENTERPRISE</text><text x="250" y="254" textAnchor="middle">CAPABILITY</text><text x="250" y="276" textAnchor="middle">MODEL</text><g className="radar-markers" aria-hidden="true"><text x="292" y="219">1</text><text x="327" y="199">2</text><text x="362" y="179">3</text><text x="397" y="159">4</text><text x="430" y="139">5</text></g></svg><ol className="maturity-legend" aria-label="Capability maturity levels">{maturity.map((label, index) => <li key={label}><b>{index + 1}</b> {label}</li>)}</ol><p className="radar-note">The maturity scale represents the operating lens applied across enterprise cybersecurity capabilities—not a personal proficiency score.</p></div>
        <div><div className="radar-selectors" aria-label="Explore enterprise cybersecurity capabilities">{radarCapabilities.map(([name], index) => <button type="button" key={name} aria-pressed={radar === index} className={radar === index ? 'is-active' : ''} onClick={() => setRadar(index)}><span>{String(index + 1).padStart(2, '0')}</span>{name}</button>)}</div><Detail title={radarCapabilities[radar][0]} text={radarCapabilities[radar][1]} supporting={radarCapabilities[radar][2]} /></div></div>
      <blockquote className="radar-objective">Maturity is not achieved within isolated domains. It emerges when capabilities work together as one operating system for cyber risk and resilience.</blockquote>
      <p className="journey-transition">Connected capabilities create the foundation. The next challenge is turning that capability into a repeatable management journey.</p>
    </section>

    <section className="about-section advisory-journey" aria-labelledby="journey-title"><p className="academic-eyebrow">Cybersecurity Advisory Journey</p><h2 id="journey-title">From Business Context to Resilient Outcomes</h2><p className="section-copy">A structured journey from understanding what matters to establishing confidence that cyber risk is being managed effectively.</p>
      <div className="roadmap" role="tablist" aria-label="Cybersecurity advisory journey">{stages.map(([name], index) => <button key={name} type="button" role="tab" aria-selected={stage === index} aria-controls="journey-detail" className={stage === index ? 'is-active' : ''} onClick={() => setStage(index)}><span>{String(index + 1).padStart(2, '0')}</span><strong>{name}</strong></button>)}</div>
      <div id="journey-detail" role="tabpanel" className="journey-detail" aria-live="polite"><div><span className="stage-number">{String(stage + 1).padStart(2, '0')}</span><h3>{currentStage[1]}</h3><p>{currentStage[2]}</p></div><dl><div><dt>Executive question</dt><dd>“{currentStage[3]}”</dd></div><div><dt>Outcome</dt><dd>{currentStage[4]}</dd></div></dl></div>
    </section>

    <section className="about-section compact-section" aria-labelledby="management-title"><p className="academic-eyebrow">Management Lens</p><h2 id="management-title">Every Stage Should Improve the Quality of a Decision</h2><div className="decision-lens">{decisions.map(([title, copy]) => <div key={title}><strong>{title}</strong><span>{copy}</span></div>)}</div></section>

    <section className="about-section compact-section" aria-labelledby="principles-title"><p className="academic-eyebrow">Leadership Principles</p><h2 id="principles-title">How I Approach Cybersecurity</h2><div className="principles-grid">{principles.map(([title, copy]) => <div key={title}><h3>{title}</h3><p>{copy}</p></div>)}</div></section>

    <footer className="executive-objective"><blockquote><strong>My objective: turn cyber risk into clearer decisions, stronger resilience and greater confidence in the organisation’s ability to operate and transform securely.</strong></blockquote><div className="x1-signature"><b>X1</b><span>Cybersecurity • Risk • Governance • Technology</span></div></footer>
  </article>;
}
