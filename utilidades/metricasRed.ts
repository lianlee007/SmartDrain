import { SensorIoT } from '../tipos';

export interface MetricasRed {
  total: number;
  normal: number;
  alerta: number;
  critico: number;
  nivelPromedio: number;
  flujoPromedio: number;
  bateriaPromedio: number;
  bateriaMinima: number;
  ultimaLectura: string | null;
}

export function calcularMetricasRed(sensores: SensorIoT[]): MetricasRed {
  const total = sensores.length;
  if (total === 0) {
    return {
      total: 0,
      normal: 0,
      alerta: 0,
      critico: 0,
      nivelPromedio: 0,
      flujoPromedio: 0,
      bateriaPromedio: 0,
      bateriaMinima: 0,
      ultimaLectura: null,
    };
  }

  const normal = sensores.filter((s) => s.estado === 'Normal').length;
  const alerta = sensores.filter((s) => s.estado === 'Alerta').length;
  const critico = sensores.filter((s) => s.estado === 'Critico').length;
  const suma = (k: keyof SensorIoT) =>
    sensores.reduce((a, s) => a + (typeof s[k] === 'number' ? (s[k] as number) : 0), 0);

  const masReciente = sensores
    .map((s) => s.ultimaLectura)
    .sort()
    .reverse()[0];

  return {
    total,
    normal,
    alerta,
    critico,
    nivelPromedio: Math.round(suma('nivelAgua') / total),
    flujoPromedio: Number((suma('flujo') / total).toFixed(2)),
    bateriaPromedio: Math.round(suma('bateria') / total),
    bateriaMinima: Math.min(...sensores.map((s) => s.bateria)),
    ultimaLectura: masReciente ?? null,
  };
}

export const INFO_ESTADO_SENSOR = {
  Normal: {
    etiqueta: 'Operativo',
    descripcion: 'Caudal y nivel dentro de parámetros. Monitoreo de rutina.',
    color: 'emerald',
    borde: 'border-emerald-500/40',
    fondo: 'bg-emerald-500/10',
    texto: 'text-emerald-600 dark:text-emerald-400',
  },
  Alerta: {
    etiqueta: 'Atención',
    descripcion: 'Nivel elevado (58–84%). Riesgo de rebalse si persiste la lluvia.',
    color: 'orange',
    borde: 'border-orange-500/40',
    fondo: 'bg-orange-500/10',
    texto: 'text-orange-600 dark:text-orange-400',
  },
  Critico: {
    etiqueta: 'Emergencia',
    descripcion: 'Nivel crítico (≥85%). Despacho inmediato y posible cierre de vía.',
    color: 'red',
    borde: 'border-red-500/40',
    fondo: 'bg-red-500/10',
    texto: 'text-red-600 dark:text-red-400',
  },
} as const;

export function colorNivel(nivel: number): string {
  if (nivel >= 85) return '#ef4444';
  if (nivel >= 58) return '#f97316';
  return '#10b981';
}

export function recomendacionSensor(s: SensorIoT): string {
  if (s.estado === 'Critico') {
    return 'Activar brigada de emergencia, revisar sumideros aguas arriba y considerar desvío vehicular.';
  }
  if (s.estado === 'Alerta') {
    return 'Programar inspección en las próximas 2 h y mantener monitoreo continuo del nodo.';
  }
  if (s.bateria < 20) {
    return 'Nivel hidráulico estable; priorizar cambio de batería del nodo IoT.';
  }
  return 'Sin acción urgente. Mantener lectura automática y cruce con reportes ciudadanos.';
}

export function generarHistorialSensor(nivelActual: number) {
  const puntos = [
    { hora: '−75 min', offset: -18 },
    { hora: '−60 min', offset: -12 },
    { hora: '−45 min', offset: -8 },
    { hora: '−30 min', offset: -4 },
    { hora: '−15 min', offset: -2 },
    { hora: 'Ahora', offset: 0 },
  ];
  return puntos.map(({ hora, offset }) => ({
    hora,
    nivel: Math.max(0, Math.min(100, Math.round(nivelActual + offset + (Math.random() * 6 - 3)))),
  }));
}
