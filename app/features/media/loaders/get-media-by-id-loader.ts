import { mediaRepository } from '../repositories'

export async function getMediaByIdLoader(id: string) {
  const media = await mediaRepository.findById(id)

  if (!media) {
    throw new Response('Media not found', { status: 404 })
  }

  return media
}
