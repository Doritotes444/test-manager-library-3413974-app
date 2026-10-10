import React from 'react';
import { LoanStatus } from '../types';

interface StatusBadgeProps {
  status: LoanStatus | 'available' | 'out_of_stock' | 'deleted';
  text?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, text }) => {
  const getStyles = () => {
    switch (status) {
      case 'open':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'overdue':
        return 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse';
      case 'closed':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'available':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'out_of_stock':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'deleted':
        return 'bg-gray-100 text-gray-500 border-gray-300 line-through';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getLabel = () => {
    if (text) return text;
    switch (status) {
      case 'open':
        return 'Abierto';
      case 'overdue':
        return 'En Mora';
      case 'closed':
        return 'Devuelto / Cerrado';
      case 'available':
        return 'Disponible';
      case 'out_of_stock':
        return 'Sin Ejemplares';
      case 'deleted':
        return 'Dado de Baja';
      default:
        return status;
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStyles()}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {getLabel()}
    </span>
  );
};
