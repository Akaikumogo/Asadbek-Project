import React from 'react';

export default function DeviceCard({ device }: { device: any }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between touch-manipulation">
      <div>
        <div className="text-sm font-medium">{device.name}</div>
        <div className="text-xs text-slate-500">{device.status ?? '—'}</div>
      </div>
      <div>
        <button className="bg-primary text-white px-3 py-2 rounded-lg text-sm">Open</button>
      </div>
    </div>
  );
}