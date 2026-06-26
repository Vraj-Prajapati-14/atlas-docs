import { z } from 'zod'
import { PaymentMethod, PaymentStatus } from '@atlas/types'

// ─── Generate bill ────────────────────────────────────────────────────────────

export const GenerateBillBody = z.object({
  orderId: z.string().min(1),
  discountInPaise: z.number().int().min(0).default(0),
  discountReasonCode: z.string().max(100).trim().optional(),
  // Customer snapshot for GST invoice
  customerName: z.string().max(100).trim().optional(),
  customerPhone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Invalid phone number')
    .optional(),
  customerGSTIN: z
    .string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN')
    .optional(),
})

// ─── Record payment ───────────────────────────────────────────────────────────

export const RecordPaymentBody = z.object({
  method: z.nativeEnum(PaymentMethod),
  amountInPaise: z.number().int().positive('Payment amount must be positive'),
  referenceId: z.string().max(100).trim().optional(),
})

// ─── Void bill ────────────────────────────────────────────────────────────────

export const VoidBillBody = z.object({
  reason: z.string().min(3).max(500).trim(),
})

// ─── List bills ───────────────────────────────────────────────────────────────

export const ListBillsQuery = z.object({
  outletId: z.string().min(1).optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD')
    .optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

// ─── Params ───────────────────────────────────────────────────────────────────

export const BillIdParam = z.object({ id: z.string().min(1) })

// ─── Inferred types ───────────────────────────────────────────────────────────

export type GenerateBillInput = z.output<typeof GenerateBillBody>
export type RecordPaymentInput = z.output<typeof RecordPaymentBody>
export type VoidBillInput = z.output<typeof VoidBillBody>
export type ListBillsInput = z.output<typeof ListBillsQuery>
