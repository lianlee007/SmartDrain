/**
 * Utilidades de contraseñas para autenticación del API.
 * Usa bcrypt para hashes nuevos y acepta texto plano legacy
 * hasta migrarlos en el próximo login exitoso.
 */
import bcrypt from 'bcrypt';

const RONDAS = 10;

/** Genera hash bcrypt para almacenar en la base de datos. */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, RONDAS);
}

/** Detecta si el valor guardado ya es un hash bcrypt ($2a$, $2b$, $2y$). */
function esHashBcrypt(stored: string): boolean {
  return stored.startsWith('$2a$') || stored.startsWith('$2b$') || stored.startsWith('$2y$');
}

/**
 * Compara contraseña en texto plano con el valor almacenado.
 * Soporta hashes bcrypt y contraseñas en claro de migraciones antiguas.
 */
export async function verificarPassword(plain: string, stored: string): Promise<boolean> {
  if (!stored) return false;
  if (esHashBcrypt(stored)) {
    return bcrypt.compare(plain, stored);
  }
  return plain === stored;
}

/** Indica si tras un login válido conviene rehashear a bcrypt. */
export function debeRehashear(stored: string): boolean {
  return stored.length > 0 && !esHashBcrypt(stored);
}
