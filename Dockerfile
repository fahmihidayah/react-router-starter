# ============================================
# Stage 1: Base - Install pnpm
# ============================================
FROM node:20-alpine AS base

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# ============================================
# Stage 2: Development Dependencies
# ============================================
FROM base AS deps

# Install all dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# ============================================
# Stage 3: Production Dependencies
# ============================================
FROM base AS prod-deps

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# ============================================
# Stage 4: Build
# ============================================
FROM base AS build

# Build arguments (optional - can be passed at build time)
ARG DATABASE_URL
ARG BETTER_AUTH_SECRET
ARG BETTER_AUTH_URL

# Set as environment variables for build process
ENV DATABASE_URL=${DATABASE_URL}
ENV BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
ENV BETTER_AUTH_URL=${BETTER_AUTH_URL}

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build the React Router app
RUN pnpm run build

# ============================================
# Stage 5: Production Runner
# ============================================
FROM node:20-alpine AS runner

# Enable corepack for pnpm in production
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Runtime arguments (can be overridden at runtime)
ARG DATABASE_URL
ARG BETTER_AUTH_SECRET
ARG BETTER_AUTH_URL
ARG PORT=3000

# Set production environment variables
ENV NODE_ENV=production \
    PORT=${PORT} \
    DATABASE_URL=${DATABASE_URL} \
    BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET} \
    BETTER_AUTH_URL=${BETTER_AUTH_URL}

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Copy production dependencies
COPY --from=prod-deps /app/node_modules ./node_modules

# Copy built application
COPY --from=build /app/build ./build

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 reactrouter && \
    chown -R reactrouter:nodejs /app

USER reactrouter

# Expose port (dynamic based on PORT env)
EXPOSE ${PORT}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:${PORT:-3000}', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the React Router server
CMD ["pnpm", "run", "start"]