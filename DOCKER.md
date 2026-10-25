# Docker Deployment Guide

This guide explains how to deploy your React Router application using Docker.

## 🏗️ Multi-Stage Dockerfile Architecture

The Dockerfile uses a 5-stage build process optimized for React Router:

```
┌─────────────────────────────────────────────────┐
│ Stage 1: Base                                   │
│ - Use the oven/bun base image                      │
│ - Copy package files                            │
└─────────────────────────────────────────────────┘
                    ↓
        ┌───────────────────────┐
        │                       │
        ↓                       ↓
┌──────────────────┐    ┌──────────────────┐
│ Stage 2: deps    │    │ Stage 3: prod    │
│ All dependencies │    │ Prod deps only   │
└──────────────────┘    └──────────────────┘
        │                       │
        ↓                       │
┌─────────────────────────────┐│
│ Stage 4: Build              ││
│ - Copy source code          ││
│ - Run bun run build            ││
└─────────────────────────────┘│
        │                       │
        ↓                       ↓
┌─────────────────────────────────────────┐
│ Stage 5: Runner (Final Image)          │
│ - Production dependencies only          │
│ - Built app from build stage           │
│ - Non-root user for security           │
│ - Health check configured               │
└─────────────────────────────────────────┘
```

## 🚀 Quick Start

### 1. Build the Docker Image

```bash
docker build -t react-router-app .
```

### 2. Run the Container

```bash
docker run -p 3000:3000 --env-file .env react-router-app
```

### 3. Access Your App

Open http://localhost:3000

## 📦 Using Docker Compose (Recommended)

Docker Compose makes it easier to manage your application and its dependencies.

### Start the Application

```bash
# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

### With Database (PostgreSQL)

Uncomment the `db` service in `docker-compose.yml` and run:

```bash
docker-compose up -d
```

## 🔧 Environment Variables

### Required Environment Variables

Create a `.env` file in the project root with these required variables:

```env
# Application
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@host:5432/database_name

# Better Auth (Required)
BETTER_AUTH_SECRET=your-secret-key-here-change-in-production
BETTER_AUTH_URL=http://localhost:3000
```

### Using .env.example

Copy the example file and fill in your values:

```bash
cp .env.example .env
# Edit .env with your actual values
```

### Build-time vs Runtime Variables

**Build Arguments** (passed during build):
```bash
docker build \
  --build-arg DATABASE_URL="postgresql://..." \
  --build-arg BETTER_AUTH_SECRET="your-secret" \
  --build-arg BETTER_AUTH_URL="http://localhost:3000" \
  -t react-router-app .
```

**Runtime Environment** (passed when running):
```bash
docker run \
  -e DATABASE_URL="postgresql://..." \
  -e BETTER_AUTH_SECRET="your-secret" \
  -e BETTER_AUTH_URL="http://localhost:3000" \
  -p 3000:3000 \
  react-router-app
```

**Or use .env file** (recommended):
```bash
docker run --env-file .env -p 3000:3000 react-router-app
```

## 🎯 Build Options

### Development Build (with dev dependencies)

```bash
docker build --target build -t react-router-app:dev .
```

### Production Build (optimized)

```bash
docker build --target runner -t react-router-app:prod .
```

### Pin the bun version

The base image is pinned in the `Dockerfile` (`FROM oven/bun:1.4-alpine`). Change that line to a
different tag and rebuild.

## 📊 Image Size Optimization

The multi-stage build ensures minimal final image size:

- **Base image**: oven/bun:1.4-alpine
- **Production dependencies**: Only what's needed to run
- **No devDependencies**: Build tools excluded
- **No source code**: Only built output included

Expected final image size: **~150-200MB**

## 🔒 Security Features

1. **Non-root user**: Application runs as `reactrouter` user
2. **Minimal base image**: Alpine Linux for smaller attack surface
3. **Production dependencies only**: No dev tools in final image
4. **Health checks**: Automatic container health monitoring

## 🏥 Health Checks

The container includes a built-in health check:

```bash
# Check container health
docker ps

# Manual health check
curl http://localhost:3000
```

Health check runs every 30 seconds and expects a 200 response.

## 🐛 Troubleshooting

### Container won't start

```bash
# View container logs
docker logs react-router-app

# Check container status
docker ps -a

# Inspect container
docker inspect react-router-app
```

### Build fails

```bash
# Clear Docker build cache
docker builder prune

# Rebuild without cache
docker build --no-cache -t react-router-app .
```

### Port already in use

```bash
# Find process using port 3000
lsof -i :3000

# Use different port
docker run -p 8080:3000 react-router-app
```

## 📝 Common Commands

```bash
# Build image
docker build -t react-router-app .

# Run container
docker run -d -p 3000:3000 --name app react-router-app

# Stop container
docker stop app

# Remove container
docker rm app

# View logs
docker logs -f app

# Execute command in container
docker exec -it app sh

# Rebuild and restart with compose
docker-compose up -d --build
```

## 🚀 Deployment Platforms

### Deploy to Fly.io

```bash
# Install flyctl
brew install flyctl

# Login
flyctl auth login

# Launch app
flyctl launch

# Deploy
flyctl deploy
```

### Deploy to Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize
railway init

# Deploy
railway up
```

### Deploy to Render

1. Connect your GitHub repository
2. Create a new Web Service
3. Set build command: `docker build -t app .`
4. Set start command: `docker run -p 3000:3000 app`

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Docker Build

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker image
        run: docker build -t react-router-app .
      - name: Run tests in container
        run: docker run react-router-app bun run test
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [React Router Deployment](https://reactrouter.com/en/main/guides/deployment)
- [bun in Docker](https://bun.sh/guides/ecosystem/docker)
- [Multi-stage builds](https://docs.docker.com/build/building/multi-stage/)

## ⚡ Performance Tips

1. **Layer caching**: Package files are copied before source code
2. **bun**: Fast installs with a single binary
3. **Alpine Linux**: Smaller image size
4. **.dockerignore**: Excludes unnecessary files
5. **Multi-stage**: Only production artifacts in final image

## 🎓 Best Practices

- ✅ Use the oven/bun Alpine base image
- ✅ Pin the bun version in the Dockerfile
- ✅ Separate build and production dependencies
- ✅ Run as non-root user
- ✅ Include health checks
- ✅ Use .dockerignore file
- ✅ Set NODE_ENV=production
- ✅ Use multi-stage builds
