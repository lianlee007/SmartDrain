import { Usuario } from '../tipos';

export interface CuentaLocal extends Usuario {
  password: string;
}

const CLAVE_CUENTAS = 'smartdrain_cuentas';
const CLAVE_USUARIO = 'smartdrain_usuario';
const CLAVE_RECORDAR = 'smartdrain_recordar';
const CLAVE_SESION = 'smartdrain_sesion';

function normalizarCorreo(correo: string): string {
  return correo.trim().toLowerCase();
}

function obtenerCuentas(): CuentaLocal[] {
  const data = localStorage.getItem(CLAVE_CUENTAS);
  return data ? JSON.parse(data) : [];
}

function guardarCuentas(cuentas: CuentaLocal[]): void {
  localStorage.setItem(CLAVE_CUENTAS, JSON.stringify(cuentas));
}

function aUsuario(cuenta: CuentaLocal): Usuario {
  return { id: cuenta.id, nombre: cuenta.nombre, correo: cuenta.correo };
}

export const ServicioAuth = {
  emailExiste(correo: string): boolean {
    const key = normalizarCorreo(correo);
    return obtenerCuentas().some((c) => normalizarCorreo(c.correo) === key);
  },

  registrar(nombre: string, correo: string, password: string): Usuario {
    const correoNorm = normalizarCorreo(correo);
    if (ServicioAuth.emailExiste(correoNorm)) {
      throw new Error('Ya existe una cuenta con este correo.');
    }
    if (password.length < 4) {
      throw new Error('La contraseña debe tener al menos 4 caracteres.');
    }

    const cuenta: CuentaLocal = {
      id: Math.random().toString(36).slice(2, 11),
      nombre: nombre.trim(),
      correo: correoNorm,
      password,
    };
    const cuentas = obtenerCuentas();
    cuentas.push(cuenta);
    guardarCuentas(cuentas);
    return aUsuario(cuenta);
  },

  iniciarSesion(correo: string, password: string): Usuario {
    const correoNorm = normalizarCorreo(correo);
    const cuenta = obtenerCuentas().find(
      (c) => normalizarCorreo(c.correo) === correoNorm && c.password === password
    );
    if (!cuenta) {
      throw new Error('Correo o contraseña incorrectos.');
    }
    return aUsuario(cuenta);
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
