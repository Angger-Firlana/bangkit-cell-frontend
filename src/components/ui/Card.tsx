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
    <div className={cn("bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden", className)}>
      {(title || subtitle || headerAction) && (
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <div>
            {title && <h3 className="text-lg font-bold text-gray-900">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
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
    <Card className={cn("border-none shadow-md", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <h4 className="text-2xl font-bold text-gray-900">{value}</h4>
          {trend && (
            <div className={cn("flex items-center mt-2 text-xs font-semibold", trend.positive ? "text-green-600" : "text-red-600")}>
              {trend.positive ? (
                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
              ) : (
                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
              )}
              {trend.value}
            </div>
          )}
        </div>
        <div className="p-3 bg-gray-50 rounded-xl text-blue-600">
          {icon}
        </div>
      </div>
    </Card>
  );
};
