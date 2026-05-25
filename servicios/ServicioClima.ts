/**
 * Datos meteorológicos actuales para Popayán vía Open-Meteo.
 * Si la API falla, devuelve valores por defecto para no bloquear el panel.
 */
import { DatosClima } from '../tipos';

export const ServicioClima = {
  obtenerClimaPopayan: async (): Promise<DatosClima> => {
    try {
      const resp = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=2.4382&longitude=-76.6132&current=temperature_2m,rain,relative_humidity_2m,wind_speed_10m&timezone=America%2FBogota'
      );
      if (!resp.ok) throw new Error('Network error');
      const data = await resp.json();
      return {
        temperatura: data.current.temperature_2m ?? 0,
        lluvia: data.current.rain ?? 0,
        humedad: data.current.relative_humidity_2m ?? 0,
        viento: data.current.wind_speed_10m ?? 0,
      };
    } catch (error) {
      console.error('Error al obtener clima', error);
      return { temperatura: 22, lluvia: 0, humedad: 70, viento: 8 };
    }
  },
};
