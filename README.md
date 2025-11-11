# Asadbek-Project (mobile frontend + Capacitor)

Bu branch frontendni mobil-first qilib yaratish, Tailwind + shadcn UI asosli komponentlar va Capacitor konfiguratsiyasini qo‘shadi. Shuningdek Socket.IO orqali backenddan kelgan telemetry eventlarga asosan React Query invalidate/refetch ishlaydi.

## Tez boshlash (frontend)
cd frontend
npm install

Dev:
npm run dev

Build:
npm run build

Capacitor:
npm run cap:init
npm run cap:add:android
npm run cap:sync
npm run cap:open:android

## Muhit o'zgaruvchilari (frontend)
.env (local) ichida:
VITE_API_URL=http://localhost:5001
VITE_API_WS=http://localhost:5001

## Backend real-time ishlash (muhim)
Browser to‘g‘ridan-to‘g‘ri raw MQTT bilan ishlay olmaydi — backend MQTT brokerga subscribe qiladi va Socket.IO orqali frontendga event yuboradi. POST /api/devices/:id/command endpointi esa device'ga buyruq yuborishda backend orqali MQTT publish qiladi.

## ESP32 topic convention
Telemetry topic: devices/{deviceId}/telemetry
Command topic: devices/{deviceId}/command
