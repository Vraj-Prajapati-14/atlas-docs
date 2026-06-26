import { z } from 'zod'

export const ALLOWED_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

export const PresignBody = z.object({
  contentType: z.enum(ALLOWED_CONTENT_TYPES, {
    errorMap: () => ({ message: 'contentType must be image/jpeg, image/png, or image/webp' }),
  }),
  folder: z.enum(['menu', 'tenant'], {
    errorMap: () => ({ message: 'folder must be "menu" or "tenant"' }),
  }),
})

export type PresignInput = z.infer<typeof PresignBody>
