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
- [MySQL Server 8](https://dev.mysql.com/downloads/installer/) (servicio `MySQL80` en ejecución)
- [DBeaver](https://dbeaver.io/) (opcional, para ver la base de datos)

## Instalación y ejecución

```bash
npm install
copy .env.example .env.local
```

Edita `.env.local` y pon tu contraseña de **root** de MySQL en `MYSQL_ROOT_PASSWORD`.

```bash
# Crear base de datos, tablas y datos iniciales (por comandos)
npm run db:setup

# API + frontend (recomendado)
npm run dev:all
```

Abre [http://localhost:3000](http://localhost:3000). La API corre en el puerto `3001` y guarda todo en MySQL.

## Variables de entorno (`.env.local`)

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=smartdrain
DB_PASSWORD=smartdrain123
DB_NAME=smartdrain
MYSQL_ROOT_PASSWORD=tu_password_root

API_PORT=3001

VITE_GROQ_API_KEY=
VITE_GROQ_MODEL=llama-3.3-70b-versatile
```

Las variables `DB_*` solo las usa el servidor Node. **No** uses el prefijo `VITE_` para contraseñas de MySQL.

## Ver la base de datos en DBeaver

1. **Database** → **New Database Connection** → **MySQL**
2. **Host:** `localhost` · **Port:** `3307` (revisa `DB_PORT` en `.env.local`; muchas PCs no usan 3306) · **Database:** `smartdrain`
3. **Username:** `smartdrain` · **Password:** la de `DB_PASSWORD` en `.env.local` (por defecto `123456`)
4. **Test Connection** → **Finish**
5. En el árbol: `smartdrain` → **Tables** → `usuarios`, `reportes`, `sensores`, `mantenimiento_sensores`

Para conectar como administrador usa el usuario `root` y tu `MYSQL_ROOT_PASSWORD`.

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run db:setup` | Crea la BD MySQL (`database/schema.sql`) |
| `npm run dev:api` | API Express + MySQL (puerto 3001) |
| `npm run dev` | Frontend Vite (puerto 3000) |
| `npm run dev:all` | API y frontend a la vez |
| `npm run build` | Compila para producción |
| `npm run preview` | Vista previa del build |
| `npm run lint` | Verificación TypeScript |

## Estructura del proyecto

```
SmartDrain/
├── database/         # schema.sql (MySQL)
├── server/           # API Express
├── paginas/          # Vistas (Inicio, Acceso, Reporte, Panel)
├── componentes/      # UI reutilizable
├── contextos/        # Auth
├── servicios/        # API clima, Groq, MySQL vía REST
├── tipos/            # Interfaces TypeScript
└── utilidades/       # Helpers de mapas y gráficas
```

## Tecnologías

- React 19 + TypeScript + Vite
- Express + MySQL 8 (`mysql2`)
- Tailwind CSS 4
- React Router, Leaflet, Recharts
- Open-Meteo (clima)
- Groq API (análisis IA, opcional)

## Licencia

Proyecto académico — uso educativo.
