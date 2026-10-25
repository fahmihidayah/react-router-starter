import { type ReactNode, useState } from 'react'
import { Form } from 'react-router'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import * as m from '~/paraglide/messages.js'

interface DeleteLearnerDialogProps {
  learner: { id: string; name: string }
  trigger: ReactNode
  includeLearnerId?: boolean
}

export function DeleteLearnerDialog({
  learner,
  trigger,
  includeLearnerId = false,
}: DeleteLearnerDialogProps) {
  const [open, setOpen] = useState(false)
  const [confirmation, setConfirmation] = useState('')
  const matches = confirmation.trim() === learner.name

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) setConfirmation('')
      }}
    >
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{m.learner_delete_named({ name: learner.name })}</AlertDialogTitle>
          <AlertDialogDescription>{m.learner_delete_confirm_description()}</AlertDialogDescription>
        </AlertDialogHeader>
        <Form method="post" className="space-y-4">
          <input type="hidden" name="intent" value="delete" />
          {includeLearnerId ? <input type="hidden" name="id" value={learner.id} /> : null}
          <div className="space-y-2">
            <Label htmlFor={`delete-learner-${learner.id}`}>
              {m.learner_delete_confirmation_label({ name: learner.name })}
            </Label>
            <Input
              id={`delete-learner-${learner.id}`}
              name="confirmation"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              placeholder={learner.name}
              autoComplete="off"
              autoFocus
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">{m.learner_cancel()}</AlertDialogCancel>
            <Button type="submit" variant="destructive" disabled={!matches}>
              {m.learner_delete_action()}
            </Button>
          </AlertDialogFooter>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
