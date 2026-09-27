import { registerCodeHighlighting } from '@lexical/code'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import type { ForwardedRef } from 'react'
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { cn } from '~/lib/utils'
import { editorConfig } from './config'
import { setEditorContent } from './content'
import { RichEditorToolbar } from './toolbar'

export interface RichEditorHandle {
  getJSON: () => string
  setJSON: (json: string) => void
}
interface RichEditorProps {
  id?: string
  placeholder?: string
  initialContent?: string
  value?: string
  onContentChange?: (json: string) => void
  onChange?: (json: string) => void
  className?: string
  'aria-invalid'?: boolean
  'aria-describedby'?: string
}

function EditorStatePlugin({
  value,
  initialContent,
  editorRef,
}: {
  value?: string
  initialContent?: string
  editorRef: ForwardedRef<RichEditorHandle>
}) {
  const [editor] = useLexicalComposerContext()
  const initialized = useRef(false)
  useImperativeHandle(
    editorRef,
    () => ({
      getJSON: () => JSON.stringify(editor.getEditorState().toJSON()),
      setJSON: (json) => setEditorContent(editor, json),
    }),
    [editor],
  )
  useEffect(() => {
    const content = value ?? (initialized.current ? undefined : initialContent)
    initialized.current = true
    if (content !== undefined && content !== JSON.stringify(editor.getEditorState().toJSON())) {
      setEditorContent(editor, content)
    }
  }, [editor, value, initialContent])
  useEffect(() => registerCodeHighlighting(editor), [editor])
  return null
}

export const RichEditor = forwardRef<RichEditorHandle, RichEditorProps>(function RichEditor(
  {
    id,
    placeholder = 'Start typing...',
    initialContent,
    value,
    onContentChange,
    onChange,
    className,
    ...aria
  },
  ref,
) {
  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div
        className={cn(
          'border-input focus-within:ring-ring/50 overflow-hidden rounded-md border focus-within:ring-2',
          className,
        )}
      >
        <RichEditorToolbar />
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                id={id}
                aria-label="Post content"
                {...aria}
                className="min-h-64 w-full px-3 py-2 outline-none"
              />
            }
            placeholder={
              <div className="pointer-events-none absolute left-3 top-2 text-muted-foreground">
                {placeholder}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <HistoryPlugin />
        <ListPlugin />
        <EditorStatePlugin value={value} initialContent={initialContent} editorRef={ref} />
        <OnChangePlugin
          ignoreSelectionChange
          onChange={(state, _editor, tags) => {
            if (!tags.has('external-content'))
              (onChange ?? onContentChange)?.(JSON.stringify(state.toJSON()))
          }}
        />
      </div>
    </LexicalComposer>
  )
})
