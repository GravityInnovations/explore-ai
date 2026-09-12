# Reusable integration assets

`templates/` contains source building blocks for the target project's agent to adapt. `runtime/` contains reusable semantic handlers and capability registration that target scenes can wire to their resolved Object3D maps. These folders contain no permanent theme, installed application or bundled 3D model collection.

The semantic registry implements generic focus, highlight, isolate, extract, explode, xray, magnify, orbit, compare and flow behavior against an immutable baseline. Geometry-dependent `dissect` and `cutaway` remain explicit extension points and are never advertised by the generic registry.

`runtime/performance-audit.ts` provides development-only scene budget measurement and lifecycle accounting. It reports violations and explicit overrides without telemetry or runtime quality downgrades.

The user's generated media belongs in that project's asset library or lesson folder, not inside this installed package. See [ASSETS.md](../references/ASSETS.md) for provenance, reuse and browser-copy rules.
