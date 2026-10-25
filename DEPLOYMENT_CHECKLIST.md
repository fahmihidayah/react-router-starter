# Deployment Checklist

This checklist covers the complete setup for staging and production deployments with image promotion.

## Pre-Deployment Setup

### 1. Jenkins Configuration

- [ ] Install required Jenkins plugins:
  - [ ] SSH Agent Plugin
  - [ ] Docker Pipeline Plugin
  - [ ] Credentials Binding Plugin

- [ ] Create Jenkins Credentials (Manage Jenkins → Credentials):
  - [ ] **GHCR Credentials** (ID: `ghcr-credentials`)
    - Type: Username with password
    - Username: Your GitHub username
    - Password: GitHub PAT with `write:packages` scope
  - [ ] **Production VPS SSH Key** (ID: `vps-ssh-key`)
    - Type: SSH Username with private key
    - Username: `ubuntu`
    - Private Key: Your SSH private key for production VPS
  - [ ] **Staging VPS SSH Key** (ID: `staging-vps-ssh-key`)
    - Type: SSH Username with private key
    - Username: `ubuntu`
    - Private Key: Your SSH private key for staging VPS

### 2. Staging VPS Setup

**See [STAGING_SETUP.md](STAGING_SETUP.md) for detailed instructions**

- [ ] Provision separate staging VPS
- [ ] Run the setup script:
  ```bash
  # Copy script to staging VPS
  scp scripts/setup-staging-vps.sh ubuntu@STAGING_IP:~/

  # SSH into staging VPS
  ssh ubuntu@STAGING_IP

  # Run setup
  chmod +x setup-staging-vps.sh
  ./setup-staging-vps.sh
  ```

- [ ] Edit `.env` file on staging VPS:
  ```bash
  nano /home/ubuntu/learning-tracker/.env
  ```

- [ ] Update critical staging environment variables:
  - [ ] `NODE_ENV=staging`
  - [ ] `DATABASE_URL` - **Separate staging database!**
  - [ ] `BETTER_AUTH_SECRET` - Generate with: `openssl rand -base64 32` (different from production!)
  - [ ] `BETTER_AUTH_URL` - `https://staging.catat-progres.temanraih.id`
  - [ ] Email configuration (indicate staging in from address)
  - [ ] Redis URL with staging prefix

- [ ] Set up DNS for staging:
  - [ ] `staging.catat-progres.temanraih.id` → `STAGING_VPS_IP`

- [ ] Set up SSL certificate for staging:
  ```bash
  sudo certbot --nginx -d staging.catat-progres.temanraih.id
  ```

- [ ] Add Jenkins SSH public key to staging VPS:
  ```bash
  # On staging VPS
  nano ~/.ssh/authorized_keys
  # Add Jenkins public key
  ```

- [ ] Update Jenkinsfile with staging VPS IP:
  ```bash
  # Edit Jenkinsfile line 14
  STAGING_VPS_HOST = 'YOUR_STAGING_IP'
  # Commit and push
  ```

### 3. Production VPS Setup (124.156.207.229)

- [ ] Run the setup script:
  ```bash
  # Copy script to VPS
  scp scripts/setup-vps.sh ubuntu@124.156.207.229:~/

  # SSH into VPS
  ssh ubuntu@124.156.207.229

  # Run setup
  chmod +x setup-vps.sh
  ./setup-vps.sh
  ```

- [ ] Edit `.env` file on VPS:
  ```bash
  nano /home/ubuntu/learning-tracker/.env
  ```

- [ ] Update critical environment variables:
  - [ ] `DATABASE_URL` - Your PostgreSQL connection string
  - [ ] `BETTER_AUTH_SECRET` - Generate with: `openssl rand -base64 32`
  - [ ] `BETTER_AUTH_URL` - `https://catat-progres.temanraih.id`
  - [ ] Email configuration (SMTP settings)
  - [ ] Redis URL (if using rate limiting)

- [ ] Set up SSL certificate:
  ```bash
  sudo certbot --nginx -d catat-progres.temanraih.id
  ```

- [ ] Verify DNS points to VPS:
  - [ ] `catat-progres.temanraih.id` → `124.156.207.229`

- [ ] Add Jenkins SSH public key to VPS:
  ```bash
  # On VPS
  nano ~/.ssh/authorized_keys
  # Add Jenkins public key
  ```

### 4. GitHub Configuration

