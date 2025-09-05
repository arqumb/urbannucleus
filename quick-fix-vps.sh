#!/bin/bash

# Urban Nucleus VPS Quick Fix Script
# Run this script to quickly fix common deployment issues

echo "🚀 Urban Nucleus VPS Quick Fix Script"
echo "====================================="

# Make scripts executable
chmod +x *.sh

# Stop LiteSpeed if running
echo "🛑 Stopping LiteSpeed..."
if systemctl is-active --quiet lsws; then
    systemctl stop lsws
    systemctl disable lsws
    echo "✅ LiteSpeed stopped and disabled"
else
    echo "ℹ️ LiteSpeed not running"
fi

# Install Nginx if not present
echo "🌐 Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    apt update
    apt install -y nginx
    echo "✅ Nginx installed"
else
    echo "✅ Nginx already installed"
fi

# Install MySQL if not present
echo "🗄️ Installing MySQL..."
if ! command -v mysql &> /dev/null; then
    apt install -y mysql-server mysql-client
    echo "✅ MySQL installed"
else
    echo "✅ MySQL already installed"
fi

# Install Node.js if not present
echo "📦 Installing Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
    echo "✅ Node.js installed"
else
    echo "✅ Node.js already installed (version: $(node --version))"
fi

# Install PM2 if not present
echo "📦 Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    echo "✅ PM2 installed"
else
    echo "✅ PM2 already installed"
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p /var/www/urban-nucleus
mkdir -p /var/log/urban-nucleus
mkdir -p /var/www/urban-nucleus/uploads/images
mkdir -p /var/www/urban-nucleus/uploads/videos
mkdir -p /var/www/urban-nucleus/uploads/hero-slides

# Set permissions
echo "🔐 Setting permissions..."
chown -R www-data:www-data /var/www/urban-nucleus
chown -R www-data:www-data /var/log/urban-nucleus
chmod -R 755 /var/www/urban-nucleus/uploads

# Configure MySQL
echo "🗄️ Configuring MySQL..."
mysql -e "CREATE DATABASE IF NOT EXISTS urban_nucleus CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null || true
mysql -e "CREATE USER IF NOT EXISTS 'urban_user'@'localhost' IDENTIFIED BY '@Arqum789';" 2>/dev/null || true
mysql -e "GRANT ALL PRIVILEGES ON urban_nucleus.* TO 'urban_user'@'localhost';" 2>/dev/null || true
mysql -e "FLUSH PRIVILEGES;" 2>/dev/null || true

# Configure Nginx
echo "🌐 Configuring Nginx..."
if [ -f "nginx-urban-nucleus.conf" ]; then
    cp nginx-urban-nucleus.conf /etc/nginx/sites-available/urban-nucleus
    ln -sf /etc/nginx/sites-available/urban-nucleus /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    echo "✅ Nginx configured"
else
    echo "❌ Nginx config file not found"
fi

# Test and restart Nginx
echo "🧪 Testing Nginx configuration..."
if nginx -t; then
    systemctl restart nginx
    systemctl enable nginx
    echo "✅ Nginx restarted and enabled"
else
    echo "❌ Nginx configuration test failed"
fi

# Start MySQL
echo "🗄️ Starting MySQL..."
systemctl start mysql
systemctl enable mysql
echo "✅ MySQL started and enabled"

# Check if application files exist
if [ -d "/var/www/urban-nucleus/backend" ]; then
    echo "📦 Installing application dependencies..."
    cd /var/www/urban-nucleus
    npm install 2>/dev/null || echo "⚠️ Main dependencies install failed"
    
    cd /var/www/urban-nucleus/backend
    npm install 2>/dev/null || echo "⚠️ Backend dependencies install failed"
    
    # Start with PM2
    echo "🚀 Starting application with PM2..."
    cd /var/www/urban-nucleus
    if [ -f "ecosystem.config.js" ]; then
        pm2 start ecosystem.config.js --env production
        pm2 save
        pm2 startup
        echo "✅ Application started with PM2"
    else
        echo "❌ PM2 config not found"
    fi
else
    echo "⚠️ Application files not found in /var/www/urban-nucleus/"
    echo "   Please upload your files first"
fi

# Configure firewall
echo "🔥 Configuring firewall..."
if command -v ufw &> /dev/null; then
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable
    echo "✅ Firewall configured"
else
    echo "ℹ️ UFW not available, skipping firewall config"
fi

echo ""
echo "🎉 Quick fix completed!"
echo ""
echo "🔍 To check status:"
echo "   - systemctl status nginx"
echo "   - systemctl status mysql"
echo "   - pm2 status"
echo ""
echo "🌐 Your website should now be accessible at: http://31.97.239.99"
echo ""
echo "📝 Next steps:"
echo "   1. Upload your website files to /var/www/urban-nucleus/"
echo "   2. Run: ./setup-database-vps.sh"
echo "   3. Test the application"
echo "   4. If issues persist, run: ./troubleshoot-vps.sh"
