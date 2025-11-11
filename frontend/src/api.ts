export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

const API_BASE = 'http://localhost:5001/api';

function getToken(): string | null {
  return localStorage.getItem('token');
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}

export async function apiFetch<T>(
  path: string,
  opts: { method?: HttpMethod; body?: any; auth?: boolean } = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (opts.auth !== false) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method: opts.method || 'GET',
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return (await res.json().catch(() => ({}))) as T;
}

// Auth
export async function login(params: { email: string; password: string }) {
  // Nest controller: POST /api/auth/login -> { access_token, user? }
  const data = await apiFetch<{ access_token: string; user?: any }>(
    '/auth/login',
    { method: 'POST', body: params, auth: false }
  );
  setToken(data.access_token);
  return data;
}

// Devices
export const DevicesAPI = {
  list: () => apiFetch<any[]>('/devices'),
  get: (id: string) => apiFetch<any>(`/devices/${id}`),
  create: (payload: Record<string, unknown>) =>
    apiFetch<any>('/devices', { method: 'POST', body: payload }),
  update: (id: string, payload: Record<string, unknown>) =>
    apiFetch<any>(`/devices/${id}`, { method: 'PUT', body: payload }),
  remove: (id: string) =>
    apiFetch<{ ok: boolean }>(`/devices/${id}`, { method: 'DELETE' }),
  command: (payload: { deviceId: string; command: string; payload?: any }) =>
    apiFetch<any>('/devices/command', { method: 'POST', body: payload })
};

// Pumps
export const PumpsAPI = {
  list: () => apiFetch<any[]>('/pumps'),
  get: (id: string) => apiFetch<any>(`/pumps/${id}`),
  create: (payload: Record<string, unknown>) =>
    apiFetch<any>('/pumps', { method: 'POST', body: payload }),
  remove: (id: string) => apiFetch<any>(`/pumps/${id}`, { method: 'DELETE' }),
  toggle: (id: string) =>
    apiFetch<any>(`/pumps/${id}/toggle`, { method: 'PUT' }),
  swap: (payload: { pump1Id: string; pump2Id: string }) =>
    apiFetch<any>('/pumps/swap', { method: 'POST', body: payload }),
  updateStatus: (
    id: string,
    payload: {
      waterLevel?: number;
      wifiConnected?: boolean;
      waterUsage?: number;
      electricityUsage?: number;
    }
  ) => apiFetch<any>(`/pumps/${id}/status`, { method: 'PUT', body: payload }),
  command: (id: string, payload: Record<string, unknown>) =>
    apiFetch<any>(`/pumps/${id}/command`, { method: 'POST', body: payload }),
  data: (id: string) => apiFetch<any>(`/pumps/${id}/data`)
};

// Monitoring
export const MonitoringAPI = {
  record: (payload: {
    pumpId: string;
    waterUsage: number;
    electricityUsage: number;
  }) => apiFetch<any>('/monitoring/usage', { method: 'POST', body: payload }),
  daily: (pumpId: string, days = 30) =>
    apiFetch<any[]>(`/monitoring/usage/daily/${pumpId}?days=${days}`),
  monthly: (pumpId: string, months = 12) =>
    apiFetch<any[]>(`/monitoring/usage/monthly/${pumpId}?months=${months}`),
  total: () =>
    apiFetch<{ totalWater: number; totalElectricity: number }>(
      '/monitoring/usage/total'
    )
};

export function signOut() {
  setToken(null);
}
