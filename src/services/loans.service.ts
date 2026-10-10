import { api } from './api';
import { Loan } from '../types';

export const loansService = {
  async getLoans(params?: { status?: string; member_id?: string; from?: string; to?: string }): Promise<Loan[]> {
    const res = await api.get<any>('/loans', params);
    return Array.isArray(res) ? res : (res?.items || []);
  },

  async getLoan(id: string): Promise<Loan> {
    return api.get<Loan>(`/loans/${id}`);
  },

  async createLoan(data: { member_id: string; book_ids?: string[]; items?: Array<{ book_id: string }> }): Promise<Loan> {
    const bookIds = data.book_ids || (data.items ? data.items.map(i => i.book_id) : []);
    const items = data.items || bookIds.map(id => ({ book_id: id }));
    const payload = {
      member_id: data.member_id,
      items,
      book_ids: bookIds,
    };
    return api.post<Loan>('/loans', payload);
  },

  async returnLoanItem(loanId: string, itemId: string): Promise<Loan> {
    // Canonical REST endpoint matching api-contract.md §3.6
    return api.post<Loan>(`/loans/${loanId}/items/${itemId}/return`);
  },

  async getOverdue(): Promise<any[]> {
    const res = await api.get<any>('/loans/overdue');
    return Array.isArray(res) ? res : (res?.items || []);
  },
};
