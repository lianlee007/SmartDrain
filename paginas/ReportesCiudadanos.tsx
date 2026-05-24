import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Camera, FilePlus, AlertTriangle, Clock, User, BarChart3, Eye } from 'lucide-react';
import { ServicioBdLocal } from '../servicios/ServicioBdLocal';
import { nombreEntidadReporte, Reporte } from '../tipos';
import { usarAuth } from '../contextos/ContextoAuth';

const colorSeveridad: Record<Reporte['severidad'], string> = {
  Leve: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Moderado: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  Grave: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function ReportesCiudadanos() {
  const { usuario } = usarAuth();
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [mostrarResumen, setMostrarResumen] = useState(false);

  const resumenReportes = useMemo(() => {
    const total = reportes.length;
    const conFoto = reportes.filter((r) => r.fotoUrl).length;
    const severidades = reportes.reduce(
      (acc, reporte) => {
        acc[reporte.severidad] = (acc[reporte.severidad] ?? 0) + 1;
        return acc;
      },
      {
        Leve: 0,
        Moderado: 0,
        Grave: 0,
      } as Record<Reporte['severidad'], number>
    );
    const estados = reportes.reduce(
      (acc, reporte) => {
        acc[reporte.estado] = (acc[reporte.estado] ?? 0) + 1;
        return acc;
      },
      {
        Pendiente: 0,
        Revisado: 0,
        Solucionado: 0,
      } as Record<Reporte['estado'], number>
    );

    return {
      total,
      conFoto,
      severidades,
      estados,
      ultimoReporte: reportes[0]?.fecha
        ? new Date(reportes[0].fecha).toLocaleString('es-CO', {
            dateStyle: 'short',
            timeStyle: 'short',
          })
        : 'Sin reportes',
    };
  }, [reportes]);

  useEffect(() => {
    ServicioBdLocal.obtenerReportes()
      .then((lista) => setReportes(lista))
      .catch(console.error);
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
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setMostrarResumen((prev) => !prev)}
            className="inline-flex items-center gap-2 border border-slate-700/50 bg-slate-900 hover:bg-slate-800 text-slate-200 px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all"
          >
            <BarChart3 className="h-4 w-4" />
            {mostrarResumen ? 'Ocultar resumen' : 'Ver resumen'}
          </button>
          <Link
            to="/reportar"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-emerald-600/20 transition-all"
          >
            <FilePlus className="h-4 w-4" />
            Nuevo reporte
          </Link>
        </div>
      </div>

      {mostrarResumen && (
        <section className="mb-8 rounded-3xl border border-slate-700/50 bg-slate-900/60 p-6 shadow-lg shadow-slate-900/20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-400 mb-2">Resumen rápido</p>
              <h2 className="text-2xl font-heading font-medium text-white">Resumen de reportes</h2>
            </div>
            <div className="rounded-3xl bg-slate-950/80 px-4 py-3 text-sm text-slate-300">
              Último reporte: <span className="font-semibold text-white">{resumenReportes.ultimoReporte}</span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-slate-700/50 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Total reportes</p>
              <p className="mt-3 text-3xl font-bold text-white">{resumenReportes.total}</p>
            </div>
            <div className="rounded-3xl border border-slate-700/50 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Con foto</p>
              <p className="mt-3 text-3xl font-bold text-white">{resumenReportes.conFoto}</p>
            </div>
            <div className="rounded-3xl border border-slate-700/50 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Pendientes</p>
              <p className="mt-3 text-3xl font-bold text-white">{resumenReportes.estados.Pendiente}</p>
            </div>
            <div className="rounded-3xl border border-slate-700/50 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Solucionados</p>
              <p className="mt-3 text-3xl font-bold text-white">{resumenReportes.estados.Solucionado}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-slate-700/50 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Leve</p>
              <p className="mt-3 text-2xl font-bold text-white">{resumenReportes.severidades.Leve}</p>
            </div>
            <div className="rounded-3xl border border-slate-700/50 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Moderado</p>
              <p className="mt-3 text-2xl font-bold text-white">{resumenReportes.severidades.Moderado}</p>
            </div>
            <div className="rounded-3xl border border-slate-700/50 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Grave</p>
              <p className="mt-3 text-2xl font-bold text-white">{resumenReportes.severidades.Grave}</p>
            </div>
          </div>
        </section>
      )}

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
                <div className="flex flex-wrap gap-2">
                  {nombreEntidadReporte(r.entidad) && (
                    <span className="text-[10px] font-black uppercase text-sky-400 tracking-widest px-2 py-0.5 rounded-md bg-sky-500/10 border border-sky-500/20">
                      {nombreEntidadReporte(r.entidad)}
                    </span>
                  )}
                  {r.categoria && (
                    <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">
                      {r.categoria}
                    </span>
                  )}
                </div>
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

                <div className="pt-3 border-t border-slate-800 space-y-3">
                  <Link
                    to={`/reportes-ciudadanos/${r.id}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-all border border-slate-700 hover:border-emerald-500"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Ver detalles
                  </Link>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase text-slate-500">{r.estado}</span>
                    {r.autorId === usuario?.id && (
                      <span className="text-[9px] font-bold uppercase text-emerald-500">Tu reporte</span>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <p className="mt-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
        <AlertTriangle className="h-3 w-3" />
        Los reportes quedan disponibles para el equipo operativo y el mapa central.
      </p>
    </div>
  );
}
