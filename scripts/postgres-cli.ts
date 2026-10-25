import { spawn } from 'node:child_process'

type PostgresCliConfig = {
  args: string[]
  env: NodeJS.ProcessEnv
}

export function getPostgresCliConfig(): PostgresCliConfig {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required')
  }

  const url = new URL(databaseUrl)
  if (url.protocol !== 'postgres:' && url.protocol !== 'postgresql:') {
    throw new Error('DATABASE_URL must use the postgres:// or postgresql:// protocol')
  }

  const databaseName = decodeURIComponent(url.pathname.slice(1))
  if (!databaseName) {
    throw new Error('DATABASE_URL must include a database name')
  }

  const args = [
    '--host',
    url.hostname,
    '--port',
    url.port || '5432',
    '--username',
    decodeURIComponent(url.username),
    '--dbname',
    databaseName,
  ]
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    PGPASSWORD: decodeURIComponent(url.password),
  }

  const sslMode = url.searchParams.get('sslmode')
  if (sslMode) {
    env.PGSSLMODE = sslMode
  }

  return { args, env }
}

export async function runPostgresCommand(
  command: 'pg_dump' | 'pg_restore',
  commandArgs: string[],
): Promise<void> {
  const { args, env } = getPostgresCliConfig()

  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, [...args, ...commandArgs], {
      env,
      stdio: 'inherit',
    })

    child.on('error', (error) => {
      reject(
        error.message.includes('ENOENT')
          ? new Error(`${command} is not installed or is not available on PATH`)
          : error,
      )
    })
    child.on('exit', (code) => {
      if (code === 0) {
        resolve()
        return
      }

      reject(new Error(`${command} exited with code ${code ?? 'unknown'}`))
    })
  })
}
