/**
 * Contratos TypeScript compartidos entre frontend, API y servicios.
 * Define entidades de dominio: usuarios, reportes, sensores y clima.
 */

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
}

export interface RegistroMantenimiento {
  fecha: string;
  accion: string;
  tecnico: string;
}

/** Identificadores de entidades municipales que reciben reportes. */
export type EntidadReporteId = 'acueducto-popayan' | 'alcaldia-popayan' | 'bomberos-popayan';

export interface EntidadReporte {
  id: EntidadReporteId;
  nombre: string;
  descripcion: string;
}

export const ENTIDADES_DISPONIBLES: EntidadReporte[] = [
  {
    id: 'acueducto-popayan',
    nombre: 'Acueducto de Popayán',
    descripcion: 'Agua potable, alcantarillado y drenaje pluvial en la ciudad',
  },
  {
    id: 'alcaldia-popayan',
    nombre: 'Alcaldía de Popayán',
    descripcion: 'Vías, obras públicas e infraestructura urbana municipal',
  },
  {
    id: 'bomberos-popayan',
    nombre: 'Cuerpo de Bomberos',
    descripcion: 'Emergencias, inundaciones y riesgos en vía pública',
  },
];

export function nombreEntidadReporte(entidadId?: EntidadReporteId): string | null {
  if (!entidadId) return null;
  return ENTIDADES_DISPONIBLES.find((e) => e.id === entidadId)?.nombre ?? null;
}

/** Reporte ciudadano georreferenciado con flujo de revisión municipal. */
export interface Reporte {
  id: string;
  descripcion: string;
  categoria?: string;
  entidad?: EntidadReporteId;
  latitud: number;
  longitud: number;
  severidad: 'Leve' | 'Moderado' | 'Grave';
  fecha: string;
  autorId: string;
  autorNombre?: string;
  estado: 'Pendiente' | 'Revisado' | 'Solucionado';
  fotoUrl?: string;
}

/** Nodo IoT de monitoreo de nivel y caudal en alcantarillado. */
export interface SensorIoT {
  id: string;
  ubicacion: string;
  latitud: number;
  longitud: number;
  nivelAgua: number; // 0 a 100
  flujo: number; // m3/s
  bateria: number; // %
  estado: 'Normal' | 'Alerta' | 'Critico';
  ultimaLectura: string;
  historialMantenimiento?: RegistroMantenimiento[];
}

export interface DatosClima {
  temperatura: number;
  lluvia: number;
  humedad: number;
  viento: number;
}
