import * as postService from '../services'

export async function getPostByIdLoader(id: string) {
  return postService.findById(id)
}
