# Smart Pump Control - System Overview

Production-ready Smart Pump Control with React (Vite), Fastify (TypeScript), TimescaleDB/Postgres, Redis, and Mosquitto (MQTT).

## Quick Start

1) Start infrastructure (Postgres/Timescale, Redis, Mosquitto):

```bash
docker compose up -d
```

2) Backend
```bash
cd backend
npm install
npm run dev
```

Environment (create .env in repo root or backend/.env):
```
PORT=4000
API_PREFIX=/api/v1
JWT_SECRET=change_me_in_prod
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/smart_pump?schema=public
REDIS_URL=redis://localhost:6379
MQTT_URL=mqtt://localhost:1883
MQTT_USERNAME=backend_service
MQTT_PASSWORD=backend_secret
TIMESCALE=true
```

3) Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend env (frontend/.env):
```
VITE_API_URL=http://localhost:4000/api/v1
VITE_WS_URL=ws://localhost:4000
VITE_MQTT_URL=ws://localhost:9001
VITE_MQTT_USERNAME=frontend_client
VITE_MQTT_PASSWORD=frontend_secret
```

## Acceptance Paths
- Login with JWT
- Devices CRUD and basic pump commands (MVP)
- i18n (uz, ru, en) with language switcher
- MQTT telemetry ingestion (scaffold) and command publish
- About page with authors

## Loyiha Strukturasi

```
.
├── backend/          # Fastify + TypeScript backend
├── frontend/         # React + Vite + TypeScript
├── hardware/         # Protocol docs and reference firmware outline
└── README.md
```

## Backend (NestJS)

### Texnologiyalar

- NestJS
- TypeScript
- MongoDB (Mongoose)
- MQTT
- JWT Authentication
- Passport

### O'rnatish

```bash
cd backend
npm install
```

### Konfiguratsiya

`.env` fayl yarating:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mqtt-devices
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
MQTT_BROKER_URL=mqtt://localhost:1883
MQTT_USERNAME=
MQTT_PASSWORD=
NODE_ENV=development
```

### Ishga tushirish

```bash
# Development
npm run dev

# Production build
npm run build
npm run start:prod
```

### API Endpoints

- `POST /api/auth/register` - Ro'yxatdan o'tish
- `POST /api/auth/login` - Tizimga kirish
- `GET /api/users/profile` - User profil (auth kerak)
- `GET /api/devices` - Barcha qurilmalar (auth kerak)
- `POST /api/devices` - Yangi qurilma qo'shish (auth kerak)
- `GET /api/devices/:id` - Qurilma ma'lumotlari (auth kerak)
- `DELETE /api/devices/:id` - Qurilmani o'chirish (auth kerak)
- `POST /api/devices/command` - MQTT ga command yuborish (auth kerak)

## Mobile (React + Capacitor)

### Texnologiyalar

- React 18
- TypeScript
- Vite
- Capacitor
- Tailwind CSS
- Framer Motion
- React Query
- Zustand

### O'rnatish

```bash
cd mobile
npm install
```

### Konfiguratsiya

`.env` fayl yarating:

```env
VITE_API_URL=http://localhost:5000/api
```

### Ishga tushirish

```bash
# Development
npm run dev

# Build
npm run build

# Capacitor sync
npm run cap:sync

# iOS
npm run cap:add:ios
npm run cap:open:ios

# Android
npm run cap:add:android
npm run cap:open:android
```

## Funksiyalar

### Backend

- ✅ User authentication (JWT)
- ✅ Admin funksiyalari
- ✅ Device CRUD operatsiyalari
- ✅ MQTT integratsiyasi
- ✅ Command yuborish

### Mobile

- ✅ User authentication
- ✅ Device management
- ✅ Voice commands (motor on/off)
- ✅ Modern UI (Tailwind CSS)
- ✅ Animatsiyalar (Framer Motion)
- ✅ Performance optimizatsiyasi

## Voice Commands

Hozirgi vaqtda quyidagi voice commandlar qo'llab-quvvatlanadi:

- "Motor on" yoki "Turn on motor"
- "Motor off" yoki "Turn off motor"
- Custom commandlar (to'g'ridan-to'g'ri MQTT ga yuboriladi)

## Rivojlantirish

Loyiha TypeScript, advanced performance optimizatsiyalari va modern best practices asosida qurilgan.
