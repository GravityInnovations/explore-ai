import { loadState, newState, updateState, requireThat, snapshot, briefDigest, QA_CHECKS, qaComplete, archiveState } from "./workflow-store.mjs";
import { readContract } from "./contracts.mjs";
import { resolveLocal } from "./paths.mjs";

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

const DECISION_SOURCES = ["user", "delegated", "proposed"];
const PENDING_MODES = ["recommendation", "options", "clarification"];

function decisionKeys(state) {
  return Object.keys(QUESTIONS).filter(key => !state.decisions[key]);
}

function currentKey(state) {
  return decisionKeys(state)[0];
}

function concreteDecision(value, source, evidence) {
  return { value: textValue(value, "Decision"), source, evidence: textValue(evidence, "Decision evidence") };
}

function validateOptions(mode, options) {
  requireThat(Array.isArray(options), "INVALID_INPUT", "Options must be an array");
  requireThat(options.every(option => option && typeof option === "object" && !Array.isArray(option)), "INVALID_INPUT", "Each option must be an object");
  requireThat(options.every(option => typeof option.id === "string" && option.id.trim() && typeof option.value === "string" && option.value.trim() &&
    typeof option.rationale === "string" && option.rationale.trim()), "INVALID_INPUT", "Each option needs an id, value and rationale");
  requireThat(new Set(options.map(option => option.id)).size === options.length, "INVALID_INPUT", "Option ids must be unique");
  const bounds = { recommendation: [1, 1], options: [2, 4], clarification: [0, 0] }[mode];
  requireThat(options.length >= bounds[0] && options.length <= bounds[1], "INVALID_INPUT", `Invalid option count for ${mode}`);
  return options.map(option => ({ id: option.id.trim(), value: option.value.trim(), rationale: option.rationale.trim() }));
}

