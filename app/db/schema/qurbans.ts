import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { transactions } from './transactions'

// Qurban table
export const qurbans = sqliteTable('qurbans', {
  id: text('id').primaryKey(),
  transactionId: text('transactionId')
    .notNull()
    .references(() => transactions.id, {
      onDelete: 'cascade',
    }),
  animalType: text('animalType', { enum: ['goat', 'sheep', 'cow', 'camel'] }).notNull(),
  groupNumber: int('groupNumber'),
  hijriYear: int('hijriYear').notNull(),
  notes: text('notes'),
  createdAt: int('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: int('updatedAt', { mode: 'timestamp' }).notNull(),
})

export type TQurban = typeof qurbans.$inferSelect
export type TInsertQurban = typeof qurbans.$inferInsert
