import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex gap-3">{actions}</div>}
    </div>
  );
};

export default PageHeader;
