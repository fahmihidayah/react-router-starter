import { Plus } from 'lucide-react'
import { Form } from 'react-router'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { useActionDialog } from '~/hooks/use-action-dialog'
import * as m from '~/paraglide/messages.js'

export function CreateTrackDialog({ errors }: { errors?: Record<string, string[] | undefined> }) {
  const dialog = useActionDialog({
    intent: 'createTrack',
    errors,
    defaultOpen: Boolean(errors),
  })
  const error = errors?.name?.[0]

  return (
    <Dialog open={dialog.open} onOpenChange={dialog.setOpen}>
      <DialogTrigger asChild>
        <Button type="button">
          <Plus /> {m.activity_add_track()}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{m.activity_add_track()}</DialogTitle>
          <DialogDescription>{m.activity_tracks_description()}</DialogDescription>
        </DialogHeader>
        <Form method="post" className="space-y-4" onSubmit={(event) => event.stopPropagation()}>
          <input type="hidden" name="intent" value="createTrack" />
          <div className="space-y-2">
            <Label htmlFor="new-track">{m.activity_track_name()}</Label>
            <Input
              id="new-track"
              name="name"
              placeholder={m.activity_track_placeholder()}
              aria-invalid={Boolean(error)}
              autoFocus
              required
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={dialog.isSubmitting}>
              {m.activity_add_track()}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
