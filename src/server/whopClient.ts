// Server-only Whop API helper. Uses direct Whop API with WHOP_API_KEY.
// Never import this from client code — see the note in schema.ts about the
// importProtection guard on this folder.

export async function callWhop<T = unknown>(method: string, path: string, body?: object): Promise<T> {
  const apiKey = process.env.WHOP_API_KEY;
  if (!apiKey) {
    throw new Error(
      "WHOP_API_KEY is not set. Add it to your environment variables / Vercel project settings.",
    );
  }

  const resp = await fetch(`https://api.whop.com/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(15_000),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const data = await resp.json();
  if (!resp.ok) {
    throw new Error(`Whop API error ${resp.status}: ${JSON.stringify(data)}`);
  }
  return data as T;
}

export function getCompanyId(): string {
  const id = process.env.WHOP_COMPANY_ID;
  if (!id) {
    throw new Error(
      "WHOP_COMPANY_ID is not set. Add it to your environment variables / Vercel project settings.",
    );
  }
  return id;
}
