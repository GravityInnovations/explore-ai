# Guided designer experience

The journey is **questions → agreed brief → design preview → QA/revisions → accepted design → topics**. The agent guides the conversation; the local CLI persists decisions and enforces transitions. Read [WORKFLOW.md](WORKFLOW.md) for command inputs and recovery.

## Client-facing conversation rules

Keep the client conversation in this order: audience, brand/logo, typography, colours, layout, visual style, motion, accessibility and constraints. Ask only the first unresolved decision in plain language, and reuse relevant evidence already supplied in the current session. When several choices arrive together, carry each concrete preference to its matching later area without marking that area resolved. When that area becomes current, acknowledge what is known and ask only for genuinely missing detail. Keep workflow state, schema names, CLI commands, Three.js, GSAP and QA labels behind the conversation.

Use the structured choices exposed by the workflow for subjective areas. Offer concrete labels and short descriptions for typography, colours, layout, visual style and accessibility; use the labelled motion scale for motion; leave constraints as a plain-language free-text question. The customer can answer with a number, letter, label or normal sentence, and the agent converts that into the concrete decision. Do not ask the customer to design responsive behaviour, choose implementation libraries or explain design jargon.

For typography, show a small set of actual rendered font samples with friendly descriptions, or accept a brand font name, link or supplied file. For colours and layout, use swatches or compact visual examples when the host supports them; otherwise ask one concise question at a time and keep the same conversational fallback. A form interaction is a focused choice, never blanket approval of the brief or preview.

Never treat an acknowledgement such as “sure”, “okay” or “yes” as the design value when it answers a request for a recommendation or options. Use the workflow's pending-choice path: create a concrete recommendation or bounded options with `propose`, stay on the same area, and use `select` only after the customer chooses an exact option. If the customer delegates, choose a concrete direction and record it with `delegate`; the delegation phrase is evidence, not the decision value. A pending recommendation, options list or clarification is not resolved and cannot enter the brief.

## Inspect, start or resume

Run the installed inspector and workflow `status --project <root> --json`. Inspect project instructions, relevant layouts/styles/assets and supplied references; exclude vendor and build output.

- A `valid` profile is structurally valid, not customer agreement. Check `workflow.topicReady` separately.
- Reuse an accepted, unchanged design. A revision returns through the appropriate reviews.
- Existing unreviewed profiles are candidates to discuss. Preserve their bytes; imported decisions remain proposals unless explicitly supplied or selected by the customer. Never adopt the previous agent's theme silently.
- With no workflow, use `start`. Resume existing sessions without repeating answered questions.
- For an explicit fresh-start request, use `restart` with the current revision and customer reason. It archives workflow state and clears the interview, preserving the app, profile and skill. Existing files are reference material, not agreed choices.

## Ask and record meaningful questions

Begin with who the experience serves and what it should accomplish. Ask one high-impact question at a time and adapt to the answer. The CLI question is a prompt, not a mandatory script. Reuse information already supplied.

Resolve these areas before submitting the brief:

| Area | Decisions |
| --- | --- |
| Audience | Learners, context and desired experience |
| Brand | References, existing identity, logo status and exclusions |
| Typography | Heading/body character, families or proposed direction, readability |
| Palette | Background, text, accent/muted roles and contrast |
| Layout | Text/visual balance, hierarchy, spacing, labels, desktop/mobile composition |
| Visuals | Shape, realism, materials, lighting, shadows, camera and highlights |
| Motion | Navigation, pacing, ambient effects and reduced-motion alternative |
| Accessibility | Keyboard/focus, readable labels, device performance and fallback |
| Constraints | Existing stack, assets/licensing, scope, budget and must/avoid requirements |

For brand/logo discovery, ask one of three plain-language paths: reuse a logo the client already supplied; ask them to provide an existing logo file or reference; or record that they explicitly want a temporary text wordmark/deferment. Reuse a recorded `brand` answer instead of asking again. Never inherit explore.ai's wordmark or logo deferral into another client, and never invent an asset or silently defer the decision.

Customers may delegate choices. Record their delegation and a concrete recommendation; do not pretend they picked the recommendation. Proposed subordinate defaults are allowed but must appear in the brief for agreement. Do not invent the audience, theme or topic from examples, or interrogate every schema field.

Earlier evidence can be carried to future areas with the workflow's candidate path. Confirm an exact candidate only when the customer confirms it; reject or supersede it when they disagree. If earlier evidence conflicts, surface the conflict and ask one focused clarification instead of choosing silently. The final decision value must contain the concrete design direction, while the earlier wording remains evidence.

Inspect references before claiming their properties. Separate observations, inferences and customer choices. A screenshot cannot establish an exact typeface or 3D lighting rig. Clarify conflicts that materially affect the design.

## Agree the brief before implementing

Use `answer` to record each direct concrete decision and provenance, then `brief` to submit the concise design specification. Present concrete choices, delegated recommendations, scope, exclusions and what the preview will demonstrate. Associate the version shown with the CLI fingerprint.

Ask for agreement to that brief and wait. Do not implement the design while this decision is pending. The customer may answer naturally; no magic phrase is required. An earlier instruction to build a demo or proceed with repository work is not agreement to an unseen brief. Record the actual explicit agreement with `agree`. Feedback goes through `revise` and back to unresolved decisions. Reuse explicit agreement already given to that exact revision rather than asking twice.

## Build the agreed design and preview

Read `schemas/design.schema.json`. Write the configured profile (default `design/profile.json`), project configuration and an empty asset index only if absent. Preserve established paths. Cover the agreed typography, spacing, colours, materials, lighting, shape, motion, camera, highlights, labels, mobile and accessibility choices. Evidence records the agreed brief and references; inferred values remain labelled.

Create or adapt a runnable design-only preview. Demonstrate typography/palette, representative forms/materials, text and labels, navigation/focus and agreed motion/fallback behaviour. Preview the shared shell once: level → subject → lesson navigation, typography, spacing and controls must be the same boundary later consumed by catalog and lesson routes. A lesson may vary its educational stage composition inside that shell only. The primary preview scene uses Three.js with GSAP ScrollTrigger; clients choose visual and interaction direction, never the rendering or animation libraries. Use text for a deferred logo. Do not choose a production lesson or fabricate runtime capabilities. SVG or procedural studies may support fallback content or visual reference, but cannot claim a completed primary lesson runtime.

The designer preview may remain responsive as a review surface. Lesson routes use the desktop lesson gate at 768 CSS pixels; do not create a separate phone composition.

Use the existing app and dependencies. For an empty project, initialise only the minimal requested preview. Respect target instructions and keep content local. Present the preview, then register its URL and relevant files through `preview`.

## QA, revise and request acceptance

The CLI runs project/design and body-contrast checks. Record observed desktop/mobile, labels, keyboard, reduced-motion and fallback behaviour, plus applicable app checks. Describe the actual check and outcome; tests and screenshots are different evidence. Neither establishes customer acceptance.

Resolve blocking findings. Use `revise` before changing submitted preview files, then resubmit and record fresh QA. External file changes make old acceptance stale. If a required check is unavailable, report the limitation and leave it pending; never mark it passed.

When QA is complete, run `review`, show the concrete preview and concise QA summary, and ask whether the customer accepts this design. Wait for their answer. Feedback returns through `revise`; explicit acceptance is recorded with `accept` against the reviewed fingerprint. Silence and validator success are not acceptance.

## Finish designer

Confirm `preflight` succeeds and report the accepted profile/preview. Future lessons inherit it. Completing designer does not choose a topic. Continue an already requested topic only after acceptance; otherwise collect level, subject and topic when the customer wants to proceed.
