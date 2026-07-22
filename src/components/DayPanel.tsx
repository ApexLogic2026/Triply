import type { Expense, Checkins, Expenses, BusinessFlags } from '../types/index';
import { useState, useRef  } from 'react';
import { IconMapPin, IconReceipt } from '@tabler/icons-react';
import { fmtHKD } from '../utils/currency';
import ExpenseForm from './ExpenseForm';

const CATS = [
  { id: 'food', label: 'Food & Drink', color: '#E1F5EE', ic: '#1D9E75' },
  { id: 'transport', label: 'Transport', color: '#E6F1FB', ic: '#185FA5' },
  { id: 'hotel', label: 'Hotel', color: '#EEEDFE', ic: '#534AB7' },
  { id: 'activity', label: 'Activity', color: '#FAEEDA', ic: '#BA7517' },
  { id: 'shopping', label: 'Shopping', color: '#FBEAF0', ic: '#993556' },
  { id: 'other', label: 'Other', color: '#F1EFE8', ic: '#5F5E5A' },
];

const LOCATIONS = ['Hong Kong', 'Tokyo', 'Osaka', 'Singapore', 'London', 'Paris', 'New York', 'Seoul'];

interface Props {
  date: string;
  checkins: Checkins;
  expenses: Expenses;
  businessFlags: BusinessFlags;
  onCheckin: (date: string, location: string, boardingPass?: string, isBusiness?: boolean) => void;
  onAddExpense: (date: string, expense: Expense) => void;
  onViewReceipt: (src: string, caption: string) => void;
}

