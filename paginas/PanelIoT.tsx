import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, Cell } from 'recharts';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { Icon } from 'leaflet';
import { CloudRain, ThermometerSun, AlertOctagon, Activity, MapPin, X, ArrowRight, Battery, Waves, CloudLightning, Info, Sun, Moon, Palette } from 'lucide-react';
import { ServicioBdLocal } from '../servicios/ServicioBdLocal';
import { ServicioClima } from '../servicios/ServicioClima';
import { SensorIoT, DatosClima, Reporte } from '../tipos';
import { motion, AnimatePresence } from 'motion/react';
import { AnalisisIA } from '../componentes/AnalisisIA';
import { urlCapaMapa, estiloTooltipGrafica, cursorGrafica } from '../utilidades/estilosTema';

const alertIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  className: 'hue-rotate-[140deg]', // Makes it reddish/orange for alerts conceptually
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

export default function PanelIoT() {
  const [sensores, setSensores] = useState<SensorIoT[]>([]);
  const [clima, setClima] = useState<DatosClima | null>(null);
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [cargando, setCargando] = useState(true);
  const [sensorSeleccionado, setSensorSeleccionado] = useState<SensorIoT | null>(null);
  const sensorSeleccionadoRef = React.useRef<SensorIoT | null>(null);
  const [modoTormenta, setModoTormenta] = useState(false);
  const [tema, setTema] = useState<'light' | 'dark'>(() => {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  });
  const [color, setColor] = useState<'emerald' | 'ocean' | 'sunset' | 'amethyst'>(() => {
    return (localStorage.getItem('color-theme') as any) || 'emerald';
  });

  const toggleTema = () => {
    const nuevoTema = tema === 'dark' ? 'light' : 'dark';
    setTema(nuevoTema);
    if (nuevoTema === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const cycleColor = () => {
    const colors: ('emerald' | 'ocean' | 'sunset' | 'amethyst')[] = ['emerald', 'ocean', 'sunset', 'amethyst'];
    const currentIndex = colors.indexOf(color);
    const nextColor = colors[(currentIndex + 1) % colors.length];
    setColor(nextColor);
    if (nextColor === 'emerald') {
      document.documentElement.removeAttribute('data-color');
      localStorage.setItem('color-theme', 'emerald');
    } else {
      document.documentElement.setAttribute('data-color', nextColor);
      localStorage.setItem('color-theme', nextColor);
    }
  };

  React.useEffect(() => {
    const storedColor = localStorage.getItem('color-theme');
    if (storedColor && storedColor !== 'emerald') {
      document.documentElement.setAttribute('data-color', storedColor);
    }
  }, []);

  React.useEffect(() => {
    sensorSeleccionadoRef.current = sensorSeleccionado;
  }, [sensorSeleccionado]);

  const generarHistorial = () => [
    { hora: '08:00', nivel: Math.floor(Math.random() * 40) + 10 },
    { hora: '09:00', nivel: Math.floor(Math.random() * 40) + 20 },
    { hora: '10:00', nivel: Math.floor(Math.random() * 60) + 30 },
    { hora: '11:00', nivel: Math.floor(Math.random() * 70) + 20 },
    { hora: '12:00', nivel: Math.floor(Math.random() * 40) + 10 },
    { hora: '13:00', nivel: Math.floor(Math.random() * 30) + 5 },
  ];

  const [dataHistorial, setDataHistorial] = useState(generarHistorial());

  const cargarDatos = async () => {
    try {
      const clim = await ServicioClima.obtenerClimaPopayan();
      setClima(clim as any);
      
      const sens = await ServicioBdLocal.obtenerSensoresIoT(modoTormenta);
      setSensores(sens);

      const reps = ServicioBdLocal.obtenerReportes();
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
      ServicioBdLocal.obtenerSensoresIoT(modoTormenta).then(newSens => {
        setSensores(newSens);
        const sel = sensorSeleccionadoRef.current;
        if (sel) {
          const updated = newSens.find(s => s.id === sel.id);
          if (updated) setSensorSeleccionado(updated);
        }
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [modoTormenta]);

  useEffect(() => {
    if (sensorSeleccionado) setDataHistorial(generarHistorial());
  }, [sensorSeleccionado?.id]);

  if (cargando) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6">
        <Activity className="h-12 w-12 text-primary-500 animate-spin" />
        <p className="text-xs font-bold uppercase tracking-[0.5em] text-slate-600 dark:text-slate-400">Iniciando Centro de Despacho</p>
      </div>
    );
  }

  const sensoresCriticos = sensores.filter(s => s.estado === 'Critico' || s.estado === 'Alerta');
  const sensoresAlerta = sensores.filter(s => s.estado === 'Alerta').length;
  const sensoresEnCritico = sensores.filter(s => s.estado === 'Critico').length;
  const nivelPromedio = sensores.length
    ? Math.round(sensores.reduce((acc, s) => acc + s.nivelAgua, 0) / sensores.length)
    : 0;

  const encabezadoFicha = (titulo: string, icono?: React.ReactNode) => (
    <h3 className="text-[10px] font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4 shrink-0">
      {icono}
      {titulo}
    </h3>
  );

  return (
    <motion.div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 sm:py-8 min-h-[calc(100vh-5rem)]" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary-500 mb-2">Centro de despacho</p>
          <h1 className="text-3xl sm:text-4xl font-heading font-medium italic text-gray-900 dark:text-white leading-tight">Mando de Resiliencia</h1>
          <p className="text-sm font-medium text-gray-500 dark:text-slate-500 mt-1">Popayán, Colombia • Monitoreo en tiempo real</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
           <button 
            onClick={() => setModoTormenta(!modoTormenta)}
            className={`flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-lg ${modoTormenta ? 'bg-red-600 text-white shadow-red-600/30' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 shadow-sm'}`}
           >
             <CloudLightning className={`h-4 w-4 sm:h-5 sm:w-5 shrink-0 ${modoTormenta ? 'animate-pulse' : 'text-slate-500 dark:text-slate-400'}`} />
             <span className="hidden sm:inline">{modoTormenta ? 'ALERTA METEOROLÓGICA ACTIVA' : 'MODO TORMENTA'}</span>
             <span className="sm:hidden">{modoTormenta ? 'Alerta' : 'Tormenta'}</span>
           </button>

           <button 
            onClick={toggleTema}
            className="flex items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all cursor-pointer"
            title={tema === 'dark' ? 'Activar Modo Claro' : 'Activar Modo Oscuro'}
           >
             {tema === 'dark' ? (
               <Sun className="h-5 w-5 text-amber-500" />
             ) : (
               <Moon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
             )}
           </button>

           <button 
            onClick={cycleColor}
            className="flex items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all cursor-pointer relative"
            title="Cambiar paleta de colores"
           >
             <Palette className={`h-5 w-5 ${
               color === 'ocean' ? 'text-sky-500' :
               color === 'sunset' ? 'text-orange-500' :
               color === 'amethyst' ? 'text-purple-500' :
               'text-emerald-500'
             }`} />
             <span className={`absolute top-1 right-1 w-2.5 h-2.5 rounded-full border border-white dark:border-slate-950 ${
               color === 'ocean' ? 'bg-sky-500' :
               color === 'sunset' ? 'bg-orange-500' :
               color === 'amethyst' ? 'bg-purple-500' :
               'bg-emerald-500'
             }`} />
           </button>

           <div className="flex bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-2 shadow-sm">
             <div className="px-4 py-1 flex items-center gap-3 border-r border-slate-200 dark:border-slate-800">
               <ThermometerSun className="text-orange-500 h-5 w-5" />
               <div className="leading-none">
                  <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase">Temp</p>
                  <p className="font-bold text-gray-900 dark:text-white text-lg">{clima?.temperatura}°C</p>
               </div>
             </div>
             <div className="px-4 py-1 flex items-center gap-3">
               <CloudRain className="text-blue-500 h-5 w-5" />
               <div className="leading-none">
                  <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase">Precip</p>
                  <p className="font-bold text-gray-900 dark:text-white text-lg">{modoTormenta ? '92' : clima?.lluvia}mm</p>
               </div>
             </div>
           </div>
        </div>
      </div>

      {/* KPIs rápidos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[
          { label: 'Nodos activos', valor: sensores.length, Icon: Activity, color: 'text-primary-500', fondo: 'bg-primary-500/10' },
          { label: 'Incidentes', valor: sensoresCriticos.length, Icon: AlertOctagon, color: sensoresCriticos.length ? 'text-red-500' : 'text-slate-400', fondo: sensoresCriticos.length ? 'bg-red-500/10' : 'bg-slate-500/10' },
          { label: 'Nivel promedio', valor: `${nivelPromedio}%`, Icon: Waves, color: 'text-blue-500', fondo: 'bg-blue-500/10' },
          { label: 'Reportes', valor: reportes.length, Icon: MapPin, color: 'text-amber-500', fondo: 'bg-amber-500/10' },
        ].map(({ label, valor, Icon, color, fondo }) => (
          <div key={label} className="card-premium rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
            <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${fondo} flex items-center justify-center shrink-0`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">{label}</p>
              <p className="text-xl sm:text-2xl font-heading font-bold text-gray-900 dark:text-white tabular-nums">{valor}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 xl:gap-6">
        
        {/* Columna izquierda */}
        <div className="xl:col-span-3 flex flex-col gap-5 order-2 xl:order-1">
           <AnalisisIA
             sensores={sensores}
             clima={clima}
             reportes={reportes}
             modoTormenta={modoTormenta}
           />

           <div className="card-premium rounded-2xl p-5 shrink-0">
              {encabezadoFicha('Salud de red')}
              <div className="space-y-4">
                 <div>
                   <div className="flex justify-between mb-2">
                     <span className="text-xs font-bold text-gray-700 dark:text-slate-300">Capacidad total</span>
                     <span className="text-xs font-mono text-primary-500">78%</span>
                   </div>
                   <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500 rounded-full" style={{ width: '78%' }} />
                   </div>
                 </div>
                 <div>
                   <div className="flex justify-between mb-2">
                     <span className="text-xs font-bold text-gray-700 dark:text-slate-300">Flujo promedio</span>
                     <span className="text-xs font-mono text-blue-500">1.4 m³/s</span>
                   </div>
                   <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '45%' }} />
                   </div>
                 </div>
              </div>
           </div>

           <div className="card-premium rounded-2xl p-5 flex flex-col flex-1 min-h-[12rem] xl:min-h-[14rem]">
              {encabezadoFicha('Registro operativo')}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar min-h-0">
                 {reportes.slice().reverse().map(r => (
                   <div key={r.id} className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-primary-400">{r.categoria || 'REPORTE'}</span>
                        <span className="text-[9px] text-slate-500 dark:text-slate-400">{new Date(r.fecha).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                      </div>
                      {r.fotoUrl && <img src={r.fotoUrl} alt="" className="w-full h-16 object-cover rounded-lg" />}
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-300 line-clamp-2">{r.descripcion}</p>
                   </div>
                 ))}
                 {reportes.length === 0 && <p className="text-xs text-slate-500 dark:text-slate-400 py-8 text-center uppercase tracking-widest">Sin actividad reciente</p>}
              </div>
           </div>
        </div>

        {/* Columna central — mapa y gráficas */}
        <div className="xl:col-span-6 flex flex-col gap-5 order-1 xl:order-2">
           <div className="card-premium rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col shadow-xl relative z-0 min-h-[280px] h-[42vh] sm:h-[46vh] xl:h-[min(52vh,520px)] xl:max-h-[540px]">
             <div className="absolute top-3 left-3 right-3 z-10 flex items-start justify-between gap-2 pointer-events-none">
                <div className="glass px-3 py-1.5 rounded-lg flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                   <span className="text-[9px] font-black text-slate-700 dark:text-white uppercase tracking-wide">En vivo</span>
                </div>
                <div className="glass px-3 py-1.5 rounded-lg hidden sm:block">
                   <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300 uppercase">{sensores.length} nodos · {reportes.length} reportes</span>
                </div>
             </div>
             <div className="flex-1 w-full bg-slate-100 dark:bg-slate-900 min-h-0">
                <MapContainer center={[2.4418, -76.6063]} zoom={14} style={{ height: '100%', width: '100%' }}>
                  <TileLayer key={tema} url={urlCapaMapa()} attribution='&copy; CARTO' />
                  {sensores.map(sensor => (
                    <Circle 
                      key={sensor.id}
                      center={[sensor.latitud, sensor.longitud]} 
                      radius={sensorSeleccionado?.id === sensor.id ? 250 : 180}
                      eventHandlers={{ click: () => setSensorSeleccionado(sensor) }}
                      pathOptions={{ 
                        color: sensor.estado === 'Critico' ? '#ef4444' : sensor.estado === 'Alerta' ? '#f97316' : '#10b981',
                        fillColor: sensor.estado === 'Critico' ? '#ef4444' : sensor.estado === 'Alerta' ? '#f97316' : '#10b981',
                        fillOpacity: sensorSeleccionado?.id === sensor.id ? 0.9 : 0.5,
                        weight: sensorSeleccionado?.id === sensor.id ? 4 : 2
                      }}
                    >
                      <Popup>
                        <div className="p-2 min-w-[200px]">
                           <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Telemetría Nodo</p>
                           <p className="font-heading font-bold text-slate-900 border-b border-slate-200 pb-2 mb-2">{sensor.ubicacion}</p>
                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <span className="text-[9px] font-bold text-slate-600 uppercase block">Nivel</span>
                                 <span className="text-xl font-black">{sensor.nivelAgua}%</span>
                              </div>
                              <div>
                                 <span className="text-[9px] font-bold text-slate-600 uppercase block">Flujo</span>
                                 <span className="text-xl font-black">{sensor.flujo} m/s</span>
                              </div>
                           </div>
                        </div>
                      </Popup>
                    </Circle>
                  ))}
                  {reportes.map(rep => (
                    <Marker key={rep.id} position={[rep.latitud, rep.longitud]} icon={alertIcon}>
                      <Popup>
                        <div className="p-2 min-w-[180px]">
                          <strong className="text-red-600 flex items-center gap-1 text-xs">
                            <AlertOctagon className="h-3 w-3"/> {rep.categoria || 'Alerta Ciudadana'}
                          </strong>
                          {rep.fotoUrl && (
                            <img src={rep.fotoUrl} alt="" className="w-full h-24 object-cover rounded-lg mt-2" />
                          )}
                          <p className="text-xs mt-2 text-slate-700">{rep.descripcion}</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
             </div>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 min-h-[220px] sm:min-h-[240px]">
              <div className="card-premium rounded-2xl p-5 h-[220px] sm:h-[240px] flex flex-col">
                {encabezadoFicha('Comparativa de caudal', <Activity className="h-4 w-4 text-primary-500" />)}
                <div className="flex-1">
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sensores.slice(0, 5)}>
                        <XAxis dataKey="ubicacion" hide />
                        <YAxis hide />
                        <Tooltip 
                          contentStyle={estiloTooltipGrafica()}
                          cursor={cursorGrafica()}
                        />
                        <Bar dataKey="nivelAgua" radius={[6,6,6,6]}>
                          {sensores.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.estado === 'Critico' ? '#ef4444' : entry.estado === 'Alerta' ? '#f97316' : '#10b981'} />
                          ))}
                        </Bar>
                      </BarChart>
                   </ResponsiveContainer>
                </div>
              </div>

              {sensorSeleccionado ? (
                <motion.div 
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  className="card-premium rounded-2xl p-5 h-[220px] sm:h-[240px] border-l-4 border-primary-500 flex flex-col"
                >
                   <div className="flex justify-between mb-4">
                      <div className="leading-none">
                        <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest">{sensorSeleccionado.id}</p>
                        <p className="font-heading font-bold text-gray-900 dark:text-white text-lg mt-1">{sensorSeleccionado.ubicacion}</p>
                      </div>
                      <button onClick={() => setSensorSeleccionado(null)}><X className="h-4 w-4 text-slate-500 dark:text-slate-400" /></button>
                   </div>
                   <div className="flex-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dataHistorial}>
                           <defs>
                             <linearGradient id="g-wave" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="var(--primary-500)" stopOpacity={0.2} />
                               <stop offset="95%" stopColor="var(--primary-500)" stopOpacity={0} />
                             </linearGradient>
                           </defs>
                           <Area type="monotone" dataKey="nivel" stroke="var(--primary-500)" strokeWidth={3} fill="url(#g-wave)" />
                        </AreaChart>
                      </ResponsiveContainer>
                   </div>
                </motion.div>
              ) : (
                <div className="card-premium rounded-2xl p-5 h-[220px] sm:h-[240px] flex flex-col items-center justify-center text-center border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
                  <MapPin className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-3" />
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Detalle de nodo</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 max-w-[200px]">Selecciona un sensor en el mapa o en la lista para ver su historial</p>
                </div>
              )}
           </div>
        </div>

        {/* Columna derecha */}
        <div className="xl:col-span-3 flex flex-col gap-5 order-3">
           <div className="card-premium rounded-2xl p-5 flex flex-col min-h-[280px] h-[42vh] sm:h-[46vh] xl:h-[min(52vh,520px)] xl:max-h-[540px]">
              {encabezadoFicha(`Nodos de red (${sensores.length})`)}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar min-h-0">
                 {sensores.map(s => (
                   <button 
                    key={s.id} onClick={() => setSensorSeleccionado(s)}
                    className={`w-full p-3 rounded-xl border transition-all text-left flex items-center justify-between group ${sensorSeleccionado?.id === s.id ? 'bg-primary-500/10 border-primary-500/40 ring-1 ring-primary-500/20' : 'bg-slate-50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-primary-500/30'}`}
                   >
                     <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center text-[10px] font-black ${s.estado === 'Critico' ? 'bg-red-500 text-white' : s.estado === 'Alerta' ? 'bg-orange-500 text-white' : 'bg-primary-500 text-white'}`}>
                           {s.nivelAgua}%
                        </div>
                        <div className="min-w-0">
                           <p className="text-[11px] font-bold text-gray-800 dark:text-slate-200 leading-tight truncate">{s.ubicacion}</p>
                           <div className="flex items-center gap-2 opacity-60">
                              <Battery className="h-3 w-3" />
                              <span className="text-[9px] font-bold uppercase">{s.bateria}%</span>
                           </div>
                        </div>
                     </div>
                     <ArrowRight className={`h-4 w-4 text-primary-500 transition-all ${sensorSeleccionado?.id === s.id ? 'translate-x-0' : '-translate-x-2 opacity-0'}`} />
                   </button>
                 ))}
              </div>
           </div>

           <div className="card-premium rounded-2xl p-5 bg-red-500/5 border-red-500/25 shrink-0">
              {encabezadoFicha('Despacho inmediato', <AlertOctagon className="h-4 w-4 text-red-500" />)}
              {(sensoresEnCritico > 0 || sensoresAlerta > 0) && (
                <p className="text-[10px] font-bold text-red-600/80 dark:text-red-400/80 -mt-2 mb-3">
                  {sensoresEnCritico} crítico{sensoresEnCritico !== 1 ? 's' : ''} · {sensoresAlerta} en alerta
                </p>
              )}
              {sensoresCriticos.length === 0 ? (
                <p className="text-[10px] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-widest text-center py-4">Sin incidentes graves</p>
              ) : (
                <div className="space-y-3">
                  {sensoresCriticos.map(s => (
                    <div key={s.id} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                       <div className="flex justify-between mb-2">
                          <span className="text-[11px] font-black text-gray-800 dark:text-slate-200">{s.ubicacion}</span>
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${s.estado === 'Critico' ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'}`}>{s.estado}</span>
                       </div>
                       <div className="flex items-center gap-3">
                          <Waves className={`h-4 w-4 ${s.estado === 'Critico' ? 'text-red-500' : 'text-orange-500'}`} />
                          <div className="flex-1 bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                             <div className={`h-full ${s.estado === 'Critico' ? 'bg-red-500' : 'bg-orange-500'}`} style={{ width: `${s.nivelAgua}%` }} />
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
              )}
           </div>
        </div>
      </div>
    </motion.div>
  );
}
