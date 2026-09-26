import { readFile } from 'node:fs/promises'
import { getLocalMediaPath } from '~/features/media/storage'
import type { Route } from './+types/media.files.$key'

export async function loader({ params }: Route.LoaderArgs) {
  try {
    const body = await readFile(getLocalMediaPath(params.key))
    return new Response(body, {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    throw new Response('Media not found', { status: 404 })
  }
}
