import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Sparkles, Activity, ShieldAlert, Zap, RefreshCw } from 'lucide-react';
import { DatosClima, Reporte, SensorIoT } from '../tipos';
import { ServicioGroq } from '../servicios/ServicioGroq';

const INTERVALO_MINIMO_MS = 120_000;

interface Props {
  sensores: SensorIoT[];
  clima?: DatosClima | null;
  reportes?: Reporte[];
  modoTormenta?: boolean;
}

function firmaEstable(
  sensores: SensorIoT[],
  reportes: Reporte[],
  modoTormenta: boolean,
  clima: DatosClima | null
): string {
  const estados = sensores
    .map((s) => `${s.id}:${s.estado}`)
    .sort()
    .join('|');
  const climaKey = clima
    ? `${Math.round(clima.temperatura)}-${Math.round(clima.lluvia)}`
    : 'sin-clima';
  return `${estados}::r${reportes.length}::t${modoTormenta ? 1 : 0}::c${climaKey}`;
}

export const AnalisisIA: React.FC<Props> = ({
  sensores,
  clima = null,
  reportes = [],
  modoTormenta = false,
}) => {
  const [insight, setInsight] = useState('');
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const ultimaPeticion = useRef(0);
  const ultimaConsultaMs = useRef(0);
  const ultimaFirma = useRef('');
  const insightRef = useRef('');

  const contexto = useMemo(
    () => ({ sensores, clima, reportes, modoTormenta }),
    [sensores, clima, reportes, modoTormenta]
  );

  const firma = useMemo(
    () => firmaEstable(sensores, reportes, modoTormenta, clima),
    [sensores, reportes, modoTormenta, clima]
  );

  const ejecutarAnalisis = useCallback(async () => {
    const idPeticion = ++ultimaPeticion.current;
    const tieneTexto = Boolean(insightRef.current);

    if (!tieneTexto) {
      setCargando(true);
    } else {
      setActualizando(true);
    }

    try {
      const { texto } = await ServicioGroq.analizarRed(contexto);
      if (idPeticion !== ultimaPeticion.current) return;

      insightRef.current = texto;
      setInsight(texto);
      ultimaConsultaMs.current = Date.now();
      ultimaFirma.current = firma;
    } finally {
      if (idPeticion === ultimaPeticion.current) {
        setCargando(false);
        setActualizando(false);
      }
    }
  }, [contexto, firma]);

  useEffect(() => {
    ejecutarAnalisis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (firma === ultimaFirma.current) return;

    const tiempoDesdeUltima = Date.now() - ultimaConsultaMs.current;
    if (ultimaFirma.current && tiempoDesdeUltima < INTERVALO_MINIMO_MS) {
      return;
    }

    ejecutarAnalisis();
  }, [firma, ejecutarAnalisis]);

  const criticos = sensores.filter((s) => s.estado === 'Critico').length;
  const alertas = sensores.filter((s) => s.estado === 'Alerta').length;

  return (
    <div className="card-premium rounded-2xl p-5 border border-slate-200 dark:border-slate-700 relative overflow-hidden shrink-0">
      <div className="absolute top-0 right-0 p-4 opacity-[0.07] dark:opacity-10 pointer-events-none">
        <Sparkles className="h-20 w-20 text-emerald-500" />
      </div>

      <div className="flex items-start justify-between gap-3 mb-4 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
            <Zap className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400 tracking-widest">
              IA operativa
            </h4>
            <h3 className="font-heading font-bold text-slate-900 dark:text-white">Análisis SmartDrain</h3>
          </div>
        </div>
        <button
          type="button"
          onClick={() => ejecutarAnalisis()}
          disabled={cargando || actualizando}
          title="Actualizar análisis"
          className="shrink-0 p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${actualizando ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="relative min-h-[5.5rem]">
        {cargando && !insight ? (
          <div className="flex items-center gap-2 py-4">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
              Procesando análisis de la red…
            </span>
          </div>
        ) : (
          <>
            {actualizando && (
              <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-2 tracking-widest">
                Actualizando análisis…
              </p>
            )}
            <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
              {insight}
            </p>
            <div className="flex gap-4 flex-wrap mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-1.5">
                <Activity className="h-3 w-3 text-emerald-600 dark:text-emerald-500" />
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                  Nodos: {sensores.length}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="h-3 w-3 text-orange-600 dark:text-orange-500" />
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                  Alertas: {alertas} · Críticos: {criticos}
                </span>
              </div>
              {reportes.length > 0 && (
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">
                  Reportes: {reportes.length}
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
