'use client'

import { useRef, useState, useCallback } from 'react'
import { ImageIcon, Loader2, Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUploadImage } from '@/hooks/use-upload-image'

interface ImageUploadProps {
  value?: string | null
  onChange: (url: string | null) => void
  folder?: 'menu' | 'tenant'
  className?: string
  aspectRatio?: 'square' | 'landscape'
}

export function ImageUpload({
  value,
  onChange,
  folder = 'menu',
  className,
  aspectRatio = 'landscape',
}: ImageUploadProps) {
  const { upload, uploading, progress } = useUploadImage()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [localPreview, setLocalPreview] = useState<string | null>(null)

  const displayUrl = localPreview ?? value

  const handleFile = useCallback(
    async (file: File) => {
      const previewUrl = URL.createObjectURL(file)
      setLocalPreview(previewUrl)

      const publicUrl = await upload(file, folder)

      URL.revokeObjectURL(previewUrl)
      setLocalPreview(null)

      if (publicUrl) onChange(publicUrl)
    },
    [upload, folder, onChange],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  if (displayUrl) {
    return (
      <div
        className={cn(
          'group relative overflow-hidden rounded-xl border border-border bg-black',
          aspectRatio === 'square' ? 'aspect-square' : 'aspect-video',
          className,
        )}
      >
        <img
          src={displayUrl}
          alt=""
          className="w-full h-full object-cover opacity-90 group-hover:opacity-70 transition-opacity duration-200"
        />

        {uploading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60">
            <Loader2 size={20} className="text-white animate-spin" />
            <div className="w-28 h-1 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-white text-[11px]">{progress}%</p>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/90 text-[11px] font-semibold text-gray-900 hover:bg-white transition-colors shadow"
            >
              <Upload size={11} /> Change
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(null) }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/70 text-[11px] font-semibold text-white hover:bg-black/90 transition-colors shadow"
            >
              <X size={11} /> Remove
            </button>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleInput}
        />
      </div>
    )
  }

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        'relative rounded-xl border-2 border-dashed transition-all cursor-pointer select-none',
        aspectRatio === 'square' ? 'aspect-square' : 'aspect-video',
        isDragging
          ? 'border-primary-500 bg-primary-500/8 scale-[0.99]'
          : 'border-border hover:border-primary-500/50 hover:bg-white/2',
        className,
      )}
      onClick={() => !uploading && inputRef.current?.click()}
      onKeyDown={(e) => e.key === 'Enter' && !uploading && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 text-center p-4">
        {uploading ? (
          <>
            <Loader2 size={22} className="text-primary-500 animate-spin" />
            <div className="w-28 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">{progress}% uploaded</p>
          </>
        ) : (
          <>
            <div className="w-11 h-11 rounded-xl bg-primary-500/10 flex items-center justify-center">
              <ImageIcon size={20} className="text-primary-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">
                {isDragging ? 'Drop to upload' : 'Upload photo'}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                JPEG · PNG · WebP · max 5 MB
              </p>
            </div>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleInput}
        disabled={uploading}
      />
    </div>
  )
}
