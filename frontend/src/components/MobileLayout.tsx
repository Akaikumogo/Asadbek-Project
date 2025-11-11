import React from 'react';
import BottomNav from './BottomNav';

type Props = { children: React.ReactNode; title?: string };

export default function MobileLayout({ children, title }: Props) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <header className="flex items-center justify-between px-4 py-3 border-b bg-white">
        <button aria-label="Open menu" className="p-2 rounded-lg">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <h1 className="text-lg font-medium">{title ?? 'Asadbek'}</h1>
        <div className="w-8" />
      </header>

      <main className="flex-1 overflow-auto p-4">
        {children}
      </main>

      <footer className="border-t bg-white" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <BottomNav />
      </footer>
    </div>
  );
}