# Generated TypeScript contracts

These declarations are generated from `../schemas/`. Do not edit them by hand.

In the development repository, run `npm run types:generate` after schema changes and `npm run types:check` to detect drift. Installed consumers can copy the declarations into their own contract module or adapt imports to a shared local package.

`lesson.d.ts` exports `Lesson`, `Step`, `Action` and action-specific types. Other files export project configuration, design, asset-index, runtime and designer-workflow shapes. TypeScript describes structure; bounds, identity, transitions, fingerprints and filesystem rules still require validation. The declarations contain no executable renderer or default theme.
