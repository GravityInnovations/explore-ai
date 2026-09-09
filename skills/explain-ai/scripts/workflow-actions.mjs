import { loadState, newState, updateState, requireThat, WorkflowError, snapshot, briefDigest } from "./workflow-store.mjs";

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

export function inputFields(input, names) {
  requireThat(input && typeof input === "object" && !Array.isArray(input), "INVALID_INPUT", "Input must be a JSON object");
  requireThat(Object.keys(input).every(k => names.includes(k)), "INVALID_INPUT", "Unknown input field");
  for (const name of names) requireThat(input[name] !== undefined, "INVALID_INPUT", `Missing input field: ${name}`);
}
export function textValue(value, name) {
  requireThat(typeof value === "string" && value.trim().length > 0, "INVALID_INPUT", `${name} must contain text`);
  return value.trim();
}
function atStage(state, allowed) {
  requireThat(state, "NOT_STARTED", "Run start before changing designer progress");
  requireThat(allowed.includes(state.stage), "INVALID_TRANSITION", `Cannot perform this action during ${state.stage}`);
}
function agreement(input, fingerprint) {
  requireThat(input.fingerprint === fingerprint, "STALE_REVIEW", "Review the current revision before agreeing");
  return { fingerprint, statement: textValue(input.statement, "User's explicit agreement"), at: new Date().toISOString() };
}

export async function runWorkflow(root, command, input = {}, expected) {
  if (command === "status") return workflowStatus(root);
  if (command === "start") {
    if (!(await loadState(root))) await updateState(root, null, () => newState());
    return workflowStatus(root);
  }
  const handlers = {
    answer(state) {
      atStage(state, ["interview"]);
      inputFields(input, ["key", "value", "source", "evidence"]);
      requireThat(Object.hasOwn(QUESTIONS, input.key), "INVALID_INPUT", "Unknown interview decision");
      requireThat(["user", "delegated", "proposed"].includes(input.source), "INVALID_INPUT", "Identify user, delegated or proposed decisions");
      state.decisions[input.key] = { value: textValue(input.value, "Answer"), source: input.source,
        evidence: textValue(input.evidence, "Decision evidence") };
      return state;
    },
    brief(state) {
      atStage(state, ["interview"]);
      inputFields(input, ["summary"]);
      const missing = Object.keys(QUESTIONS).filter(k => !state.decisions[k]);
      requireThat(!missing.length, "MISSING_DECISIONS", `Resolve these decisions first: ${missing.join(", ")}`);
      state.brief = { summary: textValue(input.summary, "Brief"), fingerprint: "", agreement: null };
      state.brief.fingerprint = briefDigest(state);
      state.stage = "brief-review";
      return state;
    },
    agree(state) {
      atStage(state, ["brief-review"]);
      inputFields(input, ["fingerprint", "statement"]);
      state.brief.agreement = agreement(input, state.brief.fingerprint);
      state.stage = "design";
      return state;
    },
  };
  requireThat(Object.hasOwn(handlers, command), "UNKNOWN_COMMAND", `Unknown workflow command: ${command}`);
  await updateState(root, expected, state => handlers[command](state));
  return workflowStatus(root);
}
