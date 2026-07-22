import { useState, useEffect } from 'react';
import './App.css';
import type { Trip, Expenses, Checkins, BusinessFlags, BoardingPass, Expense } from './types';
import { supabase } from './utils/supabase';
import Sidebar from './components/Sidebar';
import Calendar from './components/Calendar';
import DayPanel from './components/DayPanel';
import BoardingPassList from './components/BoardingPassList';
import Report from './components/Report';

function generateTripsFromCheckins(checkins: Checkins): Trip[] {
  const sorted = Object.entries(checkins).sort((a, b) => a[0].localeCompare(b[0]));
  const trips: Trip[] = [];
  const colors = ['#1D9E75', '#534AB7', '#BA7517', '#185FA5', '#993556', '#E24B4A'];
  sorted.forEach(([date, location], index) => {
    const prev = sorted[index - 1];
    if (!prev || prev[1] !== location) {
      const next = sorted.slice(index + 1).find(s => s[1] !== location);
      const endDate = next
        ? new Date(new Date(next[0] + 'T00:00:00').getTime() - 86400000).toISOString().split('T')[0]
        : date;
      trips.push({ id: `trip-${date}`, name: location, color: colors[trips.length % colors.length], start: date, end: endDate });
    }
  });
  return trips;
}

export default function App() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [checkins, setCheckins] = useState<Checkins>({});
  const [expenses, setExpenses] = useState<Expenses>({});
  const [boardingPasses, setBoardingPasses] = useState<BoardingPass[]>([]);
  const [businessFlags, setBusinessFlags] = useState<BusinessFlags>({});
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState('calendar');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [reportTrip, setReportTrip] = useState('');
  const [lightbox, setLightbox] = useState<{ src: string; caption: string } | null>(null);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    const { data: checkinsData } = await supabase.from('checkins').select('*');
    const loadedCheckins: Checkins = {};
    const loadedBusiness: BusinessFlags = {};
