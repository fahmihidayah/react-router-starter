# VPS Deployment Guide

This guide explains how to deploy the Learning Tracker application to VPS servers using Jenkins and Docker with a staging/production workflow.

## Overview

The deployment pipeline supports two environments with image promotion:

### Staging → Production Workflow

1. **Staging Deployment** (`staging/*` tags)
   - Build Docker images once
   - Push to GitHub Container Registry (GHCR)
   - Deploy to staging VPS
   - Test thoroughly

2. **Production Deployment** (`prod/*` tags)
   - Pull the **same tested image** from GHCR (no rebuild)
   - Deploy to production VPS
   - Same artifact tested in staging runs in production

### Key Benefits

- ✅ **Build once, deploy twice** - Same Docker image for both environments
- ✅ **Confidence** - Exact code tested in staging runs in production
- ✅ **Fast production deployments** - No rebuild, just pull and deploy
- ✅ **Version traceability** - Git tag version matches Docker image tag
- ✅ **Easy rollback** - Re-deploy any previous version tag

## Prerequisites

### On Jenkins Server

1. **Jenkins Plugins**
   - SSH Agent Plugin
   - Docker Pipeline Plugin
   - Credentials Binding Plugin

2. **Jenkins Credentials** (Manage Jenkins → Credentials)

   a. **GHCR Credentials** (`ghcr-credentials`)
      - Type: Username with password
      - Username: Your GitHub username
      - Password: GitHub Personal Access Token with `write:packages` permission
      - ID: `ghcr-credentials`

   b. **Production VPS SSH Key** (`vps-ssh-key`)
      - Type: SSH Username with private key
      - Username: `ubuntu`
      - Private Key: Paste your SSH private key for production VPS
      - ID: `vps-ssh-key`

   c. **Staging VPS SSH Key** (`staging-vps-ssh-key`)
      - Type: SSH Username with private key
      - Username: `ubuntu`
      - Private Key: Paste your SSH private key for staging VPS
      - ID: `staging-vps-ssh-key`

### On Staging VPS

**For detailed staging setup, see [STAGING_SETUP.md](STAGING_SETUP.md)**

Quick setup:
1. Run `scripts/setup-staging-vps.sh` on staging server
2. Configure `.env` with staging-specific values (separate database!)
3. Set up DNS: `staging.catat-progres.temanraih.id` → Staging IP
4. Configure SSL: `sudo certbot --nginx -d staging.catat-progres.temanraih.id`
5. Update `Jenkinsfile` with staging VPS IP

### On Production VPS (124.156.207.229)

