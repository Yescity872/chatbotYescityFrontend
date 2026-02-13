'use client';
import { FaExclamationTriangle } from 'react-icons/fa';

export default function ErrorAlert({ error }: { error: string }) {
  if (!error) return null;

  return (
    <div className="mb-4 bg-red-50 border border-red-200 p-3 rounded-xl flex items-center">
      <FaExclamationTriangle className="mr-3 text-red-500" />
      <span className="text-sm text-red-700">{error}</span>
    </div>
  );
}
