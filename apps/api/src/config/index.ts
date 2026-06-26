/**
 * Environment config — validated with Zod at startup.
 * If any required variable is missing or invalid, the process exits immediately.
 * This prevents silent misconfiguration in production.
 */

import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  HOST: z.string().default('0.0.0.0'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 chars'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  BCRYPT_ROUNDS: z.coerce.number().int().min(8).max(14).default(10),

  REDIS_URL: z.string().url().optional(),

  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),

  WHATSAPP_ACCESS_TOKEN: z.string().optional(),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
  WHATSAPP_BUSINESS_ACCOUNT_ID: z.string().optional(),

  MSG91_AUTH_KEY: z.string().optional(),
  MSG91_SENDER_ID: z.string().default('ATLAS'),
  MSG91_OTP_TEMPLATE_ID: z.string().optional(),

  SENTRY_DSN: z.string().url().optional(),

  // ─── AWS / S3 ──────────────────────────────────────────────────────────────
  AWS_REGION: z.string().default('ap-south-1'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  AWS_CLOUDFRONT_DOMAIN: z.string().optional(),
})

function loadConfig() {
  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `  ${issue.path.join('.')}: ${issue.message}`)
      .join('\n')
    // Fail fast — do not start with invalid config
    console.error(`\n[Atlas] Invalid environment configuration:\n${errors}\n`)
    process.exit(1)
  }

  return result.data
}

export const config = loadConfig()
export type Config = typeof config
