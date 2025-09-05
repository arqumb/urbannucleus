#!/bin/bash

# Urban Nucleus VPS Deployment Script
# Run this script on your VPS as root or with sudo privileges

echo "🚀 Starting Urban Nucleus VPS deployment..."

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install required packages
echo "🔧 Installing required packages..."
apt install -y nginx mysql-server mysql-client curl wget git unzip

# Install Node.js 18.x
echo "📦 Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install PM2 globally
echo "📦 Installing PM2..."
npm install -g pm2

# Create application directory
echo "📁 Creating application directory..."
mkdir -p /var/www/urban-nucleus
mkdir -p /var/log/urban-nucleus

# Set proper permissions
chown -R www-data:www-data /var/www/urban-nucleus
chown -R www-data:www-data /var/log/urban-nucleus

# Create uploads directory
mkdir -p /var/www/urban-nucleus/uploads
mkdir -p /var/www/urban-nucleus/uploads/images
mkdir -p /var/www/urban-nucleus/uploads/videos
mkdir -p /var/www/urban-nucleus/uploads/hero-slides

# Set permissions for uploads
chown -R www-data:www-data /var/www/urban-nucleus/uploads
chmod -R 755 /var/www/urban-nucleus/uploads

# Configure MySQL
echo "🗄️ Configuring MySQL..."
mysql -e "CREATE DATABASE IF NOT EXISTS urban_nucleus;"
mysql -e "CREATE USER IF NOT EXISTS 'urban_user'@'localhost' IDENTIFIED BY '@Arqum789';"
mysql -e "GRANT ALL PRIVILEGES ON urban_nucleus.* TO 'urban_user'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"

# Configure Nginx
echo "🌐 Configuring Nginx..."
cp nginx-urban-nucleus.conf /etc/nginx/sites-available/urban-nucleus
ln -sf /etc/nginx/sites-available/urban-nucleus /etc/nginx/sites-enabled/

# Remove default Nginx site
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx
systemctl enable nginx

# Install application dependencies
echo "📦 Installing application dependencies..."
cd /var/www/urban-nucleus
npm install

# Install backend dependencies
cd /var/www/urban-nucleus/backend
npm install

# Start application with PM2
echo "🚀 Starting application with PM2..."
cd /var/www/urban-nucleus
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save
pm2 startup

# Configure firewall (if UFW is available)
if command -v ufw &> /dev/null; then
    echo "🔥 Configuring firewall..."
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable
fi

# Create systemd service for PM2 (backup method)
echo "⚙️ Creating systemd service for PM2..."
pm2 startup systemd -u root --hp /root

echo "✅ Deployment completed!"
echo ""
echo "🌐 Your website should now be accessible at: http://31.97.239.99"
echo "🔧 Admin panel: http://31.97.239.99/admin.html"
echo "📊 PM2 status: pm2 status"
echo "📋 PM2 logs: pm2 logs urban-nucleus"
echo ""
echo "🔍 To check if everything is working:"
echo "   - curl http://localhost:3000/health"
echo "   - systemctl status nginx"
echo "   - systemctl status mysql"
echo ""
echo "📝 Next steps:"
echo "   1. Upload your website files to /var/www/urban-nucleus/"
echo "   2. Import your database schema"
echo "   3. Configure SSL certificate (recommended)"
echo "   4. Test all functionality"
