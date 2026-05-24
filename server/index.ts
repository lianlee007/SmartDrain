import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();
import express from 'express';
import cors from 'cors';
import { randomBytes } from 'crypto';
import { hashPassword, verificarPassword, debeRehashear } from './authPassword.js';
import { consultar, ejecutar, probarConexion } from './db.js';
import {
  calcularEstado,
  calcularFlujo,
  simularNivelAgua,
  simularBateria,
} from './simulacionSensores.js';
import type { Reporte, SensorIoT, Usuario } from '../tipos';

const app = express();
const PORT = Number(process.env.API_PORT || 3001);

app.use(cors());
app.use(express.json({ limit: '15mb' }));

function nuevoId(): string {
  return randomBytes(6).toString('hex');
}

function normalizarCorreo(correo: string): string {
  return correo.trim().toLowerCase();
}

interface FilaUsuario {
  id: string;
  nombre: string;
  correo: string;
  password: string;
}

interface FilaReporte {
  id: string;
  descripcion: string;
  categoria: string | null;
  latitud: number;
  longitud: number;
  severidad: Reporte['severidad'];
  estado: Reporte['estado'];
  autor_id: string;
  autor_nombre: string | null;
  foto_url: string | null;
  fecha: Date;
}

interface FilaSensor {
  id: string;
  ubicacion: string;
  latitud: number;
  longitud: number;
  nivel_agua: number;
  flujo: number;
  bateria: number;
  estado: SensorIoT['estado'];
  ultima_lectura: Date;
}

interface FilaMantenimiento {
  sensor_id: string;
  fecha: string;
  accion: string;
  tecnico: string;
}

function mapReporte(f: FilaReporte): Reporte {
  return {
    id: f.id,
    descripcion: f.descripcion,
    categoria: f.categoria ?? undefined,
    latitud: Number(f.latitud),
    longitud: Number(f.longitud),
    severidad: f.severidad,
    estado: f.estado,
    autorId: f.autor_id,
    autorNombre: f.autor_nombre ?? undefined,
    fotoUrl: f.foto_url ?? undefined,
    fecha: f.fecha instanceof Date ? f.fecha.toISOString() : String(f.fecha),
  };
}

app.get('/api/salud', async (_req, res) => {
  try {
    await probarConexion();
    res.json({ ok: true, base: process.env.DB_NAME || 'smartdrain' });
  } catch (err) {
    res.status(503).json({
      ok: false,
      error: err instanceof Error ? err.message : 'Sin conexión a MySQL',
    });
  }
});

app.get('/api/auth/existe', async (req, res) => {
  try {
    const correo = normalizarCorreo(String(req.query.correo || ''));
    const filas = await consultar<{ n: number }>(
      'SELECT COUNT(*) AS n FROM usuarios WHERE correo = ? AND id != ?',
      [correo, 'anonimo']
    );
    res.json({ existe: filas[0]?.n > 0 });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Error' });
  }
});

app.post('/api/auth/registro', async (req, res) => {
  try {
    const { nombre, correo, password } = req.body as {
      nombre?: string;
      correo?: string;
      password?: string;
    };
    if (!nombre?.trim() || !correo?.trim() || !password) {
      return res.status(400).json({ error: 'Datos incompletos.' });
    }
    if (password.length < 4) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 4 caracteres.' });
    }
    const correoNorm = normalizarCorreo(correo);
    const existe = await consultar<{ n: number }>(
      'SELECT COUNT(*) AS n FROM usuarios WHERE correo = ?',
      [correoNorm]
    );
    if (existe[0]?.n > 0) {
      return res.status(409).json({ error: 'Ya existe una cuenta con este correo.' });
    }
    const usuario: Usuario = {
      id: nuevoId(),
      nombre: nombre.trim(),
      correo: correoNorm,
    };
    const passwordHash = await hashPassword(password);
    await ejecutar(
      'INSERT INTO usuarios (id, nombre, correo, password) VALUES (?, ?, ?, ?)',
      [usuario.id, usuario.nombre, usuario.correo, passwordHash]
    );
    res.status(201).json(usuario);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { correo, password } = req.body as { correo?: string; password?: string };
    const correoNorm = normalizarCorreo(correo || '');
    const filas = await consultar<FilaUsuario>(
      'SELECT id, nombre, correo, password FROM usuarios WHERE correo = ? AND id != ? LIMIT 1',
      [correoNorm, 'anonimo']
    );
    const cuenta = filas[0];
    if (!cuenta || !password || !(await verificarPassword(password, cuenta.password))) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
    }
    if (debeRehashear(cuenta.password)) {
      const passwordHash = await hashPassword(password);
      await ejecutar('UPDATE usuarios SET password = ? WHERE id = ?', [passwordHash, cuenta.id]);
    }
    res.json({ id: cuenta.id, nombre: cuenta.nombre, correo: cuenta.correo });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Error' });
  }
});

