---
name: TanStack Start server-only import protection
description: Why createServerFn wrapper files must not live under a directory literally named "server" when the project's Vite config enables TanStack Start's importProtection.
---

Some TanStack Start + Vite setups (e.g. `@lovable.dev/vite-tanstack-config`) enable
`tanstackStart({ importProtection: { client: { files: ["**/server/**"] } } })`. This glob matches
any resolved module path containing a path segment literally named `server`, at any depth — not
just files that import DB credentials.

**Why:** `createServerFn` handlers are meant to be imported from client-executed route files (TSR
splits the handler body into a server-only chunk and leaves a thin RPC stub in the client bundle).
But import-protection runs on the raw import graph before that split, so it blocks the import
outright if the *file being imported* (not just what it transitively imports) resolves under a
`server` directory — the error is confusing because it looks like a real leak when it's just a
path-naming collision with the protection glob.

**How to apply:** Keep true server-only code (DB client, schema, credentials — things that must
never be bundled for the client) inside `src/server/`. Put `createServerFn` wrapper/export files
that routes import directly in a differently-named directory, e.g. `src/actions/`, so their own
file path doesn't match the glob. Verify by checking `vite.config.ts`'s `tanstackStart` option (or
the defaults in `node_modules/@lovable.dev/vite-tanstack-config/dist/index.js`) for the actual glob
in use, since it can be overridden per-project.
