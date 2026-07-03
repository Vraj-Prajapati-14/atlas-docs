'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
const MAX_BYTES = 5 * 1024 * 1024 // 5 MB

interface PresignResult {
  uploadUrl: string
  publicUrl: string
  key: string
  method: 'PUT'
}

export interface UseUploadImageReturn {
  upload: (file: File, folder?: 'menu' | 'tenant') => Promise<string | null>
  uploading: boolean
  progress: number
}

export function useUploadImage(): UseUploadImageReturn {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const upload = useCallback(
    async (file: File, folder: 'menu' | 'tenant' = 'menu'): Promise<string | null> => {
      if (!(ALLOWED_TYPES as readonly string[]).includes(file.type)) {
        toast.error('Only JPEG, PNG, or WebP images are allowed')
        return null
      }
      if (file.size > MAX_BYTES) {
        toast.error('Image must be under 5 MB')
        return null
      }

      setUploading(true)
      setProgress(0)

      try {
        const presign = await apiClient.post<PresignResult>('/api/v1/uploads/presign', {
          contentType: file.type,
          folder,
        })

        // PUT directly to S3 via XHR for upload-progress events
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest()
          xhr.open('PUT', presign.uploadUrl)
          xhr.setRequestHeader('Content-Type', file.type)
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
          }
          xhr.onload = () =>
            xhr.status === 200
              ? resolve()
              : reject(new Error(`S3 upload failed: HTTP ${xhr.status}`))
          xhr.onerror = () => reject(new Error('Network error during upload'))
          xhr.send(file)
        })

        setProgress(100)
        return presign.publicUrl
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Image upload failed')
        return null
      } finally {
        setUploading(false)
      }
    },
    [],
  )

  return { upload, uploading, progress }
}
