/** Fixed conversion used to show the same catalog price in Nigeria. */
export const PAYSTACK_NGN_PER_USD = 1500;

export function usdToNgn(usd: number): number {
  return Math.round(usd * PAYSTACK_NGN_PER_USD);
}