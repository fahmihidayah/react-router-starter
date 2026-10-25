import { env } from '~/env'

/**
 * Robots.txt endpoint that controls search engine crawling.
 * When ALLOW_INDEXING=false, disallows all crawlers.
 * When ALLOW_INDEXING=true, allows all crawlers.
 */
export async function loader() {
  const robotsTxt = env.ALLOW_INDEXING
    ? `# Allow all robots
User-agent: *
Allow: /

# Sitemap
# Sitemap: ${env.BETTER_AUTH_URL}/sitemap.xml
`
    : `# Disallow all robots
User-agent: *
Disallow: /
`

  return new Response(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  })
}
