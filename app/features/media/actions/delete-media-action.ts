import * as mediaService from '../services'

export async function deleteMediaAction(id: string) {
  await mediaService.deleteById(id)
  return { success: true }
}
