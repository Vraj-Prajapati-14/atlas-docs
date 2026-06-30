import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { ok } from '../../shared/response.js'
import { ValidationError } from '../../shared/errors.js'
import { registerRestaurant } from './register.service.js'

const PHONE_REGEX = /^[6-9]\d{9}$/

const RegisterBody = z.object({
  restaurantName: z.string().min(2).max(100).trim(),
  restaurantType: z.enum([
    'QSR', 'CASUAL_DINING', 'FINE_DINING', 'CAFE', 'BAR',
    'FOOD_TRUCK', 'CLOUD_KITCHEN', 'BAKERY', 'DHABA', 'SWEET_SHOP',
  ]),
  city: z.string().min(2).max(100).trim(),
  state: z.string().min(2).max(100).trim(),
  ownerName: z.string().min(2).max(100).trim(),
  ownerPhone: z.string().regex(PHONE_REGEX, 'Invalid Indian mobile number'),
  pin: z.string().length(4).regex(/^\d{4}$/, 'PIN must be exactly 4 digits'),
})

function validate<S extends z.ZodTypeAny>(schema: S, data: unknown): z.output<S> {
  const result = schema.safeParse(data)
  if (!result.success) throw new ValidationError('Invalid request body', result.error.errors)
  return result.data as z.output<S>
}

export async function registerRoutes(app: FastifyInstance): Promise<void> {
  // ─── POST /register ──────────────────────────────────────────────────────────
  // Public — creates a new restaurant in PENDING_PAYMENT status.
  // Super-admin activates the account after payment is confirmed.
  app.post('/', { config: { rateLimit: { max: 5, timeWindow: '1 hour' } } }, async (request, reply) => {
    const body = validate(RegisterBody, request.body)
    const result = await registerRestaurant(body)
    return ok(reply, result)
  })
}
