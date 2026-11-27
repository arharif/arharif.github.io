import core from "./ai-rmf-core.json";

export const aiFunctions = [
  ["GOVERN", "Set accountability, policies, risk tolerance and oversight across the AI lifecycle."],
  ["MAP", "Understand intended purpose, deployment context, dependencies and potential impacts."],
  ["MEASURE", "Use documented tests and other evidence to evaluate AI risks and trustworthiness."],
  ["MANAGE", "Prioritise, respond to and monitor risks, including residual risk and change."],
] as const;

// X1 practice suggestions. The separate Core text below comes from the NIST Playbook's outcome fields.
const categories: Record<string, readonly [topic: string, action: string, evidence: string]> = {
  "GOVERN 1": ["Policies and processes", "Trace one model from inventory to operating permissions and the review calendar. Document the policy owner and what happens when a limit is exceeded.", "Dated inventory, approved policy, exception log and review records"],
  "GOVERN 2": ["Responsibility and training", "Ask a person in each AI role to explain their approval authority, escalation route and required competence.", "Role map, approval matrix, training and competency records"],
  "GOVERN 3": ["Diverse perspectives and oversight", "Ask who might be affected, who could challenge release, and whether human oversight is possible in the actual operating workflow.", "Participation records, role design and escalation walkthrough"],
  "GOVERN 4": ["Risk culture and communication", "Use a release-review meeting to check how risks are raised, logged, shared and acted on across teams.", "Review minutes, risk register and incident escalation records"],
  "GOVERN 5": ["External feedback", "Invite affected users and domain specialists to review the proposed use and track replies to substantive issues.", "Engagement plan, feedback log and tracked decisions"],
  "GOVERN 6": ["Third-party AI", "Identify vendor models, rights and support arrangements. Rehearse an upstream failure and check exit or fallback options.", "Supplier register, use rights, contract terms and contingency plan"],
  "MAP 1": ["Context and intended purpose", "Review one use case with its domain owner and record who may be affected, where it will run, its limits and applicable constraints.", "Use-case brief, stakeholder input and scope decisions"],
  "MAP 2": ["AI system categorisation", "Describe the specific task and output, then walk an operator through a case the model may handle poorly.", "System card, workflow and test scope"],
  "MAP 3": ["Capabilities and use boundaries", "Compare expected benefits and costs with actual operating conditions. Test that human escalation remains feasible at peak demand.", "Benefits case, application scope, operating limits and oversight evidence"],
  "MAP 4": ["Components and dependencies", "Trace a sampled model, dataset or external component back to its source, owner, permissions and continuity arrangement.", "System bill of materials, data provenance, rights and controls"],
  "MAP 5": ["Impacts on people and organisations", "Rank intended benefits and possible harms by likelihood and severity. Update the analysis as affected parties give feedback.", "Impact register, feedback and rationale for prioritisation"],
  "MEASURE 1": ["Measurement methods", "Choose methods for the harms identified in MAP. Record omitted factors, measurement limitations and independent review.", "Evaluation plan, metrics, thresholds and reviewer record"],
  "MEASURE 2": ["Trustworthiness evaluation", "Use a representative test set separate from training where appropriate. Document the environment, uncertainty, subgroup effects and limitations.", "Test-set lineage, evaluation results and limitations"],
  "MEASURE 3": ["Risk tracking", "Connect live signals and feedback to known risks and agree a review trigger for newly seen failure modes.", "Monitoring dashboards, risk trends and incident intake"],
  "MEASURE 4": ["Feedback on measurement", "Check whether tests predict operational failures and amend measures that perform poorly for users or operators.", "Operational feedback, metric validation and change history"],
  "MANAGE 1": ["Risk treatment decisions", "Prioritise harms using the documented risk tolerance. Record the decision, affected parties and residual risk before deployment.", "Decision log, approvals and residual risk register"],
  "MANAGE 2": ["Responses and alternatives", "Rehearse an unacceptable result and check the ability to fall back to manual processing, deactivate the model or change its use.", "Contingency exercise, escalation and deactivation evidence"],
  "MANAGE 3": ["Third-party risk treatment", "Track vendor changes and review pre-trained or externally supplied components against ongoing use conditions.", "Vendor monitoring, validation records and escalation contacts"],
  "MANAGE 4": ["Monitoring and response", "Simulate a production incident from detection to user notification, rollback or decommissioning, and capture a reassessment trigger.", "Monitoring plan, incident record, rollback and change approvals"],
};

const examples: Record<string, readonly [action: string, evidence: string]> = {
  "MEASURE 2.5": ["Replay a dated deployment cohort and report both error rates and the conditions under which the model may fail to generalise.", "Representative test results, reliability targets and out-of-distribution limits"],
  "MEASURE 2.9": ["Ask operators to interpret representative model explanations and independently check their fidelity and limits before using them to make decisions.", "Explanation samples, fidelity results and operator feedback"],
  "MEASURE 2.10": ["Review what data is collected during inference, who can access prompts or outputs and whether logs retain more personal data than necessary.", "Privacy threat model, data-flow inventory and safeguards verification"],
  "MEASURE 2.11": ["Compare false-positive and false-negative rates across relevant merchant cohorts. Record sample sizes and uncertainty and agree follow-up with affected stakeholders.", "Subgroup metrics, test design, limitations and documented treatment"],
  "GOVERN 6.1": ["Check a vendor model's change terms, data-use restrictions and escalation ownership before approving deployment.", "Supplier contract assessment, rights and approval record"],
  "MANAGE 4.1": ["Run a drill in which drift exceeds the threshold. Verify review ownership, human override, escalation and rollback evidence.", "Monitoring criteria, drift drill and rollback record"],
};

export const aiOutcomes = core.outcomes.map(([id, outcome]) => {
  const [family] = id.split(".");
  const [title, action, evidence] = categories[family];
  return {
    id, outcome, group: family.split(" ")[0], category: family + " · " + title,
    example: examples[id]?.[0] ?? action, evidence: examples[id]?.[1] ?? evidence,
  };
});
