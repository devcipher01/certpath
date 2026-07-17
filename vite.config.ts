// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // Replit's proxy serves the app through an iframe on a different origin, and
  // the container's network doesn't support the library's IPv6 default (host "::").
  // Bind to 0.0.0.0:5000 and allow all hosts so the Replit preview can reach it.
  vite: {
    server: {
      host: "0.0.0.0",
      port: 5000,
      strictPort: true,
      allowedHosts: true,
    },
    // html-to-image accesses browser globals (document, window) — keeping it
    // out of the SSR bundle prevents the Vercel serverless function from crashing.
    // It is only ever imported client-side (inside an onClick handler) so it
    // never needs to be available on the server at runtime.
    ssr: {
      external: ["html-to-image"],
    },
  },
});
