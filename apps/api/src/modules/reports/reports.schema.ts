import { z } from 'zod'

const dateRegex = /^\d{4}-\d{2}-\d{2}$/
const monthRegex = /^\d{4}-\d{2}$/

export const DailyReportQuery = z.object({
  date: z
    .string()
    .regex(dateRegex, 'date must be YYYY-MM-DD')
    .default(() => new Date().toISOString().slice(0, 10)),
  outletId: z.string().min(1).optional(),
})

export const DateRangeQuery = z.object({
  from: z.string().regex(dateRegex, 'from must be YYYY-MM-DD'),
  to: z.string().regex(dateRegex, 'to must be YYYY-MM-DD'),
  outletId: z.string().min(1).optional(),
})

export const GSTReportQuery = z.object({
  month: z.string().regex(monthRegex, 'month must be YYYY-MM'),
  outletId: z.string().min(1).optional(),
})

export const InventoryValuationQuery = z.object({
  outletId: z.string().min(1).optional(),
})

export type DailyReportInput = z.output<typeof DailyReportQuery>
export type DateRangeInput = z.output<typeof DateRangeQuery>
export type GSTReportInput = z.output<typeof GSTReportQuery>
export type InventoryValuationInput = z.output<typeof InventoryValuationQuery>
