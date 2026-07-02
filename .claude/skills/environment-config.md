---
name: environment-config
description: >
  How to manage environment variables, configuration, and secrets in this React Router 7
  project. Covers .env files, environment-specific config, accessing env vars in server
  and client code, Better Auth configuration, database URLs, and security best practices.
  Use this skill when setting up environment variables, configuring third-party services,
  managing secrets, or when the user asks about .env, configuration, secrets, or environment
  setup.
---

# Environment Configuration & Secrets Management

## Environment Files

This project uses `.env` files for configuration:

```
.
├── .env                    # Local development (gitignored)
├── .env.example            # Template (committed to git)
└── .env.production         # Production values (gitignored)
```

### .env.example (Template)

This file is committed to git as documentation:

```bash
# .env.example
# Copy this file to .env and fill in the values

# Database
DATABASE_URL="./app/data.db"

# Better Auth
BETTER_AUTH_SECRET="generate-a-secret-key"
BETTER_AUTH_URL="http://localhost:5173"

# Optional: Email (for auth)
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASS=""

# Optional: OAuth providers
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
```

### .env (Local Development)

This file is gitignored and contains real values:

```bash
# .env (local)
DATABASE_URL="./app/data.db"
BETTER_AUTH_SECRET="super-secret-key-for-development"
BETTER_AUTH_URL="http://localhost:5173"
```

---

## Setting Up Environment Variables

### Step 1: Copy Template

```bash
cp .env.example .env
```

### Step 2: Generate Secrets

For `BETTER_AUTH_SECRET`, generate a secure random string:

```bash
# On macOS/Linux
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Step 3: Fill in Values

Edit `.env` with real values for your local environment.

---

## Accessing Environment Variables

### Server-Side (Loaders, Actions, Server Functions)

Environment variables are available via `process.env`:

```typescript
// app/lib/auth.ts
import { betterAuth } from 'better-auth'

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET, // ✅ Available server-side
  baseURL: process.env.BETTER_AUTH_URL,
  database: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || './app/data.db',
  },
})
```

### Client-Side (Components)

**IMPORTANT**: Only variables prefixed with `VITE_` are exposed to the client.

```typescript
// ❌ NOT AVAILABLE on client
process.env.BETTER_AUTH_SECRET

// ✅ AVAILABLE on client (if prefixed with VITE_)
const apiUrl = import.meta.env.VITE_API_URL
```

**Security rule**: Never expose secrets to the client. Secrets should only exist in server code.

### Environment Variable Naming Convention

```bash
# Server-only (sensitive)
DATABASE_URL="..."
BETTER_AUTH_SECRET="..."
SMTP_PASSWORD="..."

# Client-exposed (public)
VITE_APP_NAME="My App"
VITE_API_URL="https://api.example.com"
```

---

## Type-Safe Environment Variables

Define types for your environment variables:

```typescript
// app/env.ts
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().default('./app/data.db'),
  BETTER_AUTH_SECRET: z.string().min(32, 'Auth secret must be at least 32 characters'),
  BETTER_AUTH_URL: z.string().url('Must be a valid URL'),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
})

// Validate on app startup
const env = envSchema.parse(process.env)

export { env }
```

Use in your code:

```typescript
import { env } from '~/env'

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET, // ✅ Type-safe
  baseURL: env.BETTER_AUTH_URL,
})
```

### Validate on Startup

Add validation to your app entry point:

```typescript
// app/entry.server.tsx
import '~/env' // Validates env vars on startup

// If validation fails, the app won't start and you'll see the Zod error
```

---

## Better Auth Configuration

### Required Environment Variables

```bash
# Minimum required for Better Auth
BETTER_AUTH_SECRET="your-secret-key-min-32-chars"
BETTER_AUTH_URL="http://localhost:5173"  # or production URL
```

### Full Better Auth Configuration

```typescript
// app/lib/auth.ts
import { betterAuth } from 'better-auth'
import { db } from './database'

export const auth = betterAuth({
  // Secret key for signing sessions
  secret: process.env.BETTER_AUTH_SECRET!,

  // Base URL of your app
  baseURL: process.env.BETTER_AUTH_URL!,

  // Database configuration
  database: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || './app/data.db',
  },

  // Email provider (optional)
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set true in production
  },

  // OAuth providers (optional)
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      enabled: !!process.env.GOOGLE_CLIENT_ID,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      enabled: !!process.env.GITHUB_CLIENT_ID,
    },
  },
})
```

---

## Environment-Specific Configuration

### Development vs Production

Use environment checks to vary behavior:

```typescript
// app/config.ts
export const config = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // Feature flags
  features: {
    analytics: process.env.NODE_ENV === 'production',
    debugMode: process.env.NODE_ENV === 'development',
  },

  // URLs
  apiUrl: process.env.BETTER_AUTH_URL || 'http://localhost:5173',

  // Logging
  logLevel: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
}
```

Usage:

```typescript
import { config } from '~/config'

if (config.isDevelopment) {
  console.log('Debug info:', data)
}

if (config.features.analytics) {
  // Send analytics in production only
}
```

---

## Database Configuration

### SQLite (Default)

```bash
# .env
DATABASE_URL="./app/data.db"
```

### PostgreSQL (Alternative)

If switching to PostgreSQL:

```bash
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
```

Update Drizzle config:

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './app/db/schema/index.ts',
  out: './migrations',
  dialect: 'postgresql', // Changed from 'sqlite'
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
```

---

## Third-Party Service Configuration

