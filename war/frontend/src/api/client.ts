const BASE = '/vision4-seam/api';

interface ApiError extends Error {
  status?: number;
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: Record<string, unknown> | RequestInit['body'];
  headers?: Record<string, string>;
}

export async function apiRequest<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { ...options.headers };

  const user = localStorage.getItem('auth_user');
  const role = localStorage.getItem('auth_role');
  if (user) {
    headers['X-Remote-User'] = user;
  }
  if (role) {
    headers['X-Remote-Roles'] = role;
  }

  let body: RequestInit['body'] = undefined;
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.body);
  } else {
    body = options.body as RequestInit['body'];
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers, body });

  if (res.status === 204) {
    return null as T;
  }

  const data = await res.json();

  if (!res.ok) {
    const err: ApiError = new Error(data.message || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }

  return data as T;
}
