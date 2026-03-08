import React from 'react';
import clsx from 'clsx';

interface StatusPillProps {
  label: string;
  tone?: 'warning' | 'info' | 'success' | 'neutral';
}

const StatusPill: React.FC<StatusPillProps> = ({ label, tone = 'neutral' }) => {
  const toneClass = {
    warning: 'text-amber-600 bg-amber-50 border-amber-100',
    info: 'text-blue-600 bg-blue-50 border-blue-100',
    success: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    neutral: 'text-slate-600 bg-slate-50 border-slate-100',
  }[tone];

  return (
    <span className={clsx('px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all', toneClass)}>
      {label}
    </span>
  );
};

export default StatusPill;
