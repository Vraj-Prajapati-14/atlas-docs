import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { ok } from '../../shared/response.js'
import { ValidationError } from '../../shared/errors.js'
import { authenticate } from '../../shared/middleware/authenticate.js'
import { requireRole } from '../../shared/middleware/require-role.js'
import { UserRole } from '@atlas/types'
import {
  DailyReportQuery,
  DateRangeQuery,
  GSTReportQuery,
  InventoryValuationQuery,
} from './reports.schema.js'
import {
  getDailySummary,
  getGSTReport,
  getInventoryValuation,
  getItemSalesReport,
  getPaymentReport,
} from './reports.service.js'

function validate<S extends z.ZodTypeAny>(schema: S, data: unknown): z.output<S> {
  const result = schema.safeParse(data)
  if (!result.success) throw new ValidationError('Invalid request', result.error.errors)
  return result.data as z.output<S>
}

// Only managers and owners can pull reports
const REPORT_GUARD = [
  authenticate,
  requireRole(UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER),
]

export async function reportsRoutes(app: FastifyInstance): Promise<void> {
  // Daily sales summary
  app.get('/daily', { preHandler: REPORT_GUARD }, async (request, reply) => {
    const query = validate(DailyReportQuery, request.query)
    return ok(reply, await getDailySummary(request.user.tenantId, query))
  })

  // Item-wise sales over a date range
  app.get('/items', { preHandler: REPORT_GUARD }, async (request, reply) => {
    const query = validate(DateRangeQuery, request.query)
    return ok(reply, await getItemSalesReport(request.user.tenantId, query))
  })

  // Payment method breakdown
  app.get('/payments', { preHandler: REPORT_GUARD }, async (request, reply) => {
    const query = validate(DateRangeQuery, request.query)
    return ok(reply, await getPaymentReport(request.user.tenantId, query))
  })

  // GST summary for a month (for filing)
  app.get('/gst', { preHandler: REPORT_GUARD }, async (request, reply) => {
    const query = validate(GSTReportQuery, request.query)
    return ok(reply, await getGSTReport(request.user.tenantId, query))
  })

  // Inventory valuation snapshot
  app.get('/inventory-valuation', { preHandler: REPORT_GUARD }, async (request, reply) => {
    const query = validate(InventoryValuationQuery, request.query)
    return ok(reply, await getInventoryValuation(request.user.tenantId, query))
  })
}
