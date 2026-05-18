# SmartDrain — Popayán

Sistema integrado de monitoreo IoT y reporte ciudadano para la gestión de incidentes de alcantarillado en Popayán, Colombia.

**Electiva Administrativa** — Corporación Universitaria Comfacauca (Unicomfacauca)

## Integrantes

- Elkin Yesid Yandun
- Julián Leonardo Cerón
- Brayan Esmid Cruz

## Funcionalidades

- Autenticación y registro de ciudadanos
- Reportes georreferenciados con mapa interactivo
- Panel de monitoreo IoT con sensores en tiempo real
- Integración con clima (Open-Meteo)
- Análisis operativo con IA (Groq, opcional)

## Requisitos

- [Node.js](https://nodejs.org/) 18 o superior
- npm

## Instalación y ejecución

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno (opcional, para IA con Groq)
copy .env.example .env.local

# Iniciar en desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador.

## Variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
VITE_GROQ_API_KEY=tu_clave_de_groq
VITE_GROQ_MODEL=llama-3.3-70b-versatile
```

Obtén tu API key en [console.groq.com](https://console.groq.com). Sin esta clave, el análisis IA usa un modo local de respaldo.

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo (puerto 3000) |
| `npm run build` | Compila para producción |
| `npm run preview` | Vista previa del build |
| `npm run lint` | Verificación TypeScript |

## Estructura del proyecto

```
SmartDrain/
├── paginas/          # Vistas (Inicio, Acceso, Reporte, Panel)
├── componentes/      # UI reutilizable
├── contextos/        # Auth
├── servicios/        # API clima, Groq, persistencia
├── tipos/            # Interfaces TypeScript
└── utilidades/       # Helpers de mapas y gráficas
```

## Tecnologías

- React 19 + TypeScript + Vite
- Tailwind CSS 4
- React Router, Leaflet, Recharts
- Open-Meteo (clima)
- Groq API (análisis IA, opcional)
- LocalStorage (persistencia local)

## Licencia

Proyecto académico — uso educativo.
