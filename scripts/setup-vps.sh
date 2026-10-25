#!/bin/bash
set -e

# VPS Setup Script for Learning Tracker
# This script sets up a fresh Ubuntu VPS for deployment

echo "================================"
echo "Learning Tracker VPS Setup"
echo "================================"
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then
  echo "Please run this script as a normal user with sudo privileges, not as root."
  exit 1
fi

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

# Create .env template
echo ""
echo "Step 7: Creating .env template..."
cat > $APP_DIR/.env << 'EOF'
# ============================================
# Application
# ============================================
NODE_ENV=production
PORT=3000

# ============================================
# Database
# ============================================
DATABASE_URL=postgresql://username:password@your-db-host:5432/database_name

# ============================================
# Better Auth
# ============================================
# CRITICAL: Generate a secure random string (min 32 characters)
# Example: openssl rand -base64 32
BETTER_AUTH_SECRET=CHANGE_THIS_TO_A_SECURE_RANDOM_STRING_MIN_32_CHARS
BETTER_AUTH_URL=https://catat-progres.temanraih.id

# ============================================
# Rate Limiting
# ============================================
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REDIS_URL=redis://localhost:6379

# ============================================
# Email
# ============================================
EMAIL_PROVIDER=smtp
EMAIL_DELIVERY_MODE=direct
EMAIL_FROM=no-reply@temanraih.id
EMAIL_FROM_NAME=Catat Progres
EMAIL_SUPPORT_ADDRESS=support@temanraih.id

# ============================================
# Optional Settings
# ============================================
# Add other variables from .env.example as needed
EOF

echo "Created .env template at: $APP_DIR/.env"
echo "⚠️  IMPORTANT: Edit this file and add your actual configuration!"

# Create Nginx configuration
echo ""
echo "Step 8: Creating Nginx configuration..."
sudo tee /etc/nginx/sites-available/learning-tracker > /dev/null << 'EOF'
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

# Display summary
echo ""
echo "================================"
echo "Setup Complete!"
echo "================================"
echo ""
echo "✅ Docker installed"
echo "✅ Docker Compose installed"
echo "✅ Nginx installed and configured"
echo "✅ Certbot installed"
echo "✅ Application directory created at: $APP_DIR"
echo "✅ Firewall configured"
echo ""
echo "⚠️  IMPORTANT NEXT STEPS:"
echo ""
echo "1. Edit the .env file:"
echo "   nano $APP_DIR/.env"
echo ""
echo "2. Update these critical values:"
echo "   - DATABASE_URL (your PostgreSQL connection string)"
echo "   - BETTER_AUTH_SECRET (generate with: openssl rand -base64 32)"
echo "   - Other email/service credentials"
echo ""
echo "3. Set up SSL certificate:"
echo "   sudo certbot --nginx -d catat-progres.temanraih.id"
echo ""
echo "4. Configure Jenkins SSH credentials with this server's connection details:"
echo "   - Host: Your VPS IP or hostname"
echo "   - User: $USER"
echo "   - SSH Key: Add your Jenkins SSH public key to ~/.ssh/authorized_keys"
echo ""
echo "5. Ensure your DNS points to this server:"
echo "   catat-progres.temanraih.id → $(curl -s ifconfig.me 2>/dev/null || echo 'your-server-ip')"
echo ""
echo "6. You may need to log out and log back in for Docker group changes to take effect:"
echo "   exit"
echo ""
echo "After completing these steps, you can trigger deployment from Jenkins!"
echo ""
