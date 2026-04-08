import { apiRequest } from './client';
import { LocationDto } from '../types';

export function fetchLocations(activeOnly = false): Promise<LocationDto[]> {
  const qs = activeOnly ? '?activeOnly=true' : '';
  return apiRequest<LocationDto[]>(`/locations${qs}`);
}

export function fetchLocation(id: number | string): Promise<LocationDto> {
  return apiRequest<LocationDto>(`/locations/${id}`);
}

export function createLocation(data: Record<string, unknown>): Promise<LocationDto> {
  return apiRequest<LocationDto>('/locations', { method: 'POST', body: data });
}

export function updateLocation(id: number | string, data: Record<string, unknown>): Promise<LocationDto> {
  return apiRequest<LocationDto>(`/locations/${id}`, { method: 'PUT', body: data });
}

export function deleteLocation(id: number | string): Promise<null> {
  return apiRequest<null>(`/locations/${id}`, { method: 'DELETE' });
}
