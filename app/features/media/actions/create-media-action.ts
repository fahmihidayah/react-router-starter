import { redirect } from 'react-router'
import type { ActionArgs } from '~/lib/types'
import { createMediaSchema } from '../schemas/media-schema'
import * as mediaService from '../services'
import { actionError, getUploadedFile } from './media-action-utils'

export async function createMediaAction(args: ActionArgs) {
  const formData = await args.request.formData()
  const parsed = createMediaSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  const file = getUploadedFile(formData)
  if (!file) return { errors: { file: ['Choose an image to upload'] } }

  try {
    await mediaService.create(parsed.data, file)
    return redirect('/admin/media')
  } catch (error) {
    return actionError(error)
  }
}
