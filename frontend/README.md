# NASOSS Frontend

Mobile-first React app for NASOSS backend.

## Quick start

1) Install dependencies:
```
pnpm i
# or: npm i
```

2) Start backend (expected at http://localhost:3000). The dev server proxies `/api` to `http://localhost:3000`.

3) Run dev:
```
pnpm dev
# or: npm run dev
```

Open http://localhost:5173

## Features
- Auth: POST `/api/auth/login` (JWT stored in localStorage)
- Devices: list, open, create, delete, send command
- Pumps: list, open, toggle, delete, swap, send command, see data
- Monitoring: total usage, daily/monthly by `pumpId`

## Config
Vite proxy in `vite.config.ts` maps `/api` to `http://localhost:3000`. Adjust if backend runs elsewhere.

