/**
 * Vista de detalle de un reporte ciudadano por ID en la URL.
 * Muestra evidencia fotográfica, metadatos, mapa de ubicación
 * y estados de carga o "no encontrado".
 */
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { Icon } from 'leaflet';
import {
  MapPin,
  Camera,
  Clock,
  User,
  AlertTriangle,
  Building2,
  FileText,
  Hash,
} from 'lucide-react';
import { ServicioBdLocal } from '../servicios/ServicioBdLocal';
import { nombreEntidadReporte, Reporte } from '../tipos';
import { BotonVolver } from '../componentes/BotonVolver';
import { urlCapaMapa } from '../utilidades/estilosTema';
import { usarAuth } from '../contextos/ContextoAuth';

/** Icono del pin en el mapa de ubicación del reporte */
const marcadorIcono = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const colorSeveridad: Record<Reporte['severidad'], string> = {
  Leve: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Moderado: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  Grave: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const colorEstado: Record<Reporte['estado'], string> = {
  Pendiente: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Revisado: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  Solucionado: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

/** Fila reutilizable de etiqueta + valor en el panel de información */
function FilaDetalle({
  icono: Icono,
  etiqueta,
  valor,
}: {
  icono: React.ComponentType<{ className?: string }>;
  etiqueta: string;
  valor: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 py-4 border-b border-slate-800 last:border-0">
      <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center shrink-0">
        <Icono className="h-4 w-4 text-slate-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{etiqueta}</p>
        <div className="text-sm text-slate-200">{valor}</div>
      </div>
    </div>
  );
}

export default function DetalleReporte() {
  const { id } = useParams<{ id: string }>();
  const { usuario } = usarAuth();
  const [reporte, setReporte] = useState<Reporte | null>(null);
  const [listo, setListo] = useState(false);

  // Busca el reporte por id de ruta al montar o cambiar el parámetro
  useEffect(() => {
    if (!id) {
      setListo(true);
      return;
    }
    ServicioBdLocal.obtenerReportePorId(id)
      .then((encontrado) => setReporte(encontrado ?? null))
      .finally(() => setListo(true));
  }, [id]);

  if (!listo) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Cargando reporte…</p>
      </div>
    );
  }

  if (!reporte) {
    return (
      <div className="max-w-lg mx-auto px-6 py-16 text-center">
        <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
        <h1 className="text-2xl font-heading font-medium text-white mb-2">Reporte no encontrado</h1>
        <p className="text-slate-400 text-sm mb-8">
          El reporte que buscas no existe o fue eliminado de este dispositivo.
        </p>
        <Link
          to="/reportes-ciudadanos"
          className="inline-flex items-center gap-2 text-emerald-400 font-bold text-sm uppercase tracking-widest hover:underline"
        >
          Volver a reportes ciudadanos
        </Link>
      </div>
    );
  }

  const entidadNombre = nombreEntidadReporte(reporte.entidad);
  const fechaObj = new Date(reporte.fecha);
  const fechaFormateada = Number.isNaN(fechaObj.getTime())
    ? reporte.fecha
    : fechaObj.toLocaleString('es-CO', {
        dateStyle: 'full',
        timeStyle: 'short',
      });
  const esPropio = reporte.autorId === usuario?.id;

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-8 sm:py-10 min-h-[calc(100vh-5rem)]">
      <BotonVolver etiqueta="Volver a reportes" className="mb-8" />

      <header className="mb-8">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-2">
          Resumen del reporte
        </p>
        <h1 className="text-3xl sm:text-4xl font-heading font-medium italic text-white leading-tight">
          {reporte.categoria || 'Incidente ciudadano'}
        </h1>
        <div className="flex flex-wrap gap-2 mt-4">
          <span
            className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg border ${colorSeveridad[reporte.severidad]}`}
          >
            {reporte.severidad}
          </span>
          <span
            className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg border ${colorEstado[reporte.estado]}`}
          >
            {reporte.estado}
          </span>
          {esPropio && (
            <span className="text-[10px] font-black uppercase px-3 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              Tu reporte
            </span>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="card-premium rounded-3xl overflow-hidden border border-slate-700/50">
            {reporte.fotoUrl ? (
              <img
                src={reporte.fotoUrl}
                alt={`Evidencia: ${reporte.categoria || 'reporte'}`}
                className="w-full max-h-[420px] object-cover"
              />
            ) : (
              <div className="aspect-[4/3] flex flex-col items-center justify-center text-slate-600 gap-3 bg-slate-900">
                <Camera className="h-14 w-14" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Sin foto adjunta</span>
              </div>
            )}
          </div>

          <div className="card-premium rounded-3xl p-6 sm:p-8 border border-slate-700/50">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-2">
              Descripción
            </h2>
            <p className="text-slate-200 leading-relaxed text-base">{reporte.descripcion}</p>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="card-premium rounded-3xl p-6 sm:p-8 border border-slate-700/50">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-2">
              Información
            </h2>
            <FilaDetalle icono={Hash} etiqueta="ID del reporte" valor={reporte.id} />
            {entidadNombre && (
              <FilaDetalle icono={Building2} etiqueta="Entidad" valor={entidadNombre} />
            )}
            {reporte.categoria && (
              <FilaDetalle icono={FileText} etiqueta="Categoría" valor={reporte.categoria} />
            )}
            <FilaDetalle icono={Clock} etiqueta="Fecha de registro" valor={fechaFormateada} />
            {reporte.autorNombre && (
              <FilaDetalle icono={User} etiqueta="Reportado por" valor={reporte.autorNombre} />
            )}
            <FilaDetalle
              icono={MapPin}
              etiqueta="Coordenadas"
              valor={
                <span className="font-mono text-xs">
                  {reporte.latitud.toFixed(5)}, {reporte.longitud.toFixed(5)}
                </span>
              }
            />
          </div>

          <div className="card-premium rounded-3xl overflow-hidden border border-slate-700/50">
            <div className="p-4 border-b border-slate-800">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Ubicación en mapa
              </p>
            </div>
            <div className="h-[280px] sm:h-[320px]">
              <MapContainer
                center={[reporte.latitud, reporte.longitud]}
                zoom={16}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
              >
                <TileLayer url={urlCapaMapa()} attribution="&copy; CARTO" />
                <Marker position={[reporte.latitud, reporte.longitud]} icon={marcadorIcono} />
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
