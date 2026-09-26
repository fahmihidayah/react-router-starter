import * as mediaService from '../services'

export async function getMediaByIdLoader(id: string) {
  return mediaService.findById(id)
}
