import 'dotenv/config'
import { readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { stdin, stdout } from 'node:process'
import * as readline from 'node:readline/promises'
import { createBackup } from './db-backup'
import { runPostgresCommand } from './postgres-cli'

async function restore() {
  const backupDir = join(process.cwd(), 'backups')
  const backups = (await readdir(backupDir))
    .filter((file) => file.endsWith('.dump'))
    .sort()
    .reverse()

  if (backups.length === 0) {
    throw new Error(`No .dump backups found in ${backupDir}`)
  }

  console.log('Available backups:')
  backups.forEach((backup, index) => {
    console.log(`  ${index + 1}. ${backup}`)
  })

  const prompt = readline.createInterface({ input: stdin, output: stdout })
  try {
    const answer = await prompt.question('\nEnter the backup number to restore: ')
    const selectedIndex = Number.parseInt(answer, 10) - 1
    const selectedBackup = backups[selectedIndex]
    if (!selectedBackup) {
      throw new Error('Invalid backup number')
    }

    const confirmation = await prompt.question(
      'This replaces data in the DATABASE_URL target. Type RESTORE to continue: ',
    )
    if (confirmation !== 'RESTORE') {
      console.log('Restore cancelled.')
      return
    }

    const safetyBackup = await createBackup('pre-restore')
    console.log(`Current database backed up to: ${safetyBackup}`)

    const backupFile = join(backupDir, selectedBackup)
    await runPostgresCommand('pg_restore', [
      '--clean',
      '--if-exists',
      '--no-owner',
      '--no-privileges',
      backupFile,
    ])
    console.log(`Database restored from: ${backupFile}`)
  } finally {
    prompt.close()
  }
}

restore().catch((error) => {
  console.error('Unable to restore database:', error)
  process.exitCode = 1
})
