import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { Icon } from 'leaflet';
import {
  MapPin,
  CheckCircle2,
  Waves,
  AlertTriangle,
  Trash2,
  Droplets,
  ArrowRight,
  X,
  Navigation,
  Loader2,
  ImagePlus,
} from 'lucide-react';
import { usarAuth } from '../contextos/ContextoAuth';
import { ServicioBdLocal } from '../servicios/ServicioBdLocal';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { urlCapaMapa } from '../utilidades/estilosTema';
import { ServicioGroq } from '../servicios/ServicioGroq';
import { comprimirImagen } from '../utilidades/comprimirImagen';

const customIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

type Categoria = 'Obstrucción' | 'Mal Olor' | 'Tapa Dañada' | 'Desbordamiento';

const CATEGORIAS: { id: Categoria; icono: React.ComponentType<{ className?: string }>; color: string; desc: string }[] = [
  { id: 'Obstrucción', icono: Trash2, color: 'text-orange-500', desc: 'Basura o sedimentos' },
  { id: 'Mal Olor', icono: Droplets, color: 'text-purple-500', desc: 'Gases o estancamiento' },
  { id: 'Tapa Dañada', icono: AlertTriangle, color: 'text-red-500', desc: 'Peligro en vía' },
  { id: 'Desbordamiento', icono: Waves, color: 'text-blue-500', desc: 'Exceso de agua' },
];

function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function CentrarMapa({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  React.useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true });
  }, [lat, lng, map]);
  return null;
}

