// ISO/IEC 27001:2022 clause references with original learning prompts.
export const isoClauses: Record<string, readonly (readonly [string, string])[]> = {
  "CL-4": [
    ["4.1", "Record internal and external issues that affect the ISMS. Document whether climate change is relevant."],
    ["4.2", "Identify interested parties, their relevant requirements and which requirements the ISMS addresses. Consider climate-related requirements where applicable."],
    ["4.3", "Define the boundaries of the ISMS and document interfaces, dependencies and sites that affect the scope."],
    ["4.4", "Describe how the ISMS is established, operated, maintained and continually improved."],
  ],
  "CL-5": [
    ["5.1", "Identify evidence of management leadership in ISMS decisions, resources and evaluation."],
    ["5.2", "Review the information security policy against business purpose, commitments and communication."],
    ["5.3", "Confirm the people assigned to ISMS responsibilities have authority and report on performance."],
  ],
  "CL-6": [
    ["6.1.1", "Identify risks and opportunities for achieving the intended ISMS outcomes and determine actions."],
    ["6.1.2", "Define consistent information security risk criteria and apply them to risk identification, analysis and evaluation."],
    ["6.1.3", "Choose treatment options and necessary controls, compare with Annex A, justify the SoA and obtain owner approval and residual-risk acceptance."],
    ["6.2", "Set measurable information security objectives where practicable and state who does what, when and how results are evaluated."],
    ["6.3", "Plan material changes to the ISMS and record the decisions, dependencies and resources they require."],
  ],
  "CL-7": [
    ["7.1", "Identify the resources needed to establish and operate the ISMS."],
    ["7.2", "Define required competence, evaluate development actions and retain evidence."],
    ["7.3", "Check awareness of the security policy, contribution to the ISMS and implications of nonconformity."],
    ["7.4", "Plan internal and external communication of relevant ISMS information."],
    ["7.5.1", "Identify documented information required by the standard and by the organisation's operating context."],
    ["7.5.2", "Check identification, format, review and approval when documented information is created or updated."],
    ["7.5.3", "Protect documented information and control access, distribution, changes, retention and disposition."],
  ],
  "CL-8": [
    ["8.1", "Operate controlled processes, review changes and identify external processes, products and services that need oversight."],
    ["8.2", "Perform the documented information security risk assessment at planned intervals or when significant changes occur."],
    ["8.3", "Implement the approved risk treatment plan and retain evidence of the results."],
  ],
  "CL-9": [
    ["9.1", "Identify what to monitor, how to measure it, when to evaluate it and who will act on outcomes."],
    ["9.2.1", "Use internal audits to evaluate conformity with both the organisation's requirements and the standard."],
    ["9.2.2", "Set an audit programme, scope, criteria and reporting arrangements. Preserve objectivity and audit records."],
    ["9.3.1", "Have top management review the ISMS at planned intervals for continuing suitability, adequacy and effectiveness."],
    ["9.3.2", "Bring relevant changes, performance, audit and risk results and improvement opportunities into review."],
    ["9.3.3", "Record management-review decisions and any resulting changes or improvement actions."],
  ],
  "CL-10": [
    ["10.1", "Look for changes that improve the suitability, adequacy and effectiveness of the ISMS."],
    ["10.2", "Respond to nonconformity, examine causes, implement corrective action and review whether it worked."],
  ],
};
