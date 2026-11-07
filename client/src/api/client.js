// Fetch wrapper: adds JWT, parses the uniform { error: { message, code, fields, details } } shape.

const TOKEN_KEY = 'cleaningos_token';

export const tokenStore = {
  get() {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  },
  set(t) {
    try { localStorage.setItem(TOKEN_KEY, t); } catch { /* storage blocked — session lasts until reload */ }
  },
  clear() {
    try { localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
  },
};

export class ApiError extends Error {
  constructor(status, { message, code, fields, details } = {}) {
    super(message || 'Request failed');
    this.status = status;
    this.code = code;
    this.fields = fields || {};
    this.details = details;
  }
}

export const UNAUTHORIZED_EVENT = 'cleaningos:unauthorized';

export async function request(path, { method = 'GET', body, query, raw = false } = {}) {
  const qs = query
    ? '?' + new URLSearchParams(Object.entries(query).filter(([, v]) => v !== undefined && v !== null && v !== '')).toString()
    : '';
  const headers = {};
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(`/api${path}${qs}`, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
  } catch {
    throw new ApiError(0, { message: 'Cannot reach the server. Is the API running?', code: 'NETWORK' });
  }

  if (res.status === 401 && path !== '/auth/login') {
    tokenStore.clear();
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  }
  if (!res.ok) {
    let payload = {};
    try { payload = (await res.json()).error || {}; } catch { /* non-JSON error */ }
    throw new ApiError(res.status, payload);
  }
  if (raw) return res;
  if (res.status === 204) return null;
  return res.json();
}

/** Download a file from an authenticated endpoint. */
export async function download(path, query, filename) {
  const res = await request(path, { query, raw: true });
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
