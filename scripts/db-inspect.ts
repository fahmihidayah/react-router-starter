import 'dotenv/config'
import { sql } from 'drizzle-orm'
import { db } from '../app/lib/database'

/**
 * Database inspection script
 * Displays database statistics and table information
 */
async function inspect() {
  try {
    console.log('🔍 Database Inspection Report')
    console.log('='.repeat(60))
    console.log('📁 Database: PostgreSQL')
    console.log('')

    // Get all tables
    const tables = await db.execute<{ name: string }>(sql`
      SELECT table_name AS name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `)

    console.log(`📊 Total Tables: ${tables.length}`)
    console.log('')

    // Get row counts for each table
    for (const table of tables) {
      const safeTableName = `"${table.name.replaceAll('"', '""')}"`
      const [countResult] = await db.execute<{ count: string }>(
        sql.raw(`SELECT COUNT(*) AS count FROM ${safeTableName}`),
      )
      const columns = await db.execute<{
        name: string
        type: string
        notnull: boolean
        pk: boolean
      }>(sql`
        SELECT
          column_name AS name,
          data_type AS type,
          (is_nullable = 'NO') AS notnull,
          EXISTS (
            SELECT 1
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            WHERE tc.constraint_type = 'PRIMARY KEY'
              AND tc.table_schema = 'public'
              AND tc.table_name = ${table.name}
              AND kcu.column_name = columns.column_name
          ) AS pk
        FROM information_schema.columns AS columns
        WHERE table_schema = 'public' AND table_name = ${table.name}
        ORDER BY ordinal_position
      `)

      console.log(`📋 Table: ${table.name}`)
      console.log(`   Rows: ${countResult?.count ?? '0'}`)
      console.log(`   Columns: ${columns.length}`)

      // Show primary keys
      const primaryKeys = columns.filter((col) => col.pk).map((col) => col.name)
      if (primaryKeys.length > 0) {
        console.log(`   Primary Key(s): ${primaryKeys.join(', ')}`)
      }

      // Show foreign keys
      const foreignKeys = await db.execute<{
        table: string
        from: string
        to: string
      }>(sql`
        SELECT
          ccu.table_name AS table,
          kcu.column_name AS from,
          ccu.column_name AS to
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_schema = 'public'
          AND tc.table_name = ${table.name}
      `)

      if (foreignKeys.length > 0) {
        console.log('   Foreign Keys:')
        for (const fk of foreignKeys) {
          console.log(`     - ${fk.from} → ${fk.table}.${fk.to}`)
        }
      }

      console.log('')
    }

    // Database size
    const [sizeResult] = await db.execute<{ size: string }>(
      sql`SELECT pg_size_pretty(pg_database_size(current_database())) AS size`,
    )

    console.log(`💾 Database Size: ${sizeResult?.size ?? 'unknown'}`)
    console.log('='.repeat(60))

    process.exit(0)
  } catch (error) {
    console.error('❌ Error inspecting database:', error)
    process.exit(1)
  }
}

inspect()
