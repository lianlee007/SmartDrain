import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Camera, FilePlus, AlertTriangle, Clock, User } from 'lucide-react';
import { ServicioBdLocal } from '../servicios/ServicioBdLocal';
import { Reporte } from '../tipos';
import { usarAuth } from '../contextos/ContextoAuth';

const colorSeveridad: Record<Reporte['severidad'], string> = {
  Leve: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Moderado: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  Grave: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function ReportesCiudadanos() {
  const { usuario } = usarAuth();
  const [reportes, setReportes] = useState<Reporte[]>([]);

  useEffect(() => {
    setReportes(ServicioBdLocal.obtenerReportes().slice().reverse());
  }, []);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10 min-h-[calc(100vh-5rem)]">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-2">
            Participación ciudadana
          </p>
          <h1 className="text-4xl font-heading font-medium italic text-white leading-tight">
            Reportes ciudadanos
          </h1>
          <p className="text-slate-400 mt-2 max-w-xl">
            Galería de incidentes reportados por la comunidad con foto y ubicación georreferenciada.
          </p>
        </div>
        <Link
          to="/reportar"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-emerald-600/20 transition-all"
        >
          <FilePlus className="h-4 w-4" />
          Nuevo reporte
        </Link>
      </div>

      {reportes.length === 0 ? (
        <div className="card-premium rounded-3xl p-16 text-center">
          <Camera className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 mb-6">Aún no hay reportes ciudadanos registrados.</p>
          <Link
            to="/reportar"
            className="text-emerald-400 font-bold text-sm uppercase tracking-widest hover:underline"
          >
            Crear el primero
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {reportes.map((r) => (
            <article
              key={r.id}
              className="card-premium rounded-3xl overflow-hidden flex flex-col border border-slate-700/50"
            >
              <div className="aspect-[4/3] bg-slate-900 relative">
                {r.fotoUrl ? (
                  <img
                    src={r.fotoUrl}
                    alt={`Reporte ${r.categoria || 'ciudadano'}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 gap-2">
                    <Camera className="h-10 w-10" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Sin foto</span>
                  </div>
                )}
                <span
                  className={`absolute top-3 right-3 text-[9px] font-black uppercase px-2 py-1 rounded-lg border ${colorSeveridad[r.severidad]}`}
                >
                  {r.severidad}
                </span>
              </div>

              <div className="p-5 flex flex-col flex-1 gap-3">
                {r.categoria && (
                  <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">
                    {r.categoria}
                  </span>
                )}
                <p className="text-sm text-slate-200 leading-relaxed flex-1">{r.descripcion}</p>

                <div className="flex flex-wrap gap-3 text-[10px] font-bold uppercase text-slate-500 tracking-wide">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(r.fecha).toLocaleString('es-CO', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </span>
                  {r.autorNombre && (
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {r.autorNombre}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {r.latitud.toFixed(4)}, {r.longitud.toFixed(4)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-[9px] font-bold uppercase text-slate-500">{r.estado}</span>
                  {r.autorId === usuario?.id && (
                    <span className="text-[9px] font-bold uppercase text-emerald-500">Tu reporte</span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <p className="mt-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
        <AlertTriangle className="h-3 w-3" />
        Los reportes y fotos se guardan en este dispositivo (localStorage).
      </p>
    </div>
  );
}
