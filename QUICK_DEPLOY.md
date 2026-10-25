# Quick Deploy Guide

Fast-track guide for staging and production deployment with image promotion.

## Overview: Staging → Production Workflow

```
staging/1.0.0 → Build & Deploy to Staging → Test → prod/1.0.0 → Deploy Same Image to Production
```

**Key Concept:** Build once on staging, deploy the **exact same Docker image** to production.

## 1. One-Time Staging Setup (10-15 minutes)

```bash
# 1. Copy setup script to STAGING VPS
scp scripts/setup-staging-vps.sh ubuntu@STAGING_IP:~/

# 2. SSH into staging VPS
ssh ubuntu@STAGING_IP

# 3. Run setup script
chmod +x setup-staging-vps.sh
./setup-staging-vps.sh
# Follow prompts - enter: staging.catat-progres.temanraih.id

# 4. Edit environment variables for STAGING
nano /home/ubuntu/learning-tracker/.env

# Update these CRITICAL STAGING values:
# - NODE_ENV=staging
# - DATABASE_URL=postgresql://user:pass@STAGING_DB_HOST:5432/staging_db  (SEPARATE DATABASE!)
# - BETTER_AUTH_SECRET=$(openssl rand -base64 32)  (DIFFERENT from production!)
# - BETTER_AUTH_URL=https://staging.catat-progres.temanraih.id

# 5. Set up DNS: staging.catat-progres.temanraih.id → STAGING_IP

# 6. Set up SSL (after DNS propagates)
sudo certbot --nginx -d staging.catat-progres.temanraih.id

# 7. Log out and back in (for Docker group)
exit
```

## 2. One-Time Production Setup (10-15 minutes)

```bash
# 1. Copy setup script to PRODUCTION VPS
scp scripts/setup-vps.sh ubuntu@124.156.207.229:~/

# 2. SSH into production VPS
ssh ubuntu@124.156.207.229

# 3. Run setup script
chmod +x setup-vps.sh
./setup-vps.sh

# 4. Edit environment variables for PRODUCTION
nano /home/ubuntu/learning-tracker/.env

# Update these CRITICAL PRODUCTION values:
# - NODE_ENV=production
# - DATABASE_URL=postgresql://user:pass@PROD_DB_HOST:5432/prod_db  (SEPARATE DATABASE!)
# - BETTER_AUTH_SECRET=$(openssl rand -base64 32)  (DIFFERENT from staging!)
# - BETTER_AUTH_URL=https://catat-progres.temanraih.id

# 5. Set up SSL
sudo certbot --nginx -d catat-progres.temanraih.id

# 6. Log out and back in (for Docker group)
exit
```

## 3. Jenkins Setup (5-10 minutes)

### Install Plugins
Manage Jenkins → Plugins → Available:
- SSH Agent Plugin
- Docker Pipeline Plugin

### Add Credentials
Manage Jenkins → Credentials → System → Global credentials:

**1. GHCR Credentials**
- Click "Add Credentials"
- Kind: Username with password
- Username: `your-github-username`
- Password: [GitHub Personal Access Token with `write:packages`]
- ID: `ghcr-credentials`
- Description: "GHCR Docker Registry"

**2. Production VPS SSH Key**
- Click "Add Credentials"
- Kind: SSH Username with private key
- Username: `ubuntu`
- Private Key: [Paste your SSH private key for production]
- ID: `vps-ssh-key`
- Description: "Production VPS SSH Access"

**3. Staging VPS SSH Key**
- Click "Add Credentials"
- Kind: SSH Username with private key
- Username: `ubuntu`
- Private Key: [Paste your SSH private key for staging]
- ID: `staging-vps-ssh-key`
- Description: "Staging VPS SSH Access"

### Update Jenkinsfile
Edit `Jenkinsfile` line 14 with your staging IP:
```groovy
STAGING_VPS_HOST = 'YOUR_STAGING_IP'
```

Commit and push:
```bash
git add Jenkinsfile
git commit -m "Configure staging VPS IP"
git push
```

### Create Pipeline
1. New Item → Pipeline
2. Name: `learning-tracker-deploy`
3. Pipeline → Definition: "Pipeline script from SCM"
4. SCM: Git
5. Repository URL: `https://github.com/fahmihidayah/learning-tracker`
6. Branch: `*/main`
7. Script Path: `Jenkinsfile`
8. Check: "Build when a change is pushed to GitHub" (if using webhooks)
9. Save

## 4. Deploy to Staging (2 minutes)

```bash
# Create and push STAGING tag
git tag staging/1.0.0
git push origin staging/1.0.0

# Jenkins will automatically:
# 1. Build Docker images (tagged as 1.0.0)
# 2. Push images to GHCR
# 3. Deploy to STAGING VPS
# 4. Run migrations
# 5. Start application
```

## 5. Test on Staging (5-15 minutes)

```bash
# Check staging application is running
curl https://staging.catat-progres.temanraih.id/api/health
# Should return: {"status":"ok"}

# Visit staging site
open https://staging.catat-progres.temanraih.id
```

**Test Thoroughly:**
- [ ] User registration and login
- [ ] All major features
- [ ] Database operations
- [ ] File uploads
- [ ] Email notifications
- [ ] Mobile responsiveness
- [ ] Check console for errors

## 6. Promote to Production (1 minute)

**ONLY after staging tests pass!**

