// Server-only Paystack API helper.
// Never import this from client code — it contains the secret-key integration.

const PAYSTACK_API = "https://api.paystack.co";

export async function callPaystack<T = unknown>(
  method: string,
  path: string,
  body?: object,
): Promise<T> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      "PAYSTACK_SECRET_KEY is not set. Add it to your environment variables / Vercel project settings.",
    );
  }

  const response = await fetch(`${PAYSTACK_API}/${path.replace(/^\/+/, "")}`, {
    method,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(15_000),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const data = (await response.json()) as T & { message?: string };
  if (!response.ok) {
    throw new Error(`Paystack API error ${response.status}: ${JSON.stringify(data)}`);
  }
  return data;
}