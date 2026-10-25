# ============================================
# Stage 1: Base - Install bun
# ============================================
FROM oven/bun:1.4-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# ============================================
# Stage 2: Development Dependencies
# ============================================
FROM base AS deps

# Install all dependencies (including devDependencies for build)
RUN bun install --frozen-lockfile

# ============================================
# Stage 3: Production Dependencies
# ============================================
FROM base AS prod-deps

# Install only production dependencies
RUN bun install --frozen-lockfile --production

# ============================================
# Stage 4: Build
# ============================================
FROM base AS build

# The server modules require these variables while the bundle is compiled.
# Use non-sensitive placeholders here; production values are injected at runtime.
ENV DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build \
    BETTER_AUTH_SECRET=build-only-secret-not-valid-at-runtime \
    BETTER_AUTH_URL=http://localhost:3000

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build the React Router app
RUN bun run build

# ============================================
# Stage 5: Production Runner
# ============================================
FROM oven/bun:1.4-alpine AS runner

WORKDIR /app

ARG PORT=3000

# Secrets and other production configuration are injected by Docker Compose.
ENV NODE_ENV=production \
    PORT=${PORT}

# Copy package files
COPY package.json bun.lock ./

# Copy production dependencies
COPY --from=prod-deps /app/node_modules ./node_modules

# Copy built application
COPY --from=build /app/build ./build

# Create the persistent-upload mount point and a non-root user for security.
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 reactrouter && \
    mkdir -p /app/uploads/media && \
    chown -R reactrouter:nodejs /app

USER reactrouter

# Expose port (dynamic based on PORT env)
EXPOSE ${PORT}

# Health check (liveness)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun -e "const p = process.env.PORT || 3000; fetch('http://localhost:' + p + '/api/health').then(r => process.exit(r.status === 200 ? 0 : 1)).catch(() => process.exit(1))"

# Start the React Router server
CMD ["bun", "run", "start"]

# ============================================
# Stage 6: Database migrator
# ============================================
FROM base AS migrator

ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY drizzle.config.ts ./
COPY drizzle ./drizzle

CMD ["bun", "run", "db:migrate"]
