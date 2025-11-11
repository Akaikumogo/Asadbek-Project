import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { env } from '../env.js';

export async function authRoutes(app: FastifyInstance) {
  app.register(import('@fastify/jwt'), { secret: env.jwtSecret });

  const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
  });

  app.post('/auth/login', async (req, res) => {
    const parse = loginSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).send({ message: 'Invalid credentials' });
    }
    // NOTE: replace with real user lookup & password check
    const token = app.jwt.sign({ sub: parse.data.email, roles: ['ADMIN'] });
    return { access_token: token };
  });

  app.get('/auth/profile', async (req, res) => {
    try {
      await req.jwtVerify();
      return { user: req.user };
    } catch {
      return res.status(401).send({ message: 'Unauthorized' });
    }
  });
}


