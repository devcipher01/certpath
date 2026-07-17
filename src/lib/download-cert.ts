/**
 * Client-side certificate download using html-to-image.
 * Captures the #cert-print-target element as a high-resolution PNG
 * and triggers a browser download — no server round-trip needed.
 */
export async function downloadCertAsImage(filename = "certificate.png"): Promise<void> {
  const { toPng } = await import("html-to-image");

  const node = document.getElementById("cert-print-target");
  if (!node) throw new Error("Certificate element not found on page.");

  const dataUrl = await toPng(node, {
    pixelRatio: 3,          // 3× resolution → sharp when printed or shared
    cacheBust: true,        // avoid stale cached images
    backgroundColor: "#fffaf2", // match the cert background so no transparent edges
  });

  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
