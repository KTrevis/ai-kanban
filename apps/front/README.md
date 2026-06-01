# Frontend Travaille

Interface React/Vite du Kanban Travaille.

## Démarrage

Depuis la racine du repo :

```bash
bun run dev:front
```

Ou depuis `apps/front` :

```bash
bun run dev
```

Le frontend démarre sur `http://localhost:6969`.

## Configuration

Variables Vite optionnelles :

```dotenv
VITE_BACK_URL=http://localhost:420
VITE_OPENCODE_URL=http://127.0.0.1:4096
```

- `VITE_BACK_URL` : URL du backend Elysia. Défaut : `http://localhost:420`.
- `VITE_OPENCODE_URL` : URL utilisée pour ouvrir les sessions OpenCode. Défaut : `http://127.0.0.1:4096`.

## Scripts

```bash
bun run build
bun run test
bun run check-types
bun run lint
bun run format
```

## Stack

- React 19
- Vite
- TanStack Router
- TanStack Query
- Eden Treaty pour le client typé backend
- Tailwind CSS
