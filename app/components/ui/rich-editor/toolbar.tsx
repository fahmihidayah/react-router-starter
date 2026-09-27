import { $createCodeNode, $isCodeNode } from '@lexical/code'
import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from '@lexical/list'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $createHeadingNode, $createQuoteNode, $isHeadingNode } from '@lexical/rich-text'
import { $setBlocksType } from '@lexical/selection'
import { $findMatchingParent, mergeRegister } from '@lexical/utils'
import {
  $createParagraphNode,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_LOW,
  type ElementFormatType,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  type TextFormatType,
  UNDO_COMMAND,
} from 'lexical'
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Italic,
  List,
  ListOrdered,
  type LucideIcon,
  Redo,
  Underline,
  Undo,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '~/components/ui/button'
import { InsertImage } from './insert-image'

function ToolButton({
  label,
  icon: Icon,
  active,
  disabled,
  onClick,
}: {
  label: string
  icon: LucideIcon
  active?: boolean
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? 'secondary' : 'ghost'}
      aria-label={label}
      aria-pressed={active}
      title={label}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      <Icon className="size-4" />
    </Button>
  )
}

export function RichEditorToolbar() {
  const [editor] = useLexicalComposerContext()
  const [formats, setFormats] = useState<TextFormatType[]>([])
  const [language, setLanguage] = useState('plain')
  const [block, setBlock] = useState('paragraph')
  const [alignment, setAlignment] = useState<ElementFormatType>('left')
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  useEffect(
    () =>
      mergeRegister(
        editor.registerUpdateListener(({ editorState }) =>
          editorState.read(() => {
            const selection = $getSelection()
            if (!$isRangeSelection(selection)) return
            setFormats(
              (['bold', 'italic', 'underline', 'code'] as TextFormatType[]).filter((format) =>
                selection.hasFormat(format),
              ),
            )
            const node = selection.anchor.getNode()
            const element = $isElementNode(node) ? node : node.getParent()
            const list = $findMatchingParent(node, $isListNode)
            const top = node.getTopLevelElement()
            setLanguage($isCodeNode(top) ? (top.getLanguage() ?? 'plain') : 'plain')
            setBlock(
              $isListNode(list)
                ? list.getListType()
                : $isHeadingNode(top)
                  ? top.getTag()
                  : (top?.getType() ?? 'paragraph'),
            )
            setAlignment(element?.getFormatType() || 'left')
          }),
        ),
        editor.registerCommand(
          CAN_UNDO_COMMAND,
          (value) => {
            setCanUndo(value)
            return false
          },
          COMMAND_PRIORITY_LOW,
        ),
        editor.registerCommand(
          CAN_REDO_COMMAND,
          (value) => {
            setCanRedo(value)
            return false
          },
          COMMAND_PRIORITY_LOW,
        ),
      ),
    [editor],
  )

  function changeBlock(value: string) {
    editor.update(() => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) return
      $setBlocksType(selection, () => {
        if (value === 'h1' || value === 'h2' || value === 'h3') return $createHeadingNode(value)
        if (value === 'quote') return $createQuoteNode()
        if (value === 'code') return $createCodeNode('plain')
        return $createParagraphNode()
      })
    })
  }

  return (
    <fieldset
      className="flex flex-wrap items-center gap-1 border-b bg-muted/40 p-2"
      aria-label="Text formatting"
    >
      <ToolButton
        label="Undo"
        icon={Undo}
        disabled={!canUndo}
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
      />
      <ToolButton
        label="Redo"
        icon={Redo}
        disabled={!canRedo}
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
      />
      <select
        aria-label="Block style"
        className="h-8 rounded border bg-background px-2 text-sm"
        value={['bullet', 'number'].includes(block) ? 'paragraph' : block}
        onChange={(event) => changeBlock(event.target.value)}
      >
        <option value="paragraph">Paragraph</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
        <option value="quote">Quote</option>
        <option value="code">Code block</option>
      </select>
      {(
        [
          { format: 'bold', icon: Bold },
          { format: 'italic', icon: Italic },
          { format: 'underline', icon: Underline },
          { format: 'code', icon: Code },
        ] as const
      ).map(({ format, icon }) => (
        <ToolButton
          key={format}
          label={format === 'code' ? 'Inline code' : format[0].toUpperCase() + format.slice(1)}
          icon={icon}
          active={formats.includes(format)}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, format)}
        />
      ))}
      <ToolButton
        label="Bullet list"
        icon={List}
        active={block === 'bullet'}
        onClick={() =>
          editor.dispatchCommand(
            block === 'bullet' ? REMOVE_LIST_COMMAND : INSERT_UNORDERED_LIST_COMMAND,
            undefined,
          )
        }
      />
      <ToolButton
        label="Numbered list"
        icon={ListOrdered}
        active={block === 'number'}
        onClick={() =>
          editor.dispatchCommand(
            block === 'number' ? REMOVE_LIST_COMMAND : INSERT_ORDERED_LIST_COMMAND,
            undefined,
          )
        }
      />
      {(
        [
          { value: 'left', icon: AlignLeft },
          { value: 'center', icon: AlignCenter },
          { value: 'right', icon: AlignRight },
          { value: 'justify', icon: AlignJustify },
        ] as const
      ).map(({ value, icon }) => (
        <ToolButton
          key={value}
          label={`Align ${value}`}
          icon={icon}
          active={alignment === value}
          onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, value)}
        />
      ))}
      {block === 'code' && (
        <select
          aria-label="Code language"
          className="h-8 rounded border bg-background px-2 text-sm"
          onChange={(event) =>
            editor.update(() => {
              const selection = $getSelection()
              if ($isRangeSelection(selection)) {
                const node = selection.anchor.getNode().getTopLevelElement()
                if ($isCodeNode(node)) node.setLanguage(event.target.value)
              }
            })
          }
          value={language}
        >
          <option value="plain">Plain text</option>
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="css">CSS</option>
          <option value="markup">HTML</option>
          <option value="json">JSON</option>
          <option value="python">Python</option>
          <option value="bash">Bash</option>
        </select>
      )}
      <InsertImage />
    </fieldset>
  )
}
