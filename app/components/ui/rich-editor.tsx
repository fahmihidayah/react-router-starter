import { ListItemNode, ListNode } from '@lexical/list'
import type { InitialConfigType } from '@lexical/react/LexicalComposer'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import type { LexicalEditor } from 'lexical'
import { $createParagraphNode, $createTextNode, $getRoot } from 'lexical'
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { RichEditorToolbar } from '~/components/ui/rich-editor-toolbar'
import { cn } from '~/lib/utils'

const editorConfig: InitialConfigType = {
  namespace: 'RichEditor',
  nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode],
  theme: {
    paragraph: 'mb-2',
    text: {
      bold: 'font-bold',
      italic: 'italic',
      underline: 'underline',
      code: 'bg-muted px-1 rounded font-mono text-sm',
    },
    list: {
      ol: 'list-decimal ml-5',
      ul: 'list-disc ml-5',
      nested: {
        listitem: 'list-item',
      },
    },
    heading: {
      h1: 'text-2xl font-bold mb-2',
      h2: 'text-xl font-bold mb-2',
      h3: 'text-lg font-bold mb-2',
    },
    quote: 'border-l-4 border-muted pl-4 italic text-muted-foreground',
  },
  onError(error: Error) {
    console.error(error)
  },
}

interface RichEditorProps {
  placeholder?: string
  initialContent?: string
  value?: string
  onContentChange?: (json: string) => void
  onChange?: (json: string) => void
  className?: string
}

interface RichEditorHandle {
  getJSON: () => string
  setJSON: (json: string) => void
}

/**
 * Helper component to load initial JSON content into Lexical editor
 */
function InitialContentLoader({ content }: { content?: string }) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!content) return

    try {
      const editorState = editor.parseEditorState(content)
      editor.setEditorState(editorState)
    } catch (error) {
      console.error('Failed to parse initial content:', error)
      // Fallback: if content is invalid JSON, treat as plain text
      editor.update(() => {
        const root = $getRoot()
        root.clear()
        const paragraph = $createParagraphNode()
        paragraph.append($createTextNode(content))
        root.append(paragraph)
      })
    }
  }, [editor, content])

  return null
}

/**
 * Plugin to handle content changes and emit JSON
 */
function ContentChangePlugin({ onContentChange }: { onContentChange?: (json: string) => void }) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!onContentChange) return

    const removeUpdateListener = editor.registerUpdateListener(({ editorState }) => {
      const json = JSON.stringify(editorState.toJSON())
      queueMicrotask(() => {
        onContentChange(json)
      })
    })

    return () => removeUpdateListener()
  }, [editor, onContentChange])

  return null
}

const RichEditor = forwardRef<RichEditorHandle, RichEditorProps>(
  (
    {
      placeholder = 'Start typing...',
      initialContent,
      value,
      onContentChange,
      onChange,
      className,
    },
    ref,
  ) => {
    const editorRef = useRef<LexicalEditor | null>(null)
    const content = initialContent || value

    // Expose methods to parent via ref
    useImperativeHandle(
      ref,
      () => ({
        getJSON: () => {
          if (!editorRef.current) return '{}'
          const editorState = editorRef.current.getEditorState()
          return JSON.stringify(editorState.toJSON())
        },
        setJSON: (json: string) => {
          if (!editorRef.current) return
          try {
            const editorState = editorRef.current.parseEditorState(json)
            editorRef.current.setEditorState(editorState)
          } catch (error) {
            console.error('Failed to set editor JSON:', error)
          }
        },
      }),
      [],
    )

    const handleChange = onContentChange || onChange

    return (
      <LexicalComposer initialConfig={editorConfig}>
        <EditorInitializer editorRef={editorRef} />
        <div
          className={cn(
            'border-input focus-within:border-ring focus-within:ring-ring/50 dark:bg-input/30 relative flex flex-col min-h-64 w-full rounded-md border bg-transparent shadow-xs overflow-hidden',
            className,
          )}
        >
          <RichEditorToolbar />
          <div className="relative flex-1 overflow-y-auto">
            <RichTextPlugin
              contentEditable={
                <ContentEditable className="focus-visible:outline-none h-full w-full resize-none px-3 py-2 text-base md:text-sm" />
              }
              placeholder={
                <div className="pointer-events-none absolute top-2 left-3 text-muted-foreground text-base md:text-sm">
                  {placeholder}
                </div>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
          </div>
          <HistoryPlugin />
          <ListPlugin />
          <InitialContentLoader content={content} />
          <ContentChangePlugin onContentChange={handleChange} />
        </div>
      </LexicalComposer>
    )
  },
)

/**
 * Helper to capture editor instance for imperative handle
 */
function EditorInitializer({
  editorRef,
}: {
  editorRef: React.MutableRefObject<LexicalEditor | null>
}) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    editorRef.current = editor
  }, [editor, editorRef])

  return null
}

RichEditor.displayName = 'RichEditor'

export type { RichEditorHandle }
export { RichEditor }
