import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Droplets } from 'lucide-react';
import { usarAuth } from '../contextos/ContextoAuth';
import { ServicioAuth } from '../servicios/ServicioAuth';
import { motion } from 'motion/react';

export default function Registro() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [recordar, setRecordar] = useState(() => ServicioAuth.obtenerPreferenciaRecordar());
  const [error, setError] = useState('');
  const { registrar } = usarAuth();
  const navigate = useNavigate();

  const manejarEnvio = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      registrar(nombre, correo, password, recordar);
      navigate('/panel', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la cuenta.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md card-container rounded-2xl p-8"
      >
        <div className="text-center mb-8">
          <div className="inline-flex justify-center items-center w-14 h-14 rounded-xl bg-emerald-500 mb-4">
            <Droplets className="h-7 w-7 text-slate-950" />
          </div>
          <h2 className="text-2xl font-bold font-heading text-white">Crear cuenta</h2>
          <p className="text-slate-400 mt-2">Únete a la red cívica de SmartDrain</p>
        </div>

        {error && (
          <p className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <form onSubmit={manejarEnvio} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-300">Nombre completo</label>
            <input
              type="text"
              required
              autoComplete="name"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full input-field rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:outline-none transition-shadow"
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
              className="w-full input-field rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:outline-none transition-shadow"
              placeholder="juan@ejemplo.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-300">Contraseña</label>
            <input
              type="password"
              required
              minLength={4}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full input-field rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:outline-none transition-shadow"
              placeholder="Mínimo 4 caracteres"
            />
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
            className="w-full mt-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <UserPlus className="h-5 w-5" />
            Crear cuenta
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-slate-400">
          ¿Ya tienes cuenta?{' '}
          <Link to="/acceso" className="text-emerald-400 font-medium hover:underline">
            Inicia sesión
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
