/**
 * Cliente HTTP base del frontend hacia el API Express (/api).
 * Unifica headers JSON, parseo de errores y lanzamiento de excepciones.
 */
const API_BASE = '/api';

/**
 * fetch tipado: lanza Error con mensaje del servidor si !res.ok.
 */
export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  let data: { error?: string } = {};
  try {
    data = await res.json();
  } catch {
    /* respuesta vacía */
  }

  if (!res.ok) {
    throw new Error(data.error || `Error ${res.status}`);
  }

  return data as T;
}
