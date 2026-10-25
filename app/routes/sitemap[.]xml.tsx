import { db } from '~/lib/database'
import { posts } from '~/db/schema'
import { env } from '~/env'

/**
 * Sitemap.xml endpoint that generates a sitemap for search engines.
 * When ALLOW_INDEXING=false, returns an empty sitemap.
 * When ALLOW_INDEXING=true, includes all public pages and blog posts.
 */
export async function loader() {
  const baseUrl = env.BETTER_AUTH_URL

  // If indexing is disabled, return empty sitemap
  if (!env.ALLOW_INDEXING) {
    const emptySitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`

    return new Response(emptySitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    })
  }

  // Fetch all blog posts
  const allPosts = await db.query.posts.findMany({
    columns: {
      slug: true,
      updatedAt: true,
    },
    orderBy: (posts, { desc }) => [desc(posts.updatedAt)],
  })

  // Define static pages with their priorities and change frequencies
  const staticPages = [
    { url: '', changefreq: 'daily', priority: '1.0' }, // Homepage
    { url: 'about', changefreq: 'monthly', priority: '0.8' },
    { url: 'contact', changefreq: 'monthly', priority: '0.8' },
    { url: 'posts', changefreq: 'daily', priority: '0.9' },
    { url: 'privacy', changefreq: 'yearly', priority: '0.5' },
    { url: 'terms', changefreq: 'yearly', priority: '0.5' },
  ]

  // Generate sitemap XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages
  .map(
    (page) => `  <url>
    <loc>${baseUrl}${page.url ? `/${page.url}` : ''}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
  )
  .join('\n')}
${allPosts
  .map(
    (post) => `  <url>
    <loc>${baseUrl}/posts/${post.slug}</loc>
    <lastmod>${post.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`,
  )
  .join('\n')}
</urlset>`

  return new Response(sitemap, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  })
}
