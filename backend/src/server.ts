import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import sensible from '@fastify/sensible';
import websocket from '@fastify/websocket';
import { env } from './env.js';
import { registerRoutes } from './routes/index.js';
import { getMqtt } from './services/mqtt.js';

async function buildServer() {
  const app = Fastify({ logger: true });
  await app.register(cors, { origin: true, credentials: true });
  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(sensible);
  await app.register(websocket);

  await registerRoutes(app, env.apiPrefix);

  app.get('/health', async () => ({ ok: true }));

  // Initialize MQTT client and wire telemetry to logs for now
  const mqtt = getMqtt();
  mqtt.on('message', (topic, payload) => {
    try {
      const data = JSON.parse(payload.toString());
      app.log.info({ topic, data }, 'telemetry');
    } catch {
      app.log.info({ topic, raw: payload.toString() }, 'telemetry_raw');
    }
  });

  return app;
}

const app = await buildServer();
app.listen({ port: env.port, host: '0.0.0.0' }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});


