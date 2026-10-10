import React, { useEffect, useState } from 'react';
import {
  Repeat,
  Plus,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  Eye,
  Trash2,
  Calendar,
  BookOpen,
} from 'lucide-react';
import { loansService } from '../services/loans.service';
import { membersService } from '../services/members.service';
import { booksService } from '../services/books.service';
import { Loan, Member, Book } from '../types';
import { Modal } from '../components/Modal';
import { StatusBadge } from '../components/StatusBadge';

export const LoansPage: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // New Loan Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Detail Modal
  const [viewingLoan, setViewingLoan] = useState<Loan | null>(null);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const data = await loansService.getLoans({
        status: statusFilter || undefined,
      });
      setLoans(data);
    } catch (err) {
      console.error('Error fetching loans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, [statusFilter]);

  const handleOpenCreateModal = async () => {
    setCreateError(null);
    setSelectedMemberId('');
    setSelectedBookIds([]);
    try {
      const [mData, bData] = await Promise.all([
        membersService.getMembers(),
        booksService.getBooks({ available_only: true }),
      ]);
      setMembers(mData);
      setBooks(bData);
      setIsCreateModalOpen(true);
    } catch (err: any) {
      alert(`Error al cargar datos auxiliares: ${err.message}`);
    }
  };

  const handleAddBookToSelection = (bookId: string) => {
    if (!bookId) return;
    if (selectedBookIds.includes(bookId)) {
      setCreateError('No se puede incluir el mismo libro dos veces en el mismo préstamo (Regla RN-05)');
      return;
    }
    if (selectedBookIds.length >= 3) {
      setCreateError('No se puede prestar más de 3 libros por operación');
      return;
    }

    const currentMember = members.find((m) => m.id === selectedMemberId);
    const existingActive = currentMember?.active_loans_count || 0;
    if (existingActive + selectedBookIds.length + 1 > 3) {
      setCreateError(
        `El socio ya tiene ${existingActive} libro(s) y el límite total permitido es 3 (Regla RN-01)`
      );
      return;
    }

    setCreateError(null);
    setSelectedBookIds([...selectedBookIds, bookId]);
  };

  const handleRemoveBookFromSelection = (index: number) => {
    const updated = [...selectedBookIds];
    updated.splice(index, 1);
    setSelectedBookIds(updated);
    setCreateError(null);
  };

  const handleCreateLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) {
      setCreateError('Debe seleccionar un socio afiliado');
      return;
    }
    if (selectedBookIds.length === 0) {
      setCreateError('Debe incluir al menos un libro en el préstamo');
      return;
    }

    setCreateError(null);
    setSubmitting(true);

    try {
      await loansService.createLoan({
        member_id: selectedMemberId,
        book_ids: selectedBookIds,
      });
      setCreateSuccess('Préstamo registrado exitosamente con plazo de 14 días');
      setIsCreateModalOpen(false);
      fetchLoans();
      setTimeout(() => setCreateSuccess(null), 4000);
    } catch (err: any) {
      setCreateError(err?.message || 'Error al procesar el préstamo');
    } finally {
      setSubmitting(false);
    }
  };

  const currentMemberObj = members.find((m) => m.id === selectedMemberId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Terminal de Préstamos</h2>
          <p className="text-xs text-slate-500">
            Control de circulación, plazos fijos de 14 días y validación de reglas de negocio
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Nuevo Préstamo</span>
        </button>
      </div>

      {createSuccess && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-center space-x-3 text-emerald-800 text-sm">
          <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          <span>{createSuccess}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Todos los Estados</option>
            <option value="open">Abiertos (En Curso)</option>
            <option value="overdue">En Mora (Vencidos)</option>
            <option value="closed">Cerrados (Devueltos)</option>
          </select>
        </div>
      </div>

      {/* Loans Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-6">ID Préstamo</th>
                <th className="py-3 px-6">Socio</th>
                <th className="py-3 px-6">Libros</th>
                <th className="py-3 px-6">Fecha Préstamo</th>
                <th className="py-3 px-6">Fecha Vencimiento</th>
                <th className="py-3 px-6 text-center">Estado</th>
                <th className="py-3 px-6 text-right">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loans.map((loan) => (
                <tr key={loan.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-6 font-mono text-slate-500 text-[11px]">
                    {loan.id.substring(0, 8)}...
                  </td>
                  <td className="py-3.5 px-6">
                    <p className="font-bold text-slate-900">{loan.member_name || 'Socio'}</p>
                    <p className="text-slate-400 text-[11px]">{loan.member_document}</p>
                  </td>
                  <td className="py-3.5 px-6">
                    <span className="font-semibold text-slate-700">
                      {loan.items?.length || 0} ejemplar(es):
                    </span>
                    <p className="text-slate-500 truncate max-w-xs">
                      {loan.items?.map((it) => it.book_title).join(', ')}
                    </p>
                  </td>
                  <td className="py-3.5 px-6 text-slate-600">{loan.loaned_at}</td>
                  <td className="py-3.5 px-6 text-slate-600">{loan.due_date}</td>
                  <td className="py-3.5 px-6 text-center">
                    <StatusBadge status={loan.status} />
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <button
                      onClick={() => setViewingLoan(loan)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                      title="Ver Detalle"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {loans.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Repeat className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    No se encontraron préstamos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Loan Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Terminal de Préstamo - Nuevo Registro"
        maxWidth="xl"
      >
        {createError && (
          <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3 flex items-center space-x-2 text-rose-700 text-xs">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{createError}</span>
          </div>
        )}

        <form onSubmit={handleCreateLoan} className="space-y-5">
          {/* Step 1: Member Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              1. Seleccione el Socio Afiliado
            </label>
            <select
              required
              value={selectedMemberId}
              onChange={(e) => {
                setSelectedMemberId(e.target.value);
                setCreateError(null);
              }}
              className="mt-1 w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">-- Buscar y seleccionar socio --</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.document_type}: {m.document_number}) &mdash; Libros activos:{' '}
                  {m.active_loans_count || 0}/3 {m.has_overdue ? '[EN MORA]' : ''}
                </option>
              ))}
            </select>

            {currentMemberObj?.has_overdue && (
              <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center">
                <AlertCircle className="h-3.5 w-3.5 mr-1" />
                Este socio tiene préstamos en mora. No es posible generar nuevos préstamos (Regla RN-02).
              </p>
            )}
          </div>

          {/* Step 2: Book Selection */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                2. Agregar Libros al Préstamo (Máximo 3)
              </label>
              <span className="text-xs font-bold text-slate-500">
                {selectedBookIds.length} / 3 seleccionados
              </span>
            </div>

            <div className="mt-1 flex gap-2">
              <select
                id="bookSelect"
                disabled={selectedBookIds.length >= 3 || currentMemberObj?.has_overdue}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100"
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddBookToSelection(e.target.value);
                    e.target.value = '';
                  }
                }}
              >
                <option value="">-- Seleccionar libro disponible para agregar --</option>
                {books.map((b) => (
                  <option
                    key={b.id}
                    value={b.id}
                    disabled={selectedBookIds.includes(b.id) || b.available_copies <= 0}
                  >
                    {b.title} (Disp: {b.available_copies}) - {b.isbn}
                  </option>
                ))}
              </select>
            </div>

            {/* List of selected books */}
            <div className="mt-3 space-y-2">
              {selectedBookIds.map((bid, index) => {
                const book = books.find((b) => b.id === bid);
                return (
                  <div
                    key={bid}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4 text-emerald-600" />
                      <span className="font-bold text-slate-800">{book?.title || bid}</span>
                      <span className="text-slate-400 font-mono text-[11px]">({book?.isbn})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveBookFromSelection(index)}
                      className="text-slate-400 hover:text-rose-600 transition-all p-1"
                      title="Quitar libro"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
              {selectedBookIds.length === 0 && (
                <p className="text-xs text-slate-400 italic text-center py-3 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  Ningún libro seleccionado para este préstamo aún.
                </p>
              )}
            </div>
          </div>

          {/* Info Banner */}
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 flex items-start space-x-2 text-blue-800 text-xs">
            <Calendar className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600" />
            <div>
              <p className="font-semibold">Plazo Oficial de Devolución: 14 Días Calendario</p>
              <p className="text-blue-700 mt-0.5 text-[11px]">
                La fecha de devolución se calcula de forma automática e inmutable según la especificación de negocio (RN-06).
              </p>
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={
                submitting ||
                selectedBookIds.length === 0 ||
                !selectedMemberId ||
                currentMemberObj?.has_overdue
              }
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
            >
              {submitting ? 'Procesando...' : 'Confirmar Préstamo'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Detail Modal */}
      {viewingLoan && (
        <Modal
          isOpen={!!viewingLoan}
          onClose={() => setViewingLoan(null)}
          title={`Detalle del Préstamo #${viewingLoan.id.substring(0, 8)}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <p className="text-slate-400 text-[11px]">Socio Afiliado</p>
                <p className="font-bold text-slate-900 text-sm mt-0.5">
                  {viewingLoan.member_name || 'Socio'}
                </p>
                <p className="text-slate-500 font-mono">{viewingLoan.member_document}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[11px]">Estado General</p>
                <div className="mt-1">
                  <StatusBadge status={viewingLoan.status} />
                </div>
                <p className="text-slate-500 mt-1">Vence: {viewingLoan.due_date}</p>
              </div>
            </div>

            <div>
              <p className="font-bold text-slate-900 mb-2">Libros Comprendidos en este Préstamo:</p>
              <div className="space-y-2">
                {viewingLoan.items?.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{item.book_title}</p>
                      <p className="text-slate-500 font-mono text-[11px]">
                        ISBN: {item.isbn} &bull; {item.category_name}
                      </p>
                    </div>
                    <div>
                      {item.returned_at ? (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold text-[11px]">
                          Devuelto el {item.returned_at}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px]">
                          En Préstamo
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingLoan(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
