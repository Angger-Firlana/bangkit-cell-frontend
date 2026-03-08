import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className, title, subtitle, headerAction }) => {
  return (
    <div className={cn("bg-white border border-slate-100 rounded-2xl shadow-sm shadow-slate-200/50 overflow-hidden", className)}>
      {(title || subtitle || headerAction) && (
        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
          <div>
            {title && <h3 className="text-base font-bold text-slate-800 tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs font-medium text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export const CardStats: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: string; positive: boolean };
  className?: string;
}> = ({ title, value, icon, trend, className }) => {
  return (
    <Card className={cn("border-none shadow-lg shadow-slate-200/60", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{title}</p>
          <h4 className="text-2xl font-bold text-slate-800 tracking-tight">{value}</h4>
          {trend && (
            <div className={cn("flex items-center mt-2 text-[10px] font-bold uppercase tracking-wider", trend.positive ? "text-emerald-500" : "text-rose-500")}>
              {trend.positive ? (
                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
              ) : (
                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
              )}
              {trend.value}
            </div>
          )}
        </div>
        <div className="p-3 bg-slate-50 text-primary rounded-xl transition-colors group-hover:bg-primary group-hover:text-white">
          {icon}
        </div>
      </div>
    </Card>
  );
};
