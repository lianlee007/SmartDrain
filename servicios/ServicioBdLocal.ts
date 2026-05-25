/**
 * Acceso a datos persistentes vía API REST (reportes y sensores IoT).
 * Nombre histórico "BdLocal": los datos viven en MySQL detrás del servidor Express.
 */
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

  /** Filtra en cliente los reportes de un autor (no hay endpoint dedicado). */
  async obtenerReportesPorAutor(autorId: string): Promise<Reporte[]> {
    const todos = await ServicioBdLocal.obtenerReportes();
    return todos.filter((r) => r.autorId === autorId);
  },

  async obtenerReportePorId(id: string): Promise<Reporte | undefined> {
    const todos = await ServicioBdLocal.obtenerReportes();
    return todos.find((r) => r.id === id);
  },

  /** tormenta=true activa simulación hidrológica agresiva en el servidor. */
  async obtenerSensoresIoT(modoTormenta: boolean = false): Promise<SensorIoT[]> {
    return apiFetch<SensorIoT[]>(`/sensores?tormenta=${modoTormenta}`);
  },
};
