import React, { useEffect, useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
} from 'recharts';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { Icon } from 'leaflet';
import {
  CloudRain,
  ThermometerSun,
  AlertOctagon,
  Activity,
  MapPin,
  Battery,
  Waves,
  CloudLightning,
  Gauge,
  Radio,
  Clock,
  Wind,
  Droplets,
  HelpCircle,
  Server,
  TrendingUp,
  CircleDot,
} from 'lucide-react';
import { ServicioBdLocal } from '../servicios/ServicioBdLocal';
import { ServicioClima } from '../servicios/ServicioClima';
import { SensorIoT, DatosClima, Reporte } from '../tipos';
import { motion, AnimatePresence } from 'motion/react';
import { AnalisisIA } from '../componentes/AnalisisIA';
import { TarjetaKpi } from '../componentes/panel/TarjetaKpi';
import { DetalleSensor } from '../componentes/panel/DetalleSensor';
import {
  calcularMetricasRed,
  INFO_ESTADO_SENSOR,
  colorNivel,
} from '../utilidades/metricasRed';
import { urlCapaMapa, estiloTooltipGrafica, cursorGrafica } from '../utilidades/estilosTema';

const alertIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  className: 'hue-rotate-[140deg]',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const INTERVALO_LECTURA_MS = 15_000;

const GLOSARIO = [
  {
    termino: 'Nivel de agua (%)',
    def: 'Porcentaje de ocupaci├│n del colector. Indica riesgo de rebalse.',
  },
  {
    termino: 'Flujo (m┬│/s)',
    def: 'Caudal volum├®trico. Ca├¡da brusca con nivel alto sugiere obstrucci├│n.',
  },
  {
    termino: 'Alerta meteorol├│gica',
    def: 'Protocolo ante lluvia intensa: prioriza zonas bajas y refuerza la vigilancia de nodos cr├¡ticos.',
  },
  {
    termino: 'Reporte ciudadano',
    def: 'Incidencia georreferenciada que se cruza con la telemetr├¡a del mapa.',
  },
];

