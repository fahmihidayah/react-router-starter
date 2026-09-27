import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { useEffect } from 'react'
import { cn } from '~/lib/utils'
import { editorConfig } from './config'
import { setEditorContent } from './content'

function ContentPlugin({ content }: { content: string }) {
  const [editor] = useLexicalComposerContext()
  useEffect(() => setEditorContent(editor, content), [editor, content])
  return null
}

export function RichEditorViewer({ content, className }: { content: string; className?: string }) {
  return (
    <LexicalComposer
      initialConfig={{ ...editorConfig, namespace: 'RichEditorViewer', editable: false }}
    >
      <div className={cn('w-full text-base leading-relaxed', className)}>
        <RichTextPlugin
          contentEditable={<ContentEditable aria-label="Post content" className="outline-none" />}
          placeholder={null}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <ContentPlugin content={content} />
      </div>
    </LexicalComposer>
  )
}
