import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { resolveLocal } from "./paths.mjs";
import { runWorkflow } from "./workflow-actions.mjs";
import { WorkflowError } from "./workflow-store.mjs";

export async function cli(args) {
  const [command, ...flags] = args;
  const options = {};
  for (let i = 0; i < flags.length; i++) {
    const flag = flags[i];
    if (!['--project', '--input', '--expect', '--json'].includes(flag) || flag in options)
      throw new WorkflowError("INVALID_ARGUMENT", `Unknown or duplicate flag: ${flag}`);
    if (flag === "--json") options[flag] = true;
    else {
      if (!flags[i + 1] || flags[i + 1].startsWith("--")) throw new WorkflowError("INVALID_ARGUMENT", `Missing value: ${flag}`);
      options[flag] = flags[++i];
    }
  }
  if (!command || !options['--project']) throw new WorkflowError("INVALID_ARGUMENT",
    "Usage: node workflow.mjs <command> --project <root> [--input <project-relative.json>] [--expect <revision>] [--json]");
  if (options['--expect'] !== undefined && !/^(0|[1-9]\d*)$/.test(options['--expect']))
    throw new WorkflowError("INVALID_ARGUMENT", "--expect must be a nonnegative revision integer");
  const expected = options['--expect'] === undefined ? undefined : Number(options['--expect']);
  let input = {};
  if (options['--input']) input = JSON.parse(await readFile(await resolveLocal(options['--project'], options['--input'], { file: true }), "utf8"));
  const result = await runWorkflow(options['--project'], command, input, expected);
  if (options['--json']) console.log(JSON.stringify(result, null, 2));
  else {
    console.log(`Designer: ${result.stage} | revision ${result.revision ?? "none"} | topic ${result.topicReady ? "ready" : "blocked"}`);
    for (const blocker of result.blockers) console.log(`- ${blocker}`);
    console.log(`Next: ${result.next}`);
    if (result.question) console.log(`${result.question.key}: ${result.question.text}`);
    if (result.stage === "brief-review") {
      console.log(`Brief to review: ${result.brief.summary}\nFingerprint: ${result.brief.fingerprint}`);
      for (const [key, decision] of Object.entries(result.decisions)) console.log(`${key} [${decision.source}]: ${decision.value}`);
    }
    if (result.stage === "design-review") console.log(`Preview to review: ${result.preview.url}\nFingerprint: ${result.preview.fingerprint}`);
  }
  return result;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { await cli(process.argv.slice(2)); }
  catch (error) {
    console.error(JSON.stringify({ valid: false, code: error.code ?? "WORKFLOW_ERROR", message: error.message }));
    process.exitCode = 1;
  }
}
