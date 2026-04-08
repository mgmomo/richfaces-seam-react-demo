import { apiRequest } from './client';
import { User } from '../types';

export function fetchCurrentUser(): Promise<User> {
  return apiRequest<User>('/auth/me');
}