export async function workflowStatus(root) {
  const state = await loadState(root);
  if (!state) return { stage: "unstarted", revision: null, topicReady: false,
    blockers: ["Start the designer interview; existing profiles are unreviewed"], next: "start" };
  const missing = decisionKeys(state);
  let current = true;
  if (state.preview) {
    try { current = (await snapshot(root, state.preview.paths)) === state.preview.fingerprint; }
    catch { current = false; }
  }
  const blockers = [];
  if (missing.length) blockers.push(`Unresolved decisions: ${missing.join(", ")}`);
  if (state.pendingChoice) blockers.push(`Pending ${state.pendingChoice.mode} interaction for ${state.pendingChoice.key}`);
  if (state.stage !== "accepted") blockers.push("The customer has not accepted this design revision");
  if (!current) blockers.push("Preview files changed or are missing; revise, rerun QA and request acceptance again");
  const next = !current ? "revise" : ({ interview: missing.length ? "answer" : "brief", "brief-review": "agree",
    design: "preview", qa: qaComplete(state) ? "review" : "qa", "design-review": "accept", accepted: "preflight" })[state.stage];
  return { session: state.session, stage: state.stage, revision: state.revision,
    topicReady: blockers.length === 0, blockers, next,
    ...(missing.length ? { question: { key: missing[0], text: QUESTIONS[missing[0]] } } : {}),
    pendingChoice: state.pendingChoice,
    brief: state.brief, preview: state.preview, qa: state.qa,
    pendingChecks: QA_CHECKS.filter(check => !state.qa.some(q => q.check === check && q.result !== "fail")),
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
async function requireCurrent(root, state) {
  let current = false;
  try { current = (await snapshot(root, state.preview.paths)) === state.preview.fingerprint; } catch { /* Missing files are stale too. */ }
  requireThat(current, "STALE_PREVIEW", "Preview changed or is missing; revise and repeat review");
}
async function contractCheck(root, state) {
  await requireCurrent(root, state);
  let errors = [];
  try {
    const config = await readContract("project", await resolveLocal(root, "explain-ai.config.json", { file: true }));
    const design = await readContract("design", await resolveLocal(root, config.paths.design, { file: true }));
    const { validateDesign } = await import("./validate.mjs");
    errors = validateDesign(design);
  } catch (e) { errors.push({ message: e.message }); }
  await requireCurrent(root, state);
  state.qa = state.qa.filter(q => q.check !== "contracts");
  state.qa.push({ check: "contracts", result: errors.length ? "fail" : "pass",
    evidence: errors.length ? JSON.stringify(errors) : "Project/design schemas and body-text contrast passed the installed validator",
    fingerprint: state.preview.fingerprint });
}

export async function runWorkflow(root, command, input = {}, expected) {
  if (["status", "start", "preflight"].includes(command)) inputFields(input, []);
  if (command === "status") return workflowStatus(root);
  if (command === "preflight") {
    const status = await workflowStatus(root);
    requireThat(status.topicReady, "DESIGN_NOT_ACCEPTED", status.blockers.join("; "));
    return status;
  }
  if (command === "start") {
    if (!(await loadState(root))) await updateState(root, null, () => newState());
    return workflowStatus(root);
  }
  const handlers = {
    async restart(state) {
      requireThat(state, "NOT_STARTED", "Use start for a project without a workflow");
      inputFields(input, ["reason"]);
      const reason = textValue(input.reason, "Customer's fresh-start request");
      const archived = await archiveState(root, state);
      const fresh = newState();
      fresh.feedback.push({ stage: "restart", note: `${reason}\nPrevious session: ${archived}`, at: new Date().toISOString() });
      return fresh;
    },
    answer(state) {
      atStage(state, ["interview"]);
      inputFields(input, ["key", "value", "source", "evidence"]);
      requireThat(Object.hasOwn(QUESTIONS, input.key), "INVALID_INPUT", "Unknown interview decision");
      requireThat(DECISION_SOURCES.includes(input.source), "INVALID_INPUT", "Identify user, delegated or proposed decisions");
      requireThat(input.key === currentKey(state), "OUT_OF_ORDER", `Answer the current interview area: ${currentKey(state)}`);
      state.decisions[input.key] = concreteDecision(input.value, input.source, input.evidence);
      state.pendingChoice = null;
      return state;
    },
    propose(state) {
      atStage(state, ["interview"]);
      inputFields(input, ["key", "mode", "options"]);
      requireThat(Object.hasOwn(QUESTIONS, input.key), "INVALID_INPUT", "Unknown interview decision");
      requireThat(PENDING_MODES.includes(input.mode), "INVALID_INPUT", "Invalid pending interaction mode");
      requireThat(input.key === currentKey(state), "OUT_OF_ORDER", `Propose for the current interview area: ${currentKey(state)}`);
      state.pendingChoice = { key: input.key, mode: input.mode, options: validateOptions(input.mode, input.options) };
      return state;
    },
    select(state) {
      atStage(state, ["interview"]);
      inputFields(input, ["option", "evidence"]);
      requireThat(state.pendingChoice, "NO_PENDING_CHOICE", "Create a recommendation or options proposal first");
      requireThat(["recommendation", "options"].includes(state.pendingChoice.mode), "INVALID_TRANSITION", "A clarification must be answered directly");
      const option = state.pendingChoice.options.find(candidate => candidate.id === input.option);
      requireThat(option, "UNKNOWN_OPTION", "Select an option from the current proposal");
      state.decisions[state.pendingChoice.key] = concreteDecision(option.value, "user",
        `${textValue(input.evidence, "Selection evidence")} Selected ${option.id}: ${option.value}`);
      state.pendingChoice = null;
      return state;
    },
    delegate(state) {
      atStage(state, ["interview"]);
      inputFields(input, ["value", "evidence"]);
      const key = currentKey(state);
      requireThat(key, "MISSING_DECISIONS", "All interview areas are already resolved");
      state.decisions[key] = concreteDecision(input.value, "delegated", input.evidence);
      state.pendingChoice = null;
      return state;
    },
    brief(state) {
      atStage(state, ["interview"]);
      inputFields(input, ["summary"]);
      const missing = decisionKeys(state);
      requireThat(!missing.length, "MISSING_DECISIONS", `Resolve these decisions first: ${missing.join(", ")}`);
      requireThat(!state.pendingChoice, "PENDING_CHOICE", "Resolve the pending recommendation/options interaction first");
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
    async preview(state) {
      atStage(state, ["design"]);
      inputFields(input, ["url", "paths"]);
      const url = new URL(textValue(input.url, "Preview URL"));
      requireThat(["http:", "https:"].includes(url.protocol) && !url.username && !url.password,
        "INVALID_INPUT", "Use an HTTP preview URL without embedded credentials");
      requireThat(Array.isArray(input.paths) && input.paths.length > 0 && input.paths.every(p => typeof p === "string"),
        "INVALID_INPUT", "List the files/folders implementing the preview");
      const config = await readContract("project", await resolveLocal(root, "explain-ai.config.json", { file: true }));
      requireThat(input.paths.some(p => !["explain-ai.config.json", config.paths.design].includes(p)),
        "EMPTY_PREVIEW", "Include preview implementation files, not just the design profile");
      const paths = [...new Set(["explain-ai.config.json", config.paths.design, ...input.paths])].sort();
      state.preview = { url: url.href, paths, fingerprint: await snapshot(root, paths) };
      state.qa = []; state.acceptance = null; state.stage = "qa";
      await contractCheck(root, state);
      return state;
    },
    async check(state) {
      atStage(state, ["qa"]); inputFields(input, []);
      await contractCheck(root, state);
      return state;
    },
    async qa(state) {
      atStage(state, ["qa"]);
      inputFields(input, ["check", "result", "evidence", "fingerprint"]);
      requireThat(QA_CHECKS.includes(input.check) && input.check !== "contracts", "INVALID_INPUT", "Contracts are checked by the validator, not manual attestation");
      requireThat(["pass", "fail", "not-applicable"].includes(input.result), "INVALID_INPUT", "Invalid QA outcome");
      requireThat(input.result !== "not-applicable" || ["fallback", "app-check"].includes(input.check), "INVALID_INPUT", "This check is required");
      requireThat(input.fingerprint === state.preview.fingerprint, "STALE_REVIEW", "QA must reference the current preview fingerprint");
      await requireCurrent(root, state);
      state.qa = state.qa.filter(q => q.check !== input.check);
      state.qa.push({ check: input.check, result: input.result,
        evidence: textValue(input.evidence, "Observed evidence or not-applicable rationale"), fingerprint: input.fingerprint });
      return state;
    },
    async review(state) {
      atStage(state, ["qa"]); inputFields(input, []);
      await contractCheck(root, state);
      requireThat(qaComplete(state), "QA_BLOCKED", "Complete the pending checks and resolve failed QA before asking for acceptance");
      state.stage = "design-review";
      return state;
    },
    async accept(state) {
      atStage(state, ["design-review"]);
      inputFields(input, ["fingerprint", "statement"]);
      await contractCheck(root, state);
      requireThat(qaComplete(state), "QA_BLOCKED", "Resolve QA findings before accepting the design");
      state.acceptance = agreement(input, state.preview.fingerprint);
      state.stage = "accepted";
      return state;
    },
    revise(state) {
      atStage(state, ["brief-review", "design", "qa", "design-review", "accepted"]);
      inputFields(input, ["target", "note"]);
      requireThat(["brief", "design"].includes(input.target), "INVALID_INPUT", "Revision target must be brief or design");
      requireThat(input.target === "brief" || state.brief?.agreement, "INVALID_TRANSITION", "Agree the brief before revising its design");
      state.feedback.push({ stage: state.stage, note: textValue(input.note, "Revision feedback"), at: new Date().toISOString() });
      state.preview = null; state.qa = []; state.acceptance = null;
      state.pendingChoice = null;
      state.stage = input.target === "brief" ? "interview" : "design";
      if (input.target === "brief") state.brief = null;
      return state;
    },
  };
  requireThat(Object.hasOwn(handlers, command), "UNKNOWN_COMMAND", `Unknown workflow command: ${command}`);
  await updateState(root, expected, state => handlers[command](state));
  return workflowStatus(root);
}
