import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, Cell } from 'recharts';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { Icon } from 'leaflet';
import { CloudRain, ThermometerSun, AlertOctagon, Activity, MapPin, X, ArrowRight, Battery, Waves, CloudLightning, Info, Sun, Moon } from 'lucide-react';
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

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-8 min-h-[calc(100vh-5rem)]">
      
      {/* Header Informativo */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-heading font-medium italic text-gray-900 dark:text-white leading-tight">Mando de Resiliencia</h1>
          <p className="text-sm font-medium text-gray-500 dark:text-slate-500 mt-1">Popayán, Colombia • Monitoreo Crítico en Tiempo Real</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
           <button 
            onClick={() => setModoTormenta(!modoTormenta)}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg ${modoTormenta ? 'bg-red-600 text-white shadow-red-600/30' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 shadow-sm'}`}
           >
             <CloudLightning className={`h-5 w-5 ${modoTormenta ? 'animate-pulse' : 'text-slate-500 dark:text-slate-400'}`} />
             {modoTormenta ? 'ALERTA METEOROLÓGICA ACTIVA' : 'MODO TORMENTA'}
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Lado Izquierdo - Status y Usuarios */}
        <div className="lg:col-span-3 space-y-6">
           <AnalisisIA
             sensores={sensores}
             clima={clima}
             reportes={reportes}
             modoTormenta={modoTormenta}
           />

           <div className="card-premium rounded-3xl p-6">
              <h3 className="text-[10px] font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-6">Estado de Salud de Red</h3>
              <div className="space-y-6">
                 <div>
                   <div className="flex justify-between mb-2">
                     <span className="text-xs font-bold text-gray-700 dark:text-slate-300">Capacidad Total</span>
                     <span className="text-xs font-mono text-primary-500">78%</span>
                   </div>
                   <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500 rounded-full" style={{ width: '78%' }} />
                   </div>
                 </div>
                 <div>
                   <div className="flex justify-between mb-2">
                     <span className="text-xs font-bold text-gray-700 dark:text-slate-300">Flujo Promedio</span>
                     <span className="text-xs font-mono text-blue-500">1.4 m³/s</span>
                   </div>
                   <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '45%' }} />
                   </div>
                 </div>
              </div>
           </div>

           <div className="card-premium rounded-3xl p-6 h-[400px] flex flex-col">
              <h3 className="text-[10px] font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-4">Registro Operativo</h3>
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                 {reportes.slice().reverse().map(r => (
                   <div key={r.id} className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-primary-400">{r.categoria || 'REPORTE'}</span>
                        <span className="text-[9px] text-slate-500 dark:text-slate-400">{new Date(r.fecha).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                      </div>
                      {r.fotoUrl && <img src={r.fotoUrl} alt="" className="w-full h-16 object-cover rounded-lg" />}
                      <p className="text-xs font-medium text-slate-300 line-clamp-2">{r.descripcion}</p>
                   </div>
                 ))}
                 {reportes.length === 0 && <p className="text-xs text-slate-500 dark:text-slate-400 py-8 text-center uppercase tracking-widest">Sin actividad reciente</p>}
              </div>
           </div>
        </div>

        {/* Centro - Mapa y Charts */}
        <div className="lg:col-span-6 space-y-8">
           <div className="card-premium rounded-[2.5rem] overflow-hidden h-[500px] flex flex-col shadow-2xl relative z-0">
             <div className="absolute top-4 right-4 z-10 flex gap-2">
                <div className="glass px-4 py-2 rounded-xl flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                   <span className="text-[10px] font-black text-slate-700 dark:text-white uppercase">Live Data Sync</span>
                </div>
             </div>
             <div className="flex-1 w-full bg-slate-100 dark:bg-slate-900 min-h-[400px]">
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

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="card-premium rounded-3xl p-6 h-[300px] flex flex-col">
                <h3 className="text-[10px] font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-emerald-500" />
                    Comparativa de Caudal
                </h3>
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

              {sensorSeleccionado && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="card-premium rounded-3xl p-6 h-[300px] border-l-4 border-emerald-500 flex flex-col"
                >
                   <div className="flex justify-between mb-4">
                      <div className="leading-none">
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{sensorSeleccionado.id}</p>
                        <p className="font-heading font-bold text-gray-900 dark:text-white text-lg mt-1">{sensorSeleccionado.ubicacion}</p>
                      </div>
                      <button onClick={() => setSensorSeleccionado(null)}><X className="h-4 w-4 text-slate-500 dark:text-slate-400" /></button>
                   </div>
                   <div className="flex-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dataHistorial}>
                           <defs>
                             <linearGradient id="g-wave" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                               <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                             </linearGradient>
                           </defs>
                           <Area type="monotone" dataKey="nivel" stroke="#10b981" strokeWidth={3} fill="url(#g-wave)" />
                        </AreaChart>
                      </ResponsiveContainer>
                   </div>
                </motion.div>
              )}
           </div>
        </div>

        {/* Lado Derecho - Lista e Alertas */}
        <div className="lg:col-span-3 space-y-6">
           <div className="card-premium rounded-3xl p-6 h-[500px] flex flex-col">
              <h3 className="text-[10px] font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-6">Nodos de Red ({sensores.length})</h3>
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                 {sensores.map(s => (
                   <button 
                    key={s.id} onClick={() => setSensorSeleccionado(s)}
                    className={`w-full p-4 rounded-2xl border transition-all text-left flex items-center justify-between group ${sensorSeleccionado?.id === s.id ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}
                   >
                     <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black ${s.estado === 'Critico' ? 'bg-red-500 text-white' : s.estado === 'Alerta' ? 'bg-orange-500 text-white' : 'bg-emerald-500 text-white'}`}>
                           {s.nivelAgua}%
                        </div>
                        <div>
                           <p className="text-[11px] font-bold text-gray-800 dark:text-slate-200 leading-tight mb-0.5">{s.ubicacion}</p>
                           <div className="flex items-center gap-2 opacity-60">
                              <Battery className="h-3 w-3" />
                              <span className="text-[9px] font-bold uppercase">{s.bateria}%</span>
                           </div>
                        </div>
                     </div>
                     <ArrowRight className={`h-4 w-4 text-emerald-500 transition-all ${sensorSeleccionado?.id === s.id ? 'translate-x-0' : '-translate-x-2 opacity-0'}`} />
                   </button>
                 ))}
              </div>
           </div>

           <div className="card-premium rounded-3xl p-6 bg-red-600/5 border-red-500/20">
              <h3 className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <AlertOctagon className="h-4 w-4" />
                 Zonas de Despacho Inmediato
              </h3>
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
    </div>
  );
}
