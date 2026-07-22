interface Trip { id: string; name: string; color: string; start: string; end: string; }
interface Expense { id: string; cat: string; desc: string; amount: number; currency: string; hkdAmount: number; receipt: string | null; receiptName: string | null; }
interface BoardingPass { id: string; from: string; to: string; flight: string; airline: string; date: string; image: string | null; }
type Expenses = Record<string, Expense[]>;
type Checkins = Record<string, string>;

export const sampleTrips: Trip[] = [
  { id: 't1', name: 'Japan Trip', color: '#1D9E75', start: '2025-03-15', end: '2025-03-25' },
  { id: 't2', name: 'Europe Escape', color: '#534AB7', start: '2025-06-01', end: '2025-06-14' },
];

export const sampleCheckins: Checkins = {
  '2025-03-15': 'Hong Kong',
  '2025-03-16': 'Tokyo',
  '2025-03-17': 'Tokyo',
  '2025-03-18': 'Tokyo',
  '2025-03-19': 'Osaka',
  '2025-03-20': 'Osaka',
  '2025-03-21': 'Osaka',
  '2025-03-22': 'Tokyo',
  '2025-03-23': 'Tokyo',
  '2025-03-24': 'Hong Kong',
  '2025-06-01': 'Hong Kong',
  '2025-06-02': 'London',
  '2025-06-03': 'London',
  '2025-06-04': 'London',
  '2025-06-05': 'Paris',
  '2025-06-06': 'Paris',
  '2025-06-07': 'Paris',
  '2025-06-08': 'London',
  '2025-06-09': 'London',
};

export const sampleExpenses: Expenses = {
  '2025-03-16': [
    { id: 'e1', cat: 'food', desc: 'Sushi dinner', amount: 3200, currency: 'JPY', hkdAmount: 163, receipt: null, receiptName: null },
    { id: 'e2', cat: 'transport', desc: 'Airport bus', amount: 500, currency: 'JPY', hkdAmount: 26, receipt: null, receiptName: null },
  ],
  '2025-03-17': [
    { id: 'e3', cat: 'hotel', desc: 'Hotel Gracery', amount: 12000, currency: 'JPY', hkdAmount: 612, receipt: null, receiptName: null },
    { id: 'e4', cat: 'food', desc: 'Ramen lunch', amount: 950, currency: 'JPY', hkdAmount: 48, receipt: null, receiptName: null },
  ],
  '2025-03-19': [
    { id: 'e5', cat: 'transport', desc: 'Shinkansen', amount: 6890, currency: 'JPY', hkdAmount: 351, receipt: null, receiptName: null },
    { id: 'e6', cat: 'hotel', desc: 'Dormy Inn', amount: 9800, currency: 'JPY', hkdAmount: 500, receipt: null, receiptName: null },
  ],
  '2025-03-20': [
    { id: 'e7', cat: 'food', desc: 'Takoyaki', amount: 500, currency: 'JPY', hkdAmount: 26, receipt: null, receiptName: null },
    { id: 'e8', cat: 'shopping', desc: 'Namba shopping', amount: 3200, currency: 'JPY', hkdAmount: 163, receipt: null, receiptName: null },
  ],
  '2025-06-02': [
    { id: 'e9', cat: 'hotel', desc: 'The Goring', amount: 450, currency: 'GBP', hkdAmount: 4433, receipt: null, receiptName: null },
    { id: 'e10', cat: 'food', desc: 'Fish and chips', amount: 18, currency: 'GBP', hkdAmount: 177, receipt: null, receiptName: null },
  ],
  '2025-06-05': [
    { id: 'e11', cat: 'transport', desc: 'Eurostar', amount: 180, currency: 'GBP', hkdAmount: 1773, receipt: null, receiptName: null },
    { id: 'e12', cat: 'hotel', desc: 'Hotel Lutetia', amount: 520, currency: 'EUR', hkdAmount: 4394, receipt: null, receiptName: null },
  ],
  '2025-06-06': [
    { id: 'e13', cat: 'food', desc: 'Cafe de Flore', amount: 28, currency: 'EUR', hkdAmount: 237, receipt: null, receiptName: null },
    { id: 'e14', cat: 'activity', desc: 'Louvre', amount: 17, currency: 'EUR', hkdAmount: 144, receipt: null, receiptName: null },
    { id: 'e15', cat: 'shopping', desc: 'Le Marais', amount: 95, currency: 'EUR', hkdAmount: 803, receipt: null, receiptName: null },
  ],
};

export const sampleBoardingPasses: BoardingPass[] = [
  { id: 'b1', from: 'HKG', to: 'NRT', flight: 'CX509', airline: 'Cathay Pacific', date: '2025-03-16', image: null },
  { id: 'b2', from: 'OSA', to: 'NRT', flight: 'JL205', airline: 'Japan Airlines', date: '2025-03-22', image: null },
  { id: 'b3', from: 'NRT', to: 'HKG', flight: 'CX542', airline: 'Cathay Pacific', date: '2025-03-24', image: null },
  { id: 'b4', from: 'HKG', to: 'LHR', flight: 'CX256', airline: 'Cathay Pacific', date: '2025-06-02', image: null },
];