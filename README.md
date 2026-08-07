# GameCards frontend

React 18, TypeScript, and Vite client for the local GameCards two-player duel application.

## Run locally

Start PostgreSQL and the Spring backend from the sibling `GameCards` repository first. Then:

```bash
npm ci
npm run dev
```

Open `http://localhost:5173`. Runtime endpoints come from `.env` (optional) or these local defaults:

```dotenv
VITE_API_BASE_URL=http://localhost:8080
VITE_WS_BASE_URL=http://localhost:8080
```

Copy `.env.example` to `.env` to override them. Do not append `/api` or `/ws`; the client adds endpoint paths.

## Validate

```bash
npm ci
npm run lint
npm test
npm run build
```

The complete architecture, Docker setup, environment-variable reference, two-user test flow, database reset instructions, and troubleshooting guide are in the backend repository's `README.md`.
