/**
 * Botón de retroceso reutilizable.
 * Prioriza el historial del navegador; si no hay, vuelve a la ruta de origen o al inicio.
 */
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

type Props = {
  etiqueta?: string;
  className?: string;
};

export function BotonVolver({ etiqueta = 'Volver', className = '' }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  // Ruta guardada al redirigir (p. ej. desde login con state.from)
  const rutaOrigen = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;

  // history.back si hay historial; si no, ruta de origen o home
  const volver = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(rutaOrigen || '/');
    }
  };

  return (
    <button
      type="button"
      onClick={volver}
      className={`self-start w-fit inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-slate-950 bg-emerald-500 hover:bg-emerald-400 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/20 ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      {etiqueta}
    </button>
  );
}
