import type { Expenses, Checkins, BusinessFlags } from '../types/index';

function getDatesInRange(start: string, end: string): string[] {
  const dates: string[] = [];
  let d = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  while (d <= e) { dates.push(d.toISOString().split('T')[0]); d = new Date(d.getTime() + 86400000); }
  return dates;
}

function isBusiness(date: string, businessFlags: BusinessFlags): boolean {
  const recentDate = Object.keys(businessFlags)
    .filter(d => d <= date)
    .sort((a, b) => b.localeCompare(a))[0];
  return recentDate ? !!businessFlags[recentDate] : false;
}

export function exportCSV(expenses: Expenses, checkins: Checkins, rangeStart: string, rangeEnd: string, businessFlags: BusinessFlags = {}) {
  const rows: string[][] = [];

  // Build trip periods from checkins
  const sorted = Object.entries(checkins).sort((a, b) => a[0].localeCompare(b[0]));
  const tripPeriods: { location: string; start: string; end: string; isBusiness: boolean }[] = [];
  sorted.forEach(([date, location], i) => {
    const prev = sorted[i - 1];
    if (!prev || prev[1] !== location) {
      const next = sorted.slice(i + 1).find(s => s[1] !== location);
      const endDate = next
        ? new Date(new Date(next[0] + 'T00:00:00').getTime() - 86400000).toISOString().split('T')[0]
        : rangeEnd;
      tripPeriods.push({ location, start: date, end: endDate, isBusiness: isBusiness(date, businessFlags) });
    }
  });

  const businessPeriods = tripPeriods.filter(p => p.isBusiness);
  const personalPeriods = tripPeriods.filter(p => !p.isBusiness);

  function renderSection(periods: typeof tripPeriods, label: string) {
    if (periods.length === 0) return;

    rows.push([label, '', '', '', '', '']);
    rows.push(['Date', 'Location', 'Category', 'Description', 'Amount', 'Currency']);

    let sectionTotal: Record<string, number> = {};
    let totalDays = 0;

    periods.forEach(period => {
      const start = period.start > rangeStart ? period.start : rangeStart;
      const isLast = period === periods[periods.length - 1];
      const end = isLast ? rangeEnd : (period.end < rangeEnd ? period.end : rangeEnd);
      const dates = getDatesInRange(start, end);
      totalDays += dates.length;

      rows.push([`-- ${period.location} (${start} to ${end}, ${dates.length} days) --`, '', '', '', '', '']);

      const periodExps = dates.flatMap(d => (expenses[d] || []).map(e => ({ ...e, date: d })));
      if (periodExps.length === 0) {
        rows.push(['', '', '', '(no expenses)', '', '']);
      } else {
        periodExps.forEach(e => {
          rows.push([e.date, period.location, e.cat, e.desc, e.amount.toString(), e.currency]);
          if (!sectionTotal[e.currency]) sectionTotal[e.currency] = 0;
          sectionTotal[e.currency] += e.amount;
        });
      }
      rows.push(['', '', '', '', '', '']);
    });

    // Section summary
    rows.push([`Total Days`, totalDays.toString(), '', '', '', '']);
    Object.entries(sectionTotal).forEach(([currency, total]) => {
      rows.push([`Total (${currency})`, total.toLocaleString(), '', '', '', '']);
    });
    rows.push(['', '', '', '', '', '']);
  }

  // Business section
  renderSection(businessPeriods, '=== BUSINESS TRIPS ===');

  // Personal section
  renderSection(personalPeriods, '=== PERSONAL TRIPS ===');

  const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'triply-report.csv';
  a.click();
  URL.revokeObjectURL(url);
}
