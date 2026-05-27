import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { congregations } from './congregations'

// Transactions table
export const transactions = sqliteTable('transactions', {
  id: text('id').primaryKey(),
  congregationId: text('congregationId')
    .notNull()
    .references(() => congregations.id, {
      onDelete: 'cascade',
    }),
  amount: int('amount').notNull(),
  paymentMethod: text('paymentMethod', { enum: ['cash', 'transfer', 'card'] }).notNull(),
  status: text('status', { enum: ['pending', 'completed', 'failed', 'refunded'] }).notNull(),
  notes: text('notes'),
  transactionDate: int('transactionDate', { mode: 'timestamp' }).notNull(),
  createdAt: int('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: int('updatedAt', { mode: 'timestamp' }).notNull(),
})

export type TTransaction = typeof transactions.$inferSelect
export type TInsertTransaction = typeof transactions.$inferInsert
