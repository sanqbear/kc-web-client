# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
npm run dev      # Start development server (http://localhost:5173)
npm run build    # Type-check with vue-tsc and build for production
npm run preview  # Preview production build locally
```

## Tech Stack

- **Framework**: Vue 3 with `<script setup>` SFCs and TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS v4 (via `@tailwindcss/postcss`)
- **State Management**: Pinia
- **Routing**: Vue Router
- **i18n**: vue-i18n
- **Type Checking**: vue-tsc

## Project Structure

```
src/
├── main.ts          # App entry point
├── App.vue          # Root component
├── style.css        # Global styles (includes Tailwind import)
├── components/      # Vue components
├── composables/     # Reusable logic
├── i18n/            # Internationalization
│   ├── index.ts     # i18n configuration
│   └── locales/     # Language files (ko.ts, en.ts)
├── router/          # Router definitions
├── stores/          # Pinia stores
├── types/           # TypeScript type definitions
├── utils/           # Helper functions, API client
├── views/           # Pages, routed components
└── assets/          # Static assets
```

## Styling Notes

- Tailwind CSS v4 uses `@import "tailwindcss";` syntax in `src/style.css`
- PostCSS is configured with `@tailwindcss/postcss` plugin
- Use Tailwind utility classes directly in Vue templates

## Internationalization (i18n)

All user-facing text must use i18n. Never hardcode Korean/English strings in components.

### Usage in Components

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <h1>{{ t('auth.login') }}</h1>
  <p>{{ t('home.greeting', { name: userName }) }}</p>
</template>
```

### Adding New Translations

1. Add keys to both `src/i18n/locales/ko.ts` and `src/i18n/locales/en.ts`
2. Use nested structure by domain: `common`, `auth`, `home`, `validation`, etc.
3. Use parameters for dynamic values: `{ name: 'John' }` → `'Hello, {name}'`

### Locale Structure

```typescript
// src/i18n/locales/ko.ts
export default {
  common: { appName: 'Knowledge Center', ... },
  auth: { login: '로그인', ... },
  validation: { required: '필수 입력 항목입니다', ... },
}
```

### Switching Locale

```typescript
import { setLocale } from '@/i18n'
setLocale('en') // or 'ko'
```

## Backend API

Backend server source is located at `../kc-api-server` (Go + chi router + PostgreSQL).

### Dev Server Proxy

Vite dev server proxies API requests to the backend (default: `http://localhost:8080`):

| Frontend Path | Backend Path | Description |
|---------------|--------------|-------------|
| `/api/*` | `/*` | API endpoints (`/api` prefix stripped) |
| `/swagger/*` | `/swagger/*` | Swagger UI and docs |

### API Endpoints

- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `POST /api/auth/refresh` - Refresh tokens
- `GET /api/auth/me` - Current user (protected)
- `GET /api/users` - User list (protected)

Full API documentation available at `/swagger/index.html` when backend is running.

### Backend Source Reference

```
../kc-api-server/
├── cmd/api/main.go           # Entry point, DI root
├── internal/
│   ├── server/
│   │   ├── server.go         # HTTP server setup
│   │   └── routes.go         # Router configuration
│   ├── auth/                 # Authentication domain
│   │   ├── handler.go        # Auth endpoints
│   │   └── middleware.go     # JWT middleware
│   ├── users/                # User domain
│   └── database/             # PostgreSQL connection
└── docs/                     # Swagger documentation
```
