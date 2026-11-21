import type { Scenario } from "../data/types.ts";
import { stages, newTask, newId, type Task, type Studio } from "./model.ts";
import { architectureFor, stageGuidance } from "./standards.ts";

/** Adds a traceable educational project without changing assessment ratings or evidence. */
export function generateImplementation(s: Studio, scenario: Scenario): Studio {
  const source = `objective:${s.framework}:implementation-lifecycle`;
  if (s.tasks.some((task) => task.sourceIds.includes(source))) return s;
  let previous = "";
  const tasks: Task[] = [];
  for (const [i, stage] of stages.entries()) {
    const guide = stageGuidance[i];
    const task = {
      ...newTask(source, `${stage}: ${guide.title}`, stage),
      owner: stage === "ASSURE" ? "Independent assessor" : scenario.owner,
      accountable: scenario.owner,
      consulted: "Security, privacy and operations leads as applicable",
      informed: "Programme sponsor",
      resourceId: stage === "ASSURE" ? "assessor" : "control-owner",
      effort: [8, 16, 16, 8, 32, 16, 8][i],
      duration: [1, 2, 2, 1, 4, 2, 1][i],
      dependencies: previous ? [previous] : [],
    };
    tasks.push(task);
    previous = task.id;
    if (stage === "DESIGN" || stage === "EMBED") {
      const gate = {
        ...newTask(
          source,
          stage === "DESIGN"
            ? "Target design approval gate"
            : "Management acceptance / monitoring gate",
          stage,
        ),
        owner: scenario.owner,
        accountable: scenario.owner,
        effort: 0,
        duration: 0,
        milestone: true,
        dependencies: [previous],
      };
      tasks.push(gate);
      previous = gate.id;
    }
  }
  const architecture = architectureFor(s.framework);
  const design = tasks.find(
    (task) => task.title === "Target design approval gate",
  )!;
  const assurance = tasks.find((task) => task.stage === "ASSURE")!;
  const validationIds: string[] = [];
  for (const node of architecture?.nodes ?? []) {
    const implementation = {
      ...newTask(
        `objective:${s.framework}:architecture:${node.id}`,
        `Implement: ${node.title}`,
        "IMPLEMENT",
      ),
      owner: node.owner,
      accountable: scenario.owner,
      resourceId: "control-owner",
      effort: 16,
      duration: 2,
      dependencies: [design.id],
    };
    const validation = {
      ...newTask(
        `objective:${s.framework}:validation:${node.id}`,
        `Validate: ${node.title}`,
        "ASSURE",
      ),
      owner: "Independent assessor",
      accountable: scenario.owner,
      resourceId: "assessor",
      effort: 8,
      duration: 1,
      dependencies: [implementation.id],
    };
    tasks.push(implementation, validation);
    validationIds.push(validation.id);
  }
  const linked = new Map<string, string>();
  for (const finding of s.findings.filter(
    (finding) =>
      finding.framework === s.framework &&
      finding.applicability === "Applicable" &&
      (finding.current === null || finding.current < finding.target) &&
      !finding.taskId,
  )) {
    const task = {
      ...newTask(
        `finding:${finding.id}`,
        `Remediate ${finding.controlId}: ${finding.title}`.slice(0, 240),
        "IMPLEMENT",
      ),
      owner: finding.owner || scenario.owner,
      accountable: scenario.owner,
      effort: 8,
      duration: 1,
      dependencies: [design.id],
    };
    tasks.push(task);
    validationIds.push(task.id);
    linked.set(finding.id, task.id);
  }
  // Bound fan-in so complete Core assessments fit the saved-project contract.
  if (validationIds.length > 80) {
    const gates: string[] = [];
    for (let offset = 0; offset < validationIds.length; offset += 80) {
      const gate = {
        ...newTask(
          source,
          `Assurance readiness gate ${gates.length + 1}`,
          "ASSURE",
        ),
        owner: "Independent assessor",
        accountable: scenario.owner,
        effort: 0,
        duration: 0,
        milestone: true,
        dependencies: validationIds.slice(offset, offset + 80),
      };
      tasks.push(gate);
      gates.push(gate.id);
    }
    validationIds.splice(0, validationIds.length, ...gates);
  }
  if (s.tasks.length + tasks.length > 500)
    throw new Error(
      "This roadmap would exceed 500 tasks. Complete or consolidate existing actions before generating another project.",
    );
  assurance.dependencies = [
    ...new Set([...assurance.dependencies, ...validationIds]),
  ];
  return {
    ...s,
    tasks: [...s.tasks, ...tasks],
    findings: s.findings.map((finding) =>
      linked.has(finding.id)
        ? { ...finding, taskId: linked.get(finding.id)! }
        : finding,
    ),
    raid: [
      ...s.raid,
      {
        id: newId("raid"),
        type: "Assumption",
        description:
          "Initial lifecycle effort, rates and sequential dependencies are fictional planning estimates, not supplier quotations.",
        owner: scenario.owner,
        action:
          "Validate scope, staffing and delivery assumptions before baselining.",
      },
    ],
  };
}
