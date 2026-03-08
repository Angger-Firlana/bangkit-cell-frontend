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
          <label className="text-sm font-semibold text-gray-700 ml-0.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={clsx(
              "w-full bg-white border rounded-xl text-gray-900 transition-all outline-none",
              "focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600",
              icon ? "pl-11 pr-4 py-2.5" : "px-4 py-2.5",
              error ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-gray-200",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs font-medium text-red-500 ml-0.5">{error}</p>}
        {helperText && !error && <p className="text-xs text-gray-500 ml-0.5">{helperText}</p>}
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
          <label className="text-sm font-semibold text-gray-700 ml-0.5">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={clsx(
              "w-full px-4 py-2.5 bg-white border rounded-xl text-gray-900 transition-all outline-none appearance-none",
              "focus:ring-2 focus:ring-primary/20 focus:border-primary",
              error ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-gray-200",
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
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {error && <p className="text-xs font-medium text-red-500 ml-0.5">{error}</p>}
      </div>
    );
  }
);