export default function PanelIoT() {
  const [sensores, setSensores] = useState<SensorIoT[]>([]);
  const [clima, setClima] = useState<DatosClima | null>(null);
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [cargando, setCargando] = useState(true);
  const [sensorSeleccionado, setSensorSeleccionado] = useState<SensorIoT | null>(null);
  const sensorSeleccionadoRef = React.useRef<SensorIoT | null>(null);
  const [modoTormenta, setModoTormenta] = useState(false);
  const [actualizandoSensores, setActualizandoSensores] = useState(false);
  const [ultimaSync, setUltimaSync] = useState<Date | null>(null);
  const modoTormentaRef = React.useRef(modoTormenta);
  modoTormentaRef.current = modoTormenta;

  const metricas = useMemo(() => calcularMetricasRed(sensores), [sensores]);
  const sensoresCriticos = useMemo(
    () => sensores.filter((s) => s.estado === 'Critico' || s.estado === 'Alerta'),
    [sensores]
  );

  React.useEffect(() => {
    sensorSeleccionadoRef.current = sensorSeleccionado;
  }, [sensorSeleccionado]);

  const aplicarSensores = (newSens: SensorIoT[]) => {
    setSensores(newSens);
    setUltimaSync(new Date());
    const sel = sensorSeleccionadoRef.current;
    if (sel) {
      const updated = newSens.find((s) => s.id === sel.id);
      if (updated) setSensorSeleccionado(updated);
    }
  };

  const refrescarSensores = React.useCallback(async (tormenta: boolean, silencioso = false) => {
    if (!silencioso) setActualizandoSensores(true);
    try {
      const newSens = await ServicioBdLocal.obtenerSensoresIoT(tormenta);
      aplicarSensores(newSens);
    } catch (e) {
      console.error(e);
    } finally {
      if (!silencioso) setActualizandoSensores(false);
    }
  }, []);

  const alternarModoTormenta = () => {
    const activo = !modoTormenta;
    setModoTormenta(activo);
    refrescarSensores(activo);
  };

  const cargarDatos = async () => {
    try {
      const clim = await ServicioClima.obtenerClimaPopayan();
      setClima(clim as DatosClima);
      const sens = await ServicioBdLocal.obtenerSensoresIoT(modoTormenta);
      aplicarSensores(sens);
      const reps = await ServicioBdLocal.obtenerReportes();
      setReportes(reps);
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
    const interval = setInterval(() => {
      refrescarSensores(modoTormentaRef.current, true);
    }, INTERVALO_LECTURA_MS);
    return () => clearInterval(interval);
  }, [modoTormenta, refrescarSensores]);

  if (cargando) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6">
        <Activity className="h-12 w-12 text-primary-500 animate-spin" />
        <p className="text-xs font-bold uppercase tracking-[0.5em] text-slate-600 dark:text-slate-400">
          Iniciando centro de despacho
        </p>
        <p className="text-[10px] text-slate-500 max-w-xs text-center">
          Sincronizando red de sensores y reportesÔÇª
        </p>
      </div>
    );
  }

  const precipMm = modoTormenta ? 92 : (clima?.lluvia ?? 0);

  return (
    <div className="max-w-[1680px] mx-auto px-4 sm:px-6 py-8 min-h-[calc(100vh-5rem)]">
      {/* Cabecera */}
      <div className="mb-6">
        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-emerald-600 dark:text-emerald-400 mb-2">
          IoT Dashboard ┬À Red de alcantarillado
        </p>
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-heading font-medium italic text-gray-900 dark:text-white leading-tight">
              Mando de resiliencia h├¡drica
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-2xl">
              Centro de control unificado para la red de alcantarillado de Popay├ín: telemetr├¡a,
              clima y participaci├│n ciudadana en un solo mando operativo.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={alternarModoTormenta}
              disabled={actualizandoSensores}
              className={`flex items-center gap-3 px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-lg disabled:opacity-70 ${
                modoTormenta
                  ? 'bg-red-600 text-white shadow-red-600/30 ring-2 ring-red-400/50'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300'
              }`}
            >
              <CloudLightning
                className={`h-5 w-5 shrink-0 ${modoTormenta ? 'animate-pulse' : ''}`}
              />
              {actualizandoSensores
                ? 'Actualizando redÔÇª'
                : modoTormenta
                  ? 'Alerta meteorol├│gica activa'
                  : 'Activar alerta meteorol├│gica'}
            </button>

            <div className="flex bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="px-4 py-3 flex items-center gap-3 border-r border-slate-200 dark:border-slate-800">
                <ThermometerSun className="text-orange-500 h-5 w-5 shrink-0" />
                <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase">Temperatura</p>
                  <p className="font-bold text-gray-900 dark:text-white">
                    {clima?.temperatura ?? 'ÔÇö'}┬░C
                  </p>
                  <p className="text-[9px] text-slate-500">Ambiente urbano</p>
                </div>
              </div>
              <div className="px-4 py-3 flex items-center gap-3 border-r border-slate-200 dark:border-slate-800">
                <CloudRain className="text-blue-500 h-5 w-5 shrink-0" />
                <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase">Precipitaci├│n</p>
                  <p className="font-bold text-gray-900 dark:text-white">{precipMm} mm</p>
                  <p className="text-[9px] text-slate-500">
                    {modoTormenta ? 'Acumulado ÔÇö evento activo' : 'Acumulado reciente'}
                  </p>
                </div>
              </div>
              <div className="px-4 py-3 flex items-center gap-3">
                <Wind className="text-sky-500 h-5 w-5 shrink-0" />
                <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase">Viento</p>
                  <p className="font-bold text-gray-900 dark:text-white">
                    {clima?.viento ?? 'ÔÇö'} km/h
                  </p>
                  <p className="text-[9px] text-slate-500">Humedad {clima?.humedad ?? 'ÔÇö'}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        <TarjetaKpi
          icono={Server}
          titulo="Nodos activos"
          valor={metricas.total}
          subtitulo="Sensores en red municipal"
          acento="slate"
        />
        <TarjetaKpi
          icono={CircleDot}
          titulo="Operativos"
          valor={metricas.normal}
          subtitulo="Estado Normal (<58%)"
          acento="emerald"
        />
        <TarjetaKpi
          icono={AlertOctagon}
          titulo="En atenci├│n"
          valor={metricas.alerta}
          subtitulo="Alerta 58ÔÇô84%"
          acento="orange"
        />
        <TarjetaKpi
          icono={AlertOctagon}
          titulo="Emergencia"
          valor={metricas.critico}
          subtitulo="Cr├¡tico ÔëÑ85%"
          acento="red"
        />
        <TarjetaKpi
          icono={Gauge}
          titulo="Nivel medio red"
          valor={`${metricas.nivelPromedio}%`}
          subtitulo={`Flujo prom. ${metricas.flujoPromedio} m┬│/s`}
          acento="blue"
        />
        <TarjetaKpi
          icono={Clock}
          titulo="├Ültima sync"
          valor={
            ultimaSync
              ? ultimaSync.toLocaleTimeString('es-CO', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })
              : 'ÔÇö'
          }
          subtitulo={`Bater├¡a m├¡n. red ${metricas.bateriaMinima}%`}
          acento="slate"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Columna izquierda */}
        <div className="lg:col-span-3 space-y-6">
          <AnalisisIA
            sensores={sensores}
            clima={clima}
            reportes={reportes}
            modoTormenta={modoTormenta}
          />

          <div className="card-premium rounded-3xl p-6">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
              Salud agregada de la red
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-5">
              Indicadores consolidados de la red en este momento.
            </p>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Ocupaci├│n media de colectores
                  </span>
                  <span className="text-xs font-mono text-emerald-600">{metricas.nivelPromedio}%</span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                    style={{ width: `${metricas.nivelPromedio}%` }}
                  />
                </div>
                <p className="text-[9px] text-slate-500 mt-1">Promedio de los {metricas.total} nodos</p>
              </div>
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Caudal total estimado
                  </span>
                  <span className="text-xs font-mono text-blue-600">
                    {(metricas.flujoPromedio * metricas.total).toFixed(1)} m┬│/s
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(100, (metricas.flujoPromedio / 2.5) * 100)}%`,
                    }}
                  />
                </div>
                <p className="text-[9px] text-slate-500 mt-1">Suma de flujos por nodo</p>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2">
                {(['Normal', 'Alerta', 'Critico'] as const).map((est) => {
                  const n =
                    est === 'Normal'
                      ? metricas.normal
                      : est === 'Alerta'
                        ? metricas.alerta
                        : metricas.critico;
                  const info = INFO_ESTADO_SENSOR[est];
                  return (
                    <div
                      key={est}
                      className={`text-center p-2 rounded-xl border ${info.fondo} ${info.borde}`}
                    >
                      <p className={`text-lg font-black ${info.texto}`}>{n}</p>
                      <p className="text-[8px] font-bold uppercase text-slate-500">{info.etiqueta}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="card-premium rounded-3xl p-6">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Glosario del panel
            </h3>
            <ul className="space-y-3">
              {GLOSARIO.map((g) => (
                <li key={g.termino} className="text-xs border-l-2 border-emerald-500/40 pl-3">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{g.termino}</span>
                  <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{g.def}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="card-premium rounded-3xl p-6 max-h-[320px] flex flex-col">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
              Reportes ciudadanos
            </h3>
            <p className="text-[9px] text-slate-500 mb-4">{reportes.length} registrados</p>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {reportes.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">Sin reportes a├║n</p>
              ) : (
                reportes
                  .slice()
                  .reverse()
                  .slice(0, 8)
                  .map((r) => (
                    <div
                      key={r.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-emerald-600">
                          {r.categoria || 'Incidencia'}
                        </span>
                        <span
                          className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                            r.severidad === 'Grave'
                              ? 'bg-red-500 text-white'
                              : r.severidad === 'Moderado'
                                ? 'bg-orange-500 text-white'
                                : 'bg-slate-400 text-white'
                          }`}
                        >
                          {r.severidad}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2">
                        {r.descripcion}
                      </p>
                      <p className="text-[9px] text-slate-500 mt-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {r.latitud.toFixed(3)}, {r.longitud.toFixed(3)}
                      </p>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

        {/* Centro */}
        <div className="lg:col-span-6 space-y-6">
          <div className="card-premium rounded-[2rem] overflow-hidden shadow-2xl relative">
            <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-wrap gap-2 justify-between pointer-events-none">
              <div className="glass px-3 py-2 rounded-xl flex items-center gap-2 pointer-events-auto">
                <Radio className="h-3.5 w-3.5 text-red-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase text-slate-800 dark:text-white">
                  Telemetr├¡a en vivo
                </span>
              </div>
              <div className="flex flex-wrap gap-2 pointer-events-auto">
                {(['Normal', 'Alerta', 'Critico'] as const).map((est) => {
                  const info = INFO_ESTADO_SENSOR[est];
                  const color =
                    est === 'Critico' ? '#ef4444' : est === 'Alerta' ? '#f97316' : '#10b981';
                  return (
                    <div
                      key={est}
                      className="glass px-2.5 py-1.5 rounded-lg flex items-center gap-1.5"
                      title={info.descripcion}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-[9px] font-bold uppercase text-slate-700 dark:text-slate-200">
                        {info.etiqueta}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <p className="absolute bottom-4 left-4 z-[1000] text-[9px] font-medium text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-900/80 px-2 py-1 rounded-lg pointer-events-none">
              C├¡rculos = sensores IoT ┬À Marcadores = reportes ┬À Clic en un c├¡rculo para ficha t├®cnica
            </p>
            <div className="h-[480px] w-full bg-slate-100 dark:bg-slate-900">
              <MapContainer
                center={[2.4418, -76.6063]}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer url={urlCapaMapa()} attribution="&copy; CARTO" />
                {sensores.map((sensor) => (
                  <Circle
                    key={sensor.id}
                    center={[sensor.latitud, sensor.longitud]}
                    radius={sensorSeleccionado?.id === sensor.id ? 280 : 200}
                    eventHandlers={{ click: () => setSensorSeleccionado(sensor) }}
                    pathOptions={{
                      color: colorNivel(sensor.nivelAgua),
                      fillColor: colorNivel(sensor.nivelAgua),
                      fillOpacity: sensorSeleccionado?.id === sensor.id ? 0.85 : 0.45,
                      weight: sensorSeleccionado?.id === sensor.id ? 4 : 2,
                    }}
                  >
                    <Popup>
                      <div className="p-2 min-w-[220px] text-slate-900">
                        <p className="text-[9px] font-black uppercase text-slate-500">Nodo {sensor.id}</p>
                        <p className="font-bold text-sm border-b pb-2 mb-2">{sensor.ubicacion}</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-slate-500 block">Nivel</span>
                            <strong>{sensor.nivelAgua}%</strong>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Flujo</span>
                            <strong>{sensor.flujo} m┬│/s</strong>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Bater├¡a</span>
                            <strong>{sensor.bateria}%</strong>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Estado</span>
                            <strong>{INFO_ESTADO_SENSOR[sensor.estado].etiqueta}</strong>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Circle>
                ))}
                {reportes.map((rep) => (
                  <Marker key={rep.id} position={[rep.latitud, rep.longitud]} icon={alertIcon}>
                    <Popup>
                      <div className="p-2 min-w-[200px] text-slate-900">
                        <strong className="text-red-600 text-xs flex items-center gap-1">
                          <AlertOctagon className="h-3 w-3" />
                          Reporte ciudadano
                        </strong>
                        <p className="text-[10px] font-bold mt-1">{rep.categoria}</p>
                        <p className="text-xs mt-1">{rep.descripcion}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {sensorSeleccionado ? (
              <motion.div
                key={sensorSeleccionado.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <DetalleSensor
                  sensor={sensorSeleccionado}
                  onCerrar={() => setSensorSeleccionado(null)}
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div className="card-premium rounded-3xl p-6 min-h-[280px] flex flex-col">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    Nivel por nodo
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                    Comparativa de ocupaci├│n (%) ÔÇö colores seg├║n estado operativo
                  </p>
                  <div className="flex-1 min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sensores} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                        <XAxis
                          dataKey="id"
                          tick={{ fontSize: 10 }}
                          label={{ value: 'Sensor', position: 'insideBottom', offset: -2, fontSize: 9 }}
                        />
                        <YAxis
                          domain={[0, 100]}
                          tick={{ fontSize: 10 }}
                          label={{
                            value: '% llenado',
                            angle: -90,
                            position: 'insideLeft',
                            fontSize: 9,
                          }}
                        />
                        <Tooltip
                          contentStyle={estiloTooltipGrafica()}
                          cursor={cursorGrafica()}
                          formatter={(v: number) => [`${v}%`, 'Nivel']}
                          labelFormatter={(_, payload) => {
                            const p = payload?.[0]?.payload as SensorIoT | undefined;
                            return p ? `${p.id} ┬À ${p.ubicacion}` : '';
                          }}
                        />
                        <Bar dataKey="nivelAgua" name="Nivel %" radius={[6, 6, 0, 0]}>
                          {sensores.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colorNivel(entry.nivelAgua)} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="card-premium rounded-3xl p-6 min-h-[280px] flex flex-col justify-center items-center text-center border-dashed border-2 border-slate-300 dark:border-slate-700">
                  <MapPin className="h-10 w-10 text-emerald-500/50 mb-4" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Selecciona un nodo en el mapa o en la lista
                  </p>
                  <p className="text-xs text-slate-500 mt-2 max-w-xs">
                    Ver├ís ficha t├®cnica completa: nivel, caudal, bater├¡a, GPS, tendencia, mantenimiento
                    y recomendaci├│n operativa.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Derecha */}
        <div className="lg:col-span-3 space-y-6">
          <div className="card-premium rounded-3xl p-5 flex flex-col max-h-[560px]">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
              Inventario de nodos IoT
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
              Clic para abrir ficha t├®cnica del nodo
            </p>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              {sensores.map((s) => {
                const info = INFO_ESTADO_SENSOR[s.estado];
                const sel = sensorSeleccionado?.id === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSensorSeleccionado(s)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all ${
                      sel
                        ? 'bg-emerald-500/10 border-emerald-500/40 ring-1 ring-emerald-500/30'
                        : 'bg-slate-50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-emerald-500/30'
                    }`}
                  >
                    <div className="flex gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 text-white font-black text-sm"
                        style={{ backgroundColor: colorNivel(s.nivelAgua) }}
                      >
                        {s.nivelAgua}%
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono font-bold text-slate-500">
                            {s.id}
                          </span>
                          <span
                            className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${info.fondo} ${info.texto}`}
                          >
                            {info.etiqueta}
                          </span>
                        </div>
                        <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight mt-0.5 truncate">
                          {s.ubicacion}
                        </p>
                        <div className="grid grid-cols-3 gap-1 mt-2 text-[9px] font-bold text-slate-500">
                          <span className="flex items-center gap-0.5">
                            <Waves className="h-3 w-3" /> {s.flujo}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Battery className="h-3 w-3" /> {s.bateria}%
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Droplets className="h-3 w-3" /> {s.estado}
                          </span>
                        </div>
                        <div className="h-1 w-full bg-slate-200 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${s.nivelAgua}%`,
                              backgroundColor: colorNivel(s.nivelAgua),
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="card-premium rounded-3xl p-6 bg-red-500/5 border border-red-500/20">
            <h3 className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <AlertOctagon className="h-4 w-4" />
              Cola de despacho prioritario
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
              Nodos en Alerta o Cr├¡tico que requieren brigada
            </p>
            {sensoresCriticos.length === 0 ? (
              <div className="text-center py-6 px-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  Red estable
                </p>
                <p className="text-[10px] text-slate-500 mt-1">Ning├║n nodo supera umbral de alerta</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sensoresCriticos
                  .sort((a, b) => b.nivelAgua - a.nivelAgua)
                  .map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSensorSeleccionado(s)}
                      className="w-full p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-left hover:border-red-400/50 transition-colors"
                    >
                      <div className="flex justify-between mb-2">
                        <span className="text-[11px] font-black text-slate-800 dark:text-slate-200">
                          {s.ubicacion}
                        </span>
                        <span
                          className={`text-[8px] font-black uppercase px-2 py-0.5 rounded text-white ${
                            s.estado === 'Critico' ? 'bg-red-500' : 'bg-orange-500'
                          }`}
                        >
                          {INFO_ESTADO_SENSOR[s.estado].etiqueta}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mb-2">
                        Nivel {s.nivelAgua}% ┬À Flujo {s.flujo} m┬│/s ┬À Bater├¡a {s.bateria}%
                      </p>
                      <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${s.nivelAgua}%`,
                            backgroundColor: colorNivel(s.nivelAgua),
                          }}
                        />
                      </div>
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
