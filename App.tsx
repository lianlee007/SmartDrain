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

const PantallaCarga = () => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-4">
    <Activity className="h-10 w-10 text-emerald-500 animate-spin" />
    <p className="text-xs font-bold uppercase tracking-[0.4em] text-slate-400">Cargando SmartDrain</p>
  </div>
);

const RutaPrivada = ({ children }: { children: React.ReactNode }) => {
  const { usuario, cargando } = usarAuth();
  if (cargando) return <PantallaCarga />;
  if (!usuario) return <Navigate to="/acceso" replace />;
  return <>{children}</>;
};

const RutaPublica = ({ children }: { children: React.ReactNode }) => {
  const { usuario, cargando } = usarAuth();
  if (cargando) return <PantallaCarga />;
  if (usuario) return <Navigate to="/panel" replace />;
  return <>{children}</>;
};

const LayoutApp = () => {
  const { usuario, cargando } = usarAuth();
  const location = useLocation();
  const esAuth = location.pathname === '/acceso' || location.pathname === '/registro';

  if (cargando) return <PantallaCarga />;

  return (
    <div className="min-h-screen">
      {usuario && !esAuth && <BarraNavegacion />}
      <main>
        <Routes>
          <Route path="/acceso" element={<RutaPublica><Acceso /></RutaPublica>} />
          <Route path="/registro" element={<RutaPublica><Registro /></RutaPublica>} />
          <Route path="/" element={<RutaPrivada><Inicio /></RutaPrivada>} />
          <Route path="/panel" element={<RutaPrivada><PanelIoT /></RutaPrivada>} />
          <Route path="/reportar" element={<RutaPrivada><NuevoReporte /></RutaPrivada>} />
          <Route path="/reportes-ciudadanos" element={<RutaPrivada><ReportesCiudadanos /></RutaPrivada>} />
          <Route path="*" element={<Navigate to={usuario ? '/panel' : '/acceso'} replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <ProveedorAuth>
      <BrowserRouter>
        <LayoutApp />
      </BrowserRouter>
    </ProveedorAuth>
  );
}
