/**
 * CivicLens AI - API Client Utilities
 * Automatically routes API requests through VITE_API_BASE_URL if configured (e.g. standalone Vercel frontend),
 * or relative origin when running unified full-stack (e.g. Render / local dev).
 */

export const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export function apiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (!API_BASE) return cleanPath;
  return `${API_BASE}${cleanPath}`;
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(apiUrl(path), init);
}
