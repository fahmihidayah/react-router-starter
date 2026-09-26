import { FileIcon, Upload } from 'lucide-react'

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`
}

type UploadPreviewProps = {
  file: File | null
  previewUrl: string | null
  currentUrl?: string
}

export function UploadPreview({ file, previewUrl, currentUrl }: UploadPreviewProps) {
  const imageUrl = previewUrl || (!file ? currentUrl : undefined)

  if (imageUrl) {
    return (
      <div className="flex flex-col items-center gap-3">
        <img src={imageUrl} alt="Upload preview" className="size-32 rounded-lg object-cover" />
        <p className="text-sm font-medium">{file?.name || 'Click to replace'}</p>
        {file && <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>}
      </div>
    )
  }

  if (file) {
    return (
      <div className="flex flex-col items-center gap-2">
        <FileIcon className="size-10 text-muted-foreground" />
        <p className="text-sm font-medium">{file.name}</p>
        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Upload className="size-8 text-muted-foreground" />
      <p className="text-sm font-medium">Drag and drop your image here</p>
      <p className="text-xs text-muted-foreground">or click to select</p>
    </div>
  )
}