export default function NuevoReporte() {
  const { usuario } = usarAuth();
  const navigate = useNavigate();
  const inputFoto = useRef<HTMLInputElement>(null);
  const [posicion, setPosicion] = useState({ lat: 2.4418, lng: -76.6063 });
  const [categoria, setCategoria] = useState<Categoria>('Obstrucción');
  const [descripcion, setDescripcion] = useState('');
  const [severidad, setSeveridad] = useState<'Leve' | 'Moderado' | 'Grave'>('Moderado');
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoError, setFotoError] = useState('');
  const [geoEstado, setGeoEstado] = useState<'idle' | 'cargando' | 'ok' | 'error'>('idle');
  const [geoMensaje, setGeoMensaje] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [paso, setPaso] = useState(1);
  const [mensajeIA, setMensajeIA] = useState('');
  const [cargandoIA, setCargandoIA] = useState(false);

  const usarUbicacionActual = () => {
    if (!navigator.geolocation) {
      setGeoEstado('error');
      setGeoMensaje('Tu navegador no soporta geolocalización.');
      return;
    }
    setGeoEstado('cargando');
    setGeoMensaje('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosicion({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoEstado('ok');
        setGeoMensaje('Ubicación GPS aplicada al mapa.');
        setPaso(2);
      },
      (err) => {
        setGeoEstado('error');
        const mensajes: Record<number, string> = {
          1: 'Permiso de ubicación denegado. Actívalo en el navegador.',
          2: 'No se pudo obtener la ubicación.',
          3: 'Tiempo de espera agotado. Intenta de nuevo.',
        };
        setGeoMensaje(mensajes[err.code] || 'Error al obtener ubicación.');
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  const manejarFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    setFotoError('');
    try {
      const dataUrl = await comprimirImagen(archivo);
      setFotoPreview(dataUrl);
      setPaso(2);
    } catch (err) {
      setFotoError(err instanceof Error ? err.message : 'Error al cargar la foto.');
      setFotoPreview(null);
    }
  };

  const quitarFoto = () => {
    setFotoPreview(null);
    setFotoError('');
    if (inputFoto.current) inputFoto.current.value = '';
  };

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    ServicioBdLocal.guardarReporte({
      descripcion,
      categoria,
      latitud: posicion.lat,
      longitud: posicion.lng,
      severidad,
      autorId: usuario?.id || 'anonimo',
      autorNombre: usuario?.nombre,
      fotoUrl: fotoPreview || undefined,
    });
    setEnviado(true);
    setCargandoIA(true);
    const { texto } = await ServicioGroq.evaluarReporte(
      categoria,
      descripcion,
      severidad,
      posicion.lat,
      posicion.lng
    );
    setMensajeIA(texto);
    setCargandoIA(false);
    setTimeout(() => navigate('/reportes-ciudadanos'), 4000);
  };

  if (enviado) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-emerald-500/20"
        >
          <CheckCircle2 className="h-12 w-12 text-white" />
        </motion.div>
        <h2 className="text-4xl font-heading font-bold mb-4 text-white">¡Su voz cuenta!</h2>
        <p className="text-slate-400 max-w-md text-lg mb-6">
          El reporte fue enviado y ya aparece en la sección de reportes ciudadanos.
        </p>
        {fotoPreview && (
          <img
            src={fotoPreview}
            alt="Evidencia del reporte"
            className="w-48 h-36 object-cover rounded-2xl border border-slate-700 mb-6"
          />
        )}
        <motion.div className="max-w-lg card-premium rounded-2xl p-5 text-left border border-emerald-500/20 mb-8">
          <p className="text-[10px] font-black uppercase text-emerald-400 tracking-widest mb-2">
            Análisis Groq
          </p>
          {cargandoIA ? (
            <p className="text-sm text-slate-400 italic">Generando recomendación…</p>
          ) : (
            <p className="text-sm text-slate-300 leading-relaxed">&ldquo;{mensajeIA}&rdquo;</p>
          )}
        </motion.div>
        <Link
          to="/reportes-ciudadanos"
          className="text-emerald-400 text-sm font-bold uppercase tracking-widest hover:underline mb-6"
        >
          Ver en reportes ciudadanos
        </Link>
        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary-500"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 4 }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-12 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-500 mb-2">
            Popayán SmartDrain
          </p>
          <h1 className="text-5xl font-heading font-medium italic text-white">Digitalizar Reporte</h1>
          <p className="text-slate-500 mt-2 text-lg">
            Incluye foto del problema y tu ubicación actual para una respuesta más rápida.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 space-y-8">
            <div
              className={`card-premium rounded-[2.5rem] p-10 transition-all ${paso === 1 ? 'opacity-100 ring-2 ring-primary-500/20' : 'paso-inactivo'}`}
            >
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8">
                Paso 01: Identificar Problema
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {CATEGORIAS.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategoria(cat.id);
                      setPaso(2);
                    }}
                    className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all gap-4 group ${
                      categoria === cat.id
                        ? 'bg-primary-500/10 border-primary-500 shadow-xl'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <cat.icono
                      className={`h-8 w-8 transition-transform group-hover:scale-110 ${
                        categoria === cat.id ? cat.color : 'text-slate-400'
                      }`}
                    />
                    <div className="text-center">
                      <p
                        className={`text-xs font-black uppercase tracking-tighter ${
                          categoria === cat.id ? 'text-white' : 'text-slate-500'
                        }`}
                      >
                        {cat.id}
                      </p>
                      <p className="text-[9px] text-slate-500 mt-1">{cat.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div
              className={`card-premium rounded-[2.5rem] p-10 transition-all ${paso === 2 ? 'opacity-100 ring-2 ring-primary-500/20' : 'paso-inactivo'}`}
            >
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8">
                Paso 02: Detalles y evidencia
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-4 block">
                    Descripción del hallazgo
                  </label>
                  <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    className="w-full input-field rounded-2xl px-6 py-5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-lg min-h-[120px] resize-none text-slate-100"
                    placeholder="Cuéntanos exactamente qué está sucediendo..."
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-4 block">
                    Foto del problema
                  </label>
                  <input
                    ref={inputFoto}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={manejarFoto}
                  />
                  {fotoPreview ? (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-700">
                      <img src={fotoPreview} alt="Vista previa" className="w-full max-h-56 object-cover" />
                      <button
                        type="button"
                        onClick={quitarFoto}
                        className="absolute top-3 right-3 p-2 rounded-xl bg-slate-900/90 text-white hover:bg-red-600 transition-colors"
                        title="Quitar foto"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => inputFoto.current?.click()}
                      className="w-full py-10 rounded-2xl border-2 border-dashed border-slate-600 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all flex flex-col items-center gap-3 text-slate-400"
                    >
                      <ImagePlus className="h-10 w-10 text-emerald-500" />
                      <span className="text-sm font-bold">Subir foto del incidente</span>
                      <span className="text-[10px] uppercase tracking-widest">JPG, PNG · máx. 8 MB</span>
                    </button>
                  )}
                  {fotoError && <p className="mt-2 text-sm text-red-400">{fotoError}</p>}
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-4 block">
                    Nivel de gravedad
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {(['Leve', 'Moderado', 'Grave'] as const).map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setSeveridad(n)}
                        className={`p-4 rounded-xl font-bold text-sm transition-all border ${
                          severidad === n
                            ? 'bg-white text-slate-900 border-transparent'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button
                    type="button"
                    onClick={manejarEnvio}
                    disabled={!descripcion.trim()}
                    className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:bg-slate-800 disabled:text-slate-500 py-5 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-3 transition-all hover:shadow-2xl hover:shadow-primary-500/30"
                  >
                    Enviar reporte
                    <ArrowRight className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaso(1)}
                    className="p-5 rounded-2xl border border-slate-800 text-slate-400 hover:text-white"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="card-premium rounded-[2.5rem] overflow-hidden flex flex-col h-[640px] sticky top-12">
              <div className="p-6 border-b border-slate-800">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center">
                      <MapPin className="text-primary-500 h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">
                        Ubicación del incidente
                      </p>
                      <p className="font-mono text-xs text-white mt-1">
                        {posicion.lat.toFixed(5)}, {posicion.lng.toFixed(5)}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={usarUbicacionActual}
                  disabled={geoEstado === 'cargando'}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-sm font-bold transition-all"
                >
                  {geoEstado === 'cargando' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Navigation className="h-4 w-4" />
                  )}
                  Usar mi ubicación actual
                </button>
                {geoMensaje && (
                  <p
                    className={`mt-2 text-xs ${geoEstado === 'error' ? 'text-red-400' : 'text-emerald-400'}`}
                  >
                    {geoMensaje}
                  </p>
                )}
              </div>
              <div className="flex-1 relative z-0 min-h-[280px]">
                <MapContainer
                  key={`${posicion.lat}-${posicion.lng}`}
                  center={[posicion.lat, posicion.lng]}
                  zoom={16}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer url={urlCapaMapa()} attribution="&copy; CARTO" />
                  <CentrarMapa lat={posicion.lat} lng={posicion.lng} />
                  <MapClickHandler
                    onLocationSelect={(lat, lng) => {
                      setPosicion({ lat, lng });
                      setPaso(2);
                      setGeoMensaje('Ubicación ajustada manualmente en el mapa.');
                      setGeoEstado('ok');
                    }}
                  />
                  <Marker position={[posicion.lat, posicion.lng]} icon={customIcon} />
                </MapContainer>
              </div>
              <div className="p-4 bg-slate-900/50 border-t border-slate-800">
                <p className="text-xs text-slate-500 text-center">
                  Usa GPS, toca el mapa o arrastra el marcador para ubicar el incidente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
