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
    <div className={cn(
      "bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm shadow-slate-200/50 flex items-start justify-between group hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-500",
      className
    )}>
      <div className="flex-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{title}</p>
        <h4 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-2">{value}</h4>
        {trend && (
          <div className={cn(
            "flex items-center text-[10px] font-bold uppercase tracking-wider mt-1",
            trend.positive ? "text-emerald-500" : "text-rose-500"
          )}>
            {trend.value}
          </div>
        )}
      </div>
      <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-primary group-hover:text-white group-hover:scale-110 transition-all duration-500 shadow-sm">
        {icon}
      </div>
    </div>
  );
};
