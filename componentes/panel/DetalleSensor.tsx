/**
 * Panel lateral o modal con el detalle de un nodo IoT.
 * Métricas en vivo, recomendación operativa, gráfica de tendencia e historial de mantenimiento.
 */
import React from 'react';
import {
  X,
  Battery,
  Waves,
  Gauge,
  MapPin,
  Clock,
  Wrench,
  AlertTriangle,
} from 'lucide-react';
import { SensorIoT } from '../../tipos';
import {
  INFO_ESTADO_SENSOR,
  colorNivel,
  recomendacionSensor,
  generarHistorialSensor,
} from '../../utilidades/metricasRed';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { estiloTooltipGrafica } from '../../utilidades/estilosTema';

interface Props {
  sensor: SensorIoT;
  onCerrar: () => void;
}

export const DetalleSensor: React.FC<Props> = ({ sensor, onCerrar }) => {
  const info = INFO_ESTADO_SENSOR[sensor.estado];
  // Serie sintética para la gráfica según el nivel actual del sensor
  const historial = React.useMemo(
    () => generarHistorialSensor(sensor.nivelAgua),
    [sensor.id, sensor.nivelAgua]
  );

  return (
    <div className={`card-premium rounded-3xl p-6 border-l-4 ${info.borde} flex flex-col gap-4`}>
      {/* Cabecera: identificación, estado y cierre */}
      <div className="flex justify-between items-start gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Nodo IoT · {sensor.id}
          </p>
          <h3 className="font-heading font-bold text-lg text-gray-900 dark:text-white mt-1">
            {sensor.ubicacion}
          </h3>
          <span
            className={`inline-block mt-2 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg ${info.fondo} ${info.texto}`}
          >
            {info.etiqueta} — {sensor.estado}
          </span>
        </div>
        <button
          type="button"
          onClick={onCerrar}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Cerrar detalle"
        >
          <X className="h-4 w-4 text-slate-500" />
        </button>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-l-2 border-slate-300 dark:border-slate-600 pl-3">
        {info.descripcion}
      </p>

      {/* Cuadrícula de métricas principales del nodo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricaMini
          icono={Gauge}
          etiqueta="Nivel de agua"
          valor={`${sensor.nivelAgua}%`}
          explicacion="Ocupación del colector (0–100%). >58% alerta, >85% crítico."
        />
        <MetricaMini
          icono={Waves}
          etiqueta="Flujo"
          valor={`${sensor.flujo} m³/s`}
          explicacion="Caudal estimado. Baja si hay obstrucción con nivel alto."
        />
        <MetricaMini
          icono={Battery}
          etiqueta="Batería nodo"
          valor={`${sensor.bateria}%`}
          explicacion="Energía del sensor remoto. <20% requiere mantenimiento."
        />
        <MetricaMini
          icono={MapPin}
          etiqueta="GPS"
          valor={`${sensor.latitud.toFixed(4)}`}
          explicacion={`Longitud ${sensor.longitud.toFixed(4)} — Popayán`}
        />
      </div>

      {/* Barra de progreso del nivel de agua en el colector */}
      <div>
        <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500 mb-1">
          <span>Llenado del colector</span>
          <span>{sensor.nivelAgua}%</span>
        </div>
        <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${sensor.nivelAgua}%`, backgroundColor: colorNivel(sensor.nivelAgua) }}
          />
        </div>
      </div>

      {/* Acción sugerida según estado y lecturas del sensor */}
      <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-400">
            Recomendación operativa
          </p>
          <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">
            {recomendacionSensor(sensor)}
          </p>
        </div>
      </div>

      {/* Gráfica de área con historial simulado de nivel */}
      <div className="h-[140px]">
        <p className="text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest">
          Tendencia de nivel (últimas horas)
        </p>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={historial}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
            <XAxis dataKey="hora" tick={{ fontSize: 9 }} stroke="#64748b" />
            <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} stroke="#64748b" unit="%" />
            <Tooltip contentStyle={estiloTooltipGrafica()} />
            <Area
              type="monotone"
              dataKey="nivel"
              name="Nivel %"
              stroke={colorNivel(sensor.nivelAgua)}
              fill={colorNivel(sensor.nivelAgua)}
              fillOpacity={0.15}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Listado opcional de intervenciones registradas en el nodo */}
      {sensor.historialMantenimiento && sensor.historialMantenimiento.length > 0 && (
        <div>
          <p className="text-[10px] font-black uppercase text-slate-500 mb-2 flex items-center gap-1">
            <Wrench className="h-3 w-3" /> Mantenimiento reciente
          </p>
          <ul className="space-y-2">
            {sensor.historialMantenimiento.map((m, i) => (
              <li
                key={i}
                className="text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
              >
                <span className="font-bold text-slate-800 dark:text-slate-200">{m.fecha}</span>
                {' — '}
                {m.accion}
                <span className="text-slate-500"> ({m.tecnico})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-[9px] text-slate-500 flex items-center gap-1">
        <Clock className="h-3 w-3" />
        Última lectura:{' '}
        {new Date(sensor.ultimaLectura).toLocaleString('es-CO', {
          dateStyle: 'short',
          timeStyle: 'medium',
        })}
      </p>
    </div>
  );
};

/** Celda pequeña con icono, etiqueta y valor; tooltip con la explicación técnica */
const MetricaMini: React.FC<{
  icono: React.ComponentType<{ className?: string }>;
  etiqueta: string;
  valor: string;
  explicacion: string;
}> = ({ icono: Icono, etiqueta, valor, explicacion }) => (
  <div
    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800"
    title={explicacion}
  >
    <Icono className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-500 mb-1" />
    <p className="text-[9px] font-black uppercase text-slate-500 tracking-wide">{etiqueta}</p>
    <p className="text-sm font-black text-gray-900 dark:text-white tabular-nums">{valor}</p>
  </div>
);
