# Staging Environment Setup Guide

This guide explains how to set up a staging VPS for the Learning Tracker application.

## Overview

The staging environment allows you to test deployments before promoting them to production. The same Docker image tested in staging will be deployed to production, ensuring consistency.

## Prerequisites

- A separate VPS for staging (Ubuntu 20.04+ recommended)
- SSH access to the staging VPS
- A separate PostgreSQL database for staging
- Domain/subdomain for staging (e.g., `staging.catat-progres.temanraih.id`)

## Quick Setup

### 1. Prepare Staging Server Information

Before starting, gather this information:

- **Staging VPS IP**: `___.___.___.___ ` (your staging server IP)
- **Staging Domain**: `staging.catat-progres.temanraih.id` (or your choice)
- **Staging Database URL**: PostgreSQL connection string for staging database

### 2. Run Automated Setup Script

Copy and run the setup script on your staging VPS:

```bash
# Copy script to staging VPS
scp scripts/setup-staging-vps.sh ubuntu@YOUR_STAGING_IP:~/

# SSH into staging VPS
ssh ubuntu@YOUR_STAGING_IP

# Run setup script
chmod +x setup-staging-vps.sh
./setup-staging-vps.sh

# Log out and back in for Docker group changes
exit
ssh ubuntu@YOUR_STAGING_IP
```

### 3. Configure Environment Variables

Edit the `.env` file on staging VPS:

```bash
cd /home/ubuntu/learning-tracker
nano .env
```

**Critical staging environment variables:**

```env
# Application
NODE_ENV=staging
PORT=3000

# Database - MUST be different from production!
DATABASE_URL=postgresql://staging_user:password@staging-db-host:5432/staging_db

# Better Auth - Use staging URL
BETTER_AUTH_SECRET=generate-new-secret-for-staging-min-32-chars
BETTER_AUTH_URL=https://staging.catat-progres.temanraih.id

# Rate Limiting (if using Redis)
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REDIS_URL=redis://localhost:6379
RATE_LIMIT_REDIS_PREFIX=learning-tracker-staging:rate-limit

# Email Configuration
EMAIL_PROVIDER=smtp
EMAIL_FROM=no-reply-staging@temanraih.id
EMAIL_FROM_NAME=Catat Progres (Staging)
EMAIL_SUPPORT_ADDRESS=support@temanraih.id

# Optional: Disable external services in staging
GOOGLE_AUTH_ENABLED=false
RECAPTCHA_ENABLED=false

# Observability
OBSERVABILITY_ENVIRONMENT=staging
```

**Important Notes:**
- Use a **separate database** for staging
- Generate a **different `BETTER_AUTH_SECRET`** than production
- Email addresses should indicate it's staging
- Consider using a prefix for cache/queue keys to avoid conflicts

### 4. Set Up DNS

Point your staging domain to the staging VPS:

```
Type: A Record
Name: staging.catat-progres.temanraih.id
Value: YOUR_STAGING_VPS_IP
TTL: 300
```

Wait for DNS propagation (check with `dig staging.catat-progres.temanraih.id` or `nslookup`)

### 5. Configure SSL Certificate

Once DNS is propagated:

```bash
ssh ubuntu@YOUR_STAGING_IP
sudo certbot --nginx -d staging.catat-progres.temanraih.id
```

Follow the prompts to:
- Agree to terms of service
- Optionally provide an email for renewal notices
- Choose to redirect HTTP to HTTPS (recommended)

### 6. Configure Jenkins

#### a. Add Staging SSH Credential

In Jenkins (Manage Jenkins → Credentials):

1. Click "Add Credentials"
2. **Kind**: SSH Username with private key
3. **Username**: `ubuntu`
4. **Private Key**: Paste your staging VPS SSH private key
5. **ID**: `staging-vps-ssh-key`
6. **Description**: "Staging VPS SSH Access"
7. Click "Create"

#### b. Update Jenkinsfile

Edit `Jenkinsfile` line 14 to add your staging server IP:

```groovy
STAGING_VPS_HOST = 'YOUR_STAGING_IP'  // Replace with actual IP
```

