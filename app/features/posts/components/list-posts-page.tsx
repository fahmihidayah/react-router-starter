import { useSearchParams } from 'react-router'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '~/components/ui/pagination'
import type { TPost } from '~/features/posts/type'
import { ListPostItem } from './list-post-item'

interface IListPostsPageProps {
  posts: TPost[]
  currentPage: number
  totalPages: number
}

export function ListPostsPage({ posts, currentPage, totalPages }: IListPostsPageProps) {
  const [, setSearchParams] = useSearchParams()

  const handlePageChange = (page: number) => {
    setSearchParams((params) => {
      params.set('page', page.toString())
      return params
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getPaginationItems = () => {
    const items: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i)
      }
    } else {
      items.push(1)

      if (currentPage > 3) {
        items.push('...')
      }

      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        if (!items.includes(i)) {
          items.push(i)
        }
      }

      if (currentPage < totalPages - 2) {
        items.push('...')
      }

      items.push(totalPages)
    }

    return items
  }

  if (posts.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <h3 className="text-lg font-semibold">No posts found</h3>
          <p className="text-sm text-muted-foreground">Try adjusting your filters or check back later</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {posts.map((post) => (
          <ListPostItem key={post.id} post={post} />
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            {currentPage > 1 && (
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    handlePageChange(currentPage - 1)
                  }}
                />
              </PaginationItem>
            )}

            {getPaginationItems().map((item, index) => (
              <PaginationItem key={`${item}-${index}`}>
                {item === '...' ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    href="#"
                    isActive={currentPage === item}
                    onClick={(e) => {
                      e.preventDefault()
                      handlePageChange(item as number)
                    }}
                  >
                    {item}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            {currentPage < totalPages && (
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    handlePageChange(currentPage + 1)
                  }}
                />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
