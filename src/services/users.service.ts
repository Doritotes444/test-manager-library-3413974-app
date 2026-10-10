import { api } from './api';
import { User } from '../types';

export const usersService = {
  async createLibrarian(data: { name: string; username: string; password: string }): Promise<User> {
    return api.post<User>('/users', data);
  },
};
