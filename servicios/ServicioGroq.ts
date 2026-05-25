/**
 * Integración con Groq (LLM) para análisis operativo y evaluación de reportes.
 * Si no hay API key o falla la red, usa respuestas locales deterministas.
 */
import { DatosClima, Reporte, SensorIoT } from '../tipos';

const ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

/** Datos que se envían al modelo para contextualizar Popayán. */
export interface ContextoOperativo {
  sensores: SensorIoT[];
  clima?: DatosClima | null;
  reportes?: Reporte[];
  modoTormenta?: boolean;
}

export interface ResultadoGroq {
  texto: string;
  origen: 'groq' | 'local';
}

/** Lee VITE_GROQ_* o GROQ_* según entorno Vite/servidor. */
function obtenerConfig() {
  const apiKey =
    import.meta.env.VITE_GROQ_API_KEY?.trim() ||
    import.meta.env.GROQ_API_KEY?.trim() ||
    '';
  const modelo =
    import.meta.env.VITE_GROQ_MODEL?.trim() ||
    import.meta.env.GROQ_MODEL?.trim() ||
    'llama-3.3-70b-versatile';
  return { apiKey, modelo };
}

/** Análisis sin LLM: prioriza nodos Crítico/Alerta y modo tormenta. */
function analisisRespaldoRed(ctx: ContextoOperativo): string {
  const { sensores, reportes = [], modoTormenta } = ctx;
  const criticos = sensores.filter((s) => s.estado === 'Critico');
  const alertas = sensores.filter((s) => s.estado === 'Alerta');

  let msg = '';
  if (criticos.length > 0) {
    const s = criticos[0];
    msg = `Crítico: Riesgo de desbordamiento en ${s.ubicacion} (nivel ${s.nivelAgua}%). Se recomienda brigada de limpieza inmediata.`;
  } else if (alertas.length > 0) {
    const s = alertas[0];
    msg = `Alerta: Nivel elevado en ${s.ubicacion} (${s.nivelAgua}%). Monitorear y preparar intervención preventiva.`;
  } else {
    msg = 'Red estable: nodos dentro de parámetros operativos normales.';
  }

  if (modoTormenta) msg += ' Condiciones de tormenta activas: priorizar zonas bajas y sumideros.';
  if (reportes.length > 0) msg += ` ${reportes.length} reporte(s) ciudadano(s) pendientes de revisión.`;
  return msg;
}

function evaluarReporteRespaldo(
  categoria: string,
  descripcion: string,
  severidad: string
): string {
  return `Reporte registrado como ${severidad} (${categoria}). El equipo operativo revisará: ${descripcion.slice(0, 120)}${descripcion.length > 120 ? '…' : ''}`;
}

/** Construye el bloque de contexto que recibe el prompt del chat. */
function resumenOperativo(ctx: ContextoOperativo): string {
  const { sensores, clima, reportes = [], modoTormenta } = ctx;

  const lineasSensores = sensores
    .map(
      (s) =>
        `- ${s.ubicacion}: nivel ${s.nivelAgua}%, flujo ${s.flujo} m³/s, batería ${s.bateria}%, estado ${s.estado}`
    )
    .join('\n');

  const lineasReportes =
    reportes.length === 0
      ? 'Sin reportes ciudadanos recientes.'
      : reportes
          .slice(-5)
          .map(
            (r) =>
              `- [${r.severidad}] ${r.descripcion} (${r.estado}) — ${new Date(r.fecha).toLocaleString('es-CO')}`
          )
          .join('\n');

  const climaTxt = clima
    ? `Clima Popayán: ${clima.temperatura}°C, lluvia ${clima.lluvia} mm, humedad ${clima.humedad}%, viento ${clima.viento} km/h.`
    : 'Clima: sin datos.';

  return [
    climaTxt,
    modoTormenta ? 'ALERTA METEOROLÓGICA ACTIVA en el panel.' : '',
    '\nTelemetría IoT:',
    lineasSensores,
    '\nReportes ciudadanos:',
    lineasReportes,
  ]
    .filter(Boolean)
    .join('\n');
}

/** Llamada OpenAI-compatible a Groq; sin apiKey devuelve origen local vacío. */
async function completarChat(
  system: string,
  user: string,
  maxTokens = 280
): Promise<ResultadoGroq> {
  const { apiKey, modelo } = obtenerConfig();

  if (!apiKey) {
    return { texto: '', origen: 'local' };
  }

  const resp = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelo,
      temperature: 0.4,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });

  if (!resp.ok) {
    const detalle = await resp.text().catch(() => '');
    throw new Error(`Groq ${resp.status}${detalle ? `: ${detalle.slice(0, 120)}` : ''}`);
  }

  const data = await resp.json();
  const texto = data?.choices?.[0]?.message?.content?.trim();
  if (!texto) throw new Error('Respuesta vacía de Groq');

  return { texto, origen: 'groq' };
}

export const ServicioGroq = {
  estaConfigurado: (): boolean => Boolean(obtenerConfig().apiKey),

  /** Resumen accionable de la red; fallback local si Groq no responde. */
  analizarRed: async (ctx: ContextoOperativo): Promise<ResultadoGroq> => {
    const fallback = analisisRespaldoRed(ctx);

    try {
      const resultado = await completarChat(
        'Eres un analista operativo de SmartDrain en Popayán, Colombia. Integras telemetría IoT, clima y reportes ciudadanos del alcantarillado. Responde en español, máximo 4 oraciones, tono profesional y accionable. Prioriza zonas Crítico y Alerta y cruza con reportes si existen.',
        `Analiza el estado actual de la red y recomienda acciones prioritarias:\n${resumenOperativo(ctx)}`
      );

      if (resultado.origen === 'local' && !resultado.texto) {
        return { texto: fallback, origen: 'local' };
      }
      return resultado.texto ? resultado : { texto: fallback, origen: 'local' };
    } catch (error) {
      console.error('ServicioGroq.analizarRed:', error);
      return { texto: fallback, origen: 'local' };
    }
  },

  /** Feedback al ciudadano tras crear un reporte. */
  evaluarReporte: async (
    categoria: string,
    descripcion: string,
    severidad: string,
    latitud: number,
    longitud: number
  ): Promise<ResultadoGroq> => {
    const fallback = evaluarReporteRespaldo(categoria, descripcion, severidad);

    try {
      const resultado = await completarChat(
        'Eres un asistente de SmartDrain en Popayán. Evalúas reportes ciudadanos de alcantarillado. Responde en español, máximo 2 oraciones: confirma prioridad y siguiente paso para el ciudadano.',
        `Nuevo reporte:\n- Categoría: ${categoria}\n- Severidad: ${severidad}\n- Ubicación: ${latitud.toFixed(4)}, ${longitud.toFixed(4)}\n- Descripción: ${descripcion}`,
        160
      );

      if (resultado.origen === 'local' && !resultado.texto) {
        return { texto: fallback, origen: 'local' };
      }
      return resultado.texto ? resultado : { texto: fallback, origen: 'local' };
    } catch (error) {
      console.error('ServicioGroq.evaluarReporte:', error);
      return { texto: fallback, origen: 'local' };
    }
  },
};
