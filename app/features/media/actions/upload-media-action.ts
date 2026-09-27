import { createMediaSchema } from '../schemas/media-schema'
import * as mediaService from '../services'
import { actionError, getUploadedFile } from './media-action-utils'

// JSON upload endpoint for editors; uses the same validation, storage and media library.
export async function uploadMediaAction(request: Request) {
  const formData = await request.formData()
  const parsed = createMediaSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return Response.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 })
  }
  const file = getUploadedFile(formData)
  if (!file) {
    return Response.json({ errors: { file: ['Choose an image to upload'] } }, { status: 400 })
  }
  try {
    const id = await mediaService.create(parsed.data, file)
    const media = await mediaService.findById(id)
    if (!media) throw new Error('Unable to retrieve uploaded image')
    return Response.json({ url: media.url, alt: media.alt }, { status: 201 })
  } catch (error) {
    return Response.json(actionError(error), { status: 400 })
  }
}
