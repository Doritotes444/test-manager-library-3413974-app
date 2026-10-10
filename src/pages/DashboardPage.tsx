import React, { useEffect, useState } from 'react';
import { BookOpen, Users, Repeat, AlertTriangle, ArrowRight, PlusCircle, CheckCircle2 } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { booksService } from '../services/books.service';
import { membersService } from '../services/members.service';
import { loansService } from '../services/loans.service';
import { Loan, Book, Member } from '../types';

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [bData, mData, lData] = await Promise.all([
          booksService.getBooks(),
          membersService.getMembers(),
          loansService.getLoans(),
        ]);
        setBooks(bData);
        setMembers(mData);
        setLoans(lData);
      } catch (err) {
        console.error('Error fetching dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const totalBooks = books.length;
  const totalCopies = books.reduce((acc, b) => acc + b.total_copies, 0);
  const totalMembers = members.length;
  const activeLoans = loans.filter((l) => l.status === 'open' || l.status === 'overdue');
  const overdueLoans = loans.filter((l) => l.status === 'overdue');

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-100 text-xs font-semibold mb-3">
            SENA ADSO Ficha 3413974 &bull; Prueba Técnica SDD
          </span>
          <h2 className="text-3xl font-black tracking-tight">
            Panel de Control de la Biblioteca
          </h2>
          <p className="mt-2 text-emerald-100/90 text-sm leading-relaxed">
            Bienvenido al sistema Manager Library. Gestiona ejemplares, socios, préstamos atómicos con control de mora y reportes agregados en tiempo real.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('loans')}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white text-emerald-800 text-xs font-bold hover:bg-emerald-50 transition-all shadow-md"
            >
              <Repeat className="h-4 w-4" />
              <span>Nuevo Préstamo</span>
            </button>
            <button
              onClick={() => onNavigate('returns')}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-500/30 text-white text-xs font-bold hover:bg-emerald-500/40 border border-emerald-400/30 transition-all"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Devolución Rápida</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Títulos en Catálogo"
          value={loading ? '...' : totalBooks}
          subtitle={`${totalCopies} ejemplares totales`}
          icon={BookOpen}
          variant="blue"
        />
        <StatCard
          title="Socios Afiliados"
          value={loading ? '...' : totalMembers}
          subtitle="Registros activos"
          icon={Users}
          variant="purple"
        />
        <StatCard
          title="Préstamos Activos"
          value={loading ? '...' : activeLoans.length}
          subtitle="En poder de los socios"
          icon={Repeat}
          variant="emerald"
        />
        <StatCard
          title="Préstamos en Mora"
          value={loading ? '...' : overdueLoans.length}
          subtitle="Requieren atención inmediata"
          icon={AlertTriangle}
          variant="rose"
        />
      </div>

      {/* Overdue Alert banner if any */}
      {overdueLoans.length > 0 && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-5 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-900">
                Atención: Hay {overdueLoans.length} préstamo(s) con fecha de vencimiento superada
              </h4>
              <p className="text-xs text-rose-700 mt-0.5">
                Los socios con préstamos en mora tienen bloqueada la solicitud de nuevos libros según la regla RN-02.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('overdue')}
            className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-all shadow-sm"
          >
            <span>Ver Lista de Mora</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Recent Loans */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Últimos Préstamos Registrados</h3>
            <p className="text-xs text-slate-500">Historial reciente de operaciones de circulación</p>
          </div>
          <button
            onClick={() => onNavigate('loans')}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
          >
            <span>Ver todos</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-6">Socio</th>
                <th className="py-3 px-6">Libros Prestados</th>
                <th className="py-3 px-6">Fecha Préstamo</th>
                <th className="py-3 px-6">Fecha Vencimiento</th>
                <th className="py-3 px-6">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loans.slice(0, 5).map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-6 font-medium text-slate-900">
                    {l.member_name || l.member_id}
                  </td>
                  <td className="py-3.5 px-6 text-slate-600">
                    {l.items?.map((it) => it.book_title).join(', ') || 'N/A'}
                  </td>
                  <td className="py-3.5 px-6 text-slate-500">{l.loaned_at}</td>
                  <td className="py-3.5 px-6 text-slate-500">{l.due_date}</td>
                  <td className="py-3.5 px-6">
                    <StatusBadge status={l.status} />
                  </td>
                </tr>
              ))}
              {loans.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No se han registrado préstamos todavía.
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
