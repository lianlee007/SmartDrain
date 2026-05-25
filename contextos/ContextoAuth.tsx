/**
 * Contexto global de autenticación para SmartDrain.
 * Expone el usuario activo, estado de carga y métodos para registrar,
 * iniciar sesión y cerrar sesión mediante ServicioAuth.
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Usuario } from '../tipos';
import { ServicioAuth } from '../servicios/ServicioAuth';

interface ContextoAuthValor {
  usuario: Usuario | null;
  cargando: boolean;
  registrar: (nombre: string, correo: string, password: string, recordar: boolean) => Promise<void>;
  iniciarSesion: (correo: string, password: string, recordar: boolean) => Promise<void>;
  cerrarSesion: () => void;
}

const ContextoAuth = createContext<ContextoAuthValor | undefined>(undefined);

/** Proveedor que envuelve la app y sincroniza el estado de sesión */
export const ProveedorAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  // Restaura la sesión persistida (localStorage) al montar la aplicación
  useEffect(() => {
    const sesion = ServicioAuth.obtenerSesionActiva();
    setUsuario(sesion);
    setCargando(false);
  }, []);

  /** Crea cuenta nueva y persiste la sesión según la opción "recordar" */
  const registrar = async (nombre: string, correo: string, password: string, recordar: boolean) => {
    const nuevo = await ServicioAuth.registrar(nombre, correo, password);
    ServicioAuth.guardarSesion(nuevo, recordar);
    setUsuario(nuevo);
  };

  /** Valida credenciales y actualiza el usuario en contexto */
  const iniciarSesion = async (correo: string, password: string, recordar: boolean) => {
    const activo = await ServicioAuth.iniciarSesion(correo, password);
    ServicioAuth.guardarSesion(activo, recordar);
    setUsuario(activo);
  };

  /** Elimina la sesión almacenada y limpia el estado local */
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

/** Hook para consumir el contexto de auth desde cualquier componente hijo */
export const usarAuth = () => {
  const context = useContext(ContextoAuth);
  if (!context) throw new Error('usarAuth debe usarse dentro de un ProveedorAuth');
  return context;
};