1. **Install Docker and Docker Compose**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh

   # Add user to docker group
   sudo usermod -aG docker ubuntu

   # Install Docker Compose
   sudo apt install docker-compose-plugin -y

   # Verify installation
   docker --version
   docker compose version
   ```

2. **Create Application Directory**
   ```bash
   mkdir -p /home/ubuntu/learning-tracker
   cd /home/ubuntu/learning-tracker
   ```

3. **Create .env File**
   ```bash
   nano /home/ubuntu/learning-tracker/.env
   ```

   Add the following (update values as needed):
   ```env
   # Application
   NODE_ENV=production
   PORT=3000

   # Database (update with your actual PostgreSQL credentials)
   DATABASE_URL=postgresql://username:password@your-db-host:5432/database_name

   # Better Auth (CRITICAL: Generate a secure secret!)
   BETTER_AUTH_SECRET=your-super-secret-key-min-32-chars-please-change-this
   BETTER_AUTH_URL=https://catat-progres.temanraih.id

   # Rate Limiting (if using Redis)
   RATE_LIMIT_ENABLED=true
   RATE_LIMIT_REDIS_URL=redis://localhost:6379

   # Email Configuration
   EMAIL_PROVIDER=smtp
   EMAIL_DELIVERY_MODE=direct
   EMAIL_FROM=no-reply@temanraih.id
   EMAIL_FROM_NAME=Catat Progres
   EMAIL_SUPPORT_ADDRESS=support@temanraih.id

   # Add other variables from .env.example as needed
   ```

4. **Set Up Nginx Reverse Proxy** (recommended)
   ```bash
   sudo apt install nginx -y
   ```

   Create Nginx config:
   ```bash
   sudo nano /etc/nginx/sites-available/learning-tracker
   ```

   ```nginx
   server {
       listen 80;
       server_name catat-progres.temanraih.id;

       client_max_body_size 10M;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Enable the site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/learning-tracker /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

5. **Set Up SSL with Certbot** (recommended)
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d catat-progres.temanraih.id
   ```

6. **Configure Firewall**
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

## Deployment Process

### Complete Workflow: Staging → Testing → Production

```
Developer              Staging                    Production
   │                      │                           │
   ├─ git tag staging/1.0.0                          │
   │                      │                           │
   ▼                      ▼                           │
Jenkins                  │                           │
 • Build images          │                           │
 • Tag as "1.0.0"        │                           │
 • Push to GHCR ─────────┤                           │
 • Deploy to staging ────┘                           │
                         │                           │
                         ▼                           │
                   Test on Staging                   │
                    (thoroughly!)                    │
                         │                           │
                    ✓ Tests pass                     │
                         │                           │
   ├─ git tag prod/1.0.0 │                           │
   │                      │                           │
   ▼                      │                           ▼
Jenkins                  │                           │
 • Verify "1.0.0" exists in GHCR                     │
 • Pull same image (NO rebuild) ─────────────────────┤
 • Deploy to production ─────────────────────────────┘
                                                     │
                                                     ▼
                                            Version 1.0.0 LIVE
```

### Step 1: Deploy to Staging

The pipeline automatically triggers when you push a git tag matching the pattern `staging/X.Y.Z`:

```bash
# Create and push a staging tag
git tag staging/1.0.0
git push origin staging/1.0.0
```

**What happens:**
1. **Checkout** - Jenkins checks out the code
2. **Build Images** - Creates Docker images tagged with version `1.0.0`:
   - `ghcr.io/fahmihidayah/learning-tracker:1.0.0`
   - `ghcr.io/fahmihidayah/learning-tracker:latest`
   - `ghcr.io/fahmihidayah/learning-tracker:1.0.0-migrate`
   - `ghcr.io/fahmihidayah/learning-tracker:latest-migrate`
3. **Push to GHCR** - Uploads images to GitHub Container Registry
4. **Deploy to Staging VPS**:
   - Copies `docker-compose.yml` to staging VPS
   - Logs into GHCR on staging VPS
   - Pulls images (version `1.0.0`)
   - Runs database migrations
   - Starts/updates the application container
   - Cleans up old images

**Result:** Version `1.0.0` is now running on staging and ready for testing.

### Step 2: Test on Staging

Access staging environment and test thoroughly:

- **Staging URL**: https://staging.catat-progres.temanraih.id
- **Health Check**: https://staging.catat-progres.temanraih.id/api/health

Test checklist:
- [ ] User authentication flows
- [ ] All major features work
- [ ] Database operations succeed
- [ ] File uploads work
- [ ] Email notifications send
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Performance is acceptable

### Step 3: Promote to Production

After staging tests pass, promote the **exact same Docker image** to production:

```bash
# IMPORTANT: Use the SAME version number as staging!
git tag prod/1.0.0
git push origin prod/1.0.0
```

**What happens:**
1. **Verify Image Exists** - Jenkins confirms version `1.0.0` exists in GHCR
   - If not found, deployment fails with an error
   - This ensures you can only deploy versions tested in staging
2. **Pull Same Image** - **NO REBUILD** - pulls the existing `1.0.0` images
3. **Deploy to Production VPS**:
   - Copies `docker-compose.yml` to production VPS
   - Logs into GHCR on production VPS
   - Pulls the **same images** tested in staging
   - Runs database migrations
   - Starts/updates application with zero-downtime
   - Cleans up old images

**Result:** The exact Docker image you tested in staging is now live in production!

## Rollback to Previous Version

If you need to rollback to a previous version:

```bash
# Rollback staging to version 0.9.0
git tag staging/0.9.0 --force  # Force if tag already exists
git push origin staging/0.9.0 --force

# Or rollback production to version 0.9.0
git tag prod/0.9.0 --force
git push origin prod/0.9.0 --force
```

The Jenkins pipeline will deploy the specified version. Since images are stored in GHCR, you can rollback to any previously deployed version.

## Manual Deployment (without Jenkins)

### Manual Staging Deployment

```bash
# SSH into staging VPS
ssh ubuntu@STAGING_VPS_IP
cd /home/ubuntu/learning-tracker

# Login to GHCR
echo "YOUR_GITHUB_TOKEN" | docker login ghcr.io -u YOUR_USERNAME --password-stdin

# Deploy specific version (e.g., 1.0.0)
VERSION=1.0.0
IMAGE_NAME=ghcr.io/fahmihidayah/learning-tracker IMAGE_TAG=$VERSION \
  docker compose --profile tools pull app migrate

IMAGE_NAME=ghcr.io/fahmihidayah/learning-tracker IMAGE_TAG=$VERSION \
  docker compose --profile tools run --rm migrate

IMAGE_NAME=ghcr.io/fahmihidayah/learning-tracker IMAGE_TAG=$VERSION \
  docker compose up -d --no-build --remove-orphans
```

### Manual Production Deployment

```bash
# SSH into production VPS
ssh ubuntu@124.156.207.229
cd /home/ubuntu/learning-tracker

# Login to GHCR
echo "YOUR_GITHUB_TOKEN" | docker login ghcr.io -u YOUR_USERNAME --password-stdin

# Deploy specific version (e.g., 1.0.0) - MUST exist in GHCR
VERSION=1.0.0
IMAGE_NAME=ghcr.io/fahmihidayah/learning-tracker IMAGE_TAG=$VERSION \
  docker compose --profile tools pull app migrate

IMAGE_NAME=ghcr.io/fahmihidayah/learning-tracker IMAGE_TAG=$VERSION \
  docker compose --profile tools run --rm migrate

IMAGE_NAME=ghcr.io/fahmihidayah/learning-tracker IMAGE_TAG=$VERSION \
  docker compose up -d --no-build --remove-orphans
```

## Monitoring and Troubleshooting

### Check Application Status
```bash
cd /home/ubuntu/learning-tracker
docker compose ps
docker compose logs -f app
```

### Check Application Health
```bash
curl http://localhost:3000/api/health
```

### View Nginx Logs
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Restart Application
```bash
cd /home/ubuntu/learning-tracker
docker compose restart app
```

### Database Backup
```bash
# Run from VPS
docker compose exec -T app bun run db:backup
```

## Security Checklist

- [ ] Generate a strong `BETTER_AUTH_SECRET` (min 32 characters)
- [ ] Secure PostgreSQL database (strong password, network isolation)
- [ ] Enable SSL/TLS with Certbot
- [ ] Configure firewall (UFW)
- [ ] Keep VPS system updated (`sudo apt update && sudo apt upgrade`)
- [ ] Restrict SSH access (consider key-only authentication)
- [ ] Set up regular backups
- [ ] Configure Redis if using rate limiting
- [ ] Review and secure all environment variables
- [ ] Set up monitoring/alerting

## Environment Differences

| Aspect | Staging | Production |
|--------|---------|------------|
| **VPS** | Separate staging server | 124.156.207.229 |
| **Domain** | `staging.catat-progres.temanraih.id` | `catat-progres.temanraih.id` |
| **Database** | Separate staging database | Production database |
| **Git Tags** | `staging/X.Y.Z` | `prod/X.Y.Z` |
| **Docker Images** | Built on staging tags | Same images from staging |
| **BETTER_AUTH_SECRET** | Different secret | Different secret |
| **BETTER_AUTH_URL** | `https://staging...` (runtime .env) | `https://catat...` (runtime .env) |
| **Build Process** | Builds Docker images | **No build** - uses staging images |
| **Testing** | Thorough testing required | Tested artifact from staging |
| **Data** | Test data | Real user data |

**Key Point:** The `BETTER_AUTH_URL` is now a **runtime environment variable** (set in `.env` on each VPS), not a build argument. This allows the same Docker image to work in both environments with different URLs.

## Environment Variables Reference

See `.env.example` for all available environment variables. Key variables:

| Variable | Required | Description | Environment-Specific |
|----------|----------|-------------|---------------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string | ✓ Different per environment |
| `BETTER_AUTH_SECRET` | Yes | Auth secret (min 32 chars) | ✓ Different per environment |
| `BETTER_AUTH_URL` | Yes | Public URL of your app | ✓ Different per environment |
| `NODE_ENV` | Yes | Environment name | ✓ `staging` or `production` |
| `PORT` | No | Application port (default: 3000) | Same (3000) |
| `RATE_LIMIT_REDIS_URL` | Conditional | Redis URL if rate limiting enabled | Potentially different |
| `EMAIL_FROM` | Yes | From email address | Could indicate staging |

**Important:** Always use **separate databases** and **different secrets** for staging and production!

## Architecture

```
Internet → Nginx (443/80) → Docker Container (3000) → PostgreSQL (external)
                ↓
           SSL/TLS (Certbot)
```

## Support

For issues:
1. Check application logs: `docker compose logs -f app`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify environment variables in `.env`
4. Check database connectivity
5. Review Jenkins build logs

## Notes

- The application runs as a non-root user (`reactrouter`) inside the container
- Media uploads are stored in a Docker volume (`media-uploads`)
- Database migrations run automatically before each deployment
- The healthcheck ensures zero-downtime deployments
- Old Docker images are automatically pruned after successful deployment