export default function DayPanel({ date, checkins, expenses, businessFlags, onCheckin, onAddExpense, onViewReceipt }: Props) {
const [showCheckin, setShowCheckin] = useState(false);
const [showForm, setShowForm] = useState(false);
const [customLoc, setCustomLoc] = useState('');
const [bpImage, setBpImage] = useState<string | null>(null);
const [bpFileName, setBpFileName] = useState<string | null>(null);
const [isBusiness, setIsBusiness] = useState(false);
const bpFileRef = useRef<HTMLInputElement>(null);
  const loc = checkins[date] || Object.entries(checkins)
  .filter(([d]) => d <= date)
  .sort((a, b) => b[0].localeCompare(a[0]))[0]?.[1] || null;
  const exps = expenses[date] || [];
  const total = exps.reduce((s, e) => s + e.hkdAmount, 0);
  const cat = (id: string) => CATS.find(c => c.id === id) || CATS[5];

  const parsedDate = new Date(date + 'T00:00:00');
  const dateLabel = parsedDate.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div style={{ background: '#f5f5f3', borderRadius: 10, padding: 14, marginBottom: 12 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 500 }}>{dateLabel}</span>
       <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
  {loc ? (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, fontSize: 11, background: '#E1F5EE', color: '#0F6E56', fontWeight: 500 }}>
      <IconMapPin size={12} /> {loc}
    </span>
  ) : (
    <span style={{ fontSize: 11, color: '#999' }}>No check-in</span>
  )}
  {(() => {
  const recentCheckinDate = Object.keys(businessFlags)
    .filter(d => d <= date)
    .sort((a, b) => b.localeCompare(a))[0];
  return recentCheckinDate && businessFlags[recentCheckinDate] ? (
    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#E6F1FB', color: '#185FA5', fontWeight: 500 }}>💼 Business</span>
  ) : null;
})()}
</div>
      </div>

      {/* Expenses */}
      {exps.length > 0 ? (
        <>
          {exps.map((e, i) => (
            <div key={e.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < exps.length - 1 ? '0.5px solid #e5e5e3' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, background: cat(e.cat).color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <IconReceipt size={13} color={cat(e.cat).ic} />
                </div>
                <span style={{ fontSize: 12 }}>{e.desc}</span>
                {e.receipt && (
                  <img
                    src={e.receipt}
                    alt="receipt"
                    onClick={() => onViewReceipt(e.receipt!, `${e.desc} · ${fmtHKD(e.hkdAmount)}`)}
                    style={{ width: 28, height: 28, borderRadius: 4, objectFit: 'cover', border: '0.5px solid #e5e5e3', cursor: 'pointer' }}
                  />
                )}
              </div>
              <div style={{ fontSize: 12, fontWeight: 500, marginLeft: 8 }}>
                {e.currency} {e.amount.toLocaleString()}
                
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0 0', fontSize: 12, fontWeight: 500 }}>
            <span>Total</span><span>{fmtHKD(total)}</span>
          </div>
        </>
      ) : (
        <div style={{ fontSize: 12, color: '#999', paddingBottom: 8 }}>No expenses yet</div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
        <button onClick={() => { setShowCheckin(!showCheckin); setShowForm(false); }}
          style={{ padding: '5px 12px', borderRadius: 6, border: '0.5px solid #e5e5e3', background: '#fff', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <IconMapPin size={13} /> {loc ? 'Change location' : 'Check in'}
        </button>
        <button onClick={() => { setShowForm(!showForm); setShowCheckin(false); }}
          style={{ padding: '5px 12px', borderRadius: 6, border: '0.5px solid #e5e5e3', background: '#fff', fontSize: 12, cursor: 'pointer' }}>
          + Add expense
        </button>
      </div>

      {/* Check-in panel */}
      {showCheckin && (
        <div style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: 8, padding: 12, marginTop: 8 }}>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>Select location</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
            {LOCATIONS.map(l => (
              <div key={l} onClick={() => { onCheckin(date, l, bpImage || undefined, isBusiness); setShowCheckin(false); setBpImage(null); setBpFileName(null); }}
                style={{ padding: '4px 12px', borderRadius: 20, border: '0.5px solid #e5e5e3', fontSize: 12, cursor: 'pointer', background: loc === l ? '#1D9E75' : '#fff', color: loc === l ? '#fff' : '#555' }}>
                {l}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            <input value={customLoc} onChange={e => setCustomLoc(e.target.value)}
              placeholder="Or type a custom city..."
              style={{ flex: 1, fontSize: 12, padding: '5px 10px', borderRadius: 6, border: '0.5px solid #e5e5e3', background: '#fff' }} />
            <button onClick={() => { if (customLoc.trim()) { onCheckin(date, customLoc.trim(), bpImage || undefined, isBusiness); setShowCheckin(false); setCustomLoc(''); setBpImage(null); setBpFileName(null); } }}
              style={{ padding: '5px 12px', borderRadius: 6, border: 'none', background: '#1D9E75', color: '#fff', fontSize: 12, cursor: 'pointer' }}>
              Set
            </button>
          </div>
          <div onClick={() => bpFileRef.current?.click()}
            style={{ border: bpImage ? '0.5px solid #e5e5e3' : '1.5px dashed #ccc', borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', background: bpImage ? '#f9f9f8' : '#fff' }}>
            {bpImage ? (
              <>
                <img src={bpImage} alt="Boarding pass" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: '#333' }}>{bpFileName}</div>
                  <div style={{ fontSize: 11, color: '#999' }}>Boarding pass uploaded</div>
                </div>
                <span onClick={e => { e.stopPropagation(); setBpImage(null); setBpFileName(null); }} style={{ fontSize: 13, color: '#999', cursor: 'pointer' }}>✕</span>
              </>
            ) : (
              <>
                <div style={{ width: 36, height: 36, borderRadius: 6, background: '#f5f5f3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🎫</div>
                <div>
                  <div style={{ fontSize: 12, color: '#666' }}>Upload boarding pass <span style={{ color: '#999', fontWeight: 400 }}>(optional)</span></div>
                  <div style={{ fontSize: 11, color: '#999' }}>JPG, PNG or PDF</div>
                </div>
              </>
            )}
          </div>
         <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
  <div onClick={() => setIsBusiness(!isBusiness)}
    style={{ width: 36, height: 20, borderRadius: 10, background: isBusiness ? '#1D9E75' : '#e5e5e3', position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
    <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: isBusiness ? 18 : 2, transition: 'left .2s' }} />
  </div>
  <span style={{ fontSize: 12, color: '#555' }}>Business trip</span>
  {isBusiness && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#E6F1FB', color: '#185FA5', fontWeight: 500 }}>💼</span>}
</div>
          <input ref={bpFileRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }}
            onChange={e => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = ev => { setBpImage(ev.target?.result as string); setBpFileName(file.name); };
              reader.readAsDataURL(file);
            }} />
        </div>
      )}

      {/* Expense form */}
      {showForm && (
        <ExpenseForm
          onSave={e => { onAddExpense(date, e); setShowForm(false); }}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
