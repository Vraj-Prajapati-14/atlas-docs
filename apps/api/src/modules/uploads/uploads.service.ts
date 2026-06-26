import { randomUUID } from 'node:crypto'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { s3 } from '../../shared/aws/s3.js'
import { config } from '../../config/index.js'
import { ServiceUnavailableError } from '../../shared/errors.js'
import type { PresignInput } from './uploads.schema.js'

const PRESIGN_TTL_SECONDS = 300 // 5 minutes — client must upload within this window
const MAX_FILE_SIZE_MB = 5

const EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

function publicUrl(key: string): string {
  if (config.AWS_CLOUDFRONT_DOMAIN) {
    return `https://${config.AWS_CLOUDFRONT_DOMAIN}/${key}`
  }
  return `https://${config.AWS_S3_BUCKET!}.s3.${config.AWS_REGION}.amazonaws.com/${key}`
}

export interface PresignResult {
  uploadUrl: string
  key: string
  publicUrl: string
  method: 'PUT'
  expiresIn: number
  maxFileSizeMB: number
}

export async function createPresignedUpload(
  tenantId: string,
  input: PresignInput,
): Promise<PresignResult> {
  if (!config.AWS_S3_BUCKET) {
    throw new ServiceUnavailableError('File storage not configured')
  }

  const ext = EXT[input.contentType] ?? 'jpg'
  const key = `${tenantId}/${input.folder}/${randomUUID()}.${ext}`

  const command = new PutObjectCommand({
    Bucket: config.AWS_S3_BUCKET,
    Key: key,
    ContentType: input.contentType,
  })

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: PRESIGN_TTL_SECONDS })

  return {
    uploadUrl,
    key,
    publicUrl: publicUrl(key),
    method: 'PUT',
    expiresIn: PRESIGN_TTL_SECONDS,
    maxFileSizeMB: MAX_FILE_SIZE_MB,
  }
}
