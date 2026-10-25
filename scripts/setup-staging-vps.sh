#!/bin/bash
set -e

# Staging VPS Setup Script for Learning Tracker
# This script sets up a fresh Ubuntu VPS for staging deployments

echo "========================================"
echo "Learning Tracker STAGING VPS Setup"
echo "========================================"
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then
  echo "Please run this script as a normal user with sudo privileges, not as root."
  exit 1
fi

# Prompt for staging domain
read -p "Enter your staging domain (e.g., staging.catat-progres.temanraih.id): " STAGING_DOMAIN

if [ -z "$STAGING_DOMAIN" ]; then
    echo "Error: Staging domain is required!"
    exit 1
fi

echo ""
echo "Setting up staging environment for: $STAGING_DOMAIN"
echo ""

# Update system
echo "Step 1: Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker
echo ""
echo "Step 2: Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo "Docker installed successfully!"
else
    echo "Docker is already installed."
fi

# Install Docker Compose Plugin
echo ""
echo "Step 3: Installing Docker Compose..."
if ! docker compose version &> /dev/null; then
    sudo apt install docker-compose-plugin -y
    echo "Docker Compose installed successfully!"
else
    echo "Docker Compose is already installed."
fi

# Install Nginx
echo ""
echo "Step 4: Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt install nginx -y
    echo "Nginx installed successfully!"
else
    echo "Nginx is already installed."
fi

# Install Certbot for SSL
echo ""
echo "Step 5: Installing Certbot..."
if ! command -v certbot &> /dev/null; then
    sudo apt install certbot python3-certbot-nginx -y
    echo "Certbot installed successfully!"
else
    echo "Certbot is already installed."
fi

# Create application directory
echo ""
echo "Step 6: Creating application directory..."
APP_DIR="/home/$USER/learning-tracker"
mkdir -p $APP_DIR
echo "Created directory: $APP_DIR"

# Create .env template for staging
echo ""
echo "Step 7: Creating staging .env template..."
cat > $APP_DIR/.env << EOF
# ============================================
# Application - STAGING ENVIRONMENT
# ============================================
NODE_ENV=staging
PORT=3000

# ============================================
# Database - MUST BE DIFFERENT FROM PRODUCTION!
# ============================================
DATABASE_URL=postgresql://username:password@staging-db-host:5432/staging_database

# ============================================
# Better Auth
# ============================================
# CRITICAL: Generate a secure random string (min 32 characters)
# MUST BE DIFFERENT from production!
# Example: openssl rand -base64 32
BETTER_AUTH_SECRET=CHANGE_THIS_TO_A_SECURE_RANDOM_STRING_MIN_32_CHARS
BETTER_AUTH_URL=https://$STAGING_DOMAIN

# ============================================
# Rate Limiting
# ============================================
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REDIS_URL=redis://localhost:6379
RATE_LIMIT_REDIS_PREFIX=learning-tracker-staging:rate-limit

# ============================================
# Email - Indicate this is staging
# ============================================
EMAIL_PROVIDER=smtp
EMAIL_DELIVERY_MODE=direct
EMAIL_FROM=no-reply-staging@temanraih.id
EMAIL_FROM_NAME=Catat Progres (Staging)
EMAIL_SUPPORT_ADDRESS=support@temanraih.id

# Optional: Disable external services in staging
GOOGLE_AUTH_ENABLED=false
RECAPTCHA_ENABLED=false

# ============================================
# Observability
# ============================================
OBSERVABILITY_ENVIRONMENT=staging

# ============================================
# Add other variables from .env.example as needed
# ============================================
EOF

echo "Created .env template at: $APP_DIR/.env"
echo "⚠️  IMPORTANT: Edit this file and add your actual STAGING configuration!"

# Create Nginx configuration for staging
echo ""
echo "Step 8: Creating Nginx configuration for staging..."
sudo tee /etc/nginx/sites-available/learning-tracker << EOF
server {
    listen 80;
    server_name $STAGING_DOMAIN;

    client_max_body_size 10M;

    # Optional: Add staging indicator header
    add_header X-Environment "Staging" always;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable Nginx site
if [ ! -L /etc/nginx/sites-enabled/learning-tracker ]; then
    sudo ln -s /etc/nginx/sites-available/learning-tracker /etc/nginx/sites-enabled/
    echo "Nginx site configuration enabled."
fi

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
echo "Nginx configured and reloaded!"

# Configure firewall
echo ""
echo "Step 9: Configuring firewall..."
if command -v ufw &> /dev/null; then
    sudo ufw --force enable
    sudo ufw allow 22/tcp
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw status
    echo "Firewall configured!"
else
    echo "UFW not found, skipping firewall configuration."
fi

# Get server IP
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || echo 'Unable to detect')

# Display summary
echo ""
echo "========================================"
echo "Staging Setup Complete!"
echo "========================================"
echo ""
echo "✅ Docker installed"
echo "✅ Docker Compose installed"
echo "✅ Nginx installed and configured"
echo "✅ Certbot installed"
echo "✅ Application directory created at: $APP_DIR"
echo "✅ Firewall configured"
echo ""
echo "⚠️  CRITICAL NEXT STEPS:"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Configure DNS for your staging domain:"
echo "   Domain: $STAGING_DOMAIN"
echo "   Type: A Record"
echo "   Value: $SERVER_IP"
echo "   TTL: 300"
echo ""
echo "2. Edit the .env file with STAGING configuration:"
echo "   nano $APP_DIR/.env"
echo ""
echo "   Update these CRITICAL values:"
echo "   • DATABASE_URL (MUST be separate staging database!)"
echo "   • BETTER_AUTH_SECRET (generate with: openssl rand -base64 32)"
echo "   • Email/SMTP credentials"
echo "   • Any other service API keys (use staging/test credentials)"
echo ""
echo "3. Wait for DNS propagation (check with: dig $STAGING_DOMAIN)"
echo ""
echo "4. Set up SSL certificate (AFTER DNS propagates):"
echo "   sudo certbot --nginx -d $STAGING_DOMAIN"
echo ""
echo "5. Add Jenkins SSH credential for staging:"
echo "   • ID: staging-vps-ssh-key"
echo "   • Username: $USER"
echo "   • Private Key: Add your Jenkins SSH public key to:"
echo "     ~/.ssh/authorized_keys"
echo ""
echo "6. Update Jenkinsfile with this staging server IP:"
echo "   STAGING_VPS_HOST = '$SERVER_IP'"
echo ""
echo "7. You may need to log out and log back in for Docker group"
echo "   changes to take effect:"
echo "   exit"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  IMPORTANT STAGING CONSIDERATIONS:"
echo ""
echo "• Use a SEPARATE database from production"
echo "• Use DIFFERENT secrets/keys from production"
echo "• Consider using test credentials for third-party services"
echo "• Set NODE_ENV=staging (or production) in .env"
echo "• Email addresses should indicate it's staging"
echo "• Add cache/queue key prefixes to avoid conflicts"
echo ""
echo "After completing these steps, trigger a staging deployment:"
echo "  git tag staging/0.1.0"
echo "  git push origin staging/0.1.0"
echo ""
echo "For detailed instructions, see STAGING_SETUP.md"
echo ""
