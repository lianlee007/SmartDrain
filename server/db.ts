/**
 * Capa de acceso a MySQL para el backend de SmartDrain.
 * Carga variables desde .env.local, expone un pool de conexiones
 * y helpers para consultas SELECT y comandos INSERT/UPDATE/DELETE.
 */
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config({ path: '.env.local' });
dotenv.config();

// Pool compartido; límite de 10 conexiones simultáneas
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3307),
  user: process.env.DB_USER || 'smartdrain',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'smartdrain',
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
});

type SqlParams = (string | number | boolean | null | Date)[];

/** Ejecuta SELECT parametrizado y devuelve filas tipadas. */
export async function consultar<T>(sql: string, params: SqlParams = []): Promise<T[]> {
  const [rows] = await pool.execute(sql, params);
  return rows as T[];
}

/** Ejecuta INSERT/UPDATE/DELETE y devuelve metadatos (insertId, affectedRows, etc.). */
export async function ejecutar(sql: string, params: SqlParams = []): Promise<mysql.ResultSetHeader> {
  const [result] = await pool.execute(sql, params);
  return result as mysql.ResultSetHeader;
}

/** Comprueba que el pool puede conectar (usado en /api/salud y al arrancar). */
export async function probarConexion(): Promise<void> {
  await pool.query('SELECT 1');
}

export { pool };
