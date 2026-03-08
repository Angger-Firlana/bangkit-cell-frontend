import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
            {label}
          </label>
        )}
        <div className="relative group">
          {icon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={clsx(
              "w-full bg-white border rounded-xl text-slate-900 transition-all outline-none text-sm",
              "focus:ring-4 focus:ring-primary/5 focus:border-primary shadow-sm",
              icon ? "pl-11 pr-4 py-2.5" : "px-4 py-2.5",
              error ? "border-red-400 focus:border-red-400 focus:ring-red-500/5" : "border-slate-200",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">{error}</p>}
        {helperText && !error && <p className="text-[10px] font-medium text-slate-400 ml-1">{helperText}</p>}
      </div>
    );
  }
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string | number }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
            {label}
          </label>
        )}
        <div className="relative group">
          <select
            ref={ref}
            className={clsx(
              "w-full px-4 py-2.5 bg-white border rounded-xl text-slate-900 transition-all outline-none appearance-none text-sm",
              "focus:ring-4 focus:ring-primary/5 focus:border-primary shadow-sm",
              error ? "border-red-400 focus:border-red-400 focus:ring-red-500/5" : "border-slate-200",
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {error && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">{error}</p>}
      </div>
    );
  }
);
