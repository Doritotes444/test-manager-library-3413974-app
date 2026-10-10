import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
} from 'lucide-react';
import { booksService } from '../services/books.service';
import { Book, Category } from '../types';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { StatusBadge } from '../components/StatusBadge';

export const BooksPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category_id: '',
    total_copies: 1,
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const data = await booksService.getBooks({
        search: search || undefined,
        category_id: selectedCategory || undefined,
        available_only: onlyAvailable ? true : undefined,
      });
      setBooks(data);
    } catch (err) {
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await booksService.getCategories();
        setCategories(cats);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [search, selectedCategory, onlyAvailable]);

  const handleOpenCreateModal = () => {
    setEditingBook(null);
    setFormData({
      title: '',
      author: '',
      isbn: '',
      category_id: categories[0]?.id || '',
      total_copies: 1,
    });
    setCoverFile(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (book: Book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category_id: book.category_id,
      total_copies: book.total_copies,
    });
    setCoverFile(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const form = new FormData();
      form.append('title', formData.title);
      form.append('author', formData.author);
      form.append('category_id', formData.category_id);
      form.append('total_copies', String(formData.total_copies));

      if (coverFile) {
        form.append('cover', coverFile);
      }

      if (editingBook) {
        await booksService.updateBook(editingBook.id, form);
        setActionSuccess('Libro actualizado exitosamente');
      } else {
        form.append('isbn', formData.isbn);
        await booksService.createBook(form);
        setActionSuccess('Libro registrado exitosamente');
      }

      setIsModalOpen(false);
      fetchBooks();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setFormError(err?.message || 'Error al guardar el libro');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBook = async (book: Book) => {
    if (!window.confirm(`¿Está seguro de dar de baja el libro "${book.title}"?`)) {
      return;
    }

    try {
      await booksService.deleteBook(book.id);
      setActionSuccess(`Libro "${book.title}" dado de baja correctamente.`);
      fetchBooks();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      alert(`No se pudo dar de baja: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Catálogo de Libros</h2>
          <p className="text-xs text-slate-500">
            Consulta de ejemplares, control de stock y clasificación por categorías
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo Libro</span>
          </button>
        )}
      </div>

      {actionSuccess && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-center space-x-3 text-emerald-800 text-sm">
          <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por título, autor o ISBN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Todas las Categorías</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center space-x-2 text-xs font-medium text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span>Solo disponibles</span>
          </label>
        </div>
      </div>

      {/* Books Table / Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-6">Carátula</th>
                <th className="py-3 px-6">Título & Autor</th>
                <th className="py-3 px-6">ISBN-13</th>
                <th className="py-3 px-6">Categoría</th>
                <th className="py-3 px-6 text-center">Stock Disponible</th>
                <th className="py-3 px-6 text-center">Estado</th>
                {isAdmin && <th className="py-3 px-6 text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {books.map((book) => {
                const isOutOfStock = book.available_copies <= 0;
                const isDeleted = !!book.deleted_at;

                return (
                  <tr
                    key={book.id}
                    className={`hover:bg-slate-50/50 ${isDeleted ? 'opacity-50 bg-slate-50' : ''}`}
                  >
                    <td className="py-3 px-6">
                      <div className="h-12 w-9 rounded-md bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                        {book.cover_image ? (
                          <img
                            src={book.cover_image}
                            alt={book.title}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              // Fallback on image error
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-slate-300" />
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-6">
                      <p className="font-bold text-slate-900">{book.title}</p>
                      <p className="text-slate-500">{book.author}</p>
                    </td>

                    <td className="py-3 px-6 font-mono text-slate-600">{book.isbn}</td>

                    <td className="py-3 px-6">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                        {book.category_name || 'General'}
                      </span>
                    </td>

                    <td className="py-3 px-6 text-center">
                      <span
                        className={`font-bold ${
                          isOutOfStock ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {book.available_copies}
                      </span>
                      <span className="text-slate-400"> / {book.total_copies}</span>
                    </td>

                    <td className="py-3 px-6 text-center">
                      {isDeleted ? (
                        <StatusBadge status="deleted" />
                      ) : isOutOfStock ? (
                        <StatusBadge status="out_of_stock" />
                      ) : (
                        <StatusBadge status="available" />
                      )}
                    </td>

                    {isAdmin && (
                      <td className="py-3 px-6 text-right">
                        {!isDeleted ? (
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleOpenEditModal(book)}
                              title="Editar libro"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteBook(book)}
                              title="Dar de baja"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Baja</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}

              {books.length === 0 && !loading && (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="py-12 text-center text-slate-400">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    No se encontraron libros que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBook ? 'Editar Ejemplar' : 'Registrar Nuevo Libro en Catálogo'}
        maxWidth="lg"
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
              Título del Libro
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Ej: Cien Años de Soledad"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Autor
              </label>
              <input
                type="text"
                required
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Ej: Gabriel García Márquez"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                ISBN-13 (13 dígitos)
              </label>
              <input
                type="text"
                required
                disabled={!!editingBook}
                maxLength={13}
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100 disabled:text-slate-400"
                placeholder="9780307474728"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Categoría
              </label>
              <select
                required
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Total de Ejemplares (&ge; 1)
              </label>
              <input
                type="number"
                min={1}
                required
                value={formData.total_copies}
                onChange={(e) =>
                  setFormData({ ...formData, total_copies: parseInt(e.target.value) || 1 })
                }
                className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Carátula / Portada (Opcional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
              className="mt-1 block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
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
              {submitting ? 'Guardando...' : editingBook ? 'Actualizar Libro' : 'Crear Libro'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
