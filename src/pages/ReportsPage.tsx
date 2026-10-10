import React, { useEffect, useState } from 'react';
import { BarChart3, Trophy, BookOpen, Layers, Award } from 'lucide-react';
import { reportsService } from '../services/reports.service';
import { MostBorrowedReportItem } from '../types';
import { useAuth } from '../context/AuthContext';

export const ReportsPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [reportData, setReportData] = useState<MostBorrowedReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const data = await reportsService.getMostBorrowed(10);
        setReportData(data);
      } catch (err) {
        console.error('Error fetching most borrowed report:', err);
      } finally {
        setLoading(false);
      }
    };
    if (isAdmin) {
      fetchReport();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center text-rose-800">
        <p className="font-bold text-base">Acceso Restringido</p>
        <p className="text-xs text-rose-600 mt-1">
          Este informe analítico está reservado exclusivamente para usuarios con rol de Administrador.
        </p>
      </div>
    );
  }

  const maxBorrow = reportData.length > 0 ? Math.max(...reportData.map((r) => r.borrow_count)) : 1;

  // Group count by category
  const categoryStats: Record<string, number> = {};
  reportData.forEach((item) => {
    categoryStats[item.category_name] = (categoryStats[item.category_name] || 0) + item.borrow_count;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Reporte de Libros Más Prestados</h2>
        <p className="text-xs text-slate-500">
          Métricas agregadas a nivel de base de datos con categorización histórica congelada (RF-10 / ADR-004)
        </p>
      </div>

      {/* Top 3 Podium Cards */}
      {reportData.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reportData.slice(0, 3).map((item, index) => {
            const colors = [
              { bg: 'from-amber-400 to-amber-600', text: 'text-amber-800', border: 'border-amber-200', rank: '1° Lugar' },
              { bg: 'from-slate-300 to-slate-400', text: 'text-slate-700', border: 'border-slate-200', rank: '2° Lugar' },
              { bg: 'from-amber-600 to-amber-800', text: 'text-amber-900', border: 'border-amber-300', rank: '3° Lugar' },
            ][index];

            return (
              <div
                key={item.book_id}
                className={`bg-white rounded-2xl border ${colors.border} p-5 shadow-sm relative overflow-hidden flex flex-col justify-between`}
              >
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {colors.rank}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm mt-3 line-clamp-1">{item.title}</h4>
                  <p className="text-xs text-slate-500">{item.author}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">{item.category_name}</span>
                  <span className="text-base font-black text-emerald-600">
                    {item.borrow_count} <span className="text-xs font-normal text-slate-400">préstamos</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Top 10 Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Ranking Top 10 de Circulación</h3>
            <p className="text-xs text-slate-500">Volumen histórico de préstamos por título</p>
          </div>
          <span className="text-xs font-bold text-slate-400">Total Analizado: {reportData.length} libros</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-6 text-center w-16">Puesto</th>
                <th className="py-3 px-6">Título de la Obra</th>
                <th className="py-3 px-6">Autor</th>
                <th className="py-3 px-6">Categoría</th>
                <th className="py-3 px-6">Popularidad Relativa</th>
                <th className="py-3 px-6 text-center">Total Préstamos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reportData.map((row, idx) => {
                const percentage = maxBorrow > 0 ? (row.borrow_count / maxBorrow) * 100 : 0;

                return (
                  <tr key={row.book_id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-6 text-center font-bold text-slate-700">
                      #{idx + 1}
                    </td>

                    <td className="py-3.5 px-6 font-bold text-slate-900">{row.title}</td>

                    <td className="py-3.5 px-6 text-slate-600">{row.author}</td>

                    <td className="py-3.5 px-6">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">
                        {row.category_name}
                      </span>
                    </td>

                    <td className="py-3.5 px-6">
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden max-w-xs">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </td>

                    <td className="py-3.5 px-6 text-center font-black text-emerald-600 text-sm">
                      {row.borrow_count}
                    </td>
                  </tr>
                );
              })}

              {reportData.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    No hay suficientes datos de préstamos para calcular el ranking.
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
