# ExplainAI Skill — Astra Build Prompt

You are building a reusable, installable **ExplainAI agent skill**.

This repository is **not** the final educational website, not a lesson catalog, and not a pre-designed theme.

The purpose of this repository is to provide an installable skill that another AI coding agent can use inside a user's own Next.js project to create and manage interactive, scroll-driven, 3D educational experiences.

The user's own agent will do the actual lesson generation and project-specific implementation after installing this skill.

The repository uses the **MIT License**.

---

# First: Plan Before You Build

Do **not** start implementing immediately.

Your first task is to inspect this specification and produce a clear implementation plan.

The plan should include:

1. proposed repository structure
2. skill structure
3. commands/workflows exposed by the skill
4. files/templates/instructions the skill needs
5. JSON schema strategy
6. local asset-library strategy
7. how design initialization works
8. how topic generation works
9. sub-agent responsibilities
10. validation strategy
11. installation/discovery mechanism
12. testing strategy
13. any assumptions or architectural risks

Then present the plan to me for verification.

Do not ask dozens of questions.

Only ask questions where the answer materially changes the architecture.

Once I approve or correct the plan:

1. create a concrete task list
2. implement all tasks
3. test the skill
4. clean up the repository
5. remove temporary/scaffolding files that are no longer needed
6. verify documentation
7. leave the repository in a state where I can install it into another project and test it with Codex

Do not stop after creating scaffolding.

Complete the full first usable version.

---

# What This Repository Is

This repository contains an **installable agent skill**.

It should teach a capable coding agent how to:

- initialize a visual/design language for a target project
- analyze a supplied design reference
- ask the user appropriate design questions when needed
- create a reusable local design profile inside the target project
- explore an educational topic
- plan the educational story
- plan 3D visuals
- reuse or create local assets
- generate declarative lesson JSON
- validate the lesson package
- integrate the generated lesson into the target project

The skill should be reusable across projects.

The skill itself should contain:

- instructions
- schemas
- reusable prompts/workflows
- validation rules
- templates where useful
- sub-agent role definitions
- examples
- documentation

---

# What This Repository Is NOT

Do **not** build the following into this repository:

- a finished Next.js educational website
- a permanent theme
- a permanent design system
- a lesson catalog
- a database
- student accounts
- teacher accounts
- authentication
- subscriptions
- payments
- school administration
- assignment tracking
- analytics
- hosted SaaS logic
- a content management system
- a predefined set of production lessons
- a large bundled 3D asset library

Do **not** bake a specific visual style into the skill.

The visual style belongs to the project where the skill is installed.

The skill should help the user's agent create that style.

---

# Target Project Assumptions

The skill is primarily intended for projects using:

- Next.js
- App Router
- TypeScript
- Three.js
- GSAP
- ScrollTrigger

However, do not tightly couple every instruction to one specific folder layout unless required.

The skill should inspect the target project first and adapt where reasonable.

If the target project does not yet contain the required runtime pieces, the skill may help create them.

But the skill repository itself should not contain a finished application.

---

# Core Principle

The generated lesson should be **declarative**.

The lesson should describe:

- what exists
- what is being explained
- what the visual intention is
- what should be highlighted
- how the story progresses
- what assets are required

The generated lesson should **not** contain large amounts of bespoke Three.js or GSAP code when a reusable action can represent the same intent.

Prefer:

```json
{
  "action": "extract",
  "target": "cell.nucleus"
}
```

over generating custom animation code for every lesson.

The target project's runtime should interpret the JSON.

---

# Skill Capabilities

The installable skill should expose two major workflows.

They may be implemented as separate skill commands, sub-skills, or clearly separated workflows inside one installable package.

Use whichever structure best matches the skill system.

The conceptual workflows are:

1. **designer**
2. **explore-a-topic**

---

# Workflow 1 — Designer

The `designer` workflow initializes the visual language for the target project.

There is **no design stored in this repository**.

The design is created inside the user's target project.

The designer workflow should first inspect the target project.

If a design profile already exists, it should detect it and avoid unnecessarily recreating it.

If no design exists, it should help establish one.

---

# Designer — User Interview

When starting from scratch, the agent should ask a small number of high-value questions.

Do not dump a long questionnaire.

Ask progressively.

Use previous answers to decide what matters next.

Questions may cover:

- audience
- age range
- visual character
- light vs dark
- playful vs serious
- illustrated vs realistic
- cartoon vs vector-like vs technical
- typography feel
- 3D depth
- material style
- lighting feel
- amount of motion
- camera expressiveness
- highlighting behavior
- use of cutaways
- use of exploded views
- transparency
- annotation style
- mobile priorities
- accessibility/readability

