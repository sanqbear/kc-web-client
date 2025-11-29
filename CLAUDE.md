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
- **Type Checking**: vue-tsc

## Project Structure

```
src/
├── main.ts          # App entry point
├── App.vue          # Root component
├── style.css        # Global styles (includes Tailwind import)
├── components/      # Vue components
└── assets/          # Static assets
```

## Styling Notes

- Tailwind CSS v4 uses `@import "tailwindcss";` syntax in `src/style.css`
- PostCSS is configured with `@tailwindcss/postcss` plugin
- Use Tailwind utility classes directly in Vue templates

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
