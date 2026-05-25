/**
 * Perfil del usuario autenticado y historial de sus reportes.
 * Muestra estadísticas agregadas (severidad, estado, categorías)
 * y la galería personal de incidentes enviados.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Camera,
  FilePlus,
  Mail,
  BarChart3,
} from 'lucide-react';
import { usarAuth } from '../contextos/ContextoAuth';
import { ServicioBdLocal } from '../servicios/ServicioBdLocal';
import { nombreEntidadReporte, Reporte } from '../tipos';

const colorSeveridad: Record<Reporte['severidad'], string> = {
  Leve: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Moderado: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  Grave: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const colorEstado: Record<Reporte['estado'], string> = {
  Pendiente: 'text-amber-400',
  Revisado: 'text-blue-400',
  Solucionado: 'text-emerald-400',
};

export default function Perfil() {
  const { usuario } = usarAuth();
  const [reportes, setReportes] = useState<Reporte[]>([]);

  // Carga solo los reportes creados por el usuario en sesión
  useEffect(() => {
    if (!usuario) return;
    ServicioBdLocal.obtenerReportesPorAutor(usuario.id)
      .then((lista) => setReportes(lista.slice().reverse()))
      .catch(console.error);
  }, [usuario]);

  /** Métricas derivadas del listado personal de reportes */
  const estadisticas = useMemo(() => {
    const porSeveridad = { Leve: 0, Moderado: 0, Grave: 0 };
    const porEstado = { Pendiente: 0, Revisado: 0, Solucionado: 0 };
    const categorias: Record<string, number> = {};

    reportes.forEach((r) => {
      porSeveridad[r.severidad]++;
      porEstado[r.estado]++;
      const cat = r.categoria || 'Sin categoría';
      categorias[cat] = (categorias[cat] || 0) + 1;
    });

    const ultimoReporte = reportes[0]?.fecha
      ? new Date(reportes[0].fecha).toLocaleString('es-CO', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : null;

    return {
      total: reportes.length,
      porSeveridad,
      porEstado,
      categorias,
      ultimoReporte,
      conFoto: reportes.filter((r) => r.fotoUrl).length,
    };
  }, [reportes]);

  if (!usuario) return null;

  /** KPIs mostrados en la cuadrícula superior del perfil */
  const tarjetasResumen = [
    {
      titulo: 'Total reportes',
      valor: estadisticas.total,
      icono: FileText,
      color: 'text-emerald-400',
      fondo: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      titulo: 'Pendientes',
      valor: estadisticas.porEstado.Pendiente,
      icono: Clock,
      color: 'text-amber-400',
      fondo: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      titulo: 'Revisados',
      valor: estadisticas.porEstado.Revisado,
      icono: BarChart3,
      color: 'text-blue-400',
      fondo: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      titulo: 'Solucionados',
      valor: estadisticas.porEstado.Solucionado,
      icono: CheckCircle2,
      color: 'text-emerald-400',
      fondo: 'bg-emerald-500/10 border-emerald-500/20',
    },
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10 min-h-[calc(100vh-5rem)]">
      <div className="card-premium rounded-[2rem] p-8 lg:p-10 border border-slate-700/50 mb-10 flex flex-col lg:flex-row lg:items-center gap-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-emerald-500 flex items-center justify-center text-3xl font-black text-slate-950 shadow-lg shadow-emerald-500/25">
            {usuario.nombre[0].toUpperCase()}
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-2">
              Mi perfil
            </p>
            <h1 className="text-3xl lg:text-4xl font-heading font-medium italic text-white leading-tight">
              {usuario.nombre}
            </h1>
            <p className="flex items-center gap-2 text-slate-400 mt-2 text-sm">
              <Mail className="h-4 w-4 text-emerald-500" />
              {usuario.correo}
            </p>
          </div>
        </div>

        <div className="lg:ml-auto flex flex-col sm:flex-row gap-3">
          <Link
            to="/reportar"
            className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all"
          >
            <FilePlus className="h-4 w-4" />
            Nuevo reporte
          </Link>
          <Link
            to="/reportes-ciudadanos"
            className="inline-flex items-center justify-center gap-2 border border-slate-600 text-white px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all"
          >
            Ver galería
          </Link>
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-emerald-400" />
          Estadísticas generales
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {tarjetasResumen.map(({ titulo, valor, icono: Icono, color, fondo }) => (
            <div key={titulo} className={`card-premium rounded-2xl p-5 border ${fondo}`}>
              <Icono className={`h-5 w-5 mb-3 ${color}`} />
              <p className="text-3xl font-heading text-white">{valor}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">
                {titulo}
              </p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="card-premium rounded-2xl p-6 border border-slate-700/50">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
              Por severidad
            </h3>
            <div className="space-y-3">
              {(['Leve', 'Moderado', 'Grave'] as const).map((sev) => {
                const cantidad = estadisticas.porSeveridad[sev];
                const porcentaje =
                  estadisticas.total > 0 ? Math.round((cantidad / estadisticas.total) * 100) : 0;
                return (
                  <div key={sev}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">{sev}</span>
                      <span className="font-bold text-white">
                        {cantidad} ({porcentaje}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          sev === 'Leve'
                            ? 'bg-emerald-500'
                            : sev === 'Moderado'
                              ? 'bg-orange-500'
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card-premium rounded-2xl p-6 border border-slate-700/50">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
              Detalles adicionales
            </h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2">
                  <Camera className="h-4 w-4 text-emerald-500" />
                  Reportes con foto
                </span>
                <span className="font-bold text-white">{estadisticas.conFoto}</span>
              </li>
              <li className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  Incidentes graves
                </span>
                <span className="font-bold text-white">{estadisticas.porSeveridad.Grave}</span>
              </li>
              {estadisticas.ultimoReporte && (
                <li className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-emerald-500" />
                    Último reporte
                  </span>
                  <span className="font-bold text-white text-right text-xs max-w-[50%]">
                    {estadisticas.ultimoReporte}
                  </span>
                </li>
              )}
            </ul>
            {Object.keys(estadisticas.categorias).length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-800">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">
                  Por categoría
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(estadisticas.categorias).map(([cat, n]) => (
                    <span
                      key={cat}
                      className="text-[10px] font-bold uppercase px-3 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700"
                    >
                      {cat}: {n}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-emerald-400" />
          Mis reportes ({reportes.length})
        </h2>

        {reportes.length === 0 ? (
          <div className="card-premium rounded-3xl p-16 text-center">
            <FileText className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-6">Aún no has enviado ningún reporte.</p>
            <Link
              to="/reportar"
              className="inline-flex items-center gap-2 text-emerald-400 font-bold text-sm uppercase tracking-widest hover:underline"
            >
              <FilePlus className="h-4 w-4" />
              Crear mi primer reporte
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
                  <p className="text-sm text-slate-200 leading-relaxed flex-1 line-clamp-3">
                    {r.descripcion}
                  </p>

                  <div className="flex flex-wrap gap-3 text-[10px] font-bold uppercase text-slate-500 tracking-wide">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(r.fecha).toLocaleString('es-CO', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {r.latitud.toFixed(4)}, {r.longitud.toFixed(4)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <span className={`text-[9px] font-bold uppercase ${colorEstado[r.estado]}`}>
                      {r.estado}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