Do not mechanically ask every possible question.

Only ask what materially helps define the design.

---

# Designer — Existing Reference

The user may instead provide:

- screenshot
- image
- webpage
- existing design
- existing project
- CSS
- design tokens
- reference files

The agent should analyze the reference and infer as much as possible.

Ask only about important ambiguities.

The goal is to create a reusable **project-specific design profile**, not a one-off lesson design.

---

# Designer Output

The designer workflow should create or update a reusable design configuration in the target project.

The exact structure should be planned carefully.

A possible example:

```text
design/
  profile.json
```

or:

```text
design/
  profile.json
  typography.json
  materials.json
  motion.json
  lighting.json
  camera.json
```

Keep v1 simple.

The design profile may define:

- typography
- spacing
- color system
- background behavior
- 3D material language
- lighting
- shadows
- shape language
- object edge treatment
- realism/illustration balance
- animation character
- camera behavior
- transition feel
- highlighting behavior
- label style
- scroll pacing
- mobile behavior
- default easing
- default durations
- ambient motion

The skill should not hardcode a theme such as "kids science light".

That is chosen or inferred when the skill is used.

---

# Workflow 2 — Explore a Topic

The `explore-a-topic` workflow generates a lesson package.

The required inputs should be:

- level
- subject
- topic

Optional inputs:

- topic key
- reference images
- reference documents
- existing assets
- curriculum notes
- desired depth
- concepts that must be included

If enough information has already been supplied, do not ask redundant questions.

---

# Catalog Model

The expected content hierarchy in the target project is:

```text
Level
  → Subject
    → Topic
```

Examples:

```text
k1/science/plants
k2/science/plants
k5/science/plant-cell
```

The same topic may appear at different levels.

Do not assume topic slugs are globally unique.

Recommended lesson identity:

```json
{
  "lessonId": "k5-science-plant-cell",
  "level": "k5",
  "subject": "science",
  "topicKey": "plant-cell",
  "slug": "plant-cell",
  "title": "Plant Cell"
}
```

The skill should generate into a predictable location such as:

```text
content/<level>/<subject>/<topic>/lesson.json
```

with topic-specific assets in:

```text
content/<level>/<subject>/<topic>/assets/
```

when required.

---

# Explore-a-Topic Must Inherit Design

The topic workflow should **not redesign the project**.

It must use the existing project design profile.

If no design profile exists, it should route the user through the designer workflow first.

Once design exists, the topic workflow should focus on:

- educational structure
- storytelling
- visual teaching strategy
- semantic scene composition
- assets
- declarative choreography
- lesson content
- validation

Do not spend tokens repeatedly deciding global styling.

---

# Educational Planning

The topic workflow should decide:

- what the learner needs to understand
- what is appropriate for the selected level
- what order best teaches the topic
- what needs to be visualized
- what should be introduced first
- what should be shown in context
- what should be isolated
- what should be dissected
- what should be magnified
- what should be compared
- what should be animated
- what should remain visible
- how the explanation should conclude

Do not require the user to manually design the story.

The agent should plan the educational narrative.

---

# Visual Teaching Strategy

The agent should choose the best visual technique for each concept.

Do not use the same interaction repeatedly.

Available conceptual techniques may include:

- focus
- highlight
- isolate
- extract
- explode
- dissect
- assemble
- orbit
- inspect
- reveal
- hide
- fade
- xray
- cutaway
- magnify
- follow
- compare
- flow
- transform
- zoom
- rotate
- move inside
- show scale
- animate process

The skill should teach the agent to choose among them intelligently.

The visual technique should serve understanding, not animation for its own sake.

---

# Most Important Visual Rule

Whenever the educational text refers to a specific:

- object
- part
- region
- component
- structure

that exact target must become visually unmistakable.

The agent may choose to:

- move the camera
- isolate the target
- highlight it
- enlarge it
- extract it
- rotate it
- dim surrounding objects
- make surrounding objects transparent
- dissect the parent structure
- use a cutaway
- change composition

The student should immediately know:

> "This is the thing being explained right now."

---

# Declarative Lesson Schema

The skill should include and maintain a reusable lesson schema.

The schema should support concepts such as:

- schemaVersion
- lessonId
- level
- subject
- topicKey
- slug
- title
- metadata
- content/story
- semantic scene objects
- object hierarchy
- asset references
- story/scroll steps
- declarative visual actions
- camera intent
- highlighting intent
- optional precise overrides
- accessibility metadata
- optional narration hooks

