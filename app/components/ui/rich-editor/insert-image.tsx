import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $createParagraphNode, $getRoot, $getSelection, $insertNodes, $setSelection } from 'lexical'
import { ImagePlus } from 'lucide-react'
import { useRef, useState } from 'react'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { UploadField } from '~/components/ui/upload-field'
import { $createImageNode, isImageSource } from './image-node'

export function InsertImage() {
  const [editor] = useLexicalComposerContext()
  const [imageOpen, setImageOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const uploadPending = useRef(false)
  const [src, setSrc] = useState('')
  const [alt, setAlt] = useState('')
  const [imageError, setImageError] = useState('')
  const [savedSelection, setSavedSelection] = useState<ReturnType<typeof $getSelection>>(null)
  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        aria-label="Insert image"
        title="Insert image"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          editor.getEditorState().read(() => setSavedSelection($getSelection()?.clone() ?? null))
          setFile(null)
          setSrc('')
          setAlt('')
          setImageError('')
          setImageOpen(true)
        }}
      >
        <ImagePlus className="size-4" />
      </Button>
      <Dialog
        open={imageOpen}
        onOpenChange={(open) => {
          if (!uploadPending.current) setImageOpen(open)
        }}
      >
        <DialogContent
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            editor.focus()
          }}
        >
          <DialogTitle>Insert image</DialogTitle>
          <DialogDescription>
            Upload an image to your media library, or enter an existing image URL.
          </DialogDescription>
          <UploadField
            id="editor-image-file"
            name="file"
            label="Upload image"
            accept="image/*"
            disabled={uploading}
            onChange={(nextFile) => {
              if (!uploadPending.current) {
                setFile(nextFile)
                setImageError('')
              }
            }}
          />
          <div className="space-y-2">
            <Label htmlFor="editor-image-src">Image URL</Label>
            <Input
              id="editor-image-src"
              disabled={uploading || !!file}
              value={src}
              onChange={(event) => setSrc(event.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editor-image-alt">Image description</Label>
            <Input
              id="editor-image-alt"
              disabled={uploading}
              value={alt}
              onChange={(event) => setAlt(event.target.value)}
              placeholder="Describe the image for screen readers"
            />
          </div>
          {imageError && (
            <p role="alert" className="text-sm text-destructive">
              {imageError}
            </p>
          )}
          <Button
            type="button"
            disabled={uploading}
            onClick={async () => {
              if (uploadPending.current) return
              let imageUrl = src.trim()
              setImageError('')
              if (file) {
                uploadPending.current = true
                setUploading(true)
                try {
                  const data = new FormData()
                  data.set('file', file)
                  data.set('alt', alt.trim())
                  const response = await fetch('/admin/media/upload', {
                    method: 'POST',
                    body: data,
                  })
                  if (response.redirected)
                    throw new Error('Your session expired. Sign in again to upload images.')
                  const result = await response.json()
                  if (!response.ok) {
                    throw new Error(
                      result.errors?.file?.[0] ??
                        result.errors?.form?.[0] ??
                        'Unable to upload image',
                    )
                  }
                  if (typeof result.url !== 'string' || !isImageSource(result.url)) {
                    throw new Error('The upload did not return a valid image URL')
                  }
                  imageUrl = result.url
                  setSrc(imageUrl)
                  setFile(null)
                } catch (error) {
                  setImageError(
                    error instanceof Error
                      ? error.message
                      : 'Unable to upload image. Please try again.',
                  )
                  return
                } finally {
                  uploadPending.current = false
                  setUploading(false)
                }
              }
              if (!isImageSource(imageUrl)) {
                setImageError('Choose an image or enter an HTTP(S) URL or a path starting with /.')
                return
              }
              editor.update(() => {
                if (savedSelection) $setSelection(savedSelection.clone())
                else $getRoot().selectEnd()
                const paragraph = $createParagraphNode().append(
                  $createImageNode(imageUrl, alt.trim()),
                )
                $insertNodes([paragraph, $createParagraphNode()])
                paragraph.getNextSibling()?.selectEnd()
              })
              setImageOpen(false)
            }}
          >
            {uploading ? 'Uploading...' : file ? 'Upload and insert' : 'Insert image'}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}
