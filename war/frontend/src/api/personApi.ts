import { apiRequest } from './client';
import { PersonDto } from '../types';

export function fetchPersons(): Promise<PersonDto[]> {
  return apiRequest<PersonDto[]>('/persons');
}

export function fetchPerson(id: number | string): Promise<PersonDto> {
  return apiRequest<PersonDto>(`/persons/${id}`);
}

export function createPerson(data: Record<string, unknown>): Promise<PersonDto> {
  return apiRequest<PersonDto>('/persons', { method: 'POST', body: data });
}

export function updatePerson(id: number | string, data: Record<string, unknown>): Promise<PersonDto> {
  return apiRequest<PersonDto>(`/persons/${id}`, { method: 'PUT', body: data });
}

export function deletePerson(id: number | string): Promise<null> {
  return apiRequest<null>(`/persons/${id}`, { method: 'DELETE' });
}