The lesson format should be:

- human-readable
- compact
- agent-friendly
- versioned
- strongly validated

Create:

- TypeScript types where appropriate
- formal JSON Schema
- validation instructions

---

# Semantic Scene Addressing

The skill should teach agents to create semantic target paths.

Prefer:

```text
cell.nucleus
cell.wall
plant.leaf
heart.leftVentricle
motor.rotor
```

over mesh IDs.

Visual components should expose semantic anatomy where possible.

The agent should never depend on opaque generated mesh names if a semantic name can be created.

---

# Reusable Action Vocabulary

The skill should define a stable initial vocabulary.

For example:

```text
focus
highlight
isolate
extract
explode
dissect
assemble
orbit
inspect
reveal
hide
fade
xray
cutaway
magnify
follow
compare
flow
transform
```

The vocabulary should be extensible.

Avoid turning JSON into a general programming language.

JSON should express intent.

The runtime should implement behavior.

---

# Camera Intent

Prefer semantic camera instructions such as:

```text
wide
medium
close
macro
inside
orbit
top
side
best
```

over raw coordinates.

Allow exact overrides when necessary.

The target project's runtime should be encouraged to calculate useful camera placement from:

- object bounds
- current camera
- viewport
- semantic target
- surrounding geometry

---

# Local Asset Library

The skill should use a **local asset library** in the target project.

Do not use a database in v1.

Do not assume cloud storage.

Possible structure:

```text
asset-library/
  biological/
  mechanical/
  environments/
  icons/
  textures/
  models/
  images/
  audio/
```

The skill should define a lightweight metadata format.

Example:

```json
{
  "id": "plant-cell-reference-01",
  "type": "image",
  "path": "...",
  "tags": ["biology", "cell", "plant"],
  "description": "...",
  "license": "..."
}
```

Agents should search and reuse existing local assets before creating duplicates.

Lesson-specific assets can remain inside the lesson folder.

---

# Asset Planning

The topic workflow should have a distinct asset-planning stage.

It should decide whether a visual should be:

1. built from an existing reusable component
2. created procedurally
3. reused from the local asset library
4. created as a new local asset
5. taken from a reference supplied by the user

Do not assume every topic needs external 3D models.

Do not assume every visual can be represented with generic primitives.

Use judgment.

---

# Sub-Agent Fleet

The skill should orchestrate or clearly define specialized sub-agent roles.

Do not create one huge prompt that tries to do everything.

Suggested roles:

## Education Planner
Responsible for:

- topic understanding
- level-appropriate scope
- educational sequence
- concept selection

## Visual Director
Responsible for:

- visual storytelling
- spatial explanation
- selection of dissection/extraction/zoom/etc.

## Asset Planner
Responsible for:

- asset reuse
- procedural vs local asset decisions
- asset requirements

## Scene Composer
Responsible for:

- semantic scene graph
- object hierarchy
- target naming

## Choreography Agent
Responsible for:

- story steps
- declarative actions
- camera intent
- highlighting

## Content Writer
Responsible for:

- level-appropriate copy
- concise educational explanations
- readable wording

## Validator / Critic
Responsible for checking:

- schema validity
- all targets exist
- asset references resolve
- visual focus matches text
- educational sequence makes sense
- design inheritance is respected
- accessibility/readability
- no unnecessary complexity

## Optimizer
Responsible for:

- removing redundant fields
- preferring defaults
- reusing components
- reusing assets
- reducing token-heavy output

The implementation does not need to literally launch eight processes.

The key requirement is separation of responsibilities and a workflow that can evolve into a true fleet.

---

# Token Efficiency

Token efficiency is a major goal.

The skill should teach agents to prefer:

- inherited project design
- reusable components
- semantic actions
- presets
- defaults
- local asset reuse
- compact lesson JSON

over regenerating:

- CSS
- Three.js boilerplate
- GSAP timelines
- repeated visual styling
- repeated materials
- repeated asset definitions

A later lesson should generally require less authoring work than an early lesson.

---

# Runtime Integration Guidance

The skill may include instructions/templates for integrating with a reusable Next.js runtime in the target project.

However:

**Do not build a permanent theme or complete production application inside this skill repository.**

The target agent may create or extend the runtime when installing/using the skill in a project.

The skill should explain:

- expected runtime responsibilities
- how JSON maps to Three.js
- how semantic actions map to GSAP
- how design inheritance works
- how lesson assets resolve
- how catalog paths work

---

# Target Project Catalog

When used in a target Next.js project, the recommended route hierarchy is:

