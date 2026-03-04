'use client';

import React from 'react';

export const InfoRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
}> = ({ icon, label, value, className = "", labelClassName = "", valueClassName = "" }) => (
  <div className={`flex items-start ${className}`}>
    <div className="flex-shrink-0 mt-0.5 text-gray-600">{icon}</div>
    <div className="flex-1 min-w-0">
      <span className={`text-gray-900 text-sm font-medium ${labelClassName}`}>{label}</span>
      <p className={`text-gray-600 text-sm mt-0.5 break-words line-clamp-3 ${valueClassName}`}>{value}</p>
    </div>
  </div>
);