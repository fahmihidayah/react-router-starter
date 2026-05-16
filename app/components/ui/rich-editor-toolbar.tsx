import {
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Quote,
  Underline,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import {
  FORMAT_TEXT_COMMAND,
  $getSelection,
  $isRangeSelection,
  type LexicalCommand,
} from 'lexical'
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from '@lexical/list'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'

import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Separator } from '~/components/ui/separator'

export function RichEditorToolbar() {
  const [editor] = useLexicalComposerContext()
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)

  const updateToolbar = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        setIsBold(selection.hasFormat('bold'))
        setIsItalic(selection.hasFormat('italic'))
        setIsUnderline(selection.hasFormat('underline'))
      }
    })
  }, [editor])

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar()
      })
    })
  }, [editor, updateToolbar])

  const handleFormatText = (format: 'bold' | 'italic' | 'underline') => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format)
  }

  const handleHeading = (tag: 'h1' | 'h2' | 'h3') => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        const anchor = selection.anchor
        const element = anchor.getNode().getTopLevelElementOrThrow()
        const headingNode = new HeadingNode(tag)

        if ('getChildren' in element) {
          const children = (element as unknown as { getChildren: () => unknown[] }).getChildren()
          children.forEach((child) => {
            headingNode.append(child as never)
          })
        }
        element.replace(headingNode)
      }
    })
  }

  const handleUnorderedList = () => {
    editor.dispatchCommand(
      INSERT_UNORDERED_LIST_COMMAND as unknown as LexicalCommand<undefined>,
      undefined,
    )
  }

  const handleOrderedList = () => {
    editor.dispatchCommand(
      INSERT_ORDERED_LIST_COMMAND as unknown as LexicalCommand<undefined>,
      undefined,
    )
  }

  const handleRemoveList = () => {
    editor.dispatchCommand(
      REMOVE_LIST_COMMAND as unknown as LexicalCommand<undefined>,
      undefined,
    )
  }

  const handleQuote = () => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        const anchor = selection.anchor
        const element = anchor.getNode().getTopLevelElementOrThrow()
        const quoteNode = new QuoteNode()

        if ('getChildren' in element) {
          const children = (element as unknown as { getChildren: () => unknown[] }).getChildren()
          children.forEach((child) => {
            quoteNode.append(child as never)
          })
        }
        element.replace(quoteNode)
      }
    })
  }

  return (
    <div className="border-input flex flex-wrap items-center gap-1 border-b bg-muted/40 p-2">
      {/* Text Formatting */}
      <Button
        size="sm"
        variant={isBold ? 'default' : 'ghost'}
        onClick={() => handleFormatText('bold')}
        title="Bold (Ctrl+B)"
        className="h-8 w-8 p-0"
      >
        <Bold className="h-4 w-4" />
      </Button>

      <Button
        size="sm"
        variant={isItalic ? 'default' : 'ghost'}
        onClick={() => handleFormatText('italic')}
        title="Italic (Ctrl+I)"
        className="h-8 w-8 p-0"
      >
        <Italic className="h-4 w-4" />
      </Button>

      <Button
        size="sm"
        variant={isUnderline ? 'default' : 'ghost'}
        onClick={() => handleFormatText('underline')}
        title="Underline (Ctrl+U)"
        className="h-8 w-8 p-0"
      >
        <Underline className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Heading Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            title="Headings"
            className="h-8 gap-1"
          >
            <Heading1 className="h-4 w-4" />
            <span className="text-xs">Heading</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => handleHeading('h1')}>
            <Heading1 className="mr-2 h-4 w-4" />
            <span>Heading 1</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleHeading('h2')}>
            <Heading2 className="mr-2 h-4 w-4" />
            <span>Heading 2</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleHeading('h3')}>
            <Heading3 className="mr-2 h-4 w-4" />
            <span>Heading 3</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator orientation="vertical" className="h-6" />

      {/* List Buttons */}
      <Button
        size="sm"
        variant="ghost"
        onClick={handleUnorderedList}
        title="Bullet List"
        className="h-8 w-8 p-0"
      >
        <List className="h-4 w-4" />
      </Button>

      <Button
        size="sm"
        variant="ghost"
        onClick={handleOrderedList}
        title="Numbered List"
        className="h-8 w-8 p-0"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      <Button
        size="sm"
        variant="ghost"
        onClick={handleRemoveList}
        title="Remove List"
        className="h-8 w-8 px-1 text-xs"
      >
        <span>Remove</span>
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Quote */}
      <Button
        size="sm"
        variant="ghost"
        onClick={handleQuote}
        title="Block Quote"
        className="h-8 w-8 p-0"
      >
        <Quote className="h-4 w-4" />
      </Button>
    </div>
  )
}
