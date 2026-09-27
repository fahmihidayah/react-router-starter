import { PostForm, type PostFormProps } from './post-form'
export function NewPostForm(props: Omit<PostFormProps, 'post'>) {
  return <PostForm {...props} />
}
