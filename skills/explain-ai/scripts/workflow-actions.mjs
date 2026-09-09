import { loadState, newState, updateState, requireThat, WorkflowError, snapshot } from "./workflow-store.mjs";

export const QUESTIONS = {
  audience: "Who is this experience for, and what should it help them do?",
  brand: "Do you have brand rules or references to follow, and anything to avoid?",
  typography: "What should the typography feel like, or would you like a recommendation?",
  palette: "What colour direction should we explore, or should I propose options?",
  layout: "How should the explanation and visual share the page on desktop and mobile?",
  visuals: "Should the visuals feel schematic, illustrated or realistic, and what material character fits?",
  motion: "How should people move through the experience, and how much motion feels right?",
  accessibility: "What accessibility, device or low-performance needs should the design address?",
  constraints: "What other requirements or constraints should the design respect?",
};

export async function workflowStatus(root) {
  const state = await loadState(root);
  if (!state) return { stage: "unstarted", revision: null, topicReady: false,
    blockers: ["Start the designer interview; existing profiles are unreviewed"], next: "start" };
  const missing = Object.keys(QUESTIONS).filter(k => !state.decisions[k]);
  let current = true;
  if (state.preview) {
    try { current = (await snapshot(root, state.preview.paths)) === state.preview.fingerprint; }
    catch { current = false; }
  }
  const blockers = [];
  if (missing.length) blockers.push(`Unresolved decisions: ${missing.join(", ")}`);
  if (state.stage !== "accepted") blockers.push("The customer has not accepted this design revision");
  if (!current) blockers.push("Preview files changed or are missing; revise, rerun QA and request acceptance again");
  const next = !current ? "revise" : ({ interview: missing.length ? "answer" : "brief", "brief-review": "agree",
    design: "preview", qa: "qa", "design-review": "accept", accepted: "preflight" })[state.stage];
  return { session: state.session, stage: state.stage, revision: state.revision,
    topicReady: blockers.length === 0, blockers, next,
    ...(missing.length ? { question: { key: missing[0], text: QUESTIONS[missing[0]] } } : {}),
    brief: state.brief, preview: state.preview, qa: state.qa,
    decisions: state.decisions, acceptance: state.acceptance };
}

export async function runWorkflow(root, command, input = {}, expected) {
  if (command === "status") return workflowStatus(root);
  if (command === "start") {
    if (!(await loadState(root))) await updateState(root, null, () => newState());
    return workflowStatus(root);
  }
  throw new WorkflowError("UNKNOWN_COMMAND", `Unknown workflow command: ${command}`);
}
