import { useState } from 'react';
import { IconReceipt, IconDownload, IconPlane } from '@tabler/icons-react';
import type { Trip, Expenses, Checkins, BoardingPass, BusinessFlags } from '../types/index';
import { exportCSV } from '../utils/csvExport';


interface Props {
  trips: Trip[];
  expenses: Expenses;
  checkins: Checkins;
  boardingPasses: BoardingPass[];
  businessFlags: BusinessFlags;
  selectedTrip: string;
  onSelectTrip: (id: string) => void;
}

function fmt(d: Date) { return d.toISOString().split('T')[0]; }

function getDatesInRange(start: string, end: string): string[] {
  const dates: string[] = [];
  let d = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  while (d <= e) { dates.push(fmt(d)); d = new Date(d.getTime() + 86400000); }
  return dates;
}

export default function Report({ trips, expenses, checkins, boardingPasses, businessFlags }: Props) {
  const today = fmt(new Date());
  const [rangeStart, setRangeStart] = useState(today);
  const [rangeEnd, setRangeEnd] = useState(today);
  const tripsInRange = trips.filter(t => t.start <= rangeEnd && t.end >= rangeStart);
  const allDates = rangeStart && rangeEnd && rangeStart <= rangeEnd ? getDatesInRange(rangeStart, rangeEnd) : [];

  return (
    <div>
      {/* Date range picker */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center' }}>
        <input type="date" value={rangeStart} onChange={e => setRangeStart(e.target.value)}
          style={{ fontSize: 12, padding: '6px 10px', borderRadius: 6, border: '0.5px solid #e5e5e3', background: '#fff' }} />
        <span style={{ fontSize: 12, color: '#999' }}>to</span>
        <input type="date" value={rangeEnd} onChange={e => setRangeEnd(e.target.value)}
          style={{ fontSize: 12, padding: '6px 10px', borderRadius: 6, border: '0.5px solid #e5e5e3', background: '#fff' }} />
      </div>

      {allDates.length === 0 ? (
        <div style={{ fontSize: 13, color: '#999' }}>Select a valid date range</div>
      ) : tripsInRange.length === 0 ? (
        <div style={{ fontSize: 13, color: '#999' }}>No trips found in this date range</div>
      ) : (
        <>
          {tripsInRange.map(trip => {
            const tripStart = trip.start > rangeStart ? trip.start : rangeStart;
const isLastTrip = trip.id === tripsInRange[tripsInRange.length - 1].id;
const tripEnd = isLastTrip ? rangeEnd : (trip.end < rangeEnd ? trip.end : rangeEnd);
            const tripDates = getDatesInRange(tripStart, tripEnd);
            const tripBPs = (boardingPasses || []).filter(bp => bp.date >= trip.start && bp.date <= trip.end);
            const tripExps = tripDates.flatMap(d => (expenses[d] || []).map(e => ({ ...e, date: d })));

            
            return (
              <div key={trip.id} style={{ border: '0.5px solid #e5e5e3', borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
                {/* Trip header */}
                <div style={{ padding: '12px 16px', background: '#f5f5f3', display: 'flex', alignItems: 'center', gap: 8 }}>
  <div style={{ width: 10, height: 10, borderRadius: '50%', background: trip.color, flexShrink: 0 }} />
  <span style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>{trip.name}</span>
  {(() => {
  const recentCheckinDate = Object.keys(businessFlags)
    .filter(d => d <= trip.start)
    .sort((a, b) => b.localeCompare(a))[0];
  return recentCheckinDate && businessFlags[recentCheckinDate] ? (
    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#E6F1FB', color: '#185FA5', fontWeight: 500 }}>💼 Business</span>
  ) : null;
})()}
  <span style={{ fontSize: 11, color: '#999' }}>{tripStart} – {tripEnd}</span>
  <span style={{ fontSize: 11, color: '#1D9E75', fontWeight: 500, marginLeft: 8 }}>{tripDates.length} day{tripDates.length > 1 ? 's' : ''}</span>
  <span style={{ fontSize: 13, fontWeight: 500, color: '#0F6E56', marginLeft: 8 }}>{tripExps.length} expense{tripExps.length !== 1 ? 's' : ''}</span>
</div>

                <div style={{ padding: '12px 16px' }}>
                  {/* Flights */}
                  {tripBPs.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 500, color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Flights</div>
                      {tripBPs.map(bp => (
                        <div key={bp.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', background: '#f9f9f8', borderRadius: 6, marginBottom: 4 }}>
                          <IconPlane size={13} color="#1D9E75" />
                          <span style={{ fontSize: 12, fontWeight: 500 }}>{bp.from} → {bp.to}</span>
                          <span style={{ fontSize: 11, color: '#999' }}>{bp.flight} · {bp.airline}</span>
                          <span style={{ fontSize: 11, color: '#999', marginLeft: 'auto' }}>{bp.date}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Expenses */}
                  {tripExps.length > 0 ? (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 500, color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Expenses</div>
                      {tripExps.map((e: any, i: number) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', fontSize: 12, color: '#555', borderBottom: '0.5px solid #f0f0ee' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 11, color: '#bbb', minWidth: 80 }}>{e.date}</span>
                            <span>{e.desc}</span>
                            {e.receipt && <IconReceipt size={11} color="#1D9E75" />}
                          </div>
                          <span style={{ fontWeight: 500 }}>{e.currency} {e.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: '#999', marginBottom: 12 }}>No expenses</div>
                  )}

                  
                </div>
              </div>
            );
          })}

<button onClick={() => exportCSV(expenses, checkins, rangeStart, rangeEnd)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 6, border: '0.5px solid #e5e5e3', background: '#fff', fontSize: 12, cursor: 'pointer', marginTop: 8 }}>
            <IconDownload size={14} /> Export CSV
          </button>
        </>
      )}
    </div>
  );
}
