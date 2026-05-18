import React, { createContext, useContext, useState, useEffect } from 'react';
import { Usuario } from '../tipos';
import { ServicioAuth } from '../servicios/ServicioAuth';

interface ContextoAuthValor {
  usuario: Usuario | null;
  cargando: boolean;
  registrar: (nombre: string, correo: string, password: string, recordar: boolean) => void;
  iniciarSesion: (correo: string, password: string, recordar: boolean) => void;
  cerrarSesion: () => void;
}

const ContextoAuth = createContext<ContextoAuthValor | undefined>(undefined);

export const ProveedorAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const sesion = ServicioAuth.obtenerSesionActiva();
    setUsuario(sesion);
    setCargando(false);
  }, []);

  const registrar = (nombre: string, correo: string, password: string, recordar: boolean) => {
    const nuevo = ServicioAuth.registrar(nombre, correo, password);
    ServicioAuth.guardarSesion(nuevo, recordar);
    setUsuario(nuevo);
  };

  const iniciarSesion = (correo: string, password: string, recordar: boolean) => {
    const activo = ServicioAuth.iniciarSesion(correo, password);
    ServicioAuth.guardarSesion(activo, recordar);
    setUsuario(activo);
  };

  const cerrarSesion = () => {
    ServicioAuth.cerrarSesion();
    setUsuario(null);
  };

  return (
    <ContextoAuth.Provider value={{ usuario, cargando, registrar, iniciarSesion, cerrarSesion }}>
      {children}
    </ContextoAuth.Provider>
  );
};

export const usarAuth = () => {
  const context = useContext(ContextoAuth);
  if (!context) throw new Error('usarAuth debe usarse dentro de un ProveedorAuth');
  return context;
};
