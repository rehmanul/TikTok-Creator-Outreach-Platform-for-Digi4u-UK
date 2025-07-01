import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),

  // Database
  DATABASE_URL: z.string().optional(),

  // JWT
  JWT_SECRET: z.string().default('dev-secret-key-change-in-production'),
  JWT_EXPIRES_IN: z.string().default('30d'),

  // TikTok API
  TIKTOK_CLIENT_KEY: z.string().default('7519035078651936769'),
  TIKTOK_CLIENT_SECRET: z.string().optional(),
  TIKTOK_ADVERTISER_ID: z.string().default('7519829315018588178'),
  TIKTOK_ACCESS_TOKEN: z.string().optional(),
  TIKTOK_REDIRECT_URI: z.string().optional(),

  // AI Service
  GEMINI_API_KEY: z.string().optional(),

  // Webhooks
  WEBHOOK_SECRET: z.string().optional(),

  // Replit specific
  REPL_ID: z.string().optional(),
  REPL_SLUG: z.string().optional(),
  REPL_OWNER: z.string().optional(),
});

export type Environment = z.infer<typeof envSchema>;

export const env = envSchema.parse(process.env);

// Set dynamic redirect URI for Replit deployment
if (!env.TIKTOK_REDIRECT_URI) {
  if (env.REPL_ID && env.REPL_SLUG && env.REPL_OWNER) {
    env.TIKTOK_REDIRECT_URI = `https://${env.REPL_ID}.${env.REPL_SLUG}.${env.REPL_OWNER}.replit.app/api/tiktok/oauth-callback`;
  } else {
    // Fallback to production URL if REPL env vars not available
    env.TIKTOK_REDIRECT_URI = `https://dgtok-4u.onrender.com/api/tiktok/oauth-callback`;
  }
}

console.log('TikTok configuration:', {
  clientKey: env.TIKTOK_CLIENT_KEY?.substring(0, 10) + '...',
  redirectUri: env.TIKTOK_REDIRECT_URI,
  advertiserId: env.TIKTOK_ADVERTISER_ID?.substring(0, 10) + '...',
  hasSecret: !!env.TIKTOK_CLIENT_SECRET
});

export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';