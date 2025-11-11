import { FastifyInstance } from 'fastify';

export async function metricsRoutes(app: FastifyInstance) {
  app.get('/metrics', async (req) => {
    // Placeholder returning empty; to be replaced with DB-backed aggregation
    const { deviceId, pumpId, from, to, granularity } = (req.query as any) || {};
    return [];
  });
}


