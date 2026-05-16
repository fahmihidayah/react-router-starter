import { FileIcon, Upload, X } from 'lucide-react'
import { useRef, useState } from 'react'
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragActive, setIsDragActive] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFile = (file: File | null) => {
    if (!file) {
      setSelectedFile(null)
      setPreview(null)
      onChange?.(null)
      return
    }

    setSelectedFile(file)
    onChange?.(file)

    // Generate preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPreview(null)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    handleFile(file || null)
  }

  const handleDragEnter = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
  }

  const handleDragOver = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFile(file)
      // Update input element for form submission
      if (inputRef.current) {
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(file)
        inputRef.current.files = dataTransfer.files
      }
    }
  }

  const handleClear = () => {
    handleFile(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const handleClick = () => {
    inputRef.current?.click()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`
  }

  return (
    <div className="w-full ">
      <label htmlFor={id || name} className="block text-sm font-medium mb-2">
        {label}
      </label>

      <button
        type="button"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleClick()
          }
        }}
        disabled={disabled}
        className={cn(
          'w-full relative border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors text-left',
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400',
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

        {preview ? (
          <div className="flex flex-col items-center gap-4">
            <img src={preview} alt="Preview" className="h-32 w-32 object-cover rounded-lg" />
            <div className="text-center">
              <p className="text-sm font-medium">{selectedFile?.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(selectedFile?.size || 0)}
              </p>
            </div>
          </div>
        ) : selectedFile ? (
          <div className="flex flex-col items-center gap-3">
            <FileIcon className="h-12 w-12 text-gray-400" />
            <div className="text-center">
              <p className="text-sm font-medium">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
            </div>
          </div>
        ) : defaultImageUrl ? (
          <div className="flex flex-col items-center gap-4">
            <img
              src={defaultImageUrl}
              alt="Current"
              className="h-32 w-32 object-cover rounded-lg"
            />
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Click to replace</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-gray-400" />
            <div className="text-center">
              <p className="text-sm font-medium">Drag and drop your file here</p>
              <p className="text-xs text-muted-foreground">or click to select</p>
            </div>
          </div>
        )}
      </button>

      {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}

      {selectedFile && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            handleClear()
          }}
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
