import { z } from 'zod'

const PHONE_REGEX = /^[6-9]\d{9}$/

export const ListCustomersQuery = z.object({
  search: z.string().optional(),
  page:   z.coerce.number().int().positive().default(1),
  limit:  z.coerce.number().int().positive().max(100).default(20),
})

export const CreateCustomerBody = z.object({
  name:        z.string().min(2).max(100),
  phone:       z.string().regex(PHONE_REGEX, 'Invalid Indian mobile number'),
  email:       z.string().email().optional(),
  gstin:       z.string().optional(),
  companyName: z.string().optional(),
  address:     z.string().optional(),
})

export const UpdateCustomerBody = CreateCustomerBody.partial()

export const CustomerIdParam = z.object({ id: z.string() })

export type ListCustomersInput  = z.infer<typeof ListCustomersQuery>
export type CreateCustomerInput = z.infer<typeof CreateCustomerBody>
export type UpdateCustomerInput = z.infer<typeof UpdateCustomerBody>
