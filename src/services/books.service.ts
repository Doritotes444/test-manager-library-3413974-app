import { api } from './api';
import { Book, Category } from '../types';

export const booksService = {
  async getBooks(params?: { search?: string; q?: string; category_id?: string; available_only?: boolean }): Promise<Book[]> {
    const res = await api.get<any>('/books', {
      q: params?.q || params?.search,
      ...params,
    });
    return Array.isArray(res) ? res : (res?.items || []);
  },

  async getBook(id: string): Promise<Book> {
    return api.get<Book>(`/books/${id}`);
  },

  async createBook(formData: FormData): Promise<Book> {
    return api.post<Book>('/books', formData);
  },

  async updateBook(id: string, formData: FormData): Promise<Book> {
    return api.put<Book>(`/books/${id}`, formData);
  },

  async deleteBook(id: string): Promise<void> {
    return api.delete<void>(`/books/${id}`);
  },

  async getCategories(): Promise<Category[]> {
    const res = await api.get<any>('/categories');
    return Array.isArray(res) ? res : (res?.items || []);
  },
};
