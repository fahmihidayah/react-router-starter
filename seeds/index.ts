import 'dotenv/config'
import { randomUUID } from 'node:crypto'
import { roles, tags, userRoles, users } from '../app/db/schema'
import { auth } from '../app/lib/auth'
import { databaseClient, db } from '../app/lib/database'

const now = new Date()

const ADMIN_EMAIL = 'admin@fahmihidayah.my.id'
const ADMIN_PASSWORD = 'Test@1234'

const seedRoles = [
  {
    id: randomUUID(),
    name: 'Admin',
    description: 'Administrator with full access',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    name: 'User',
    description: 'Standard application user',
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

    console.log('🛡️  Ensuring application roles exist...')
    await db.insert(roles).values(seedRoles).onConflictDoNothing({ target: roles.name })

    console.log('👤 Creating admin through Better Auth...')
    const response = await auth.api.signUpEmail({
      body: {
        name: 'Admin',
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      },
      asResponse: true,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Better Auth could not create the admin (${response.status}): ${error}`)
    }

    const result = (await response.json()) as { user?: { id?: string } }
    if (!result.user?.id) {
      throw new Error('Better Auth created no user ID for the admin')
    }

    const adminRole = await db.query.roles.findFirst({ where: { name: 'Admin' } })
    if (!adminRole) {
      throw new Error('Admin role was not found after seeding roles')
    }

    await db.insert(userRoles).values({
      userId: result.user.id,
      roleId: adminRole.id,
    })

    console.log('📝 Inserting seed tags...')
    await db.insert(tags).values(seedTags)

    console.log('✅ Seeding completed successfully!')
    console.log(`👤 Created admin user: ${ADMIN_EMAIL}`)
    console.log(`📊 Inserted ${seedTags.length} tags`)
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exitCode = 1
  } finally {
    await databaseClient.end()
  }
}

seed()
