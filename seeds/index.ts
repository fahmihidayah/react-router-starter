import 'dotenv/config'
import { drizzle } from 'drizzle-orm/libsql'
import {
  users,
  congregations,
  tags,
  events,
  transactions,
  qurbans,
} from '../app/db/schema'
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

// Seed data for congregations
const seedCongregations = [
  {
    id: randomUUID(),
    name: 'Ahmad bin Abdullah',
    gender: 'm' as const,
    phone: '+1234567890',
    address: '123 Masjid Street, City, State 12345',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    name: 'Fatima binti Muhammad',
    gender: 'f' as const,
    phone: '+1234567891',
    address: '456 Prayer Avenue, City, State 12345',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    name: 'Omar bin Ali',
    gender: 'm' as const,
    phone: '+1234567892',
    address: '789 Dua Lane, City, State 12345',
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

// Seed data for events
const seedEvents = [
  {
    id: randomUUID(),
    name: 'Friday Prayer',
    description: 'Weekly congregational Friday prayer',
    eventDate: new Date('2026-05-29T13:00:00'),
    location: 'Main Prayer Hall',
    status: 'planned' as const,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    name: 'Quran Study Circle',
    description: 'Weekly Quran recitation and interpretation study',
    eventDate: new Date('2026-05-30T19:00:00'),
    location: 'Community Room',
    status: 'planned' as const,
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
    await db.delete(congregations)
    await db.delete(tags)
    await db.delete(events)

    // Insert seed data
    console.log('📝 Inserting seed users...')
    await db.insert(users).values(seedUsers)

    console.log('📝 Inserting seed congregations...')
    await db.insert(congregations).values(seedCongregations)

    console.log('📝 Inserting seed tags...')
    await db.insert(tags).values(seedTags)

    console.log('📝 Inserting seed events...')
    await db.insert(events).values(seedEvents)

    console.log('✅ Seeding completed successfully!')
    console.log(`📊 Inserted ${seedUsers.length} users`)
    console.log(`📊 Inserted ${seedCongregations.length} congregations`)
    console.log(`📊 Inserted ${seedTags.length} tags`)
    console.log(`📊 Inserted ${seedEvents.length} events`)
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

seed()
