import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $createParagraphNode, $getRoot, $getSelection, $insertNodes, $setSelection } from 'lexical'
import { ImagePlus } from 'lucide-react'
import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { $createImageNode, isImageSource } from './image-node'

export function InsertImage() {
  const [editor] = useLexicalComposerContext()
  const [imageOpen, setImageOpen] = useState(false)
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
          setSrc('')
          setAlt('')
          setImageError('')
          setImageOpen(true)
        }}
      >
        <ImagePlus className="size-4" />
      </Button>
      <Dialog open={imageOpen} onOpenChange={setImageOpen}>
        <DialogContent
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            editor.focus()
          }}
        >
          <DialogTitle>Insert image</DialogTitle>
          <DialogDescription>Use an image URL or the path of an uploaded image.</DialogDescription>
          <div className="space-y-2">
            <Label htmlFor="editor-image-src">Image URL</Label>
            <Input
              id="editor-image-src"
              value={src}
              onChange={(event) => setSrc(event.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editor-image-alt">Image description</Label>
            <Input
              id="editor-image-alt"
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
            onClick={() => {
              if (!isImageSource(src.trim())) {
                setImageError('Enter an HTTP(S) URL or a path starting with /.')
                return
              }
              editor.update(() => {
                if (savedSelection) $setSelection(savedSelection.clone())
                else $getRoot().selectEnd()
                const paragraph = $createParagraphNode().append(
                  $createImageNode(src.trim(), alt.trim()),
                )
                $insertNodes([paragraph, $createParagraphNode()])
                paragraph.getNextSibling()?.selectEnd()
              })
              setImageOpen(false)
            }}
          >
            Insert image
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}
