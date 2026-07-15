---
name: SSR hydration and dev-only tagger noise
description: How to distinguish a real hydration bug from harmless dev-only noise in this TanStack Start setup, and how to avoid causing real ones.
---

Two different hydration warnings show up in this stack; treat them differently.

**Real bug (fix it):** any component that computes its initial render output using
`Date.now()`, `Math.random()`, or other non-deterministic input inside the render body
(or a `useMemo` that runs during render) will produce different output on the server
vs. the client, causing a genuine hydration mismatch. React then discards and
re-renders the whole subtree, which can make clicks/navigation feel like they
"skip" or do nothing right after a page loads.

**How to apply:** compute the initial state deterministically (e.g. an unshuffled
slice) for both SSR and first client render, then do the randomized/non-deterministic
step inside a `useEffect` so it only runs after mount — after hydration has already
succeeded. Never call `Date.now()`/`Math.random()` directly inside a `useMemo`/render
path whose output is part of the SSR-ed markup.

**Harmless noise (ignore it):** the Lovable dev-only `componentTagger` plugin injects
a `data-tsd-source="/path/to/file.tsx:LINE:COL"` attribute on elements, recording the
exact source line. If the file is edited while the dev server is warm (HMR), the
server-rendered line number and the freshly recompiled client line number can briefly
differ, producing a `data-tsd-source` mismatch warning on `<html>`. This plugin is
dev-only (stripped from production builds per the vite config), so it never affects
production, and it stabilizes after a clean restart with no further edits.
