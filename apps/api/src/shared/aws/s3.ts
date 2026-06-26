import { S3Client } from '@aws-sdk/client-s3'
import { config } from '../../config/index.js'

// Uses explicit credentials when provided (dev/staging).
// Falls back to the default chain (IAM role, instance profile) in production on AWS.
export const s3 = new S3Client({
  region: config.AWS_REGION,
  ...(config.AWS_ACCESS_KEY_ID && config.AWS_SECRET_ACCESS_KEY
    ? {
        credentials: {
          accessKeyId: config.AWS_ACCESS_KEY_ID,
          secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
        },
      }
    : {}),
})
