import { useState, useRef } from 'react';
import { IconCamera, IconX } from '@tabler/icons-react';
import type { Expense } from '../types';
import { CURRENCIES, toHKD, fmtHKD } from '../utils/currency';

const CATS = [
  { id: 'food', label: 'Food & Drink', color: '#E1F5EE', ic: '#1D9E75' },
  { id: 'transport', label: 'Transport', color: '#E6F1FB', ic: '#185FA5' },
  { id: 'hotel', label: 'Hotel', color: '#EEEDFE', ic: '#534AB7' },
  { id: 'activity', label: 'Activity', color: '#FAEEDA', ic: '#BA7517' },
  { id: 'shopping', label: 'Shopping', color: '#FBEAF0', ic: '#993556' },
  { id: 'other', label: 'Other', color: '#F1EFE8', ic: '#5F5E5A' },
];

interface Props {
  onSave: (expense: Expense) => void;
  onCancel: () => void;
}

export default function ExpenseForm({ onSave, onCancel }: Props) {
  const [cat, setCat] = useState('food');
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('HKD');
  const [receipt, setReceipt] = useState<string | null>(null);
  const [receiptName, setReceiptName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const hkd = amount ? toHKD(parseFloat(amount), currency) : 0;

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setReceipt(ev.target?.result as string);
      setReceiptName(file.name);
    };
    reader.readAsDataURL(file);
  }

  function handleSave() {
    if (!desc.trim()) return alert('Please enter a description');
    onSave({
      id: Date.now().toString(),
      cat,
      desc: desc.trim(),
      amount: parseFloat(amount) || 0,
      currency,
      hkdAmount: hkd,
      receipt,
      receiptName,
    });
  }

  return (
    <div style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: 8, padding: 12, marginTop: 10 }}>
      {/* Category */}
      <select value={cat} onChange={e => setCat(e.target.value)}
        style={{ width: '100%', fontSize: 12, padding: '6px 10px', borderRadius: 6, border: '0.5px solid #e5e5e3', marginBottom: 8, background: '#fff' }}>
        {CATS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
      </select>

      {/* Description */}
      <input value={desc} onChange={e => setDesc(e.target.value)}
        placeholder="Description (e.g. Dinner at Nobu)"
        style={{ width: '100%', fontSize: 12, padding: '6px 10px', borderRadius: 6, border: '0.5px solid #e5e5e3', marginBottom: 8, background: '#fff' }} />

      {/* Amount + Currency */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
          placeholder="Amount"
          style={{ flex: 1, fontSize: 12, padding: '6px 10px', borderRadius: 6, border: '0.5px solid #e5e5e3', background: '#fff' }} />
        <select value={currency} onChange={e => setCurrency(e.target.value)}
          style={{ fontSize: 12, padding: '6px 10px', borderRadius: 6, border: '0.5px solid #e5e5e3', background: '#fff' }}>
          {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* HKD preview */}
      {amount && currency !== 'HKD' && (
        <div style={{ fontSize: 11, color: '#1D9E75', marginBottom: 8, paddingLeft: 4 }}>
          ≈ {fmtHKD(hkd)}
        </div>
      )}

      {/* Receipt upload */}
      <div
        onClick={() => !receipt && fileRef.current?.click()}
        style={{
          border: receipt ? '0.5px solid #e5e5e3' : '1.5px dashed #ccc',
          borderRadius: 8,
          padding: '10px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          cursor: receipt ? 'default' : 'pointer',
          background: receipt ? '#f9f9f8' : '#fff',
          marginBottom: 8,
        }}
      >
        {receipt ? (
          <>
            <img src={receipt} alt="Receipt" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', border: '0.5px solid #e5e5e3' }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{receiptName}</div>
              <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>Receipt ready</div>
            </div>
            <span onClick={e => { e.stopPropagation(); setReceipt(null); setReceiptName(null); if (fileRef.current) fileRef.current.value = ''; }}
              style={{ cursor: 'pointer', color: '#999' }}>
              <IconX size={14} />
            </span>
          </>
        ) : (
          <>
            <div style={{ width: 36, height: 36, borderRadius: 6, background: '#f5f5f3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconCamera size={18} color="#999" />
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#666' }}>Upload receipt</div>
              <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>JPG, PNG or PDF</div>
            </div>
          </>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={handleFile} />

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={handleSave}
          style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: '#1D9E75', color: '#fff', fontSize: 12, cursor: 'pointer' }}>
          Save expense
        </button>
        <button onClick={onCancel}
          style={{ padding: '6px 14px', borderRadius: 6, border: '0.5px solid #e5e5e3', background: '#fff', fontSize: 12, cursor: 'pointer' }}>
          Cancel
        </button>
      </div>
    </div>
  );
}