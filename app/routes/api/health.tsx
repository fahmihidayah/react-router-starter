/**
 * Liveness endpoint: indicates the application process is running.
 * Does NOT check dependencies (database, queue, storage) - use /api/ready for that.
 * Always returns 200 if the process is alive.
 */
export async function loader() {
  return Response.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
}
