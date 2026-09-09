# Minimal examples

`examples/project/` contains a tiny filesystem fixture, not a finished app or default design. Its deliberately labelled `example-only` profile exists solely to illustrate the contract. Designer must derive the user's actual profile from their project/reference/preferences.

The example contains one shared original SVG, an index, its browser copy and two short lessons at `content/k1/maths/equal-parts/lesson.json` and `content/k2/maths/equal-parts/lesson.json`. They share a topic and asset without colliding. Level labels are illustrative, not claims of curriculum alignment.

After installing this skill's dependencies:

```sh
node scripts/validate.mjs --project examples/project
node scripts/validate.mjs --project examples/project --integrated
node scripts/find-assets.mjs examples/project equal parts
```

The manifest describes the capabilities an integrating example renderer must provide. There is no bundled renderer in this fixture, so a validation pass establishes contracts and local asset mapping, not rendered behavior. The target agent implements `split-rectangle` and `rectangle-part` using its project runtime, or uses its own components in a new lesson. See RUNTIME.md for the integration boundary.

Study identity, hierarchy, direct focus and asset reuse. Do not copy example style values or production content into a user's project merely to get a passing validator.
