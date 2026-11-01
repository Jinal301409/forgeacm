/**
 * CivicLens AI - Centralized API Client Utilities
 * Automatically routes API requests through VITE_API_BASE_URL if configured (e.g. standalone Vercel frontend),
 * or relative origin when running unified full-stack (e.g. Render / local dev).
 */

export const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

export function apiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (!API_BASE) return cleanPath;
  return `${API_BASE}${cleanPath}`;
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(apiUrl(path), init);
}

/**
 * Safely validates HTTP response and parses JSON, preventing "Unexpected token '<'"
 * errors when HTML or non-JSON responses are returned.
 */
export async function safeJson<T = any>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    throw new Error(
      res.ok
        ? 'Received non-JSON response from server.'
        : `Server error (${res.status}): ${text.slice(0, 100) || res.statusText}`
    );
  }
  return res.json();
}
