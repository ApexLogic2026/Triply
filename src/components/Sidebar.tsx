import { IconPlane, IconCalendar, IconChartBar } from '@tabler/icons-react';

interface Props {
  currentScreen: string;
  onSelectScreen: (screen: string) => void;
}

export default function Sidebar({ currentScreen, onSelectScreen }: Props) {
  const isMobile = window.innerWidth < 768;

  if (isMobile) {
    return (
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '0.5px solid #e5e5e3', display: 'flex', zIndex: 10 }}>
        {[
          { id: 'calendar', label: 'Calendar', icon: <IconCalendar size={20} /> },
          { id: 'report', label: 'Report', icon: <IconChartBar size={20} /> },
        ].map(item => (
          <div key={item.id} onClick={() => onSelectScreen(item.id)}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px 0', cursor: 'pointer', color: currentScreen === item.id ? '#1D9E75' : '#999', fontSize: 11, gap: 3 }}>
            {item.icon}
            {item.label}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ width: 200, borderRight: '0.5px solid #e5e5e3', background: '#f5f5f3', display: 'flex', flexDirection: 'column', flexShrink: 0, height: '100%' }}>
      <div style={{ padding: '20px 16px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 28, height: 28, background: '#1D9E75', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconPlane size={16} color="#fff" />
        </div>
        <span style={{ fontSize: 14, fontWeight: 500 }}>Triply</span>
      </div>
      <div style={{ padding: '8px 8px 0' }}>
        {[
          { id: 'calendar', label: 'Calendar', icon: <IconCalendar size={16} /> },
          { id: 'report', label: 'Report', icon: <IconChartBar size={16} /> },
        ].map(item => (
          <div key={item.id} onClick={() => onSelectScreen(item.id)}
            style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, cursor: 'pointer', borderRadius: 6, marginBottom: 2, borderLeft: currentScreen === item.id ? '2px solid #1D9E75' : '2px solid transparent', background: currentScreen === item.id ? '#fff' : 'transparent', color: currentScreen === item.id ? '#1a1a18' : '#666', fontWeight: currentScreen === item.id ? 500 : 400 }}>
            {item.icon}
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}