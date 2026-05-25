/**
 * Tipos de variables de entorno expuestas por Vite al frontend.
 * VITE_* se inyectan en build; GROQ_* son alias opcionales en desarrollo.
 */
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GROQ_API_KEY: string;
  readonly VITE_GROQ_MODEL: string;
  readonly GROQ_API_KEY?: string;
  readonly GROQ_MODEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
