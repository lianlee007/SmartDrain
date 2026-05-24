import bcrypt from 'bcrypt';

const RONDAS = 10;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, RONDAS);
}

function esHashBcrypt(stored: string): boolean {
  return stored.startsWith('$2a$') || stored.startsWith('$2b$') || stored.startsWith('$2y$');
}

export async function verificarPassword(plain: string, stored: string): Promise<boolean> {
  if (!stored) return false;
  if (esHashBcrypt(stored)) {
    return bcrypt.compare(plain, stored);
  }
  return plain === stored;
}

export function debeRehashear(stored: string): boolean {
  return stored.length > 0 && !esHashBcrypt(stored);
}
