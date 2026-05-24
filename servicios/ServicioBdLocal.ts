import { Reporte, SensorIoT } from '../tipos';
import { apiFetch } from './apiCliente';

export const ServicioBdLocal = {
  async obtenerReportes(): Promise<Reporte[]> {
    return apiFetch<Reporte[]>('/reportes');
  },

  async guardarReporte(reporte: Omit<Reporte, 'id' | 'fecha' | 'estado'>): Promise<Reporte> {
    return apiFetch<Reporte>('/reportes', {
      method: 'POST',
      body: JSON.stringify({
        descripcion: reporte.descripcion,
        categoria: reporte.categoria,
        latitud: reporte.latitud,
        longitud: reporte.longitud,
        severidad: reporte.severidad,
        autorId: reporte.autorId,
        autorNombre: reporte.autorNombre,
        fotoUrl: reporte.fotoUrl,
      }),
    });
  },

  async obtenerReportesPorAutor(autorId: string): Promise<Reporte[]> {
    const todos = await ServicioBdLocal.obtenerReportes();
    return todos.filter((r) => r.autorId === autorId);
  },

  async obtenerReportePorId(id: string): Promise<Reporte | undefined> {
    const todos = await ServicioBdLocal.obtenerReportes();
    return todos.find((r) => r.id === id);
  },

  async obtenerSensoresIoT(modoTormenta: boolean = false): Promise<SensorIoT[]> {
    return apiFetch<SensorIoT[]>(`/sensores?tormenta=${modoTormenta}`);
  },
};
