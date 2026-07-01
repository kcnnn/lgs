export const CREDIT_PACKS = {
  single: { priceEnv: "STRIPE_PRICE_SINGLE", credits: 1, label: "1 report", price: 35 },
  five: { priceEnv: "STRIPE_PRICE_FIVE", credits: 5, label: "5 reports", price: 150 },
  twenty: { priceEnv: "STRIPE_PRICE_TWENTY", credits: 20, label: "20 reports", price: 500 },
} as const;

export type CreditPack = keyof typeof CREDIT_PACKS;

export function isCreditPack(value: string): value is CreditPack {
  return value in CREDIT_PACKS;
}