- [ ] Create Personal Access Token:
  - Go to GitHub Settings → Developer settings → Personal access tokens
  - Generate new token with `write:packages` permission
  - Save token securely (you'll need it for Jenkins)

- [ ] Verify repository access:
  - Repository: `fahmihidayah/learning-tracker`
  - Ensure you have push access

### 5. Database Setup

#### Staging Database
- [ ] Separate staging PostgreSQL database is created
- [ ] Staging database credentials are secure
- [ ] Network allows staging VPS to connect to staging database
- [ ] Test connection from staging VPS

#### Production Database
- [ ] Production PostgreSQL database is created and accessible
- [ ] Production database credentials are secure
- [ ] Network allows production VPS to connect to production database
- [ ] Test connection from production VPS:
  ```bash
  # Install psql if needed
  sudo apt install postgresql-client -y

  # Test connection
  psql "postgresql://username:password@host:5432/database"
  ```

### 6. Security Review

#### Staging
- [ ] Strong `BETTER_AUTH_SECRET` generated (different from production!)
- [ ] Staging database password is strong and unique
- [ ] SSH key-only authentication enabled
- [ ] Firewall configured (ports 22, 80, 443 only)
- [ ] SSL certificate installed and auto-renewal enabled
- [ ] All secrets in `.env`, not in code
- [ ] `.env` file has proper permissions (600)

#### Production
- [ ] Strong `BETTER_AUTH_SECRET` generated (different from staging!)
- [ ] Production database password is strong and unique
- [ ] SSH key-only authentication enabled
- [ ] Firewall configured (ports 22, 80, 443 only)
- [ ] SSL certificate installed and auto-renewal enabled
- [ ] All secrets in `.env`, not in code
- [ ] `.env` file has proper permissions (600)

## Deployment Process

### Phase 1: Deploy to Staging

- [ ] Code changes are committed and pushed
- [ ] Create staging git tag:
  ```bash
  git tag staging/1.0.0
  git push origin staging/1.0.0
  ```
- [ ] Jenkins pipeline starts automatically
- [ ] Monitor Jenkins build logs

### Phase 2: Staging Verification

- [ ] Check Jenkins build status (should be green)
- [ ] Verify staging application is running:
  ```bash
  ssh ubuntu@STAGING_IP
  cd /home/ubuntu/learning-tracker
  docker compose ps
  ```
- [ ] Check staging health:
  ```bash
  curl https://staging.catat-progres.temanraih.id/api/health
  ```
- [ ] **Thorough Testing on Staging:**
  - [ ] Test user registration and login
  - [ ] Test all major features
  - [ ] Verify database operations
  - [ ] Test file uploads
  - [ ] Verify email notifications
  - [ ] Check for console errors
  - [ ] Test mobile responsiveness
  - [ ] Check performance
- [ ] Check staging application logs:
  ```bash
  docker compose logs -f app
  ```
- [ ] Monitor for errors during testing

### Phase 3: Promote to Production

**ONLY proceed if all staging tests pass!**

- [ ] Create production git tag with **SAME version**:
  ```bash
  git tag prod/1.0.0  # Same version as staging!
  git push origin prod/1.0.0
  ```
- [ ] Jenkins verifies image exists in GHCR
- [ ] Jenkins deploys **same Docker image** to production (no rebuild)
- [ ] Monitor Jenkins deployment logs

### Phase 4: Production Verification

- [ ] Check Jenkins build status (should be green)
- [ ] Verify production application is running:
  ```bash
  ssh ubuntu@124.156.207.229
  cd /home/ubuntu/learning-tracker
  docker compose ps
  ```
- [ ] Check production health:
  ```bash
  curl https://catat-progres.temanraih.id/api/health
  ```
- [ ] Test login functionality on production
- [ ] Verify database migrations ran successfully
- [ ] Quick smoke test of critical features
- [ ] Check production application logs:
  ```bash
  docker compose logs -f app
  ```
- [ ] Monitor for errors in first 10-15 minutes

## Rollback Procedures

### Rollback Staging

```bash
# Use a previous version
git tag staging/0.9.0 --force
git push origin staging/0.9.0 --force
```

### Rollback Production

```bash
# Use a previous version that exists in GHCR
git tag prod/0.9.0 --force
git push origin prod/0.9.0 --force
```

**Manual rollback (emergency):**

```bash
# SSH into production VPS
ssh ubuntu@124.156.207.229
cd /home/ubuntu/learning-tracker

# Deploy specific previous version
VERSION=0.9.0
IMAGE_NAME=ghcr.io/fahmihidayah/learning-tracker IMAGE_TAG=$VERSION \
  docker compose up -d --no-build

# Check status
docker compose ps
docker compose logs -f app
```

## Troubleshooting

### Jenkins Build Fails

- [ ] Check Jenkins console output for errors
- [ ] Verify GHCR credentials are correct
- [ ] Ensure tag format matches `prod/X.Y.Z`
- [ ] Check Docker build logs

### Deployment Fails

- [ ] Verify SSH credentials in Jenkins
- [ ] Check VPS is accessible: `ssh ubuntu@124.156.207.229`
- [ ] Verify `.env` file exists on VPS
- [ ] Check VPS Docker is running: `docker ps`
- [ ] Review deployment logs in Jenkins

### Application Won't Start

- [ ] Check `.env` variables are correct
- [ ] Verify database connection: `DATABASE_URL`
- [ ] Check Docker logs: `docker compose logs -f app`
- [ ] Verify ports are available: `sudo lsof -i :3000`
- [ ] Check disk space: `df -h`

### Database Migration Fails

- [ ] Check database credentials
- [ ] Verify database is accessible from VPS
- [ ] Review migration logs: `docker compose logs migrate`
- [ ] Check database user has appropriate permissions

## Maintenance

### Regular Tasks

- [ ] Monitor application logs weekly
- [ ] Check disk space monthly
- [ ] Review and rotate logs
- [ ] Update system packages monthly:
  ```bash
  sudo apt update && sudo apt upgrade -y
  ```
- [ ] Backup database regularly (automated recommended)
- [ ] Monitor SSL certificate expiration (Certbot auto-renews)

### Emergency Contacts

- VPS Provider: _________________
- Database Provider: _________________
- Domain Registrar: _________________
- Team Lead: _________________

## Notes

- Build numbers are incremental from Jenkins
- Each deployment creates tags: `BUILD_NUMBER` and `latest`
- Old Docker images are automatically pruned
- Migrations run before each deployment
- Zero-downtime deployment via Docker healthchecks
