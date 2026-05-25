/**
 * Barra de navegación principal de SmartDrain.
 * Enlaces de rutas, estado de sesión y menú responsive para móvil.
 */
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Droplets, Menu, X, LayoutGrid, FilePlus, Map, Users, LogIn, UserPlus } from 'lucide-react';
import { usarAuth } from '../contextos/ContextoAuth';

export const BarraNavegacion = () => {
  const { usuario, cerrarSesion } = usarAuth();
  const location = useLocation();
  const [menuAbierto, setMenuAbierto] = React.useState(false);

  // Rutas públicas visibles en escritorio y en el drawer móvil
  const navLinks = [
    { nombre: 'Inicio', ruta: '/', icono: Map },
    { nombre: 'Dashboard', ruta: '/panel', icono: LayoutGrid },
    { nombre: 'Nuevo Reporte', ruta: '/reportar', icono: FilePlus },
    { nombre: 'Reportes', ruta: '/reportes-ciudadanos', icono: Users },
  ];

  const EsActivo = (ruta: string) => location.pathname === ruta;

  return (
    <nav className="nav-bar sticky top-0 z-[100] w-full">
      <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-10">
          {/* Logo y marca */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 transition-transform group-hover:scale-105">
              <Droplets className="h-6 w-6 text-slate-950" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">SmartDrain</span>
          </Link>

          {/* Navegación horizontal (solo pantallas grandes) */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.ruta}
                to={link.ruta}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                  EsActivo(link.ruta)
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <link.icono className="h-4 w-4" />
                {link.nombre}
              </Link>
            ))}
          </div>
        </div>

        {/* Zona derecha: perfil/sesión o acceso, más botón hamburguesa */}
        <div className="flex items-center gap-3">
          {usuario ? (
            <>
              <Link
                to="/perfil"
                className={`hidden md:flex items-center gap-3 px-4 py-2 rounded-xl border transition-all ${
                  EsActivo('/perfil')
                    ? 'bg-emerald-500/10 border-emerald-500/40'
                    : 'bg-slate-800 border-slate-700 hover:border-emerald-500/40 hover:bg-slate-800/80'
                }`}
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center text-[10px] font-black text-slate-900">
                  {usuario.nombre[0].toUpperCase()}
                </div>
                <span className="text-xs font-bold text-slate-200">{usuario.nombre}</span>
              </Link>
              <button
                onClick={cerrarSesion}
                className="hidden sm:inline text-xs font-bold text-red-500 hover:underline uppercase tracking-widest"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/acceso"
                state={{ from: location }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-300 border border-slate-600 hover:text-white hover:border-slate-500 hover:bg-white/5 transition-all"
              >
                <LogIn className="h-4 w-4" />
                Iniciar sesión
              </Link>
              <Link
                to="/registro"
                state={{ from: location }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-950 bg-emerald-500 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
              >
                <UserPlus className="h-4 w-4" />
                Registrarse
              </Link>
            </div>
          )}

          {/* Alternar menú desplegable en viewports pequeños */}
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="lg:hidden p-2 text-slate-300"
          >
            {menuAbierto ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Panel móvil: mismos enlaces + auth según estado de usuario */}
      {menuAbierto && (
        <div className="lg:hidden nav-bar border-t border-slate-700 animate-in slide-in-from-top-4">
          <div className="px-6 py-8 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.ruta}
                to={link.ruta}
                onClick={() => setMenuAbierto(false)}
                className={`flex items-center gap-4 px-4 py-4 rounded-2xl text-sm font-bold uppercase tracking-widest ${
                  EsActivo(link.ruta)
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'text-slate-300'
                }`}
              >
                <link.icono className="h-5 w-5" />
                {link.nombre}
              </Link>
            ))}
            {!usuario && (
              <div className="pt-4 mt-4 border-t border-slate-700 space-y-3">
                <Link
                  to="/acceso"
                  state={{ from: location }}
                  onClick={() => setMenuAbierto(false)}
                  className="flex items-center justify-center gap-2 px-4 py-4 rounded-2xl text-sm font-bold uppercase tracking-widest text-slate-300 border border-slate-600"
                >
                  <LogIn className="h-5 w-5" />
                  Iniciar sesión
                </Link>
                <Link
                  to="/registro"
                  state={{ from: location }}
                  onClick={() => setMenuAbierto(false)}
                  className="flex items-center justify-center gap-2 px-4 py-4 rounded-2xl text-sm font-bold uppercase tracking-widest text-slate-950 bg-emerald-500"
                >
                  <UserPlus className="h-5 w-5" />
                  Registrarse
                </Link>
              </div>
            )}
            {usuario && (
              <>
                <Link
                  to="/perfil"
                  onClick={() => setMenuAbierto(false)}
                  className={`flex items-center gap-4 px-4 py-4 rounded-2xl text-sm font-bold uppercase tracking-widest ${
                    EsActivo('/perfil')
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'text-slate-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-xs font-black text-slate-900">
                    {usuario.nombre[0].toUpperCase()}
                  </div>
                  Mi perfil — {usuario.nombre}
                </Link>
                <button
                  onClick={() => {
                    cerrarSesion();
                    setMenuAbierto(false);
                  }}
                  className="w-full pt-4 border-t border-slate-700 text-sm font-bold text-red-500 uppercase tracking-widest"
                >
                  Cerrar sesión
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
