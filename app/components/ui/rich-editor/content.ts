import { $createParagraphNode, $createTextNode, $getRoot, type LexicalEditor } from 'lexical'

// Keep legacy plain text and double-encoded posts readable.
export function setEditorContent(editor: LexicalEditor, content: string) {
  let normalized = content
  try {
    const parsed: unknown = JSON.parse(content)
    if (typeof parsed === 'string') normalized = parsed
    const state = editor.parseEditorState(normalized)
    if (!state.isEmpty()) {
      editor.setEditorState(state, { tag: 'external-content' })
      return
    }
    normalized = ''
  } catch {
    // Older posts may contain plain text instead of a serialized editor state.
  }
  editor.update(
    () => {
      const paragraph = $createParagraphNode()
      if (normalized) paragraph.append($createTextNode(normalized))
      $getRoot().clear().append(paragraph)
    },
    { tag: 'external-content', discrete: true },
  )
}
