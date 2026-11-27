import core from "./ai-rmf-core.json";
import { outcomeGuidance } from "./aiRmfGuidance";

export const aiFunctions = [
  ["GOVERN", "Set accountability, policies, risk tolerance and oversight across the AI lifecycle."],
  ["MAP", "Understand intended purpose, deployment context, dependencies and potential impacts."],
  ["MEASURE", "Use documented tests and other evidence to evaluate AI risks and trustworthiness."],
  ["MANAGE", "Prioritise, respond to and monitor risks, including residual risk and change."],
] as const;

// X1 navigation captions for the numbered NIST Core categories.
const categories: Record<string, string> = {
  "GOVERN 1": "Policies and processes",
  "GOVERN 2": "Responsibility and training",
  "GOVERN 3": "Diverse perspectives and oversight",
  "GOVERN 4": "Risk culture and communication",
  "GOVERN 5": "External feedback",
  "GOVERN 6": "Third-party AI",
  "MAP 1": "Context and intended purpose",
  "MAP 2": "AI system categorisation",
  "MAP 3": "Capabilities and use boundaries",
  "MAP 4": "Components and dependencies",
  "MAP 5": "Impacts on people and organisations",
  "MEASURE 1": "Measurement methods",
  "MEASURE 2": "Trustworthiness evaluation",
  "MEASURE 3": "Risk tracking",
  "MEASURE 4": "Feedback on measurement",
  "MANAGE 1": "Risk treatment decisions",
  "MANAGE 2": "Responses and alternatives",
  "MANAGE 3": "Third-party risk treatment",
  "MANAGE 4": "Monitoring and response",
};

export const aiOutcomes = core.outcomes.map(([id, outcome]) => {
  const [family] = id.split(".");
  const [example, evidence] = outcomeGuidance[id];
  return {
    id, outcome, group: family.split(" ")[0], category: family + " · " + categories[family],
    example, evidence,
  };
});
