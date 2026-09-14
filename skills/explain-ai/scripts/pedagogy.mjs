const BANDS = [
  {
    name: "Grades 1–2",
    min: 1,
    max: 2,
    maxTargets: 2,
    maxNewConcepts: 1,
  },
  {
    name: "Grades 3–5",
    min: 3,
    max: 5,
    maxTargets: 4,
    maxNewConcepts: 1,
  },
  {
    name: "Grades 6–8",
    min: 6,
    max: 8,
    maxTargets: 6,
    maxNewConcepts: 2,
  },
];

export function pedagogyBand(level) {
  const match = String(level).match(/(?:grade|g|k)[-_]?(\d+)/i);
  const grade = match ? Number(match[1]) : undefined;
  return BANDS.find((band) => grade >= band.min && grade <= band.max) ?? BANDS[1];
}

export function critiquePedagogy(lesson) {
  const warnings = [];
  const band = pedagogyBand(lesson.level);
  const introduced = new Set();
  lesson.steps.forEach((step, index) => {
    const path = `/steps/${index}`;
    const targets = new Set(step.explains ?? []);
    if (targets.size > band.maxTargets)
      warnings.push({ code: "COGNITIVE_LOAD_TARGETS", path, message: `${band.name} guidance allows at most ${band.maxTargets} simultaneous labelled targets` });
    const terms = step.introduces ?? [];
    if (terms.length > band.maxNewConcepts)
      warnings.push({ code: "COGNITIVE_LOAD_CONCEPTS", path, message: `${band.name} guidance recommends at most ${band.maxNewConcepts} new concepts per step` });
    terms.forEach((term) => introduced.add(term));
    for (const term of step.uses ?? []) {
      if (!introduced.has(term))
        warnings.push({ code: "VOCABULARY_ORDER", path, message: `Term ${term} is used before it is introduced` });
    }
  });
  const last = lesson.steps.at(-1);
  if (last && !/(recap|review|remember|connect|summary|summar)/i.test(`${last.title} ${last.text}`))
    warnings.push({ code: "MISSING_RECAP", path: `/steps/${lesson.steps.length - 1}`, message: "End with a short recap or reconnection to the objective" });
  const taught = lesson.steps.map((step) => step.text).join(" ").toLowerCase();
  lesson.metadata.objectives.forEach((objective, index) => {
    const terms = objective.toLowerCase().split(/\W+/).filter((term) => term.length > 3);
    if (terms.length && !terms.some((term) => taught.includes(term)))
      warnings.push({ code: "OBJECTIVE_COVERAGE", path: `/metadata/objectives/${index}`, message: "Objective has no obvious matching term in the taught steps" });
  });
  return warnings;
}

export { BANDS };
