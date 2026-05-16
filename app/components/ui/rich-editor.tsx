import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { ListNode, ListItemNode } from '@lexical/list'
import type { InitialConfigType } from '@lexical/react/LexicalComposer'
import { forwardRef } from 'react'
import { cn } from '~/lib/utils'
import { RichEditorToolbar } from '~/components/ui/rich-editor-toolbar'

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

interface RichEditorProps extends React.HTMLAttributes<HTMLDivElement> {
  placeholder?: string
}

const RichEditor = forwardRef<HTMLDivElement, RichEditorProps>(
  ({ placeholder = 'Start typing...', className, ...props }, ref) => {
    return (
      <LexicalComposer initialConfig={editorConfig}>
        <div
          ref={ref}
          className={cn(
            'border-input focus-within:border-ring focus-within:ring-ring/50 dark:bg-input/30 relative flex flex-col min-h-64 w-full rounded-md border bg-transparent shadow-xs overflow-hidden',
            className,
          )}
          {...props}
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
        </div>
      </LexicalComposer>
    )
  },
)

RichEditor.displayName = 'RichEditor'

export { RichEditor }
