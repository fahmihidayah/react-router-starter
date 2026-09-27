import type { TPost } from '~/db/schema'
import { PostForm, type PostFormProps } from './post-form'
export function EditPostForm(props: PostFormProps & { post: TPost }) {
  return <PostForm key={props.post.id} {...props} />
}
