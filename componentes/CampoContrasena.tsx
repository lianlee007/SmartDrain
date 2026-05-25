/**
 * Campo de contraseña con alternancia mostrar/ocultar.
 * Reutiliza las props nativas de input excepto type (se controla internamente).
 */
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type CampoContrasenaProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type'
>;

export function CampoContrasena({ className = '', ...props }: CampoContrasenaProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      {/* type alterna entre password y text según visible */}
      <input
        {...props}
        type={visible ? 'text' : 'password'}
        className={`w-full input-field rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-emerald-500/50 focus:outline-none transition-shadow ${className}`}
      />
      {/* Control de accesibilidad para revelar la contraseña */}
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200 transition-colors"
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      >
        {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  );
}
