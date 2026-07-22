import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import type { Checkins } from '../types/index';

interface Props {
  checkins: Checkins;
  currentMonth: Date;
  selectedDate: string | null;
  onChangeMonth: (dir: number) => void;
  onSelectDate: (date: string) => void;
  onGoToToday: () => void;
}
function fmt(d: Date) { return d.toISOString().split('T')[0]; }

const LOCATION_COLORS = [
  '#E1F5EE', '#E6F1FB', '#EEEDFE', '#FAEEDA', '#FBEAF0',
  '#E8F4FD', '#FEF3E2', '#F0FBE8', '#FDE8E8', '#F0E8FE',
];

function getLocationColor(location: string, locationOrder: Map<string, number>): string {
  const idx = locationOrder.get(location) ?? 0;
  return LOCATION_COLORS[idx % LOCATION_COLORS.length];
}

export default function Calendar({ checkins, currentMonth, selectedDate, onChangeMonth, onSelectDate, onGoToToday }: Props) {
  const m = currentMonth;
  const firstDay = new Date(m.getFullYear(), m.getMonth(), 1);
  const lastDay = new Date(m.getFullYear(), m.getMonth() + 1, 0);
  const today = fmt(new Date());

  // Build location order map (each unique location gets a color index)
  const locationOrder = new Map<string, number>();
  let colorIdx = 0;
  Object.entries(checkins).sort((a, b) => a[0].localeCompare(b[0])).forEach(([, loc]) => {
    if (!locationOrder.has(loc)) {
      locationOrder.set(loc, colorIdx++);
    }
  });

  // Get location for any date (use most recent check-in)
  function getLocForDate(dateStr: string): string | null {
    return checkins[dateStr] || Object.entries(checkins)
      .filter(([d]) => d <= dateStr)
      .sort((a, b) => b[0].localeCompare(a[0]))[0]?.[1] || null;
  }

  const dows = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const dow = firstDay.getDay();
  const days: { dateStr: string; day: number; otherMonth: boolean }[] = [];

  for (let i = 0; i < dow; i++) {
    const pd = new Date(firstDay.getTime() - (dow - i) * 86400000);
    days.push({ dateStr: fmt(pd), day: pd.getDate(), otherMonth: true });
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const ds = `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({ dateStr: ds, day: d, otherMonth: false });
  }
  const rem = (7 - ((dow + lastDay.getDate()) % 7)) % 7;
  for (let i = 1; i <= rem; i++) {
    const nd = new Date(lastDay.getTime() + i * 86400000);
    days.push({ dateStr: fmt(nd) + '-next-' + i, day: i, otherMonth: true });
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500 }}>
          <button onClick={() => onChangeMonth(-1)} style={{ width: 26, height: 26, borderRadius: 6, border: '0.5px solid #e5e5e3', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconChevronLeft size={14} />
          </button>
          {m.toLocaleString('en', { month: 'long', year: 'numeric' })}
          <button onClick={() => onChangeMonth(1)} style={{ width: 26, height: 26, borderRadius: 6, border: '0.5px solid #e5e5e3', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconChevronRight size={14} />
          </button>
          <button onClick={onGoToToday} style={{ padding: '4px 12px', borderRadius: 6, border: '0.5px solid #e5e5e3', background: '#fff', fontSize: 12, cursor: 'pointer', marginLeft: 4 }}>
            Today
          </button>
        </div>
        <div style={{ fontSize: 11, color: '#999' }}>Click a date to log expenses</div>
      </div>

      {/* Legend */}
      {locationOrder.size > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
          {Array.from(locationOrder.entries()).map(([loc, idx]) => (
            <div key={loc} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#555' }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: LOCATION_COLORS[idx % LOCATION_COLORS.length] }} />
              {loc}
            </div>
          ))}
        </div>
      )}

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 16 }}>
        {dows.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 11, color: '#999', padding: '4px 0', fontWeight: 500 }}>{d}</div>
        ))}
        {days.map(({ dateStr, day, otherMonth }, idx) => {
          const isToday = dateStr === today;
          const isSel = dateStr === selectedDate;
          const hasCI = !!checkins[dateStr];
          const loc = !otherMonth ? getLocForDate(dateStr) : null;
          const locBg = loc ? getLocationColor(loc, locationOrder) : 'transparent';
          const dayOfWeek = idx % 7;
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

          let textColor = '#555';
          if (otherMonth) textColor = '#ccc';
          else if (isSel) textColor = '#fff';
          else if (isToday) textColor = '#1D9E75';
          else if (isWeekend) textColor = '#E24B4A';

          return (
            <div
              key={dateStr}
              onClick={() => !otherMonth && onSelectDate(dateStr)}
              style={{
                aspectRatio: '1',
                borderRadius: 6,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                cursor: otherMonth ? 'default' : 'pointer',
                position: 'relative',
                color: textColor,
                background: isSel ? '#1D9E75' : otherMonth ? 'transparent' : locBg,
                fontWeight: isToday || isWeekend ? 600 : 400,
              }}
            >
              {day}
              {hasCI && !isSel && (
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#1D9E75', position: 'absolute', bottom: 3 }} />
              )}
              {isSel && (
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#fff', position: 'absolute', bottom: 3 }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}