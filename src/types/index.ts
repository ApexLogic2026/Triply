export interface Trip {
  id: string;
  name: string;
  color: string;
  start: string;
  end: string;
}

export interface Expense {
  id: string;
  cat: string;
  desc: string;
  amount: number;
  currency: string;
  hkdAmount: number;
  receipt: string | null;
  receiptName: string | null;
}

export interface BoardingPass {
  id: string;
  from: string;
  to: string;
  flight: string;
  airline: string;
  date: string;
  image: string | null;
}

export type Expenses = Record<string, Expense[]>;
export type Checkins = Record<string, string>;
export type BusinessFlags = Record<string, boolean>;
