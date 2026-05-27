import 'dotenv/config'
import { drizzle } from 'drizzle-orm/libsql'
import { users, tags } from '../app/db/schema'
import { randomUUID } from 'crypto'

const db = drizzle(process.env.DB_FILE_NAME ?? 'file:./app.db')

const now = new Date()

const seedUsers = [
  {
    id: randomUUID(),
    name: 'John Doe',
    email: 'john.doe@example.com',
    emailVerified: false,
    image: null,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    emailVerified: true,
    image: null,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    emailVerified: true,
    image: null,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    name: 'Alice Williams',
    email: 'alice.williams@example.com',
    emailVerified: false,
    image: null,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    name: 'Charlie Brown',
    email: 'charlie.brown@example.com',
    emailVerified: true,
    image: null,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    name: 'Diana Prince',
    email: 'diana.prince@example.com',
    emailVerified: true,
    image: null,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    name: 'Ethan Hunt',
    email: 'ethan.hunt@example.com',
    emailVerified: false,
    image: null,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    name: 'Fiona Green',
    email: 'fiona.green@example.com',
    emailVerified: true,
    image: null,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    name: 'George Miller',
    email: 'george.miller@example.com',
    emailVerified: true,
    image: null,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    name: 'Hannah Davis',
    email: 'hannah.davis@example.com',
    emailVerified: false,
    image: null,
    createdAt: now,
    updatedAt: now,
  },
]

// Seed data for tags
const seedTags = [
  {
    id: randomUUID(),
    name: 'Youth',
    color: '#3B82F6',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    name: 'Family',
    color: '#10B981',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    name: 'Education',
    color: '#F59E0B',
    createdAt: now,
    updatedAt: now,
  },
]

async function seed() {
  try {
    console.log('🌱 Seeding database...')

    // Clear existing data (optional)
    console.log('🗑️  Clearing existing data...')
    await db.delete(users)
    await db.delete(tags)

    // Insert seed data
    console.log('📝 Inserting seed users...')
    await db.insert(users).values(seedUsers)

    console.log('📝 Inserting seed tags...')
    await db.insert(tags).values(seedTags)

    console.log('✅ Seeding completed successfully!')
    console.log(`📊 Inserted ${seedUsers.length} users`)
    console.log(`📊 Inserted ${seedTags.length} tags`)
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

seed()
