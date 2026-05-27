import 'dotenv/config'
import { sql } from 'drizzle-orm'
import { db } from '../app/lib/database'

/**
 * Database inspection script
 * Displays database statistics and table information
 */
async function inspect() {
  try {
    const dbPath = process.env.DB_FILE_NAME ?? 'file:./app.db'
    const dbFile = dbPath.replace('file:', '')

    console.log('🔍 Database Inspection Report')
    console.log('='.repeat(60))
    console.log(`📁 Database: ${dbFile}`)
    console.log('')

    // Get all tables
    const tablesResult = await db.all(
      sql`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`,
    )

    const tables = tablesResult as Array<{ name: string }>

    console.log(`📊 Total Tables: ${tables.length}`)
    console.log('')

    // Get row counts for each table
    for (const table of tables) {
      const countResult = (await db.get(sql.raw(`SELECT COUNT(*) as count FROM ${table.name}`))) as {
        count: number
      }

      const columns = (await db.all(sql.raw(`PRAGMA table_info(${table.name})`))) as Array<{
        name: string
        type: string
        notnull: number
        pk: number
      }>

      console.log(`📋 Table: ${table.name}`)
      console.log(`   Rows: ${countResult.count}`)
      console.log(`   Columns: ${columns.length}`)

      // Show primary keys
      const primaryKeys = columns.filter((col) => col.pk > 0).map((col) => col.name)
      if (primaryKeys.length > 0) {
        console.log(`   Primary Key(s): ${primaryKeys.join(', ')}`)
      }

      // Show foreign keys
      const foreignKeys = (await db.all(
        sql.raw(`PRAGMA foreign_key_list(${table.name})`),
      )) as Array<{
        table: string
        from: string
        to: string
      }>

      if (foreignKeys.length > 0) {
        console.log('   Foreign Keys:')
        for (const fk of foreignKeys) {
          console.log(`     - ${fk.from} → ${fk.table}.${fk.to}`)
        }
      }

      console.log('')
    }

    // Database size
    const pageCountResult = (await db.get(sql`PRAGMA page_count`)) as { page_count: number }
    const pageSizeResult = (await db.get(sql`PRAGMA page_size`)) as { page_size: number }

    const dbSizeBytes = pageCountResult.page_count * pageSizeResult.page_size
    const dbSizeMB = (dbSizeBytes / (1024 * 1024)).toFixed(2)

    console.log(`💾 Database Size: ${dbSizeMB} MB`)
    console.log('='.repeat(60))

    process.exit(0)
  } catch (error) {
    console.error('❌ Error inspecting database:', error)
    process.exit(1)
  }
}

inspect()