(checkinsData || []).forEach((c: any) => {
  loadedCheckins[c.date] = c.location;
  if (c.is_business) loadedBusiness[c.date] = true;
});
setCheckins(loadedCheckins);
setBusinessFlags(loadedBusiness);
    setTrips(generateTripsFromCheckins(loadedCheckins));

    const { data: expensesData } = await supabase.from('expenses').select('*');
    const loadedExpenses: Expenses = {};
    (expensesData || []).forEach((e: any) => {
      if (!loadedExpenses[e.date]) loadedExpenses[e.date] = [];
      loadedExpenses[e.date].push({
        id: e.id, cat: e.cat, desc: e.description, amount: Number(e.amount),
        currency: e.currency, hkdAmount: Number(e.hkd_amount),
        receipt: e.receipt, receiptName: e.receipt_name,
      });
    });
    setExpenses(loadedExpenses);

    const { data: bpData } = await supabase.from('boarding_passes').select('*');
    const loadedBPs: BoardingPass[] = (bpData || []).map((b: any) => ({
      id: b.id, from: b.from_code, to: b.to_code, flight: b.flight,
      airline: b.airline, date: b.date, image: b.image,
    }));
    setBoardingPasses(loadedBPs);
    setLoading(false);
  }

  function fmt(d: Date) { return d.toISOString().split('T')[0]; }


  async function handleCheckin(date: string, location: string, boardingPassImage?: string, isBusiness?: boolean) {
  const newCheckins = { ...checkins, [date]: location };
  const newFlags = { ...businessFlags, [date]: !!isBusiness };
  setCheckins(newCheckins);
  setBusinessFlags(newFlags);
  setTrips(generateTripsFromCheckins(newCheckins));
  await supabase.from('checkins').upsert({ date, location, is_business: !!isBusiness });

  // Save boarding pass as a special expense entry
  if (boardingPassImage) {
    const bp: Expense = {
      id: `bp-${date}`,
      cat: 'transport',
      desc: `Boarding Pass - ${location}`,
      amount: 0,
      currency: 'HKD',
      hkdAmount: 0,
      receipt: boardingPassImage,
      receiptName: 'boarding-pass.jpg',
    };
    setExpenses(prev => {
      const existing = (prev[date] || []).filter(e => e.id !== `bp-${date}`);
      return { ...prev, [date]: [bp, ...existing] };
    });
    await supabase.from('expenses').upsert({
      id: bp.id, date, cat: bp.cat, description: bp.desc,
      amount: 0, currency: 'HKD', hkd_amount: 0,
      receipt: boardingPassImage, receipt_name: 'boarding-pass.jpg',
    });
  }
}

  async function handleAddExpense(date: string, expense: Expense) {
    setExpenses(prev => {
      const existing = prev[date] || [];
      return { ...prev, [date]: [...existing, expense] };
    });
    await supabase.from('expenses').insert({
      id: expense.id, date, cat: expense.cat, description: expense.desc,
      amount: expense.amount, currency: expense.currency, hkd_amount: expense.hkdAmount,
      receipt: expense.receipt, receipt_name: expense.receiptName,
    });
  }

  function cityFromCode(code: string): string {
    const map: Record<string, string> = {
      HKG: 'Hong Kong', NRT: 'Tokyo', KIX: 'Osaka', SIN: 'Singapore',
      LHR: 'London', CDG: 'Paris', JFK: 'New York', ICN: 'Seoul',
      SYD: 'Sydney', MEL: 'Melbourne', LAX: 'Los Angeles', SFO: 'San Francisco',
      BKK: 'Bangkok', TPE: 'Taipei', PVG: 'Shanghai', PEK: 'Beijing',
      DXB: 'Dubai', FCO: 'Rome', BCN: 'Barcelona', AMS: 'Amsterdam',
    };
    return map[code.toUpperCase()] || code;
  }

  async function handleAddBP(bp: BoardingPass) {
    const newBPs = [...boardingPasses, bp].sort((a, b) => a.date.localeCompare(b.date));
    setBoardingPasses(newBPs);
    await supabase.from('boarding_passes').insert({
      id: bp.id, from_code: bp.from, to_code: bp.to, flight: bp.flight,
      airline: bp.airline, date: bp.date, image: bp.image,
    });
    // Only save boarding pass arrival date as check-in
    const newCheckins = { ...checkins, [bp.date]: cityFromCode(bp.to) };
    setCheckins(newCheckins);
    setTrips(generateTripsFromCheckins(newCheckins));
    await supabase.from('checkins').upsert({ date: bp.date, location: cityFromCode(bp.to) });
  }

  async function handleDeleteBP(id: string) {
    setBoardingPasses(prev => prev.filter(b => b.id !== id));
    await supabase.from('boarding_passes').delete().eq('id', id);
  }

  const titles: Record<string, string> = {
    calendar: 'Calendar',
    boarding: 'Boarding Passes',
    report: 'Report',
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontSize: 14, color: '#999' }}>
        Loading Triply...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', flexDirection: window.innerWidth < 768 ? 'column' : 'row' }}>
      <Sidebar
        currentScreen={screen}
        onSelectScreen={s => { setScreen(s); setSelectedDate(null); }}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '0.5px solid #e5e5e3', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 16, fontWeight: 500 }}>{titles[screen]}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {(() => {
              const referenceDate = selectedDate || fmt(new Date());
              const recentCity = Object.entries(checkins)
                .filter(([date]) => date <= referenceDate)
                .sort((a, b) => b[0].localeCompare(a[0]))[0]?.[1];
              return recentCity ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, background: '#E1F5EE', fontSize: 12, color: '#0F6E56', fontWeight: 500 }}>
                  📍 {recentCity}
                </div>
              ) : null;
            })()}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', paddingBottom: window.innerWidth < 768 ? 80 : 20 }}>
          {screen === 'calendar' && (
  <div style={{ display: 'flex', gap: 16, height: '100%', flexDirection: window.innerWidth < 768 ? 'column' : 'row' }}>
    <div style={{ flex: 1, minWidth: 0 }}>
      <Calendar
        checkins={checkins}
        currentMonth={currentMonth}
        selectedDate={selectedDate}
        onChangeMonth={dir => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + dir, 1))}
        onSelectDate={date => setSelectedDate(date === selectedDate ? null : date)}
        onGoToToday={() => setCurrentMonth(new Date())}
      />
    </div>
    <div style={{ width: window.innerWidth < 768 ? '100%' : 320, flexShrink: 0, overflowY: 'auto' }}>
      {selectedDate ? (
        <DayPanel
  date={selectedDate}
  checkins={checkins}
  expenses={expenses}
  businessFlags={businessFlags}
  onCheckin={handleCheckin}
  onAddExpense={handleAddExpense}
  onViewReceipt={(src, caption) => setLightbox({ src, caption })}
/>
      ) : (
        <div style={{ fontSize: 13, color: '#999', marginTop: 40, textAlign: 'center' }}>
          👆 Click a date to view details
        </div>
      )}
    </div>
  </div>
)}
          {screen === 'boarding' && (
            <BoardingPassList
              boardingPasses={boardingPasses}
              onAdd={handleAddBP}
              onDelete={handleDeleteBP}
            />
          )}
          {screen === 'report' && (
            <Report
              trips={trips}
              expenses={expenses}
              checkins={checkins}
              boardingPasses={boardingPasses}
              selectedTrip={reportTrip}
              onSelectTrip={setReportTrip}
            />
          )}
        </div>
      </div>
      {lightbox && (
        <div onClick={() => setLightbox(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 10, padding: 16, maxWidth: 360, width: '90%', position: 'relative' }}>
            <button onClick={() => setLightbox(null)}
              style={{ position: 'absolute', top: 10, right: 10, width: 26, height: 26, borderRadius: 6, border: '0.5px solid #e5e5e3', background: '#f5f5f3', cursor: 'pointer', fontSize: 14 }}>
              ✕
            </button>
            <img src={lightbox.src} alt="Receipt" style={{ width: '100%', borderRadius: 6 }} />
            <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>{lightbox.caption}</div>
          </div>
        </div>
      )}
    </div>
  );
}
