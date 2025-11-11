# Backend - NestJS

## O'rnatish

```bash
npm install
```

## Konfiguratsiya

`.env` fayl yarating va `.env.example` dagi o'zgaruvchilarni to'ldiring.

## Ishga tushirish

```bash
# Development
npm run dev

# Production
npm run build
npm run start:prod
```

## API Dokumentatsiya

### Auth
- `POST /api/auth/register` - Ro'yxatdan o'tish
- `POST /api/auth/login` - Login

### Devices
- `GET /api/devices` - Barcha qurilmalar
- `POST /api/devices` - Yangi qurilma
- `GET /api/devices/:id` - Qurilma ma'lumotlari
- `DELETE /api/devices/:id` - Qurilmani o'chirish
- `POST /api/devices/command` - Command yuborish

### Users
- `GET /api/users/profile` - User profil

