import React, { useEffect, useState } from 'react';
import { AlertTriangle, Phone, Mail, RotateCcw, ShieldAlert, CheckCircle } from 'lucide-react';
import { loansService } from '../services/loans.service';
import { Loan, LoanItem } from '../types';
import { StatusBadge } from '../components/StatusBadge';

export const OverduePage: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchOverdueLoans = async () => {
    try {
      setLoading(true);
      const data = await loansService.getLoans({ status: 'overdue' });
      setLoans(data);
    } catch (err) {
      console.error('Error fetching overdue loans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverdueLoans();
  }, []);

  const handleReturnItem = async (loanId: string, item: LoanItem) => {
    try {
      await loansService.returnLoanItem(loanId, item.id);
      setActionSuccess(`Libro "${item.book_title}" devuelto con éxito.`);
      fetchOverdueLoans();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      alert(`Error al registrar devolución: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Monitor de Mora</h2>
        <p className="text-xs text-slate-500">
          Control estricto de préstamos vencidos e inhabilitación automática de nuevos préstamos (Regla RN-02)
        </p>
      </div>

      {actionSuccess && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-center space-x-3 text-emerald-800 text-sm">
          <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Explanatory Banner */}
      <div className="rounded-2xl bg-rose-50 border border-rose-200 p-5 flex items-start space-x-4">
        <div className="h-10 w-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 flex-shrink-0">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-rose-900">
            Regla de Negocio RN-02: Bloqueo de Préstamos por Mora
          </h4>
          <p className="text-xs text-rose-700 mt-1 leading-relaxed">
            Cualquier socio que mantenga al menos un libro con fecha límite superada (más de 14 días desde la expedición) queda automáticamente inhabilitado en el sistema para recibir nuevos ejemplares hasta saldar la totalidad de los préstamos en mora.
          </p>
        </div>
      </div>

      {/* Overdue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-6">Socio en Mora</th>
                <th className="py-3 px-6">Fecha Vencimiento</th>
                <th className="py-3 px-6">Libros Pendientes</th>
                <th className="py-3 px-6 text-center">Estado</th>
                <th className="py-3 px-6 text-right">Acción Rápida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loans.map((loan) => {
                const unreturned = loan.items.filter((it) => !it.returned_at);

                return (
                  <tr key={loan.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-6">
                      <p className="font-bold text-slate-900">{loan.member_name}</p>
                      <p className="text-slate-400 font-mono text-[11px]">{loan.member_document}</p>
                    </td>

                    <td className="py-3.5 px-6">
                      <span className="font-bold text-rose-600">{loan.due_date}</span>
                      <p className="text-[11px] text-slate-400">Prestado: {loan.loaned_at}</p>
                    </td>

                    <td className="py-3.5 px-6">
                      <div className="space-y-1">
                        {unreturned.map((it) => (
                          <div key={it.id} className="flex items-center justify-between gap-4">
                            <span className="font-medium text-slate-800">{it.book_title}</span>
                            <button
                              onClick={() => handleReturnItem(loan.id, it)}
                              className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[10px] border border-emerald-200"
                            >
                              Devolver
                            </button>
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-6 text-center">
                      <StatusBadge status="overdue" />
                    </td>

                    <td className="py-3.5 px-6 text-right">
                      <span className="text-xs font-semibold text-rose-600">Bloqueado para Préstamo</span>
                    </td>
                  </tr>
                );
              })}

              {loans.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
                    No hay ningún socio en mora en este momento. ¡Excelente gestión de biblioteca!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
