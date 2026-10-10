import { api } from './api';
import { AuthResponse, User } from '../types';

export const authService = {
  async login(username: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', { username, password });
    localStorage.setItem('ml_token', response.token);
    localStorage.setItem('ml_user', JSON.stringify(response.user));
    return response;
  },

  getCurrentUser(): User | null {
    const raw = localStorage.getItem('ml_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    return localStorage.getItem('ml_token');
  },

  logout(): void {
    localStorage.removeItem('ml_token');
    localStorage.removeItem('ml_user');
  },
};