Commit and push this change:

```bash
git add Jenkinsfile
git commit -m "Configure staging VPS IP in Jenkinsfile"
git push
```

### 7. Verify Setup

Test that staging is ready:

```bash
# SSH should work without password
ssh ubuntu@YOUR_STAGING_IP

# Check Docker
docker --version
docker compose version

# Check directories
ls -la /home/ubuntu/learning-tracker

# Check .env file exists
cat /home/ubuntu/learning-tracker/.env | grep -v SECRET | grep -v PASSWORD

# Test Nginx
sudo nginx -t
curl -I http://localhost

# Exit staging server
exit
```

## Deployment Workflow

### Deploy to Staging

```bash
# Create staging tag (must match pattern: staging/X.Y.Z)
git tag staging/1.0.0
git push origin staging/1.0.0
```

Jenkins will automatically:
1. ✅ Build Docker images (tagged as `1.0.0`)
2. ✅ Push images to GHCR
3. ✅ Deploy to staging VPS
4. ✅ Run database migrations
5. ✅ Start application

### Test on Staging

Access your staging environment:
- **URL**: https://staging.catat-progres.temanraih.id
- **Health Check**: https://staging.catat-progres.temanraih.id/api/health

Test thoroughly:
- [ ] User registration and login
- [ ] All major features
- [ ] Database operations
- [ ] File uploads
- [ ] Email notifications
- [ ] Performance
- [ ] Mobile responsiveness

### Promote to Production

After testing succeeds, promote the **same Docker image** to production:

```bash
# Use the SAME version number as staging
git tag prod/1.0.0
git push origin prod/1.0.0
```

Jenkins will:
1. ✅ Verify image `1.0.0` exists in GHCR
2. ✅ Pull the **same image** (no rebuild)
3. ✅ Deploy to production VPS
4. ✅ Run migrations
5. ✅ Start application

**This ensures the exact code tested in staging runs in production!**

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Developer                            │
└─────────────────────────────────────────────────────────┘
                          │
                    git tag staging/1.0.0
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                      GitHub                              │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                      Jenkins                             │
│  • Builds Docker images (1.0.0)                          │
│  • Pushes to GHCR                                        │
└─────────────────────────────────────────────────────────┘
                          │
          ┌───────────────┴───────────────┐
          ▼                               ▼
┌──────────────────┐           ┌──────────────────┐
│  Staging VPS     │           │       GHCR       │
│  • staging.catat │           │  Image: 1.0.0    │
│    -progres...   │           │  (stored)        │
│  • Staging DB    │           └──────────────────┘
└──────────────────┘                     │
          │                              │
    Manual Testing                       │
          │                              │
          ✓ Tests Pass                   │
          │                              │
    git tag prod/1.0.0                  │
          │                              │
          ▼                              │
    Jenkins pulls same image ────────────┘
          │
          ▼
┌──────────────────┐
│  Production VPS  │
│  • catat-progres │
│    .temanraih.id │
│  • Production DB │
└──────────────────┘
```

## Monitoring and Troubleshooting

### Check Staging Application Status

```bash
ssh ubuntu@YOUR_STAGING_IP
cd /home/ubuntu/learning-tracker
docker compose ps
docker compose logs -f app
```

### View Nginx Logs

```bash
ssh ubuntu@YOUR_STAGING_IP
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Restart Staging Application

```bash
ssh ubuntu@YOUR_STAGING_IP
cd /home/ubuntu/learning-tracker
docker compose restart app
```

### Common Issues

#### 1. Cannot connect to staging URL

**Check:**
- DNS propagation: `dig staging.catat-progres.temanraih.id`
- Nginx is running: `sudo systemctl status nginx`
- Docker containers are up: `docker compose ps`
- Firewall allows traffic: `sudo ufw status`

#### 2. Database connection errors

**Check:**
- `DATABASE_URL` in `.env` is correct
- Staging database exists and is accessible
- Network allows connection from staging VPS to database
- Database user has proper permissions

#### 3. SSL certificate issues

