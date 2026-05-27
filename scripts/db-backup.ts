import 'dotenv/config'
import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Database backup script
 * Creates a timestamped backup of the current database
 */
async function backup() {
  try {
    const dbPath = process.env.DB_FILE_NAME ?? 'file:./app.db'
    const dbFile = dbPath.replace('file:', '')

    if (!existsSync(dbFile)) {
      console.error(`❌ Database file not found: ${dbFile}`)
      process.exit(1)
    }

    // Create backups directory if it doesn't exist
    const backupDir = join(process.cwd(), 'backups')
    if (!existsSync(backupDir)) {
      mkdirSync(backupDir, { recursive: true })
    }

    // Generate timestamped backup filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const backupFile = join(backupDir, `app-${timestamp}.db`)

    // Copy database file
    copyFileSync(dbFile, backupFile)

    console.log('✅ Database backup created successfully!')
    console.log(`📁 Backup location: ${backupFile}`)
    console.log(`📊 Original database: ${dbFile}`)
  } catch (error) {
    console.error('❌ Error creating backup:', error)
    process.exit(1)
  }
}

backup()
