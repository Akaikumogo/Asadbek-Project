import React from 'react';

const items = [
  { id: 'home', label: 'Home', icon: HomeIcon },
  { id: 'devices', label: 'Devices', icon: DeviceIcon },
  { id: 'monitor', label: 'Monitor', icon: MonitorIcon },
  { id: 'profile', label: 'Profile', icon: ProfileIcon }
];

export default function BottomNav() {
  return (
    <nav aria-label="Primary" className="flex justify-between px-4 py-2 bg-white">
      {items.map((it) => (
        <button
          key={it.id}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-1 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
          aria-label={it.label}
        >
          <it.icon />
          <span className="text-xs">{it.label}</span>
        </button>
      ))}
    </nav>
  );
}

function HomeIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
      <path d="M3 11.5L12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V11.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function DeviceIcon(){ return (<svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/></svg>); }
function MonitorIcon(){ return (<svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"><path d="M2 7h20v10H2z" stroke="currentColor" strokeWidth="1.5"/><path d="M8 21h8" stroke="currentColor" strokeWidth="1.5"/></svg>); }
function ProfileIcon(){ return (<svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M4 20a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.5"/></svg>); }