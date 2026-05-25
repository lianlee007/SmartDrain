/**
 * Simulación de telemetría IoT para nodos de drenaje en Popayán.
 * Modela perfiles por sensor, estados operativos y modo tormenta
 * sin hardware físico conectado.
 */
import type { SensorIoT } from '../tipos';

/** Perfil hidrológico por nodo (zonas bajas vs lomas) */
const PERFILES: Record<
  string,
  { nivelBase: number; volatilidad: number; sensibilidadLluvia: number }
> = {
  s1: { nivelBase: 22, volatilidad: 4, sensibilidadLluvia: 0.75 },
  s2: { nivelBase: 48, volatilidad: 6, sensibilidadLluvia: 1.35 },
  s3: { nivelBase: 34, volatilidad: 5, sensibilidadLluvia: 1.0 },
  s4: { nivelBase: 14, volatilidad: 3, sensibilidadLluvia: 0.45 },
  s5: { nivelBase: 16, volatilidad: 4, sensibilidadLluvia: 0.55 },
  s6: { nivelBase: 26, volatilidad: 4, sensibilidadLluvia: 0.65 },
  s7: { nivelBase: 38, volatilidad: 5, sensibilidadLluvia: 0.9 },
  s8: { nivelBase: 44, volatilidad: 6, sensibilidadLluvia: 1.15 },
};

const PERFIL_DEFAULT = { nivelBase: 28, volatilidad: 5, sensibilidadLluvia: 0.8 };

/** Umbrales de negocio: ≥85 Crítico, ≥58 Alerta, resto Normal. */
export function calcularEstado(nivel: number): SensorIoT['estado'] {
  if (nivel >= 85) return 'Critico';
  if (nivel >= 58) return 'Alerta';
  return 'Normal';
}

/** Caudal simulado (m³/s): menor cuando el nivel está muy alto (colapso de flujo). */
export function calcularFlujo(nivel: number): number {
  const cap = Math.max(0.15, Number((2.2 * (1 - nivel / 115)).toFixed(2)));
  if (nivel >= 85) return Math.max(0.1, Number((cap * 0.35).toFixed(2)));
  if (nivel >= 58) return Math.max(0.2, Number((cap * 0.65).toFixed(2)));
  return cap;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(n)));
}

/**
 * Avanza el nivel de agua (0–100) según perfil del sensor.
 * En modo tormenta aumenta probabilidad y magnitud de subidas.
 */
export function simularNivelAgua(
  sensorId: string,
  nivelActual: number,
  modoTormenta: boolean
): number {
  const p = PERFILES[sensorId] ?? PERFIL_DEFAULT;

  if (modoTormenta) {
    const volTormenta = p.volatilidad * 2.2;
    const ruido = (Math.random() - 0.35) * 2 * volTormenta;
    const reversion = (p.nivelBase - nivelActual) * 0.05;

    let subida = 0;
    const probLluvia = 0.72 + p.sensibilidadLluvia * 0.2;
    if (Math.random() < probLluvia) {
      subida += 5 + Math.random() * 12 * p.sensibilidadLluvia;
    }
    if (Math.random() < 0.22 * p.sensibilidadLluvia) {
      subida += 10 + Math.random() * 14;
    }
    if (p.sensibilidadLluvia >= 1 && Math.random() < 0.15) {
      subida += 6 + Math.random() * 8;
    }

    return clamp(nivelActual + ruido + reversion + subida, 0, 100);
  }

  const ruido = (Math.random() - 0.5) * 2 * (p.volatilidad * 1.35);
  const reversion = (p.nivelBase - nivelActual) * 0.12;

  let evento = 0;
  const roll = Math.random();
  if (roll < 0.22) {
    evento += 3 + Math.random() * 8;
  } else if (roll < 0.38 && nivelActual > p.nivelBase + 5) {
    evento -= 2 + Math.random() * 6;
  } else if (roll < 0.48) {
    evento += 1 + Math.random() * 4;
  }

  return clamp(nivelActual + ruido + reversion + evento, 0, 100);
}

/** Descarga gradual de batería; más rápida bajo tormenta (mayor uso del nodo). */
export function simularBateria(bateria: number, modoTormenta: boolean): number {
  if (bateria <= 5) return bateria;
  const gasto = Math.random() < (modoTormenta ? 0.14 : 0.06) ? 1 : 0;
  return Math.max(5, bateria - gasto);
}
