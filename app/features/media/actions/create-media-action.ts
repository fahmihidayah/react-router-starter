import { randomUUID } from 'node:crypto'
import { redirect } from 'react-router'
import { saveUploadedFile } from '~/lib/upload'
import { mediaRepository } from '../repositories'
import { createMediaSchema } from '../schemas/media-schema'

export async function createMediaAction(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const alt = formData.get('alt')?.toString()

  if (!file || file.size === 0) {
    return {
      errors: {
        url: ['File is required'],
        filename: [],
        alt: [],
      },
    }
  }

  try {
    const uploadResult = await saveUploadedFile(file)
    const url = uploadResult.url
    const filename = uploadResult.filename

    const result = createMediaSchema.safeParse({
      url,
      filename,
      alt: alt || null,
    })

    if (!result.success) {
      return { errors: result.error.flatten().fieldErrors }
    }

    const { url: validatedUrl, filename: validatedFilename, alt: validatedAlt } = result.data
    const now = new Date()

    await mediaRepository.create({
      id: randomUUID(),
      url: validatedUrl,
      alt: validatedAlt || null,
      filename: validatedFilename,
      createdAt: now,
      updatedAt: now,
    })

    return redirect('/dashboard/media')
  } catch (uploadError) {
    const errorMessage = uploadError instanceof Error ? uploadError.message : String(uploadError)
    console.error('File upload error:', errorMessage, uploadError)
    return {
      errors: {
        url: ['Failed to upload file. Please try again.'],
        filename: [],
        alt: [],
      },
    }
  }
}
