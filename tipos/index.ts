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

export interface Reporte {
  id: string;
  descripcion: string;
  categoria?: string;
  latitud: number;
  longitud: number;
  severidad: 'Leve' | 'Moderado' | 'Grave';
  fecha: string;
  autorId: string;
  autorNombre?: string;
  estado: 'Pendiente' | 'Revisado' | 'Solucionado';
  fotoUrl?: string;
}

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