### Email Service (SMTP)

```bash
# .env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="app-specific-password"
```

Usage:

```typescript
// app/lib/email.ts
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number.parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendEmail(to: string, subject: string, html: string) {
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject,
    html,
  })
}
```

### OAuth Providers

```bash
# .env
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

---

## Production Deployment

### Hosting Platform Environment Variables

Most hosting platforms provide a UI to set environment variables:

**Vercel:**
1. Go to Project Settings → Environment Variables
2. Add each variable (key-value pairs)
3. Select environments: Production, Preview, Development

**Fly.io:**
```bash
fly secrets set BETTER_AUTH_SECRET="your-secret"
fly secrets set DATABASE_URL="your-db-url"
```

**Railway:**
1. Go to Variables tab
2. Add environment variables
3. Deploy

**Render:**
1. Go to Environment → Environment Variables
2. Add key-value pairs
3. Save changes (triggers redeploy)

### Environment Variables Checklist

- [ ] `BETTER_AUTH_SECRET` - Generated secure random string (32+ chars)
- [ ] `BETTER_AUTH_URL` - Production URL (e.g., `https://myapp.com`)
- [ ] `DATABASE_URL` - Production database connection string
- [ ] `NODE_ENV` - Set to `production`
- [ ] OAuth secrets (if using social login)
- [ ] SMTP credentials (if using email)
- [ ] Any API keys for third-party services

---

## Security Best Practices

### ✅ DO

- **Use strong secrets**: Generate with `openssl rand -base64 32`
- **Never commit secrets**: Add `.env` to `.gitignore`
- **Use `.env.example`**: Document all required variables
- **Validate on startup**: Use Zod to validate env vars
- **Rotate secrets**: Change secrets periodically (auth secret, API keys)
- **Use different secrets per environment**: Dev, staging, production should have different values
- **Limit client exposure**: Only prefix with `VITE_` if needed on client

### ❌ DON'T

- **Don't commit .env files**: They contain secrets
- **Don't log secrets**: Never `console.log(process.env.SECRET)`
- **Don't expose secrets to client**: No secrets in `VITE_` prefixed vars
- **Don't hardcode secrets**: Always use environment variables
- **Don't share secrets**: Use secret management tools (1Password, Bitwarden, etc.)
- **Don't reuse secrets**: Each service should have its own secret

---

## Example: Full .env Setup

### .env.example (Committed)

```bash
# .env.example
# Copy to .env and fill in real values

# ================================
# Application
# ================================
NODE_ENV="development"

# ================================
# Database
# ================================
DATABASE_URL="./app/data.db"

# ================================
# Authentication (Better Auth)
# ================================
BETTER_AUTH_SECRET="generate-with-openssl-rand-base64-32"
BETTER_AUTH_URL="http://localhost:5173"

# ================================
# Email (Optional)
# ================================
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASS=""

# ================================
# OAuth Providers (Optional)
# ================================
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# ================================
# Client-Side (Public)
# ================================
VITE_APP_NAME="Starter App"
VITE_API_URL="http://localhost:5173"
```

### .env (Local, Gitignored)

```bash
# .env
NODE_ENV="development"
DATABASE_URL="./app/data.db"
BETTER_AUTH_SECRET="aB3dF8kL9pQ2rT5vW7xY0zA1bC4eG6hI"
BETTER_AUTH_URL="http://localhost:5173"
VITE_APP_NAME="Starter App"
VITE_API_URL="http://localhost:5173"
```

### .env.production (Production, Gitignored)

```bash
# .env.production
NODE_ENV="production"
DATABASE_URL="postgresql://user:pass@db.host.com:5432/prod"
BETTER_AUTH_SECRET="xK9mN3pR8sT1vY6zA2bD5eH7iJ0kL4nM"
BETTER_AUTH_URL="https://myapp.com"
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASS="SG.xxxxxxxxxxxx"
VITE_APP_NAME="Starter App"
VITE_API_URL="https://myapp.com"
```

---

## Troubleshooting

### Issue: "BETTER_AUTH_SECRET is required"

**Cause**: Missing or empty `BETTER_AUTH_SECRET` in `.env`

**Solution**:
```bash
# Generate secret
openssl rand -base64 32

# Add to .env
echo 'BETTER_AUTH_SECRET="your-generated-secret"' >> .env
```

### Issue: Environment variable not loading

**Cause**: Vite caches `.env` files

**Solution**:
```bash
# Restart dev server
pnpm dev
```

### Issue: Client can't access environment variable

**Cause**: Variable not prefixed with `VITE_`

**Solution**:
```bash
# Rename variable
VITE_API_URL="http://localhost:5173"  # ✅ Available on client
API_URL="http://localhost:5173"       # ❌ Server-only
```

### Issue: "Cannot read property of undefined"

**Cause**: Accessing env var that doesn't exist

**Solution**:
```typescript
// Add fallback
const secret = process.env.BETTER_AUTH_SECRET || 'fallback-value'

// Or validate with Zod (recommended)
import { z } from 'zod'
const env = z.object({
  BETTER_AUTH_SECRET: z.string().min(32),
}).parse(process.env)
```

---

## Commands Reference

```bash
# Copy example to create local .env
cp .env.example .env

# Generate secure secret
openssl rand -base64 32

# Load environment in shell (for debugging)
source .env

# Check if variable is set (Linux/Mac)
echo $BETTER_AUTH_SECRET

# Start dev server (loads .env automatically)
pnpm dev

# Build for production (uses .env.production if present)
pnpm build
```
