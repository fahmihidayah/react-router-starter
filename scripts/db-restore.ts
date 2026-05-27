import 'dotenv/config'
import { copyFileSync, existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { stdin, stdout } from 'node:process'
import * as readline from 'node:readline'

/**
 * Database restore script
 * Restores database from a backup file
 */
async function restore() {
  try {
    const backupDir = join(process.cwd(), 'backups')

    if (!existsSync(backupDir)) {
      console.error('❌ No backups directory found')
      process.exit(1)
    }

    // List available backups
    const backups = readdirSync(backupDir)
      .filter((file) => file.endsWith('.db'))
      .sort()
      .reverse()

    if (backups.length === 0) {
      console.error('❌ No backup files found')
      process.exit(1)
    }

    console.log('📋 Available backups:')
    backups.forEach((backup, index) => {
      console.log(`  ${index + 1}. ${backup}`)
    })

    const rl = readline.createInterface({
      input: stdin,
      output: stdout,
    })

    const backupNumber = await new Promise<string>((resolve) => {
      rl.question('\n🔢 Enter backup number to restore (or press Ctrl+C to cancel): ', resolve)
    })

    rl.close()

    const selectedIndex = Number.parseInt(backupNumber, 10) - 1

    if (selectedIndex < 0 || selectedIndex >= backups.length) {
      console.error('❌ Invalid backup number')
      process.exit(1)
    }

    const selectedBackup = backups[selectedIndex]
    const backupFile = join(backupDir, selectedBackup)
    const dbPath = process.env.DB_FILE_NAME ?? 'file:./app.db'
    const dbFile = dbPath.replace('file:', '')

    // Create backup of current database before restoring
    if (existsSync(dbFile)) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
      const preRestoreBackup = join(backupDir, `pre-restore-${timestamp}.db`)
      copyFileSync(dbFile, preRestoreBackup)
      console.log(`📦 Current database backed up to: ${preRestoreBackup}`)
    }

    // Restore from backup
    copyFileSync(backupFile, dbFile)

    console.log('✅ Database restored successfully!')
    console.log(`📁 Restored from: ${backupFile}`)
    console.log(`📊 Database location: ${dbFile}`)
  } catch (error) {
    console.error('❌ Error restoring backup:', error)
    process.exit(1)
  }
}

restore()