app.get('/api/reportes', async (_req, res) => {
  try {
    const filas = await consultar<FilaReporte>(
      `SELECT id, descripcion, categoria, latitud, longitud, severidad, estado,
              autor_id, autor_nombre, foto_url, fecha
       FROM reportes ORDER BY fecha DESC`
    );
    res.json(filas.map(mapReporte));
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Error' });
  }
});

app.post('/api/reportes', async (req, res) => {
  try {
    const body = req.body as Omit<Reporte, 'id' | 'fecha' | 'estado'> & { autorId: string };
    const id = nuevoId();
    let autorId = body.autorId || 'anonimo';

    const usuarioExiste = await consultar<{ n: number }>(
      'SELECT COUNT(*) AS n FROM usuarios WHERE id = ?',
      [autorId]
    );
    if (!usuarioExiste[0]?.n) autorId = 'anonimo';

    await ejecutar(
      `INSERT INTO reportes
        (id, descripcion, categoria, latitud, longitud, severidad, estado, autor_id, autor_nombre, foto_url)
       VALUES (?, ?, ?, ?, ?, ?, 'Pendiente', ?, ?, ?)`,
      [
        id,
        body.descripcion,
        body.categoria ?? null,
        body.latitud,
        body.longitud,
        body.severidad,
        autorId,
        body.autorNombre ?? null,
        body.fotoUrl ?? null,
      ]
    );

    const filas = await consultar<FilaReporte>(
      `SELECT id, descripcion, categoria, latitud, longitud, severidad, estado,
              autor_id, autor_nombre, foto_url, fecha
       FROM reportes WHERE id = ?`,
      [id]
    );
    res.status(201).json(mapReporte(filas[0]));
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Error' });
  }
});

app.get('/api/sensores', async (req, res) => {
  try {
    const modoTormenta = req.query.tormenta === 'true';
    const filas = await consultar<FilaSensor>('SELECT * FROM sensores ORDER BY id');
    const mantenimiento = await consultar<FilaMantenimiento>(
      'SELECT sensor_id, fecha, accion, tecnico FROM mantenimiento_sensores'
    );

    const actualizados: SensorIoT[] = [];

    for (const s of filas) {
      const nuevoNivel = simularNivelAgua(s.id, s.nivel_agua, modoTormenta);
      const estado = calcularEstado(nuevoNivel);
      const nuevoFlujo = calcularFlujo(nuevoNivel);
      const nuevaBateria = simularBateria(s.bateria, modoTormenta);

      await ejecutar(
        `UPDATE sensores SET nivel_agua = ?, flujo = ?, bateria = ?, estado = ?, ultima_lectura = NOW() WHERE id = ?`,
        [nuevoNivel, nuevoFlujo, nuevaBateria, estado, s.id]
      );

      actualizados.push({
        id: s.id,
        ubicacion: s.ubicacion,
        latitud: Number(s.latitud),
        longitud: Number(s.longitud),
        nivelAgua: nuevoNivel,
        flujo: nuevoFlujo,
        bateria: nuevaBateria,
        estado,
        ultimaLectura: new Date().toISOString(),
        historialMantenimiento: mantenimiento
          .filter((m) => m.sensor_id === s.id)
          .map((m) => ({
            fecha: String(m.fecha).slice(0, 10),
            accion: m.accion,
            tecnico: m.tecnico,
          })),
      });
    }

    res.json(actualizados);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Error' });
  }
});

app.listen(PORT, () => {
  console.log(`API SmartDrain → http://localhost:${PORT}`);
  probarConexion()
    .then(() => console.log(`MySQL conectado (${process.env.DB_NAME || 'smartdrain'})`))
    .catch((err) => {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('No se pudo conectar a MySQL:', msg || '(sin detalle)');
      console.error('Revisa .env.local: DB_PORT=3307, DB_USER, DB_PASSWORD. Reinicia: npm run dev:all');
    });
});
