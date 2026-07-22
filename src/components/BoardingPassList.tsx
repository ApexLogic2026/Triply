import { useState } from 'react';
import { IconPlane, IconTrash, IconUpload } from '@tabler/icons-react';
import type { BoardingPass } from '../types';

interface Props {
  boardingPasses: BoardingPass[];
  onAdd: (bp: BoardingPass) => void;
  onDelete: (id: string) => void;
}

export default function BoardingPassList({ boardingPasses, onAdd, onDelete }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ from: '', to: '', flight: '', airline: '', date: '' });

  function handleSave() {
    if (!form.from || !form.to || !form.flight) return alert('Please fill in From, To and Flight number');
    onAdd({ id: Date.now().toString(), ...form, image: null });
    setForm({ from: '', to: '', flight: '', airline: '', date: '' });
    setShowForm(false);
  }

  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 500, color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
        Uploaded Boarding Passes
      </div>

      {/* List */}
      {boardingPasses.map(bp => (
        <div key={bp.id} style={{ background: '#f5f5f3', borderRadius: 10, padding: 14, marginBottom: 10, display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: 8, background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <IconPlane size={20} color="#1D9E75" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
              <strong>{bp.from}</strong>
              <span style={{ fontSize: 12, color: '#999' }}>→</span>
              <strong>{bp.to}</strong>
              <span style={{ fontSize: 11, color: '#999', fontWeight: 400, marginLeft: 4 }}>{bp.flight}</span>
            </div>
            <div style={{ fontSize: 11, color: '#666', marginTop: 3 }}>{bp.airline} · {bp.date}</div>
          </div>
          <span onClick={() => onDelete(bp.id)} style={{ cursor: 'pointer', color: '#ccc' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#e24b4a')}
            onMouseLeave={e => (e.currentTarget.style.color = '#ccc')}>
            <IconTrash size={16} />
          </span>
        </div>
      ))}

      {/* Upload zone */}
      {!showForm ? (
        <div onClick={() => setShowForm(true)}
          style={{ border: '1.5px dashed #ccc', borderRadius: 10, padding: 32, textAlign: 'center', cursor: 'pointer' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f3')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
          <IconUpload size={28} color="#ccc" style={{ display: 'block', margin: '0 auto 8px' }} />
          <div style={{ fontSize: 13, color: '#666' }}>Add boarding pass</div>
          <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>Click to enter flight details</div>
        </div>
      ) : (
        <div style={{ background: '#f5f5f3', borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 10 }}>New Boarding Pass</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input value={form.from} onChange={e => setForm({ ...form, from: e.target.value.toUpperCase() })}
              placeholder="From (e.g. HKG)"
              style={{ flex: 1, fontSize: 12, padding: '6px 10px', borderRadius: 6, border: '0.5px solid #e5e5e3', background: '#fff' }} />
            <input value={form.to} onChange={e => setForm({ ...form, to: e.target.value.toUpperCase() })}
              placeholder="To (e.g. NRT)"
              style={{ flex: 1, fontSize: 12, padding: '6px 10px', borderRadius: 6, border: '0.5px solid #e5e5e3', background: '#fff' }} />
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input value={form.flight} onChange={e => setForm({ ...form, flight: e.target.value.toUpperCase() })}
              placeholder="Flight No. (e.g. CX509)"
              style={{ flex: 1, fontSize: 12, padding: '6px 10px', borderRadius: 6, border: '0.5px solid #e5e5e3', background: '#fff' }} />
            <input value={form.airline} onChange={e => setForm({ ...form, airline: e.target.value })}
              placeholder="Airline"
              style={{ flex: 1, fontSize: 12, padding: '6px 10px', borderRadius: 6, border: '0.5px solid #e5e5e3', background: '#fff' }} />
          </div>
          <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
            style={{ width: '100%', fontSize: 12, padding: '6px 10px', borderRadius: 6, border: '0.5px solid #e5e5e3', background: '#fff', marginBottom: 8 }} />
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={handleSave}
              style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: '#1D9E75', color: '#fff', fontSize: 12, cursor: 'pointer' }}>
              Save
            </button>
            <button onClick={() => setShowForm(false)}
              style={{ padding: '6px 14px', borderRadius: 6, border: '0.5px solid #e5e5e3', background: '#fff', fontSize: 12, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}