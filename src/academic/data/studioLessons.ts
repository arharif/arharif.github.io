import type { LearningModule } from "./types.ts";
export const studioLessons: LearningModule[] = [
  {
    id: "csf-profiles",
    discipline: "grc",
    title: "NIST CSF 2.0",
    prerequisite:
      "Recognise a business service, risk owner and evidence reference.",
    objectives: [
      "Define a scoped Current and Target Profile",
      "Separate CSF Tiers from the X1 educational rubric",
      "Trace an outcome gap into implementation and validation",
    ],
    analogy:
      "A building inspection has a boundary, observed condition and a desired condition. A renovation plan is not evidence that the building has already improved.",
    sections: [
      {
        title: "Define the outcome and boundary",
        text: "The CSF 2.0 Core organises cybersecurity outcomes into GOVERN, IDENTIFY, PROTECT, DETECT, RESPOND and RECOVER. A profile selects and contextualises outcomes for an organisation or service. Define mission, critical services, interfaces, interested parties, assessment period and risk tolerance before rating anything. The Core is not a universal certification checklist; selecting all outcomes does not establish conformity.",
      },
      {
        title: "Work a banking and industrial example",
        text: "For a fictional payment service, GOVERN includes who may approve supplier access and accept the associated risk. Examine a responsibility matrix and sampled decisions, rather than accepting a policy title alone. In a plant, vendor access decisions also involve operations and safety authority. A service owner supplies context, a control owner implements safeguards and an assessor records the population, period, sample and exceptions.",
      },
      {
        title: "Distinguish a profile, Tier and educational rating",
        text: "A Current Profile describes what is currently achieved and known. A Target Profile describes desired outcomes and priorities under business constraints. SP 1302 provides context for governance and management Tiers selected through organisational judgement; Tiers are not arithmetic averages of control scores. X1 uses a separate, explicitly labelled 0–4 educational model. Unassessed outcomes remain unknown, and justified exclusions are reported separately.",
      },
      {
        title: "Close the loop with defensible evidence",
        text: "Suppose one scoped outcome has an X1 current level of 1 and target of 3. Record the rationale, evidence status and owner; the two-level gap is an educational prioritisation signal. Create an access-review task, assign responsible/accountable roles, set dependencies and request test evidence. Completing that task does not change the original rating. An assessor must review the new evidence and deliberately reassess the profile before a report can claim a changed position.",
      },
    ],
    activity:
      "Use the guided assessment to frame one fictional service. Record two outcomes: one assessed and one excluded with justification. Create an action for a gap, assign RACI and a date, and explain what test evidence would justify reassessment. Manually calculate the mean over eligible assessed items.",
    deliverable:
      "A scoped Current/Target Profile, explicit Tier rationale and linked improvement action with validation criteria.",
    misconception:
      "A 75% review-completion figure means 75% NIST compliance. It measures review activity only and cannot establish conformity.",
    revision: [
      "Scope before scoring",
      "Keep Tiers and educational ratings separate",
      "Report unknowns and exclusions",
      "Reassess only after evidence review",
    ],
    assessment: {
      prompt:
        "An implementation task is marked complete. What should happen to the CSF profile rating?",
      choices: [
        "Automatically increase it",
        "Keep the original assessment until evidence is reviewed and reassessment is recorded",
        "Convert its level into a CSF Tier",
      ],
      correct: 1,
      explanation:
        "Delivery, effectiveness assessment and profile reassessment are distinct activities. The report must retain the underlying evidence and decision.",
    },
    lab: "/assess",
    resource: "csf",
  },
  {
    id: "nist-control-implementation",
    discipline: "grc",
    title: "NIST SP 800-53 and Control Assessment",
    prerequisite:
      "Understand confidentiality, integrity, availability, scope and risk treatment.",
    objectives: [
      "Choose and tailor a starting baseline from explicit impacts",
      "Separate control statement, implementation and assessment procedure",
      "Document responsibility and evidence gaps",
    ],
    analogy:
      "A construction specification, the installed equipment and the inspection checklist serve different purposes. A specification is not proof that the installation works.",
    sections: [
      {
        title: "Categorise information and system impacts",
        text: "SP 800-53 is a catalogue of security and privacy controls and enhancements. SP 800-53B supplies starting security baselines and a separate privacy baseline. Determine information types, system boundaries and confidentiality, integrity and availability impacts before reviewing a starting security baseline. This exercise uses an explicit high-water mark for those entered impacts. Banking or manufacturing sector membership alone does not select Moderate or High.",
      },
      {
        title: "Tailor and assign responsibility",
        text: "A fictional bank may inherit identity controls from a provider while retaining responsibility for approving payment-service entitlements. An industrial gateway may rely on plant engineering for safe change windows. Record common, inherited and system-specific responsibilities, provider boundaries, organisation-defined parameters and rationale for exclusions or additions. A selected control or enhancement remains a distinct record; inheritance does not erase the need for assurance evidence.",
      },
      {
        title: "Design an assessment using SP 800-53A",
        text: "A control statement describes the intended safeguard; implementation guidance helps interpret context. SP 800-53A supplies determination statements and assessment objects/methods. For account management, examine approvals and removal records, interview the owner and test a defined sample of terminated accounts. Document population, period, sample selection, expected results and exceptions. The illustrative procedure must be tailored rather than treated as the full official assessment.",
      },
      {
        title: "Report gaps and prepare a POA&M",
        text: "If two sampled supplier accounts remained enabled after their approved end dates, record the finding, evidence references, business implication and accountable owner. Create a remediation task with a target date and a follow-up validation gate. A screenshot showing configuration is evidence of a point in time, not necessarily continuous operation. Keep implementation status separate from assessment findings and risk-owner decisions, and disclose sampling and independence limitations.",
      },
    ],
    activity:
      "Enter system information types and CIA impacts in the NIST implementation simulator. Compare two starting baselines, review privacy applicability separately and tailor one control. Record a concrete examine/interview/test procedure and create a control-linked implementation task.",
    deliverable:
      "A source-linked baseline/tailoring decision, responsibility record, scoped assessment procedure and POA&M action.",
    misconception:
      "A bank must always use the High baseline. Baseline selection depends on categorisation and applicable authorisation context, not sector alone.",
    revision: [
      "Categorise explicitly",
      "Review privacy separately",
      "Tailor with rationale",
      "Assess the implementation, not just the policy title",
    ],
    assessment: {
      prompt:
        "What is the best starting point for selecting a security baseline?",
      choices: [
        "The organisation’s industry name",
        "The number of controls that look achievable",
        "Defined system/information scope, impact categorisation and applicable authorisation context",
      ],
      correct: 2,
      explanation:
        "Impact and scope drive the starting baseline review; tailoring and privacy applicability require further documented decisions.",
    },
    lab: "/standards/800-53",
    resource: "controls",
  },
  {
    id: "implementation-pmo",
    discipline: "grc",
    title: "Cybersecurity Programme and PMO Leadership",
    prerequisite:
      "Understand a gap, accountable owner, dependency and testable deliverable.",
    objectives: [
      "Build traceable tasks and RACI",
      "Explain working calendars, resource levelling and critical-path assumptions",
      "Separate delivery progress from assurance",
    ],
    analogy:
      "A map can show the shortest delivery route while the actual plan is delayed because two deliveries need the same van. Dependency logic and resource availability answer different scheduling questions.",
    sections: [
      {
        title: "Frame the programme around outcomes",
        text: "The X1 seven-stage model is an educational operating structure: FRAME, DIAGNOSE, DESIGN, PLAN, IMPLEMENT, ASSURE and EMBED. It is not a prescribed NIST or ISO lifecycle. Begin with mission and scope, then trace every work item to an outcome, control, gap, privacy finding or business objective. Define responsible delivery, one accountable decision role, consulted specialists and informed stakeholders before treating a task as ready for execution.",
      },
      {
        title: "Make dates and resources explicit",
        text: "A fictional payment-access review may need approved role definitions before account testing. A plant change may depend on a safe maintenance window and engineering availability. Enter earliest starts, deadlines, working weekdays, holidays, effort and resource capacity. X1 schedules finish-to-start dependencies on the next working day and allows each resource one task at a time. An apparent parallel plan becomes sequential when the same resource is required.",
      },
      {
        title: "Interpret the critical path and budget",
        text: "The dependency-only critical path is computed from task durations and zero slack before calendar/resource levelling. It is not automatically the final resource-constrained delivery path. Examine the actual scheduled dates and resource delays too. Estimate cost as work hours multiplied by explicit resource rates; include uncertainty and exclusions. Fictional rates are learning assumptions, not measured costs, supplier quotations or commitments. A baseline is a retained comparison, not a live forecast.",
      },
      {
        title: "Validate completion and embed improvement",
        text: "Implementation progress describes the entered delivery position. Operating-effectiveness validation requires a procedure, evidence and reviewer. A task can be implemented while a validation test fails; the original assessment and residual risk remain unchanged until deliberately reassessed. A RAID log records risks, assumptions, issues and dependencies. Governance closes the loop through approved decisions, acceptance expiry, monitoring and evidence-backed management review.",
      },
    ],
    activity:
      "Generate a seven-stage project, then add two tasks sharing one resource. Add a predecessor and a non-working holiday. Reproduce the schedule by hand, capture a baseline and increase one effort estimate. Explain the resource delay and cost difference. Record a validation failure without changing the underlying maturity or risk rating.",
    deliverable:
      "A traceable WBS, RACI, working-calendar Gantt, RAID log, baseline comparison and validation plan.",
    misconception:
      "A task at 100% proves the control is effective. Delivery completion and tested effectiveness are separate claims.",
    revision: [
      "Trace each task",
      "Validate dependencies and calendar",
      "Declare resource/rate assumptions",
      "Reassess after validation",
    ],
    assessment: {
      prompt:
        "Two independent tasks require the same exclusive resource. What must the schedule account for?",
      choices: [
        "They always finish in parallel",
        "They must be levelled within the declared resource capacity",
        "The second task can be hidden from the report",
      ],
      correct: 1,
      explanation:
        "Dependencies alone do not establish available capacity. The schedule must enforce the declared resource rule and disclose the resulting delay.",
    },
    lab: "/implement",
    resource: "risk-method",
  },
  {
    id: "privacy-risk-governance",
    discipline: "grc",
    title: "Privacy Risk and Governance",
    prerequisite:
      "Recognise personal data, a processing purpose and affected individuals.",
    objectives: [
      "Map a processing lifecycle",
      "Identify individual harms distinct from security breaches",
      "Document minimisation, legal review and residual assumptions",
    ],
    analogy:
      "Keeping a guest list in a locked cabinet does not justify using it for an unrelated purpose. Strong security can coexist with disproportionate or unfair processing.",
    sections: [
      {
        title: "Start with people and processing",
        text: "A privacy assessment examines potential problems for individuals arising from data processing. Define data subjects, categories, sources, purposes, use, sharing, retention, deletion and processing roles. The NIST Privacy Framework supports managing these risks; it does not automatically determine legal conformity. This academy provides a published 1.0 track and a separately labelled 1.1 initial-public-draft learning track. A draft finding is never silently relabelled as a final-edition assessment.",
      },
      {
        title: "Analyse necessity and proportionality",
        text: "In a fictional payment service, fraud review may require transaction attributes while unnecessary precise location adds intrusion and exposure. In a factory, quality telemetry may support operations but repurposing worker identifiers for undisclosed disciplinary decisions can cause harm. Explain why each field is necessary, compare less intrusive alternatives, identify affected people and define meaningful challenge/human review. These questions remain relevant even when access controls are effective.",
      },
      {
        title: "Work a problematic-action and harm scenario",
        text: "Consider unexpected sharing of a worker’s performance profile with a third party. The problematic data action is the unanticipated disclosure or reuse; possible harms include unfair exclusion, economic loss and loss of autonomy. Enter likelihood of that event and severity of the individual harm under a declared ordinal model. Compare minimisation, purpose restrictions, retention and deletion safeguards, but record residual ratings separately with evidence and uncertainty. Selecting a safeguard does not prove its benefit.",
      },
      {
        title: "Use a DPIA-style record responsibly",
        text: "An educational DPIA-style record includes purposes, scope, necessity/proportionality, individual harms, safeguards, residual risk and accountable review. Determine jurisdictional applicability, lawful authority, transfer rules and any formal impact-assessment obligations with a qualified reviewer. A learner marking legal scope reviewed is not legal advice or regulator approval. Create linked actions, validate deletion/access/review mechanisms and reassess remaining harm before recommending acceptance or escalation.",
      },
    ],
    activity:
      "Load a fictional processing example. Record a purpose, subjects, data categories and controller role. Describe one problematic data action and an individual harm. Compare retention/minimisation options, enter residual assumptions and create a privacy-linked implementation action. Explain which legal and evidence questions remain unresolved.",
    deliverable:
      "A processing inventory, individual-harm risk record, educational DPIA-style report and linked remediation/validation plan.",
    misconception:
      "There is no privacy risk when the data are encrypted. Harm can arise from excessive, unfair or unexpected authorised processing.",
    revision: [
      "Map the full lifecycle",
      "Describe harm to individuals",
      "Review legal scope explicitly",
      "Do not confuse draft and final editions",
    ],
    assessment: {
      prompt:
        "Which situation can create privacy harm without a security breach?",
      choices: [
        "Authorised data are reused for a disproportionate, undisclosed purpose",
        "Only an attacker stealing a password",
        "Only a failed backup",
      ],
      correct: 0,
      explanation:
        "Problematic authorised processing can affect rights, autonomy, economic interests or fairness without unauthorised access. Security and privacy analyses are related but distinct.",
    },
    lab: "/simulate/privacy",
    resource: "privacy-framework",
  },
];
