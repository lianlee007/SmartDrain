/**
 * Componente raíz de SmartDrain: enrutamiento, autenticación y layout global.
 * Envuelve la app con el proveedor de sesión, define rutas públicas/privadas
 * y muestra la barra de navegación en todas las pantallas.
 */
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ProveedorAuth, usarAuth } from './contextos/ContextoAuth';
import { BarraNavegacion } from './componentes/BarraNavegacion';
import { Activity } from 'lucide-react';

import Inicio from './paginas/Inicio';
import Acceso from './paginas/Acceso';
import Registro from './paginas/Registro';
import NuevoReporte from './paginas/NuevoReporte';
import PanelIoT from './paginas/PanelIoT';
import ReportesCiudadanos from './paginas/ReportesCiudadanos';
import DetalleReporte from './paginas/DetalleReporte';
import Perfil from './paginas/Perfil';

/** Pantalla de espera mientras se restaura la sesión del usuario */
const PantallaCarga = () => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-4">
    <Activity className="h-10 w-10 text-emerald-500 animate-spin" />
    <p className="text-xs font-bold uppercase tracking-[0.4em] text-slate-400">Cargando SmartDrain</p>
  </div>
);

/** Redirige a /acceso si no hay sesión; guarda la ruta de origen para volver tras login */
const RutaPrivada = ({ children }: { children: React.ReactNode }) => {
  const { usuario, cargando } = usarAuth();
  const location = useLocation();
  if (cargando) return <PantallaCarga />;
  if (!usuario) return <Navigate to="/acceso" state={{ from: location }} replace />;
  return <>{children}</>;
};

/** Impide acceder a login/registro si el usuario ya está autenticado */
const RutaPublica = ({ children }: { children: React.ReactNode }) => {
  const { usuario, cargando } = usarAuth();
  if (cargando) return <PantallaCarga />;
  if (usuario) return <Navigate to="/" replace />;
  return <>{children}</>;
};

/** Layout principal: barra de navegación y definición de todas las rutas */
const LayoutApp = () => {
  const { cargando } = usarAuth();

  if (cargando) return <PantallaCarga />;

  return (
    <div className="min-h-screen">
      <BarraNavegacion />
      <main>
        <Routes>
          <Route path="/acceso" element={<RutaPublica><Acceso /></RutaPublica>} />
          <Route path="/registro" element={<RutaPublica><Registro /></RutaPublica>} />
          <Route path="/" element={<Inicio />} />
          <Route path="/panel" element={<PanelIoT />} />
          <Route path="/reportar" element={<RutaPrivada><NuevoReporte /></RutaPrivada>} />
          <Route path="/perfil" element={<RutaPrivada><Perfil /></RutaPrivada>} />
          <Route path="/reportes-ciudadanos/:id" element={<DetalleReporte />} />
          <Route path="/reportes-ciudadanos" element={<ReportesCiudadanos />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

/** Raíz de la aplicación: proveedor de auth + router */
export default function App() {
  return (
    <ProveedorAuth>
      <BrowserRouter>
        <LayoutApp />
      </BrowserRouter>
    </ProveedorAuth>
  );
}
