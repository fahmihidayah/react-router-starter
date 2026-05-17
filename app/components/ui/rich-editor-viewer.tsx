import { ListItemNode, ListNode } from '@lexical/list'
import type { InitialConfigType } from '@lexical/react/LexicalComposer'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { useEffect } from 'react'
import { $getRoot, $createParagraphNode, $createTextNode } from 'lexical'
import { cn } from '~/lib/utils'

interface IRichEditorViewerProps {
  content: string
  className?: string
}

const viewerConfig: InitialConfigType = {
  namespace: 'RichEditorViewer',
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
      h1: 'text-2xl font-bold mb-4 mt-6',
      h2: 'text-xl font-bold mb-3 mt-5',
      h3: 'text-lg font-bold mb-2 mt-4',
    },
    quote: 'border-l-4 border-muted pl-4 italic text-muted-foreground my-4',
  },
  onError(error: Error) {
    console.error(error)
  },
}

/**
 * Helper component to load initial content into read-only viewer
 */
function InitialContentLoader({ content }: { content: string }) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    try {
      const editorState = editor.parseEditorState(content)
      editor.setEditorState(editorState)
    } catch (error) {
      console.error('Failed to parse content:', error)
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
 * Read-only Lexical editor viewer for displaying rich content
 */
export function RichEditorViewer({ content, className }: IRichEditorViewerProps) {
  return (
    <LexicalComposer initialConfig={viewerConfig}>
      <div
        className={cn(
          'prose prose-sm dark:prose-invert max-w-none w-full',
          className,
        )}
      >
        <RichTextPlugin
          contentEditable={
            <ContentEditable className="outline-none w-full text-base leading-relaxed" />
          }
          placeholder={<div className="text-muted-foreground">No content</div>}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <InitialContentLoader content={content} />
      </div>
    </LexicalComposer>
  )
}
