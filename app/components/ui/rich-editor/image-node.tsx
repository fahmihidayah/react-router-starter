import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useLexicalEditable } from '@lexical/react/useLexicalEditable'
import {
  $applyNodeReplacement,
  $getNodeByKey,
  DecoratorNode,
  type DOMConversionMap,
  type DOMExportOutput,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from 'lexical'
import type { JSX } from 'react'

export function isImageSource(src: string): boolean {
  if (src.startsWith('/') && !src.startsWith('//') && !src.includes('\\')) return true
  try {
    return ['http:', 'https:'].includes(new URL(src).protocol)
  } catch {
    return false
  }
}

type SerializedImageNode = Spread<{ src: string; altText: string }, SerializedLexicalNode>

function EditorImage({
  src,
  altText,
  nodeKey,
}: {
  src: string
  altText: string
  nodeKey: NodeKey
}) {
  const [editor] = useLexicalComposerContext()
  const editable = useLexicalEditable()
  return (
    <span className="group relative inline-block max-w-full">
      <img
        src={isImageSource(src) ? src : undefined}
        alt={altText}
        className="max-h-[640px] max-w-full rounded-md"
        draggable={false}
      />
      {editable && (
        <button
          type="button"
          aria-label="Remove image"
          className="absolute right-2 top-2 rounded bg-background px-2 py-1 text-sm shadow"
          onClick={() => editor.update(() => $getNodeByKey(nodeKey)?.remove())}
        >
          Remove
        </button>
      )}
    </span>
  )
}

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string
  __altText: string

  static getType() {
    return 'image'
  }
  static clone(node: ImageNode) {
    return new ImageNode(node.__src, node.__altText, node.__key)
  }
  constructor(src = '', altText = '', key?: NodeKey) {
    super(key)
    this.__src = src
    this.__altText = altText
  }
  static importJSON(json: SerializedImageNode) {
    return $createImageNode(json.src, json.altText).updateFromJSON(json)
  }
  exportJSON(): SerializedImageNode {
    return {
      ...super.exportJSON(),
      src: this.__src,
      altText: this.__altText,
      type: 'image',
      version: 1,
    }
  }
  static importDOM(): DOMConversionMap {
    return {
      img: () => ({
        conversion: (element) => {
          const src = element.getAttribute('src') ?? ''
          return isImageSource(src)
            ? { node: $createImageNode(src, element.getAttribute('alt') ?? '') }
            : null
        },
        priority: 0,
      }),
    }
  }
  exportDOM(): DOMExportOutput {
    const element = document.createElement('img')
    if (isImageSource(this.__src)) element.setAttribute('src', this.__src)
    element.setAttribute('alt', this.__altText)
    return { element }
  }
  createDOM() {
    return document.createElement('span')
  }
  updateDOM() {
    return false
  }
  isInline() {
    return true
  }
  getTextContent() {
    return this.__altText
  }
  decorate() {
    return <EditorImage src={this.__src} altText={this.__altText} nodeKey={this.__key} />
  }
}

export function $createImageNode(src: string, altText: string) {
  return $applyNodeReplacement(new ImageNode(src, altText))
}
