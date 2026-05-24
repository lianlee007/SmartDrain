import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { UserPlus, Droplets, Users, Activity, Sparkles, ArrowRight } from 'lucide-react';
import { usarAuth } from '../contextos/ContextoAuth';
import { ServicioAuth } from '../servicios/ServicioAuth';
import { motion } from 'motion/react';
import { BotonVolver } from '../componentes/BotonVolver';
import { CampoContrasena } from '../componentes/CampoContrasena';

const destacados = [
  { icono: Users, titulo: 'Comunidad', desc: 'Únete a otros ciudadanos reportando incidentes' },
  { icono: Activity, titulo: 'Tiempo real', desc: 'Tus alertas llegan al panel operativo al instante' },
  { icono: Sparkles, titulo: 'IA integrada', desc: 'Análisis inteligente de reportes con Groq' },
];

export default function Registro() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [recordar, setRecordar] = useState(() => ServicioAuth.obtenerPreferenciaRecordar());
  const [error, setError] = useState('');
  const { registrar } = usarAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destino = (location.state as { from?: { pathname: string } } | null)?.from?.pathname || '/reportar';

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await registrar(nombre, correo, password, recordar);
      navigate(destino, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la cuenta.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 sm:px-6 py-10 lg:py-14">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-5xl card-premium rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden border border-slate-700/60 shadow-2xl shadow-black/30 grid lg:grid-cols-[1.05fr_1fr]"
      >
        {/* Panel izquierdo — marca */}
        <div className="relative hidden lg:flex flex-col justify-between p-10 xl:p-12 bg-gradient-to-br from-blue-500/10 via-slate-900/90 to-slate-950 border-r border-slate-700/50">
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500 shadow-lg shadow-emerald-500/25 mb-8">
              <Droplets className="h-8 w-8 text-slate-950" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-emerald-400 mb-3">
              Nueva cuenta
            </p>
            <h1 className="text-3xl xl:text-4xl font-heading font-medium text-white leading-tight mb-4">
              Únete a la red <span className="italic text-emerald-400">cívica</span>
            </h1>
            <p className="text-slate-400 leading-relaxed max-w-sm">
              Crea tu cuenta en segundos y empieza a reportar problemas del alcantarillado en tu
              barrio.
            </p>
          </div>

          <div className="relative z-10 grid gap-3 mt-10">
            {destacados.map(({ icono: Icono, titulo, desc }) => (
              <div
                key={titulo}
                className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-4 flex gap-3"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15">
                  <Icono className="h-4 w-4 text-emerald-400" />
                </span>
                <div>
                  <p className="text-sm font-bold text-white">{titulo}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel derecho — formulario */}
        <div className="p-8 sm:p-10 lg:p-12 flex flex-col justify-center">
          <BotonVolver className="mb-6" />

          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-xl bg-emerald-500 flex items-center justify-center">
              <Droplets className="h-6 w-6 text-slate-950" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-heading text-white">Crear cuenta</h2>
              <p className="text-sm text-slate-400">Regístrate en SmartDrain</p>
            </div>
          </div>

          <div className="hidden lg:block mb-8">
            <h2 className="text-2xl font-bold font-heading text-white">Crear cuenta</h2>
            <p className="text-slate-400 mt-1 text-sm">Completa el formulario para registrarte</p>
          </div>

          {error && (
            <p className="mb-5 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <form onSubmit={manejarEnvio} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1.5 text-slate-300">Nombre completo</label>
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full input-field rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/50 focus:outline-none transition-shadow"
                  placeholder="Juan Pérez"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-300">Correo electrónico</label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className="w-full input-field rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/50 focus:outline-none transition-shadow"
                  placeholder="juan@ejemplo.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-300">Contraseña</label>
                <CampoContrasena
                  required
                  minLength={4}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mín. 4 caracteres"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={recordar}
                onChange={(e) => setRecordar(e.target.checked)}
                className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
              />
              <span className="text-sm text-slate-400">Recordar usuario en este dispositivo</span>
            </label>

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <UserPlus className="h-5 w-5" />
              Crear cuenta
              <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </form>

          <p className="text-center mt-8 text-sm text-slate-400 border-t border-slate-800 pt-6">
            ¿Ya tienes cuenta?{' '}
            <Link
              to="/acceso"
              state={location.state}
              className="text-emerald-400 font-semibold hover:underline"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
