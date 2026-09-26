import { redirect } from 'react-router'
import type { ActionArgs } from '~/lib/types'
import { updateMediaSchema } from '../schemas/media-schema'
import * as mediaService from '../services'
import { actionError, getUploadedFile } from './media-action-utils'

export async function updateMediaAction(args: ActionArgs) {
  const id = args.params.id
  if (!id) throw new Response('Media ID is required', { status: 400 })

  const formData = await args.request.formData()
  const parsed = updateMediaSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  try {
    await mediaService.update(id, parsed.data, getUploadedFile(formData))
    return redirect('/admin/media')
  } catch (error) {
    return actionError(error)
  }
}
