import React, { useEffect, useState } from 'react';
import {
  RotateCcw,
  Search,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Calendar,
  User,
} from 'lucide-react';
import { loansService } from '../services/loans.service';
import { Loan, LoanItem } from '../types';
import { StatusBadge } from '../components/StatusBadge';

export const ReturnsPage: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [processingItemId, setProcessingItemId] = useState<string | null>(null);

  const fetchActiveLoans = async () => {
    try {
      setLoading(true);
      // Fetch open and overdue loans
      const allLoans = await loansService.getLoans();
      const active = allLoans.filter((l) => l.status === 'open' || l.status === 'overdue');
      setLoans(active);
    } catch (err) {
      console.error('Error fetching active loans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveLoans();
  }, []);

  const handleReturnItem = async (loanId: string, item: LoanItem) => {
    setActionError(null);
    setActionSuccess(null);
    setProcessingItemId(item.id);

    try {
      await loansService.returnLoanItem(loanId, item.id);
      setActionSuccess(
        `Devolución registrada con éxito: "${item.book_title}". El stock disponible del libro se ha reintegrado.`
      );
      fetchActiveLoans();
      setTimeout(() => setActionSuccess(null), 5000);
    } catch (err: any) {
      setActionError(err?.message || 'Error al procesar la devolución');
    } finally {
      setProcessingItemId(null);
    }
  };

  const filteredLoans = loans.filter((l) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      l.member_name?.toLowerCase().includes(term) ||
      l.member_document?.toLowerCase().includes(term) ||
      l.id.toLowerCase().includes(term) ||
      l.items?.some((it) => it.book_title.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Módulo de Devoluciones</h2>
        <p className="text-xs text-slate-500">
          Recepción individual de libros prestados con reincorporación inmediata de stock (Regla RN-04)
        </p>
      </div>

      {actionSuccess && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-center space-x-3 text-emerald-800 text-sm">
          <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 flex items-center space-x-3 text-rose-800 text-sm">
          <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Search Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por documento de socio, nombre o título..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Active Loans Cards */}
      <div className="space-y-4">
        {filteredLoans.map((loan) => {
          const pendingItems = loan.items.filter((it) => !it.returned_at);

          return (
            <div
              key={loan.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-2">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{loan.member_name}</h3>
                    <p className="text-xs text-slate-500 font-mono">
                      Doc: {loan.member_document} &bull; Préstamo #{loan.id.substring(0, 8)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-[11px] text-slate-400">Fecha Límite</p>
                    <p className="text-xs font-bold text-slate-700">{loan.due_date}</p>
                  </div>
                  <StatusBadge status={loan.status} />
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Libros asociados al préstamo:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {loan.items.map((item) => {
                    const isReturned = !!item.returned_at;
                    const isProcessing = processingItemId === item.id;

                    return (
                      <div
                        key={item.id}
                        className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                          isReturned
                            ? 'bg-slate-50/70 border-slate-200 text-slate-400'
                            : 'bg-white border-slate-200 shadow-sm hover:border-emerald-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                              {item.category_name}
                            </span>
                            {isReturned && (
                              <span className="text-[11px] font-medium text-slate-500">
                                Devuelto
                              </span>
                            )}
                          </div>
                          <p className="font-bold text-slate-900 text-xs mt-2 line-clamp-1">
                            {item.book_title}
                          </p>
                          <p className="text-[11px] font-mono text-slate-500">ISBN: {item.isbn}</p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                          {isReturned ? (
                            <span className="text-[11px] text-slate-400">
                              Fecha: {item.returned_at}
                            </span>
                          ) : (
                            <button
                              onClick={() => handleReturnItem(loan.id, item)}
                              disabled={isProcessing}
                              className="w-full flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                              <span>{isProcessing ? 'Procesando...' : 'Devolver Libro'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {filteredLoans.length === 0 && !loading && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
            <CheckCircle className="h-10 w-10 mx-auto mb-2 text-emerald-500" />
            <p className="text-sm font-bold text-slate-700">No hay devoluciones pendientes</p>
            <p className="text-xs text-slate-400 mt-1">
              Todos los libros prestados han sido devueltos a la colección.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
