import { apiRequest } from './client';
import { DashboardData } from '../types';

export function fetchDashboard(): Promise<DashboardData> {
  return apiRequest<DashboardData>('/dashboard');
}
