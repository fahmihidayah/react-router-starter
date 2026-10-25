import 'dotenv/config'
import { databaseClient } from '../app/lib/database'
import { seedBootstrapAdmin } from './admin'
import { seedDemoData } from './demo'
import { resolveBootstrapAdminCredentials } from './lib/credentials'
import { seedSystem } from './system'

const SEED_MODES = ['system', 'demo', 'local', 'admin'] as const
type SeedMode = (typeof SEED_MODES)[number]

function resolveSeedMode(argument: string | undefined): SeedMode {
  if (!argument) return 'system'

  const mode = SEED_MODES.find((candidate) => candidate === argument)
  if (!mode) {
    throw new Error(`Unknown seed target "${argument}". Expected one of: ${SEED_MODES.join(', ')}.`)
  }

  return mode
}

async function runSystemSeed(): Promise<void> {
  const { permissionCount, roleCount } = await seedSystem()
  console.log(`🔐 Synchronized ${roleCount} system roles and ${permissionCount} permissions`)
}

async function runDemoSeed(): Promise<void> {
  const tagCount = await seedDemoData()
  console.log(`📊 Synchronized ${tagCount} demo tags`)
}

async function runAdminBootstrap(): Promise<void> {
  const credentials = resolveBootstrapAdminCredentials()
  const { created, email } = await seedBootstrapAdmin(credentials)

  console.log(`${created ? '👤 Created' : '👤 Updated'} bootstrap administrator: ${email}`)
  console.log('🔑 Change this password after the first sign-in and rotate it on a schedule.')
}

async function main(): Promise<void> {
  const mode = resolveSeedMode(process.argv[2])
  console.log(`🌱 Seeding database (${mode})...`)

  if (mode === 'system' || mode === 'local') await runSystemSeed()
  if (mode === 'demo' || mode === 'local') await runDemoSeed()
  if (mode === 'admin') await runAdminBootstrap()

  console.log('✅ Seeding completed successfully!')
}

main()
  .catch((error: unknown) => {
    console.error(`❌ ${error instanceof Error ? error.message : 'Seeding failed'}`)
    process.exitCode = 1
  })
  .finally(async () => {
    await databaseClient.end()
  })
