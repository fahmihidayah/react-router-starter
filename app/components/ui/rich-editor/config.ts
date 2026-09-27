import { CodeHighlightNode, CodeNode } from '@lexical/code'
import { ListItemNode, ListNode } from '@lexical/list'
import type { InitialConfigType } from '@lexical/react/LexicalComposer'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { ImageNode } from './image-node'

export const editorConfig: InitialConfigType = {
  namespace: 'RichEditor',
  nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, CodeNode, CodeHighlightNode, ImageNode],
  theme: {
    paragraph: 'mb-2',
    code: 'block whitespace-pre-wrap rounded-md bg-muted p-4 font-mono text-sm my-3',
    codeHighlight: {
      keyword: 'text-purple-600 dark:text-purple-400',
      string: 'text-green-700 dark:text-green-400',
      comment: 'text-muted-foreground italic',
      function: 'text-blue-600 dark:text-blue-400',
      number: 'text-orange-600 dark:text-orange-400',
      operator: 'text-pink-600 dark:text-pink-400',
    },
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
    throw error
  },
}
