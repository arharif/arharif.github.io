import { ArrowDown, Building2, Cpu, Scale, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

const decisionFlow = [
  ['Business Priorities', 'Start with strategic objectives, critical services, stakeholder expectations and business context.'],
  ['Risk', 'Understand exposure, consequences and uncertainty.'],
  ['Requirements', 'Translate regulatory, contractual and framework expectations into actionable requirements.'],
  ['Controls', 'Design governance, process and technical measures that reduce relevant risks.'],
  ['Evidence', 'Establish traceability and proof that controls exist and operate as expected.'],
  ['Management Decisions', 'Translate cybersecurity information into prioritisation, investment, remediation or risk-acceptance decisions.'],
] as const;

const capabilities = [
  ['Cyber Strategy & GRC', 'Connect strategy, governance and accountability to measurable security outcomes.'],
  ['NIST, ISO 27001 & PCI DSS', 'Turn overlapping framework expectations into a coherent, usable control environment.'],
  ['Cyber Risk & Assurance', 'Create credible risk visibility and confidence in control design and operation.'],
  ['IAM & Privacy Governance', 'Establish accountable identity, access and privacy decision structures.'],
  ['Operational Resilience', 'Strengthen critical-service preparedness, response and recovery.'],
  ['AI Security & Governance', 'Enable responsible AI adoption through proportionate risk, control and oversight.'],
] as const;

const valueJourney = [
  ['Clarify', 'Governance & Ownership', 'Define decision rights, accountability and the operating context.', 'Creates a shared direction and removes ownership ambiguity.', 'A clear governance model and accountable owners.'],
  ['Assess', 'Current & Target State', 'Evaluate present capability and define the outcome the organisation needs.', 'Makes improvement measurable rather than assumption-led.', 'An evidence-based maturity baseline and target state.'],
  ['Translate', 'Frameworks → Controls', 'Convert obligations into practical governance, process and technical measures.', 'Connects external expectations to day-to-day operation.', 'A tailored, actionable control set.'],
  ['Identify', 'Risk & Capability Gaps', 'Surface material exposure and the weaknesses that create it.', 'Focuses attention on issues with meaningful consequences.', 'Prioritised risks and capability gaps.'],
  ['Prioritise', 'Transformation Roadmap', 'Sequence improvements around risk, dependencies, value and feasibility.', 'Directs investment to the changes that matter most.', 'A realistic, owned transformation roadmap.'],
  ['Assure', 'Evidence & Executive Reporting', 'Validate operation and convert evidence into decision-ready insight.', 'Gives leaders confidence and transparent choices.', 'Defensible assurance and executive reporting.'],
] as const;

const principles = [
  ['Business First', 'Cybersecurity decisions should begin with business context, critical services and strategic objectives.'],
  ['Risk-Based', 'Effort and investment should focus on the exposures that matter most.'],
  ['Evidence-Driven', 'Controls must be demonstrable, defensible and supported by reliable evidence.'],
  ['Practical', 'Requirements must translate into implementable operating practices rather than theoretical compliance.'],
  ['Executive-Ready', 'Cybersecurity information must support clear decisions about priorities, investment, remediation and risk acceptance.'],
] as const;

function InteractiveDetail({ title, text }: { title: string; text: string }) {
  return <div className="executive-detail glass" aria-live="polite"><p className="academic-eyebrow">Selected perspective</p><h3>{title}</h3><p>{text}</p></div>;
}

export function AboutX1Page() {
  const [flow, setFlow] = useState(0);
  const [capability, setCapability] = useState(0);
  const [value, setValue] = useState(0);
  const [principle, setPrinciple] = useState(0);
  return <article className="executive-about space-y-16">
    <header className="executive-hero glass">
      <div><p className="academic-eyebrow">Cybersecurity advisory</p><h1>Turning Cybersecurity Complexity into Business Decisions</h1><p>I work at the intersection of <strong>cybersecurity, risk, governance and technology</strong>, helping organisations translate complex regulatory and security requirements into <strong>practical controls, resilient operating models and decision-ready insights</strong>.</p><p>I focus on cybersecurity as a <strong>business capability</strong>, not simply a compliance exercise—combining governance, risk management, assurance and technical understanding to improve resilience, accountability and measurable security performance.</p></div>
      <aside className="governance-triangle" aria-label="Cyber governance connects business, risk and technology"><span><Building2 aria-hidden="true" />Business</span><span><Scale aria-hidden="true" />Risk</span><span><Cpu aria-hidden="true" />Technology</span><strong><ShieldCheck aria-hidden="true" />Cyber<br />Governance</strong></aside>
    </header>

    <section aria-labelledby="decision-title"><p className="academic-eyebrow">The decision chain</p><h2 id="decision-title">From business context to management action</h2><p className="section-intro">Select each stage to see how complex expectations become defensible decisions.</p><div className="decision-flow" role="list">{decisionFlow.map(([name], index) => <div role="listitem" key={name}><button aria-pressed={flow === index} className={flow === index ? 'is-active' : ''} onClick={() => setFlow(index)} onMouseEnter={() => setFlow(index)}>{name}</button>{index < decisionFlow.length - 1 && <ArrowDown aria-hidden="true" />}</div>)}</div><InteractiveDetail title={decisionFlow[flow][0]} text={decisionFlow[flow][1]} /></section>

    <section aria-labelledby="focus-title"><p className="academic-eyebrow">Areas of focus</p><h2 id="focus-title">Cybersecurity as a business capability</h2><div className="capability-constellation"><div className="capability-core">Cybersecurity<br />as a Business<br />Capability</div>{capabilities.map(([name], index) => <button key={name} aria-pressed={capability === index} className={capability === index ? 'is-active' : ''} onClick={() => setCapability(index)}><span>{String(index + 1).padStart(2, '0')}</span>{name}</button>)}</div><InteractiveDetail title={capabilities[capability][0]} text={capabilities[capability][1]} /></section>

    <section aria-labelledby="value-title"><p className="academic-eyebrow">How I create value</p><h2 id="value-title">From fragmented activity to structured transformation</h2><div className="value-path" role="list">{valueJourney.map(([verb, subject], index) => <button role="listitem" key={verb} aria-pressed={value === index} className={value === index ? 'is-active' : ''} onClick={() => setValue(index)}><small>{String(index + 1).padStart(2, '0')}</small><strong>{verb}</strong><span>{subject}</span></button>)}</div><div className="value-detail glass" aria-live="polite"><div><small>What happens</small><p>{valueJourney[value][2]}</p></div><div><small>Why it matters</small><p>{valueJourney[value][3]}</p></div><div><small>Expected outcome</small><p>{valueJourney[value][4]}</p></div></div></section>

    <section aria-labelledby="approach-title"><p className="academic-eyebrow">My approach</p><h2 id="approach-title">Business First. Risk-Based. Evidence-Driven. Practical. Executive-Ready.</h2><div className="principle-tabs" role="tablist" aria-label="Advisory principles">{principles.map(([name], index) => <button role="tab" aria-selected={principle === index} className={principle === index ? 'is-active' : ''} onClick={() => setPrinciple(index)} key={name}>{name}</button>)}</div><InteractiveDetail title={principles[principle][0]} text={principles[principle][1]} /></section>

    <blockquote className="executive-objective"><p>My objective is simple:</p><strong>Turn cybersecurity requirements into clearer risk decisions, stronger controls and measurable business resilience.</strong></blockquote>
  </article>;
}
