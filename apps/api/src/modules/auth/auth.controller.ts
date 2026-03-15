import type { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db } from '../../db/index.js';
import { users } from '../../db/schema.js';
import { eq } from 'drizzle-orm';

// ── Validation Schemas ─────────────────────────────────────────
const registerSchema = z.object({
  email: z.string().email().max(255).trim().toLowerCase(),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(255).trim().optional(),
});

const loginSchema = z.object({
  email: z.string().email().max(255).trim().toLowerCase(),
  password: z.string().min(1).max(128),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1).max(2048),
});

// ── SALT ROUNDS for bcrypt ─────────────────────────────────────
const SALT_ROUNDS = 12;

export const authController = {
  async register(request: FastifyRequest, reply: FastifyReply) {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) {
      reply.code(400);
      return { error: 'Validation failed', details: parsed.error.issues.map(i => i.message) };
    }

    const { email, password, name } = parsed.data;

    // Check if user exists
    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
    if (existing) {
      reply.code(409);
      return { error: 'Email already registered' };
    }

    // Hash password with bcrypt (Argon2 preferred in production)
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const rows = await db.insert(users).values({
      email,
      passwordHash,
      name,
      settings: {},
    }).returning({
      id: users.id,
      email: users.email,
      name: users.name,
      createdAt: users.createdAt,
    });

    const user = rows[0];
    if (!user) {
      reply.code(500);
      return { error: 'Failed to create user' };
    }

    // Generate tokens
    const accessToken = (request.server as any).jwt.sign(
      { sub: user.id, email: user.email },
      { expiresIn: '15m' }
    );
    const refreshToken = (request.server as any).jwt.sign(
      { sub: user.id, type: 'refresh' },
      { expiresIn: '7d' }
    );

    reply.code(201);
    return { user, accessToken, refreshToken };
  },

  async login(request: FastifyRequest, reply: FastifyReply) {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      reply.code(400);
      return { error: 'Validation failed', details: parsed.error.issues.map(i => i.message) };
    }

    const { email, password } = parsed.data;

    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user || !user.passwordHash) {
      // Use constant-time response to prevent user enumeration
      reply.code(401);
      return { error: 'Invalid email or password' };
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      reply.code(401);
      return { error: 'Invalid email or password' };
    }

    const accessToken = (request.server as any).jwt.sign(
      { sub: user.id, email: user.email },
      { expiresIn: '15m' }
    );
    const refreshToken = (request.server as any).jwt.sign(
      { sub: user.id, type: 'refresh' },
      { expiresIn: '7d' }
    );

    return {
      user: { id: user.id, email: user.email, name: user.name },
      accessToken,
      refreshToken,
    };
  },

  async refresh(request: FastifyRequest, reply: FastifyReply) {
    const parsed = refreshSchema.safeParse(request.body);
    if (!parsed.success) {
      reply.code(400);
      return { error: 'Refresh token required' };
    }

    try {
      const decoded = (request.server as any).jwt.verify(parsed.data.refreshToken) as any;
      if (decoded.type !== 'refresh') {
        reply.code(401);
        return { error: 'Invalid token type' };
      }

      const [user] = await db.select({ id: users.id, email: users.email }).from(users).where(eq(users.id, decoded.sub));
      if (!user) {
        reply.code(401);
        return { error: 'User not found' };
      }

      const accessToken = (request.server as any).jwt.sign(
        { sub: user.id, email: user.email },
        { expiresIn: '15m' }
      );
      const newRefreshToken = (request.server as any).jwt.sign(
        { sub: user.id, type: 'refresh' },
        { expiresIn: '7d' }
      );

      return { accessToken, refreshToken: newRefreshToken };
    } catch {
      reply.code(401);
      return { error: 'Invalid or expired refresh token' };
    }
  },

  async logout(_request: FastifyRequest, reply: FastifyReply) {
    // In production, add refresh token to a blacklist (Redis)
    reply.code(204);
  },
};
