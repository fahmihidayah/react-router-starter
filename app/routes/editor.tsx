import { Card } from '~/components/ui/card'
import { RichEditor } from '~/components/ui/rich-editor'

export default function EditorTestPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Rich Editor Test</h1>
          <p className="text-muted-foreground">
            Test the Lexical-based rich text editor with formatting toolbar
          </p>
        </div>

        <Card className="p-6">
          <div className="mb-6">
            <h2 className="mb-2 block text-sm font-medium">
              Editor with Formatting
            </h2>
            <RichEditor placeholder="Start typing here... Try using the toolbar!" />
          </div>
        </Card>

        <Card className="mt-6 p-6">
          <h2 className="mb-4 text-lg font-semibold">Features</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✓ Bold, Italic, Underline text formatting</li>
            <li>✓ Heading levels (H1, H2, H3)</li>
            <li>✓ Bullet and numbered lists</li>
            <li>✓ Block quotes</li>
            <li>✓ Undo/Redo history</li>
            <li>✓ Real-time toolbar state updates</li>
            <li>✓ Responsive design</li>
            <li>✓ Error boundary for stability</li>
          </ul>
        </Card>

        <Card className="mt-6 p-6">
          <h2 className="mb-4 text-lg font-semibold">Toolbar Controls</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div>
              <span className="font-medium text-foreground">Text Formatting:</span> Bold,
              Italic, Underline buttons
            </div>
            <div>
              <span className="font-medium text-foreground">Headings:</span> Dropdown menu
              for H1, H2, H3
            </div>
            <div>
              <span className="font-medium text-foreground">Lists:</span> Bullet lists,
              numbered lists, and remove list option
            </div>
            <div>
              <span className="font-medium text-foreground">Block Quote:</span> Insert
              quoted text blocks
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
