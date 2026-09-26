import * as mediaService from '../services'

export async function deleteManyMediaAction(ids: string[]) {
  if (ids.length === 0) return { success: false, message: 'Select at least one media item' }
  await mediaService.deleteMany(ids)
  return { success: true }
}
