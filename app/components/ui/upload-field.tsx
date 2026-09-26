import { X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '~/lib/utils'
import { UploadPreview } from './upload-preview'

interface UploadFieldProps {
  id?: string
  name: string
  label: string
  description?: string
  accept?: string
  disabled?: boolean
  error?: string
  onChange?: (file: File | null) => void
  defaultImageUrl?: string
  required?: boolean
}

export function UploadField({
  id,
  name,
  label,
  description,
  accept = '*/*',
  disabled = false,
  error,
  onChange,
  defaultImageUrl,
  required = false,
}: UploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const inputId = id || name

  useEffect(() => {
    if (!file?.type.startsWith('image/')) {
      setPreviewUrl(null)
      return
    }

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const selectFile = (nextFile: File | null) => {
    setFile(nextFile)
    onChange?.(nextFile)
  }

  const handleDrop = (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setIsDragging(false)
    const droppedFile = event.dataTransfer.files[0]
    if (!droppedFile || !inputRef.current) return

    const transfer = new DataTransfer()
    transfer.items.add(droppedFile)
    inputRef.current.files = transfer.files
    selectFile(droppedFile)
  }

  const clear = () => {
    if (inputRef.current) inputRef.current.value = ''
    selectFile(null)
  }

  return (
    <div className="w-full">
      <label htmlFor={inputId} className="mb-2 block text-sm font-medium">
        {label}
      </label>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        disabled={disabled}
        className={cn(
          'w-full cursor-pointer rounded-lg border-2 border-dashed p-6 transition-colors',
          isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-ring/50',
          disabled && 'cursor-not-allowed opacity-50',
          error && 'border-destructive bg-destructive/10',
        )}
      >
        <UploadPreview file={file} previewUrl={previewUrl} currentUrl={defaultImageUrl} />
      </button>
      <input
        ref={inputRef}
        id={inputId}
        name={name}
        type="file"
        accept={accept}
        onChange={(event) => selectFile(event.target.files?.[0] || null)}
        disabled={disabled}
        required={required}
        className="sr-only"
      />
      {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
      {file && (
        <button
          type="button"
          onClick={clear}
          className="mt-2 inline-flex items-center gap-1 text-sm text-destructive"
        >
          <X className="size-4" />
          Clear
        </button>
      )}
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  )
}
