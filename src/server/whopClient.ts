// Server-only Whop API helper. Never import this from client code — see the
// note in schema.ts about the importProtection guard on this folder.

function getProxyHeaders(): { hostname: string; headers: Record<string, string> } {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const token = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? "depl " + process.env.WEB_REPL_RENEWAL
      : null;

  if (!hostname || !token) {
    throw new Error(
      "Missing Replit connector environment variables. Ensure the Whop integration is connected via the Integrations tab.",
    );
  }

  return {
    hostname,
    headers: {
      "Content-Type": "application/json",
      "X-Replit-Token": token,
      "Connector-Name": "whop",
    },
  };
}

export async function callWhop<T = unknown>(method: string, path: string, body?: object): Promise<T> {
  const { hostname, headers } = getProxyHeaders();
  const resp = await fetch(`https://${hostname}/api/v2/proxy/${path}`, {
    method,
    headers,
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
  if (!id) throw new Error("WHOP_COMPANY_ID is not set.");
  return id;
}
