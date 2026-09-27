import { uploadMediaAction } from '~/features/media/actions/upload-media-action'
import type { Route } from './+types/media.upload'

export function action({ request }: Route.ActionArgs) {
  return uploadMediaAction(request)
}
