import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { ok } from '../../shared/response.js'
import { ValidationError } from '../../shared/errors.js'
import { authenticate } from '../../shared/middleware/authenticate.js'
import { PresignBody } from './uploads.schema.js'
import { createPresignedUpload } from './uploads.service.js'

function validate<S extends z.ZodTypeAny>(schema: S, data: unknown): z.output<S> {
  const result = schema.safeParse(data)
  if (!result.success) throw new ValidationError('Invalid request body', result.error.errors)
  return result.data as z.output<S>
}

export async function uploadsRoutes(app: FastifyInstance): Promise<void> {
  // POST /uploads/presign
  // Returns a presigned PUT URL for direct browser→S3 upload.
  // Client: PUT the file bytes to uploadUrl with the matching Content-Type header.
  // After upload completes, store the returned publicUrl as the item's imageUrl.
  app.post('/presign', { preHandler: authenticate }, async (request, reply) => {
    const body = validate(PresignBody, request.body)
    const result = await createPresignedUpload(request.user.tenantId, body)
    return ok(reply, result)
  })
}
