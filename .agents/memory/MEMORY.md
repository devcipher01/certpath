# Memory Index

- [TanStack Start server-only import protection](tanstack-start-import-protection.md) — `**/server/**` glob blocks ANY client import from a path with a `server` segment, even createServerFn wrapper files.
- [SSR hydration and dev-only tagger noise](tanstack-start-hydration-mismatch.md) — never seed random/shuffle with Date.now() in render; a separate dev-only tagger mismatch is expected and harmless.
