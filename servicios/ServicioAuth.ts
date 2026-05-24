import { Usuario } from '../tipos';
import { apiFetch } from './apiCliente';

const CLAVE_USUARIO = 'smartdrain_usuario';
const CLAVE_RECORDAR = 'smartdrain_recordar';
const CLAVE_SESION = 'smartdrain_sesion';

export const ServicioAuth = {
  async emailExiste(correo: string): Promise<boolean> {
    const { existe } = await apiFetch<{ existe: boolean }>(
      `/auth/existe?correo=${encodeURIComponent(correo)}`
    );
    return existe;
  },

  async registrar(nombre: string, correo: string, password: string): Promise<Usuario> {
    return apiFetch<Usuario>('/auth/registro', {
      method: 'POST',
      body: JSON.stringify({ nombre, correo, password }),
    });
  },

  async iniciarSesion(correo: string, password: string): Promise<Usuario> {
    return apiFetch<Usuario>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ correo, password }),
    });
  },

  guardarSesion(usuario: Usuario, recordar: boolean): void {
    const json = JSON.stringify(usuario);
    sessionStorage.setItem(CLAVE_SESION, json);

    if (recordar) {
      localStorage.setItem(CLAVE_USUARIO, json);
      localStorage.setItem(CLAVE_RECORDAR, 'true');
    } else {
      localStorage.removeItem(CLAVE_USUARIO);
      localStorage.setItem(CLAVE_RECORDAR, 'false');
    }
  },

  obtenerSesionActiva(): Usuario | null {
    const sesion = sessionStorage.getItem(CLAVE_SESION);
    if (sesion) {
      try {
        return JSON.parse(sesion) as Usuario;
      } catch {
        sessionStorage.removeItem(CLAVE_SESION);
      }
    }

    const recordar = localStorage.getItem(CLAVE_RECORDAR) === 'true';
    if (recordar) {
      const persistido = localStorage.getItem(CLAVE_USUARIO);
      if (persistido) {
        try {
          const usuario = JSON.parse(persistido) as Usuario;
          sessionStorage.setItem(CLAVE_SESION, persistido);
          return usuario;
        } catch {
          localStorage.removeItem(CLAVE_USUARIO);
        }
      }
    }

    return null;
  },

  obtenerPreferenciaRecordar(): boolean {
    return localStorage.getItem(CLAVE_RECORDAR) !== 'false';
  },

  cerrarSesion(): void {
    sessionStorage.removeItem(CLAVE_SESION);
    localStorage.removeItem(CLAVE_USUARIO);
    localStorage.removeItem(CLAVE_RECORDAR);
  },
};