```bash
# Create and push PRODUCTION tag with SAME version
git tag prod/1.0.0  # Same version as staging!
git push origin prod/1.0.0

# Jenkins will automatically:
# 1. Verify image 1.0.0 exists in GHCR
# 2. Pull the SAME images (NO rebuild!)
# 3. Deploy to PRODUCTION VPS
# 4. Run migrations
# 5. Start application
```

## 7. Verify Production (1 minute)

```bash
# Check production application is running
curl https://catat-progres.temanraih.id/api/health
# Should return: {"status":"ok"}

# Visit production site
open https://catat-progres.temanraih.id
```

## Environment Variables Quick Reference

### Staging `.env` (on staging VPS)

```env
NODE_ENV=staging
PORT=3000

# MUST be separate database!
DATABASE_URL=postgresql://user:password@staging-db-host:5432/staging_database

# MUST be different from production!
BETTER_AUTH_SECRET=your-staging-secret-min-32-chars
BETTER_AUTH_URL=https://staging.catat-progres.temanraih.id

EMAIL_FROM=no-reply-staging@temanraih.id
EMAIL_FROM_NAME=Catat Progres (Staging)
```

### Production `.env` (on production VPS)

```env
NODE_ENV=production
PORT=3000

# Separate production database!
DATABASE_URL=postgresql://user:password@prod-db-host:5432/prod_database

# Different secret from staging!
BETTER_AUTH_SECRET=your-production-secret-min-32-chars
BETTER_AUTH_URL=https://catat-progres.temanraih.id

EMAIL_FROM=no-reply@temanraih.id
EMAIL_FROM_NAME=Catat Progres
```

## Common Commands

### Check Staging Status
```bash
ssh ubuntu@STAGING_IP "cd learning-tracker && docker compose ps"
```

### Check Production Status
```bash
ssh ubuntu@124.156.207.229 "cd learning-tracker && docker compose ps"
```

### View Staging Logs
```bash
ssh ubuntu@STAGING_IP "cd learning-tracker && docker compose logs -f app"
```

### View Production Logs
```bash
ssh ubuntu@124.156.207.229 "cd learning-tracker && docker compose logs -f app"
```

### Restart Staging Application
```bash
ssh ubuntu@STAGING_IP "cd learning-tracker && docker compose restart app"
```

### Restart Production Application
```bash
ssh ubuntu@124.156.207.229 "cd learning-tracker && docker compose restart app"
```

## Rollback

### Rollback Staging
```bash
git tag staging/0.9.0 --force
git push origin staging/0.9.0 --force
```

### Rollback Production
```bash
git tag prod/0.9.0 --force  # Must be a version that was deployed to staging
git push origin prod/0.9.0 --force
```

## Troubleshooting Quick Fixes

### Staging won't start
```bash
# Check logs
ssh ubuntu@STAGING_IP
cd learning-tracker
docker compose logs app

# Check .env file (hide secrets)
cat .env | grep -v PASSWORD | grep -v SECRET
```

### Production deployment fails: "Image not found"
**Problem:** You're trying to deploy a version that wasn't built in staging.

**Solution:** Deploy to staging first:
```bash
git tag staging/1.0.0
git push origin staging/1.0.0
# Wait for staging deployment to complete
# Then promote to production:
git tag prod/1.0.0
git push origin prod/1.0.0
```

### Can't connect to database
```bash
# Test database connection
docker compose exec app node -e "
  const postgres = require('postgres');
  const sql = postgres(process.env.DATABASE_URL);
  sql\`SELECT NOW()\`.then(console.log).catch(console.error).finally(() => sql.end());
"
```

### SSL certificate issues
```bash
sudo certbot renew --dry-run
sudo certbot renew
sudo systemctl reload nginx
```

## Next Deployments

After initial setup, deploying is a simple 3-step process:

### 1. Deploy to Staging
```bash
git tag staging/1.0.1
git push origin staging/1.0.1
```

### 2. Test on Staging
Visit https://staging.catat-progres.temanraih.id and test thoroughly

### 3. Promote to Production
```bash
git tag prod/1.0.1
git push origin prod/1.0.1
```

That's it! Jenkins handles everything automatically.

## Architecture Diagram

```
Developer
    ↓
  staging/1.0.0
    ↓
  Jenkins
    ├─ Build images (1.0.0)
    ├─ Push to GHCR
    └─ Deploy to Staging VPS
         ↓
    Test on Staging
         ↓
    ✓ Tests Pass
         ↓
  prod/1.0.0
    ↓
  Jenkins
    ├─ Verify 1.0.0 in GHCR
    ├─ Pull same images (NO rebuild)
    └─ Deploy to Production VPS
         ↓
  Same Tested Image LIVE
```

## Key Concepts

1. **Separate Databases** - Staging and production MUST have separate databases
2. **Different Secrets** - Use different `BETTER_AUTH_SECRET` for each environment
3. **Same Version** - Production tag must match staging tag version (e.g., `staging/1.0.0` → `prod/1.0.0`)
4. **No Rebuild** - Production uses the exact image tested in staging
5. **Runtime Config** - `BETTER_AUTH_URL` and other env vars are set at runtime via `.env`
6. **Test First** - Always test thoroughly on staging before promoting to production

## Support

For detailed instructions, see:
- **STAGING_SETUP.md** - Complete staging environment setup
- **DEPLOYMENT.md** - Full deployment guide
- **DEPLOYMENT_CHECKLIST.md** - Step-by-step checklist

Need help? Check the logs first:
```bash
# Staging
ssh ubuntu@STAGING_IP "cd learning-tracker && docker compose logs -f app"

# Production
ssh ubuntu@124.156.207.229 "cd learning-tracker && docker compose logs -f app"
```
