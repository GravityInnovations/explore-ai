# Illustrative project fixture

`project/` is a minimal filesystem example with two equal-parts lessons at different levels, one shared original SVG, its browser copy and an explicitly example-only design profile. It is not a production catalog or a default project theme.

From the installed skill folder, run:

```sh
node scripts/validate.mjs --project examples/project --integrated
```

The runtime manifest states the capabilities an example renderer would need; this fixture does not include a renderer. Use it to learn the data format and asset reuse, then follow the user's project design. See [EXAMPLES.md](../references/EXAMPLES.md) for interpretation. Actual acceptance evidence is recorded in VERIFICATION.md in the development repository; it is not required by this self-contained installation.
