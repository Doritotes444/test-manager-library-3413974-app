import { api } from './api';
import { MostBorrowedReportItem } from '../types';

export const reportsService = {
  async getMostBorrowed(limit: number = 10, from?: string, to?: string): Promise<MostBorrowedReportItem[]> {
    const now = new Date();
    const defaultFrom = from || '2020-01-01';
    const defaultTo = to || now.toISOString().split('T')[0];
    const res = await api.get<any>('/reports/most-borrowed', { limit, from: defaultFrom, to: defaultTo });
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.rows)) {
      return res.rows.map((r: any) => ({
        book_id: r.book_id,
        title: r.book_title || r.title,
        author: r.author || '',
        category_name: r.category_name || '',
        borrow_count: r.times_borrowed ?? r.borrow_count ?? 0,
      }));
    }
    return [];
  },
};
