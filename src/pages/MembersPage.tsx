import React, { useEffect, useState } from 'react';
import { Users, UserPlus, Search, Edit2, AlertCircle, CheckCircle, ShieldAlert } from 'lucide-react';
import { membersService } from '../services/members.service';
import { Member } from '../types';
import { Modal } from '../components/Modal';

export const MembersPage: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    document_type: 'CC',
    document_number: '',
    email: '',
    phone: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await membersService.getMembers({ search: search || undefined });
      setMembers(data);
    } catch (err) {
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [search]);

  const handleOpenCreateModal = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      document_type: 'CC',
      document_number: '',
      email: '',
      phone: '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (member: Member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      document_type: member.document_type,
      document_number: member.document_number,
      email: member.email,
      phone: member.phone,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      if (editingMember) {
        await membersService.updateMember(editingMember.id, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        });
        setActionSuccess('Datos del socio actualizados correctamente');
      } else {
        await membersService.createMember(formData);
        setActionSuccess('Socio registrado exitosamente');
      }

      setIsModalOpen(false);
      fetchMembers();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setFormError(err?.message || 'Error al procesar el socio');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Socios Afiliados</h2>
          <p className="text-xs text-slate-500">
            Registro y control de usuarios autorizados para préstamos bibliotecarios
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all"
        >
          <UserPlus className="h-4 w-4" />
          <span>Nuevo Socio</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-center space-x-3 text-emerald-800 text-sm">
          <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filter toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, documento o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Members table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-6">Nombre Completo</th>
                <th className="py-3 px-6">Tipo & Documento</th>
                <th className="py-3 px-6">Contacto</th>
                <th className="py-3 px-6 text-center">Libros en Poder</th>
                <th className="py-3 px-6 text-center">Estado para Préstamos</th>
                <th className="py-3 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((member) => {
                const activeLoansCount = member.active_loans_count || 0;
                const isAtLimit = activeLoansCount >= 3;
                const hasOverdue = !!member.has_overdue;

                return (
                  <tr key={member.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-6">
                      <p className="font-bold text-slate-900">{member.name}</p>
                    </td>

                    <td className="py-3.5 px-6 font-mono text-slate-600">
                      <span className="font-semibold text-slate-400 mr-1">
                        {member.document_type}:
                      </span>
                      {member.document_number}
                    </td>

                    <td className="py-3.5 px-6">
                      <p className="text-slate-700">{member.email}</p>
                      <p className="text-slate-400 text-[11px]">{member.phone}</p>
                    </td>

                    <td className="py-3.5 px-6 text-center">
                      <span
                        className={`font-extrabold ${
                          isAtLimit ? 'text-amber-600' : 'text-slate-700'
                        }`}
                      >
                        {activeLoansCount}
                      </span>
                      <span className="text-slate-400"> / 3 máx.</span>
                    </td>

                    <td className="py-3.5 px-6 text-center">
                      {hasOverdue ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <ShieldAlert className="h-3 w-3" />
                          <span>Mora (Bloqueado)</span>
                        </span>
                      ) : isAtLimit ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <span>Cupo Lleno (3/3)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span>Habilitado</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => handleOpenEditModal(member)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                        title="Editar socio"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {members.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Users className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    No se encontraron socios registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMember ? 'Actualizar Datos del Socio' : 'Registrar Nuevo Socio'}
        maxWidth="md"
      >
        {formError && (
          <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3 flex items-center space-x-2 text-rose-700 text-xs">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Nombre Completo
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Ej: Carlos Alberto Restrepo"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Tipo Documento
              </label>
              <select
                disabled={!!editingMember}
                value={formData.document_type}
                onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
                className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100"
              >
                <option value="CC">Cédula de Ciudadanía (CC)</option>
                <option value="TI">Tarjeta de Identidad (TI)</option>
                <option value="CE">Cédula de Extranjería (CE)</option>
                <option value="PAS">Pasaporte (PAS)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Número Documento
              </label>
              <input
                type="text"
                required
                disabled={!!editingMember}
                value={formData.document_number}
                onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
                className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100"
                placeholder="1020304050"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="carlos@ejemplo.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Teléfono de Contacto
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="3001234567"
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
            >
              {submitting ? 'Guardando...' : editingMember ? 'Guardar Cambios' : 'Registrar Socio'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
