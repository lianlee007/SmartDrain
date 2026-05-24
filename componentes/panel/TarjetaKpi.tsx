import React from 'react';
import { LucideIcon } from 'lucide-react';

interface Props {
  icono: LucideIcon;
  titulo: string;
  valor: string | number;
  subtitulo: string;
  ayuda?: string;
  acento?: 'emerald' | 'orange' | 'red' | 'blue' | 'slate';
}

const acentos = {
  emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  orange: 'text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/20',
  red: 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20',
  blue: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20',
  slate: 'text-slate-600 dark:text-slate-400 bg-slate-500/10 border-slate-500/20',
};

export const TarjetaKpi: React.FC<Props> = ({
  icono: Icono,
  titulo,
  valor,
  subtitulo,
  ayuda,
  acento = 'slate',
}) => (
  <div
    className={`rounded-2xl border p-4 ${acentos[acento]}`}
    title={ayuda}
  >
    <div className="flex items-start justify-between gap-2 mb-2">
      <Icono className="h-4 w-4 shrink-0 opacity-80" />
      <p className="text-[9px] font-black uppercase tracking-widest opacity-70 leading-tight text-right">
        {titulo}
      </p>
    </div>
    <p className="text-2xl font-black text-gray-900 dark:text-white tabular-nums">{valor}</p>
    <p className="text-[10px] font-medium text-slate-600 dark:text-slate-400 mt-1 leading-snug">
      {subtitulo}
    </p>
  </div>
);
