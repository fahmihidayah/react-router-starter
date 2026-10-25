import 'dotenv/config'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { runPostgresCommand } from './postgres-cli'

export async function createBackup(prefix = 'app'): Promise<string> {
  const backupDir = join(process.cwd(), 'backups')
  await mkdir(backupDir, { recursive: true })

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
  const backupFile = join(backupDir, `${prefix}-${timestamp}.dump`)

  await runPostgresCommand('pg_dump', [
    '--format=custom',
    '--no-owner',
    '--no-privileges',
    '--file',
    backupFile,
  ])

  return backupFile
}

async function main() {
  try {
    const backupFile = await createBackup()
    console.log(`Database backup created: ${backupFile}`)
  } catch (error) {
    console.error('Unable to create database backup:', error)
    process.exitCode = 1
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  void main()
}
