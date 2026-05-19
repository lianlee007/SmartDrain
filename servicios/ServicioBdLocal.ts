import { Reporte, SensorIoT } from '../tipos';

const CLAVE_REPORTES = 'smartdrain_reportes';

const SENSORES_RED: SensorIoT[] = [
  { 
    id: 's1', ubicacion: 'Centro Histórico (Parque Caldas)', latitud: 2.4418, longitud: -76.6063, 
    nivelAgua: 25, flujo: 1.2, bateria: 98, estado: 'Normal', ultimaLectura: new Date().toISOString(),
    historialMantenimiento: [{ fecha: '2024-03-10', accion: 'Limpieza de rejilla', tecnico: 'Juan G.' }]
  },
  { 
    id: 's2', ubicacion: 'Sector Campanario', latitud: 2.4578, longitud: -76.5912, 
    nivelAgua: 85, flujo: 0.4, bateria: 76, estado: 'Critico', ultimaLectura: new Date().toISOString(),
    historialMantenimiento: [{ fecha: '2024-04-01', accion: 'Cambio de batería', tecnico: 'Ana M.' }]
  },
  { 
    id: 's3', ubicacion: 'Barrio Bolívar', latitud: 2.4461, longitud: -76.6015, 
    nivelAgua: 60, flujo: 1.8, bateria: 88, estado: 'Alerta', ultimaLectura: new Date().toISOString()
  },
  { id: 's4', ubicacion: 'Pomona', latitud: 2.4485, longitud: -76.5891, nivelAgua: 10, flujo: 1.1, bateria: 95, estado: 'Normal', ultimaLectura: new Date().toISOString() },
  { id: 's5', ubicacion: 'Terminal de Transportes', latitud: 2.4526, longitud: -76.6066, nivelAgua: 15, flujo: 2.1, bateria: 92, estado: 'Normal', ultimaLectura: new Date().toISOString() },
  { id: 's6', ubicacion: 'Hospital Universitario San José', latitud: 2.4442, longitud: -76.6025, nivelAgua: 30, flujo: 1.5, bateria: 84, estado: 'Normal', ultimaLectura: new Date().toISOString() },
  { id: 's7', ubicacion: 'Comuna 2 (Bello Horizonte)', latitud: 2.4632, longitud: -76.5821, nivelAgua: 45, flujo: 0.9, bateria: 81, estado: 'Normal', ultimaLectura: new Date().toISOString() },
  { id: 's8', ubicacion: 'El Empedrado', latitud: 2.4385, longitud: -76.6045, nivelAgua: 75, flujo: 0.3, bateria: 99, estado: 'Alerta', ultimaLectura: new Date().toISOString() },
];

export const ServicioBdLocal = {
  obtenerReportes: (): Reporte[] => {
    const data = localStorage.getItem(CLAVE_REPORTES);
    return data ? JSON.parse(data) : [];
  },

  guardarReporte: (reporte: Omit<Reporte, 'id' | 'fecha' | 'estado'>): Reporte => {
    const reportes = ServicioBdLocal.obtenerReportes();
    const nuevoReporte: Reporte = {
      ...reporte,
      id: Math.random().toString(36).slice(2, 11),
      fecha: new Date().toISOString(),
      estado: 'Pendiente',
    };
    reportes.push(nuevoReporte);
    localStorage.setItem(CLAVE_REPORTES, JSON.stringify(reportes));
    return nuevoReporte;
  },

  obtenerReportesPorAutor: (autorId: string): Reporte[] =>
    ServicioBdLocal.obtenerReportes().filter((r) => r.autorId === autorId),

  obtenerReportePorId: (id: string): Reporte | undefined =>
    ServicioBdLocal.obtenerReportes().find((r) => r.id === id),

  obtenerSensoresIoT: (modoTormenta: boolean = false): Promise<SensorIoT[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const sensoresActualizados = SENSORES_RED.map(s => {
          let varacion = Math.floor(Math.random() * 15) - 5;
          if (modoTormenta) varacion += 20;

          let nuevoNivel = s.nivelAgua + varacion;
          if(nuevoNivel < 0) nuevoNivel = 0;
          if(nuevoNivel > 100) nuevoNivel = 100;
          
          let estado: 'Normal' | 'Alerta' | 'Critico' = 'Normal';
          if(nuevoNivel > 85) estado = 'Critico';
          else if(nuevoNivel > 55) estado = 'Alerta';

          // Flujo se reduce si el nivel es muy alto (obstrucción)
          const nuevoFlujo = Math.max(0.1, (2.5 * (1 - nuevoNivel / 110)).toFixed(1) as any);

          return { 
            ...s, 
            nivelAgua: nuevoNivel, 
            flujo: nuevoFlujo,
            estado, 
            ultimaLectura: new Date().toISOString() 
          };
        });
        resolve(sensoresActualizados);
      }, 300);
    });
  }
};
