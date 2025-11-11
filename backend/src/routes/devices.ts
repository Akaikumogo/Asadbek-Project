import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { publish } from '../services/mqtt.js';
import { Device, Pump, PumpRole, PumpMode } from '../types.js';

const deviceCreate = z.object({
  id: z.string(),
  name: z.string(),
  site: z.string().optional()
});

const pumpCommandSchema = z.object({
  deviceId: z.string(),
  pumpId: z.string(),
  on: z.boolean()
});

const switchRoleSchema = z.object({
  deviceId: z.string(),
  active: z.enum(['PRIMARY', 'SECONDARY', 'PARALLEL'])
});

const scheduleUpsertSchema = z.object({
  deviceId: z.string(),
  rules: z.array(
    z.object({
      id: z.string(),
      cron: z.string(),
      enabled: z.boolean(),
      duration_s: z.number().optional(),
      pumpId: z.string().optional()
    })
  )
});

// In-memory registry for MVP; replace with DB later
const devices = new Map<string, Device>();
const pumps = new Map<string, Pump>(); // key: `${deviceId}:${pumpId}`
const schedules = new Map<string, any[]>(); // deviceId -> rules[]
const netInfo = new Map<string, any>(); // deviceId -> net

export async function deviceRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async (req) => {
    if (!req.headers.authorization) return;
    try {
      await req.jwtVerify();
    } catch {
      // allow unauth for initial scaffold where needed, but prefer auth
    }
  });

  app.get('/devices/:id/net', async (req, res) => {
    const id = (req.params as any).id as string;
    return netInfo.get(id) ?? { connected: false };
  });

  app.get('/devices/:id/schedules', async (req, res) => {
    const id = (req.params as any).id as string;
    return schedules.get(id) ?? [];
  });

  app.post('/devices/:id/schedules', async (req, res) => {
    const id = (req.params as any).id as string;
    const body = z.object({ rules: z.array(z.any()) }).safeParse(req.body);
    if (!body.success) return res.status(400).send({ message: 'Invalid body' });
    schedules.set(id, body.data.rules);
    // also publish to device for resilience
    const correlationId = `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await publish(`cmd/pump/${id}/schedule_upsert`, { rules: body.data.rules, correlationId });
    return { ok: true, correlationId };
  });

  app.get('/devices', async () => {
    return Array.from(devices.values());
  });

  app.post('/devices', async (req, res) => {
    const parsed = deviceCreate.safeParse(req.body);
    if (!parsed.success) return res.status(400).send({ message: 'Invalid body' });
    const now = new Date().toISOString();
    const dev: Device = {
      id: parsed.data.id,
      name: parsed.data.name,
      site: parsed.data.site,
      createdAt: now,
      updatedAt: now
    };
    devices.set(dev.id, dev);
    return dev;
  });

  app.delete('/devices/:id', async (req, res) => {
    const id = (req.params as any).id as string;
    devices.delete(id);
    // delete pumps for device
    for (const key of pumps.keys()) {
      if (key.startsWith(id + ':')) pumps.delete(key);
    }
    return { ok: true };
  });

  app.get('/devices/:id/pumps', async (req, res) => {
    const id = (req.params as any).id as string;
    const list: Pump[] = [];
    for (const [key, value] of pumps) {
      if (key.startsWith(id + ':')) list.push(value);
    }
    return list;
  });

  app.post('/devices/:id/pumps', async (req, res) => {
    const id = (req.params as any).id as string;
    const body = z
      .object({
        pumpId: z.string(),
        name: z.string(),
        role: z.custom<PumpRole>().default('PRIMARY' as PumpRole),
        mode: z.custom<PumpMode>().default('Primary' as PumpMode)
      })
      .safeParse(req.body);
    if (!body.success) return res.status(400).send({ message: 'Invalid body' });
    const now = new Date().toISOString();
    const pump: Pump = {
      id: body.data.pumpId,
      deviceId: id,
      name: body.data.name,
      role: (body.data.role as PumpRole) || 'PRIMARY',
      mode: (body.data.mode as PumpMode) || 'Primary',
      on: false,
      createdAt: now,
      updatedAt: now
    };
    pumps.set(`${id}:${pump.id}`, pump);
    return pump;
  });

  app.post('/commands/pump/set', async (req, res) => {
    const parsed = pumpCommandSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).send({ message: 'Invalid body' });
    const { deviceId, pumpId, on } = parsed.data;
    const correlationId = `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await publish(`cmd/pump/${deviceId}/${pumpId}/set`, { on, correlationId });
    return { correlationId, accepted: true };
  });

  app.post('/commands/pump/switch_role', async (req, res) => {
    const parsed = switchRoleSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).send({ message: 'Invalid body' });
    const { deviceId, active } = parsed.data;
    const correlationId = `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await publish(`cmd/pump/${deviceId}/switch_role`, { active, correlationId });
    return { correlationId, accepted: true };
  });

  app.post('/commands/schedule_upsert', async (req, res) => {
    const parsed = scheduleUpsertSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).send({ message: 'Invalid body' });
    const { deviceId, rules } = parsed.data;
    const correlationId = `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await publish(`cmd/pump/${deviceId}/schedule_upsert`, { rules, correlationId });
    return { correlationId, accepted: true };
  });
}


