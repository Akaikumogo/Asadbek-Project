import { FastifyInstance } from 'fastify';
import { authRoutes } from './auth.js';
import { deviceRoutes } from './devices.js';
import { metricsRoutes } from './metrics.js';

export async function registerRoutes(app: FastifyInstance, prefix: string) {
  app.register(authRoutes, { prefix });
  app.register(deviceRoutes, { prefix });
  app.register(metricsRoutes, { prefix });
}


