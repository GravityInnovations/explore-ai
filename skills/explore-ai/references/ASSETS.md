# Local assets and component reuse

Before authoring a visual, search the target project's component registry and local index:

```sh
node <installed-skill>/scripts/find-assets.mjs <project-root> plant cell
```

The helper searches ID, description and tags, requires all supplied terms and verifies matching files. Broaden the query when needed and inspect anatomy/quality, not only names. No query lists all indexed assets. It never downloads, uploads or edits assets.

## Decide the representation

For each teaching target, choose an existing reusable component, procedural construction, indexed local asset, new local asset, or supplied reference. Record the reason and missing capabilities. Primitive geometry works for schematic scale/flow/comparison, but an anatomical cutaway may require structured geometry. Do not reduce every topic to generic spheres or obtain an external model when a clear procedural visual suffices.

Prefer geometry exposing meaningful named parts. Map imported mesh names once in a reviewed component to semantic scene paths. Record source-to-semantic mapping beside that component; lesson actions must never reference opaque mesh IDs. `semanticTargets` in asset metadata is advisory anatomy documentation; lesson targets must still exist in `objects`.

## Metadata and paths

Read `schemas/asset-index.schema.json`. A local library index is:

```json
{
  "schemaVersion": "2.0.0",
  "assets": [{
    "id": "plant-cell-diagram",
    "type": "image",
    "path": "biological/plant-cell.svg",
    "tags": ["biology", "plant", "cell"],
    "description": "Labelled schematic for the static lesson alternative",
    "license": "MIT",
    "source": "Original project illustration",
    "provenanceStatus": "original",
    "redistribution": "allowed",
    "semanticTargets": ["cell.wall", "cell.nucleus"]
  }]
}
```

Paths in the library are relative to `config.paths.assetLibrary`. Lesson `assets` use the same metadata shape, but paths must start with `assets/` and resolve relative to the lesson folder. IDs must be unique across the shared index and the lesson. Reuse shared IDs directly; do not copy the metadata into every lesson or action.

Types are `model`, `image`, `texture`, `audio` and `component`. Retain source and provenance information. `provenanceStatus` is `original`, `permissive`, `customer-supplied`, `reference-only`, `restricted` or `unknown`; `redistribution` is `allowed`, `attribution-required` or `denied`. Permissive or attribution-required assets need a license and attribution. Customer-supplied assets need an authorization evidence note before redistribution. Unknown, reference-only, restricted and denied assets are evidence only and are blocked from integrated/public output. Do not infer a license from a filename or URL, and do not invent attribution.

New reusable material goes in a descriptive local category; topic-only material stays with its lesson. Preserve existing files and IDs. Check for an existing semantically equivalent asset before allocating another ID. Keep model sizes, texture resolution and decoder requirements within the project's mobile budget. Do not add network-only dependencies.

## Browser integration

Filesystem content is not automatically browser-accessible. Copy library assets to `<publicAssets>/library/<asset.path>` and lesson assets to `<publicAssets>/lessons/<lessonId>/<asset.path>`; for the default `public/explore-ai` root, URLs begin `/explore-ai/`. Match Next.js `basePath` when configured. Keep originals and public copies in sync; `validate.mjs --project <root> --integrated` compares bytes. Source components use reviewed static imports and must not be copied into public assets.

Procedural visuals need no external files; nevertheless record the component name and its actual action capabilities in the runtime manifest. New assets are complete only when semantic targeting, licensing, local resolution and fallback readability have been checked.
