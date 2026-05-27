import { Link } from 'react-router'
import { Card } from '~/components/ui/card'
import type { TPost } from '~/db/schema'
import { formatDate } from '~/lib/utils'

interface IListPostItemProps {
  post: TPost
}

export function ListPostItem({ post }: IListPostItemProps) {
  return (
    <Link to={`/posts/${post.slug}`} className="group">
      <Card className="h-full px-5 py-5 transition-all duration-200 hover:shadow-lg hover:border-foreground">
        <h3 className="line-clamp-2 text-base group-hover:text-primary transition-colors">
          {post.title}
        </h3>
        <p className="text-xs">{formatDate(post.createdAt)}</p>
      </Card>
    </Link>
  )
}
