import { FileIcon, Upload, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '~/lib/utils'

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
}: UploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Cleanup preview URL on unmount or file change
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleFile = (newFile: File | null) => {
    // Cleanup old preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    setFile(newFile)
    onChange?.(newFile)

    // Create preview URL for images using Blob
    if (newFile?.type.startsWith('image/')) {
      const url = URL.createObjectURL(newFile)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFile = e.target.files?.[0] || null
    handleFile(newFile)
  }

  const handleDrag = (e: React.DragEvent, active: boolean) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(active)
  }

  const handleDrop = (e: React.DragEvent) => {
    handleDrag(e, false)

    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile && inputRef.current) {
      handleFile(droppedFile)

      // Update input element for form submission
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(droppedFile)
      inputRef.current.files = dataTransfer.files
    }
  }

  const handleClear = () => {
    handleFile(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`
  }

  const renderPreview = () => {
    if (previewUrl) {
      return (
        <div className="flex flex-col items-center gap-4">
          <img src={previewUrl} alt="Preview" className="h-32 w-32 object-cover rounded-lg" />
          <div className="text-center">
            <p className="text-sm font-medium">{file?.name}</p>
            <p className="text-xs text-muted-foreground">{formatFileSize(file?.size || 0)}</p>
          </div>
        </div>
      )
    }

    if (file) {
      return (
        <div className="flex flex-col items-center gap-3">
          <FileIcon className="h-12 w-12 text-gray-400" />
          <div className="text-center">
            <p className="text-sm font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
          </div>
        </div>
      )
    }

    if (defaultImageUrl) {
      return (
        <div className="flex flex-col items-center gap-4">
          <img src={defaultImageUrl} alt="Current" className="h-32 w-32 object-cover rounded-lg" />
          <p className="text-xs text-muted-foreground">Click to replace</p>
        </div>
      )
    }

    return (
      <div className="flex flex-col items-center gap-2">
        <Upload className="h-8 w-8 text-gray-400" />
        <div className="text-center">
          <p className="text-sm font-medium">Drag and drop your file here</p>
          <p className="text-xs text-muted-foreground">or click to select</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <label htmlFor={id || name} className="block text-sm font-medium mb-2">
        {label}
      </label>

      <button
        type="button"
        onDragEnter={(e) => handleDrag(e, true)}
        onDragLeave={(e) => handleDrag(e, false)}
        onDragOver={(e) => handleDrag(e, true)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className={cn(
          'w-full border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors text-left',
          isDragging && 'border-blue-500 bg-blue-50',
          !isDragging && 'border-gray-300 hover:border-gray-400',
          disabled && 'opacity-50 cursor-not-allowed',
          error && 'border-red-500 bg-red-50',
        )}
      >
        <input
          ref={inputRef}
          id={id || name}
          name={name}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={disabled}
          className="hidden"
        />

        {renderPreview()}
      </button>

      {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}

      {file && (
        <button
          type="button"
          onClick={handleClear}
          className="mt-2 inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
        >
          <X className="h-4 w-4" />
          Clear
        </button>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
