import { redirect } from 'react-router'
import { saveUploadedFile } from '~/lib/upload'
import { mediaRepository } from '../repositories'
import { updateMediaSchema } from '../schemas/media-schema'

export async function updateMediaAction(request: Request, id: string) {
  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const alt = formData.get('alt')?.toString()

  try {
    let url: string
    let filename: string
    let altText: string | null = alt || null

    // Get existing media to preserve fields when not provided
    const existingMedia = await mediaRepository.findById(id)
    if (!existingMedia) {
      return {
        errors: {
          url: ['Media not found'],
          filename: [],
          alt: [],
        },
      }
    }

    // If file is provided, upload it and generate URL and filename
    if (file && file.size > 0) {
      const uploadResult = await saveUploadedFile(file)
      url = uploadResult.url
      filename = uploadResult.filename
      // Preserve existing alt text if new alt is not provided
      if (!alt) {
        altText = existingMedia.alt
      }
    } else {
      // No file provided, keep existing url and filename
      url = existingMedia.url
      filename = existingMedia.filename
      // Preserve existing alt text if new alt is not provided
      if (!alt) {
        altText = existingMedia.alt
      }
    }

    const result = updateMediaSchema.safeParse({
      url,
      filename,
      alt: altText,
    })

    if (!result.success) {
      return { errors: result.error.flatten().fieldErrors }
    }

    const { url: validatedUrl, filename: validatedFilename, alt: validatedAlt } = result.data

    await mediaRepository.update(id, {
      url: validatedUrl,
      alt: validatedAlt || null,
      filename: validatedFilename,
      updatedAt: new Date(),
    })

    return redirect('/dashboard/media')
  } catch (error) {
    console.error('Update media error:', error)
    return {
      errors: {
        url: ['Failed to update media. Please try again.'],
        alt: [],
        filename: [],
      },
    }
  }
}