**Renew certificate:**
```bash
sudo certbot renew --dry-run
sudo certbot renew
sudo systemctl reload nginx
```

#### 4. Different behavior than local development

**Remember:**
- Staging uses `NODE_ENV=staging` (or `production`)
- Different environment variables than development
- Different database (might have different data)
- Real external services (emails, OAuth, etc.)

## Environment Differences

| Aspect | Development | Staging | Production |
|--------|------------|---------|------------|
| **Node Environment** | `development` | `staging` or `production` | `production` |
| **Database** | Local/Docker PostgreSQL | Separate staging database | Production database |
| **Domain** | `localhost:5173` | `staging.catat-progres...` | `catat-progres...` |
| **SSL** | No | Yes (Let's Encrypt) | Yes (Let's Encrypt) |
| **Docker** | Local build | GHCR images | GHCR images (same as staging) |
| **Build** | On every change | On `staging/*` tag | Uses staging build |
| **Data** | Test/seed data | Realistic test data | Real user data |
| **External Services** | Often mocked/disabled | Real or test accounts | Production accounts |

## Best Practices

### 1. Keep Staging Similar to Production

- Use same operating system version
- Similar server specs (CPU, RAM, disk)
- Same Docker and Docker Compose versions
- Similar network configuration

### 2. Use Realistic Test Data

- Import anonymized production data (be careful with GDPR/privacy!)
- Create comprehensive test scenarios
- Include edge cases

### 3. Regular Cleanup

Staging databases can accumulate test data:

```bash
# Backup before cleanup
ssh ubuntu@YOUR_STAGING_IP "cd /home/ubuntu/learning-tracker && docker compose exec app pnpm db:backup"

# Optional: Reset to fresh state
# WARNING: This will delete all staging data!
# ssh ubuntu@YOUR_STAGING_IP "cd /home/ubuntu/learning-tracker && docker compose exec app pnpm db:reset"
```

### 4. Tag Naming Convention

Use semantic versioning consistently:

```bash
# Staging
git tag staging/1.0.0    # Major.Minor.Patch
git tag staging/1.1.0    # Feature update
git tag staging/1.1.1    # Bug fix

# Production (after staging testing)
git tag prod/1.0.0       # Same version number
```

### 5. Documentation

Keep a changelog of what's deployed where:

```bash
# Check what version is running
ssh ubuntu@YOUR_STAGING_IP "cd /home/ubuntu/learning-tracker && docker compose ps | grep app"
```

## Security Considerations

### Staging-Specific Security

- [ ] Use different secrets than production (`BETTER_AUTH_SECRET`, API keys, etc.)
- [ ] Restrict staging database access (not publicly accessible if possible)
- [ ] Use test credentials for third-party services (email, payment, etc.)
- [ ] Consider HTTP basic auth for staging if you want to restrict access
- [ ] Don't store sensitive production data in staging
- [ ] Regularly update staging server packages

### Optional: Add HTTP Basic Auth to Staging

To restrict who can access staging, add to Nginx config:

```bash
ssh ubuntu@YOUR_STAGING_IP
sudo htpasswd -c /etc/nginx/.htpasswd staginguser
```

Then update `/etc/nginx/sites-available/learning-tracker`:

```nginx
server {
    # ... existing config ...

    auth_basic "Staging Environment";
    auth_basic_user_file /etc/nginx/.htpasswd;

    location / {
        # ... existing proxy config ...
    }
}
```

Reload Nginx:
```bash
sudo systemctl reload nginx
```

## Support and Next Steps

After staging is set up:

1. ✅ Test a staging deployment: `git tag staging/0.1.0 && git push origin staging/0.1.0`
2. ✅ Verify staging application is accessible
3. ✅ Test promoting to production: `git tag prod/0.1.0 && git push origin prod/0.1.0`
4. ✅ Document any environment-specific configurations

For detailed deployment steps, see:
- **DEPLOYMENT.md** - Complete deployment guide
- **DEPLOYMENT_CHECKLIST.md** - Pre/post deployment checklist
- **QUICK_DEPLOY.md** - Quick reference guide
