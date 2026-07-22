export const CURRENCIES = ['HKD', 'JPY', 'USD', 'EUR', 'GBP', 'KRW', 'SGD', 'AUD', 'TWD'];

export const RATES: Record<string, number> = {
  HKD: 1,
  JPY: 0.051,
  USD: 7.78,
  EUR: 8.45,
  GBP: 9.85,
  KRW: 0.0057,
  SGD: 5.75,
  AUD: 4.95,
  TWD: 0.24,
};

export function toHKD(amount: number, currency: string): number {
  const rate = RATES[currency] ?? 1;
  return Math.round(amount * rate);
}

export function fmtHKD(amount: number): string {
  return 'HK$' + amount.toLocaleString();
}