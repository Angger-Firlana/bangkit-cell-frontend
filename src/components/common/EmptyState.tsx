import React from 'react';

interface EmptyStateProps {
  title: string;
  message: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, message, action, icon }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center shadow-sm">
      {icon && <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">{icon}</div>}
      <h3 className="text-lg font-black text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500 mt-2">{message}</p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
};

export default EmptyState;
