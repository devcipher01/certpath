/**
 * Client-side certificate download using html-to-image.
 * Captures the #cert-print-target element as a high-resolution PNG
 * and triggers a browser download — no server round-trip needed.
 *
 * IMPORTANT: the CDN import uses /* @vite-ignore * / so Vite never analyzes,
 * bundles, or includes html-to-image in the SSR/server output. Without this,
 * the package (which references browser globals) lands in the Vercel serverless
 * bundle and crashes the function on startup.
 */
export async function downloadCertAsImage(filename = "certificate.png"): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore — CDN ESM import; types aren't resolved but the shape is stable
  const { toPng } = await import(/* @vite-ignore */ "https://esm.sh/html-to-image@1.11.13");

  const node = document.getElementById("cert-print-target");
  if (!node) throw new Error("Certificate element not found on page.");

  const dataUrl = await (toPng as (n: HTMLElement, o?: object) => Promise<string>)(node, {
    pixelRatio: 3,           // 3× resolution → sharp when printed or shared
    cacheBust: true,         // avoid stale cached images
    backgroundColor: "#fffaf2", // match the cert background; no transparent edges
  });

  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
