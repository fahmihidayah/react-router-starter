import type { ReactNode } from 'react'
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

export function RenameTrackDialog({
  track,
  trigger,
  errors,
}: {
  track: { id: string; name: string }
  trigger: ReactNode
  errors?: Record<string, string[] | undefined>
}) {
  const dialog = useActionDialog({ intent: 'renameTrack', errors })

  return (
    <Dialog open={dialog.open} onOpenChange={dialog.setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{m.activity_rename_track()}</DialogTitle>
          <DialogDescription>{m.activity_topic_rename_description()}</DialogDescription>
        </DialogHeader>
        <Form method="post" className="space-y-4">
          <input type="hidden" name="intent" value="renameTrack" />
          <input type="hidden" name="trackId" value={track.id} />
          <div className="space-y-2">
            <Label htmlFor={`rename-track-${track.id}`}>{m.activity_track_name()}</Label>
            <Input
              id={`rename-track-${track.id}`}
              name="name"
              defaultValue={track.name}
              autoFocus
              required
            />
            {errors?.name?.[0] ? (
              <p className="text-sm text-destructive">{errors.name[0]}</p>
            ) : null}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={dialog.isSubmitting}>
              {m.activity_topic_save_name()}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