```text
/                                   -> levels
/[level]                            -> subjects
/[level]/[subject]                  -> topics
/[level]/[subject]/[topic]          -> lesson
```

The skill may help the user's agent create this structure if the target project needs it.

But this repository itself should not contain a finished production catalog site.

---

# Filesystem First

For v1, all generated content remains on the filesystem.

Do not implement:

- Postgres
- Supabase
- Firebase
- S3
- CMS APIs
- remote lesson storage

Design the formats so storage can be replaced later.

For now, keep things simple and local.

---

# Installability

This must be a genuinely installable/reusable skill.

Determine the correct skill package structure for the target agent ecosystem.

The final repository should make it obvious how another user can:

1. clone or install the skill
2. register/install it with their agent
3. invoke `designer`
4. invoke `explore-a-topic`
5. generate project-local design files
6. generate project-local lesson JSON/assets
7. validate output
8. test the generated lesson in their own project

Do not fake installation instructions.

Inspect the actual supported skill mechanism available in the environment and implement accordingly.

If multiple installation approaches are supported, document the recommended one first.

---

# Skill Boundaries

The skill must not silently:

- upload content
- create cloud resources
- connect to a database
- publish lessons
- create accounts
- add payment systems
- choose a commercial business model
- modify licensing
- introduce external paid APIs
- add API keys
- create a proprietary hosted backend

If one of these is required later, it should be an explicit future extension.

---

# MIT License

This repository uses the **MIT License**.

Keep the existing MIT licensing.

Do not replace it with a non-commercial license.

Do not add contradictory licensing restrictions.

---

# Documentation

Create clear documentation, including something equivalent to:

```text
README.md
SKILL.md
DESIGNER.md
EXPLORE-A-TOPIC.md
LESSON-SPEC.md
ASSETS.md
AGENTS.md
INSTALL.md
EXAMPLES.md
```

Adapt filenames to the actual skill ecosystem if there is a more canonical structure.

Documentation must cover:

- what the skill does
- what it does not do
- installation
- designer workflow
- topic workflow
- project-local design files
- project-local asset library
- lesson JSON
- semantic target naming
- action vocabulary
- agent roles
- validation
- target-project integration
- extension points

---

# Testing

Test the skill itself.

At minimum verify:

1. installation/discovery works
2. designer can initialize a new project design
3. designer can infer from an existing reference
4. explore-a-topic refuses to redesign when design already exists
5. explore-a-topic produces valid JSON
6. repeated topics across levels do not collide
7. semantic action targets can be validated
8. asset references resolve
9. schema validation works
10. instructions are usable by another coding agent

Create a small fixture/test project if useful.

Do not leave unnecessary generated test artifacts in the final repository.

---

# Cleanup Requirement

Before declaring the work complete:

- remove temporary files
- remove unused scaffolding
- remove duplicate documentation
- remove abandoned experiments
- remove test output that should not ship
- verify paths and examples
- verify installation instructions
- verify MIT license remains intact
- verify the repository does not contain a hardcoded production theme
- verify the repository does not contain generated production lessons beyond minimal examples/fixtures needed to explain the skill

Leave the repository clean and intentional.

---

# Final Workflow You Must Follow

## Phase 1 — Plan

Inspect the specification.

Propose the architecture and implementation plan.

Identify contradictions or risky assumptions.

Ask only critical questions.

Wait for my verification.

## Phase 2 — Task Breakdown

After approval, create a complete task list.

The task list should be concrete enough that progress can be checked.

## Phase 3 — Implement

Complete all tasks.

Do not stop at scaffolding.

## Phase 4 — Test

Run installation/discovery tests and workflow tests.

Use a temporary/example target project if necessary.

## Phase 5 — Cleanup

Clean the repository thoroughly.

## Phase 6 — Final Review

Report:

- what was built
- skill structure
- install command/process
- designer usage
- explore-a-topic usage
- tests run
- known limitations
- future extension points

The repository should then be ready for me to install into another project and test using Codex.

---

# Success Criterion

A capable user should be able to install this skill into their own agent environment and do something like:

```text
designer
```

The agent helps them establish a project-specific design language.

Then:

```text
explore-a-topic
Level: k5
Subject: science
Topic: plant cell
Reference: plant-cell.png
```

The user's own agent then plans the educational experience, reuses the local design language and asset library, and generates a validated lesson package such as:

```text
content/k5/science/plant-cell/lesson.json
```

plus any required local assets.

The skill repository itself remains reusable, neutral, clean, MIT-licensed, and free of any hardcoded production design.
