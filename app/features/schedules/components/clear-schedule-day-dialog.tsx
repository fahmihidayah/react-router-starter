import { Trash2 } from 'lucide-react'
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
import * as m from '~/paraglide/messages.js'

export function ClearScheduleDayDialog({ learnerId, date }: { learnerId: string; date: string }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Trash2 /> {m.schedule_clear_day()}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <Form method="post">
          <input type="hidden" name="intent" value="clearScheduleDay" />
          <input type="hidden" name="learnerId" value={learnerId} />
          <input type="hidden" name="date" value={date} />
          <AlertDialogHeader>
            <AlertDialogTitle>{m.schedule_clear_day_title()}</AlertDialogTitle>
            <AlertDialogDescription>{m.schedule_clear_day_description()}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel>{m.schedule_cancel()}</AlertDialogCancel>
            <Button type="submit" variant="destructive">
              {m.schedule_clear_action()}
            </Button>
          </AlertDialogFooter>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
