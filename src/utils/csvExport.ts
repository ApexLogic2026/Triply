import type { Expenses, Checkins } from '../types/index';

function getDatesInRange(start: string, end: string): string[] {
  const dates: string[] = [];
  let d = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  while (d <= e) { dates.push(d.toISOString().split('T')[0]); d = new Date(d.getTime() + 86400000); }
  return dates;
}

export function exportCSV(expenses: Expenses, checkins: Checkins, rangeStart: string, rangeEnd: string) {
  const rows: string[][] = [
    ['Date', 'Location', 'Category', 'Description', 'Original Amount', 'Currency', 'HKD Equivalent']
  ];

  // Build trip periods from checkins
  const sorted = Object.entries(checkins).sort((a, b) => a[0].localeCompare(b[0]));
  const tripPeriods: { location: string; start: string; end: string }[] = [];
  sorted.forEach(([date, location], i) => {
    const prev = sorted[i - 1];
    if (!prev || prev[1] !== location) {
      const next = sorted.slice(i + 1).find(s => s[1] !== location);
      const endDate = next
        ? new Date(new Date(next[0] + 'T00:00:00').getTime() - 86400000).toISOString().split('T')[0]
        : rangeEnd;
      tripPeriods.push({ location, start: date, end: endDate });
    }
  });

  // For each trip period, output header + expenses
  tripPeriods.forEach(period => {
    const start = period.start > rangeStart ? period.start : rangeStart;
    const isLast = period === tripPeriods[tripPeriods.length - 1];
    const end = isLast ? rangeEnd : (period.end < rangeEnd ? period.end : rangeEnd);
    const dates = getDatesInRange(start, end);

    // Trip header row
   rows.push([`--- ${period.location} (${start} to ${end}, ${dates.length} days) ---`, '', '', '', '', '', '']);

    // Expenses in this period
    const periodExps = dates.flatMap(d => (expenses[d] || []).map(e => ({ ...e, date: d })));
    if (periodExps.length === 0) {
      rows.push(['', '', '', '(no expenses)', '', '', '']);
    } else {
      periodExps.forEach(e => {
        rows.push([e.date, period.location, e.cat, e.desc, e.amount.toString(), e.currency, e.hkdAmount.toString()]);
      });
    }
    rows.push(['', '', '', '', '', '', '']); // blank row between trips
  });

  const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'triply-expenses.csv';
  a.click();
  URL.revokeObjectURL(url);
}