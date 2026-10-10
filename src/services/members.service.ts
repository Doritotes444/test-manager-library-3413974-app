import { api } from './api';
import { Member } from '../types';

export const membersService = {
  async getMembers(params?: { search?: string; q?: string }): Promise<Member[]> {
    const res = await api.get<any>('/members', {
      q: params?.q || params?.search,
      ...params,
    });
    return Array.isArray(res) ? res : (res?.items || []);
  },

  async getMember(id: string): Promise<Member> {
    return api.get<Member>(`/members/${id}`);
  },

  async createMember(data: {
    name: string;
    document_type?: string;
    document_number: string;
    email?: string;
    phone?: string;
    full_name?: string;
  }): Promise<Member> {
    const payload = {
      ...data,
      full_name: data.full_name || data.name,
      document_number: data.document_number,
    };
    return api.post<Member>('/members', payload);
  },

  async updateMember(
    id: string,
    data: {
      name?: string;
      email?: string;
      phone?: string;
      full_name?: string;
      document_number?: string;
    }
  ): Promise<Member> {
    const payload = {
      ...data,
      full_name: data.full_name || data.name,
    };
    return api.put<Member>(`/members/${id}`, payload);
  },
};
