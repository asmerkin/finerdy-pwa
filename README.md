# Finerdy PWA

Progressive Web App para gestión de finanzas personales.

## Stack

- **Nuxt 3** - Framework Vue
- **Pinia** - State management
- **Tailwind CSS** - Estilos
- **@vite-pwa/nuxt** - PWA features
- **Heroicons** - Iconografía

## Requisitos

- Node.js 18+
- npm 9+

## Setup

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Configurar API base URL en .env
NUXT_PUBLIC_API_BASE=http://localhost
```

## Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev
```

La app estará disponible en `http://localhost:3000`

## Build

```bash
# Build para producción
npm run build

# Preview del build
npm run preview
```

## PWA

La app incluye:
- Manifest para instalación
- Service Worker para cache offline
- Iconos para diferentes plataformas

### Iconos requeridos

Coloca los iconos en `public/icons/`:
- `icon-192.png` (192x192)
- `icon-512.png` (512x512)

## API Backend

Esta PWA consume la API de Laravel ubicada en el repositorio `expenses`.

### Configuración CORS en Laravel

```php
// config/cors.php
'allowed_origins' => ['http://localhost:3000'],
'supports_credentials' => true,

// config/sanctum.php
'stateful' => ['localhost:3000'],

// config/session.php
'same_site' => 'lax',
```

## Estructura

```
finerdy-pwa/
├── assets/css/        # Estilos globales
├── components/        # Componentes Vue
│   ├── Common/        # Card, Badge, etc.
│   ├── Forms/         # FormButton, IconButton, etc.
│   ├── Navigation/    # Sidebar, MobileHeader
│   └── Tables/        # TransactionsTable, etc.
├── composables/       # Composables reutilizables
├── layouts/           # Layouts de página
├── middleware/        # Auth middleware
├── pages/             # Páginas (file-based routing)
├── plugins/           # Plugins Nuxt
├── public/            # Assets estáticos
├── stores/            # Pinia stores
└── types/             # TypeScript types
```

## Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `NUXT_PUBLIC_API_BASE` | URL base de la API | `http://localhost` |

## Licencia

Privado
