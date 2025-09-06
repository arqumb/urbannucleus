#!/bin/bash

# Urban Nucleus VPS Error Fix Script
# Run this script on your VPS to fix common deployment issues

echo "🔧 Urban Nucleus VPS Error Fix Script"
echo "====================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "success") echo -e "${GREEN}✅ $message${NC}" ;;
        "error") echo -e "${RED}❌ $message${NC}" ;;
        "warning") echo -e "${YELLOW}⚠️  $message${NC}" ;;
        "info") echo -e "${YELLOW}ℹ️  $message${NC}" ;;
    esac
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_status "error" "Please run as root (use sudo)"
    exit 1
fi

print_status "info" "Starting VPS error fixes..."

# 1. Fix file permissions
print_status "info" "Fixing file permissions..."
chown -R www-data:www-data /var/www/urban-nucleus
chmod -R 755 /var/www/urban-nucleus
chmod -R 777 /var/www/urban-nucleus/uploads
chmod -R 777 /var/www/urban-nucleus/uploads/hero-slides

# 2. Create log directory if it doesn't exist
print_status "info" "Setting up log directories..."
mkdir -p /var/log/urban-nucleus
chown -R www-data:www-data /var/log/urban-nucleus
chmod -R 755 /var/log/urban-nucleus

# 3. Check and fix MySQL service
print_status "info" "Checking MySQL service..."
if systemctl is-active --quiet mysql; then
    print_status "success" "MySQL is running"
else
    print_status "warning" "MySQL is not running, starting it..."
    systemctl start mysql
    systemctl enable mysql
    sleep 3
    
    if systemctl is-active --quiet mysql; then
        print_status "success" "MySQL started successfully"
    else
        print_status "error" "Failed to start MySQL"
    fi
fi

# 4. Check and fix Nginx service
print_status "info" "Checking Nginx service..."
if systemctl is-active --quiet nginx; then
    print_status "success" "Nginx is running"
else
    print_status "warning" "Nginx is not running, starting it..."
    systemctl start nginx
    systemctl enable nginx
    sleep 2
    
    if systemctl is-active --quiet nginx; then
        print_status "success" "Nginx started successfully"
    else
        print_status "error" "Failed to start Nginx"
    fi
fi

# 5. Test database connection
print_status "info" "Testing database connection..."
if mysql -u urban_user -p'@Arqum789' -e "USE urban_nucleus; SELECT 'Database connection successful!' as status;" 2>/dev/null; then
    print_status "success" "Database connection successful"
else
    print_status "error" "Database connection failed"
    print_status "info" "Attempting to create database and user..."
    
    mysql -u root -e "
    CREATE DATABASE IF NOT EXISTS urban_nucleus;
    CREATE USER IF NOT EXISTS 'urban_user'@'localhost' IDENTIFIED BY '@Arqum789';
    GRANT ALL PRIVILEGES ON urban_nucleus.* TO 'urban_user'@'localhost';
    FLUSH PRIVILEGES;
    "
    
    if mysql -u urban_user -p'@Arqum789' -e "USE urban_nucleus; SELECT 'Database connection successful!' as status;" 2>/dev/null; then
        print_status "success" "Database created and connection successful"
    else
        print_status "error" "Failed to create database"
    fi
fi

# 6. Check PM2 status
print_status "info" "Checking PM2 status..."
if command -v pm2 &> /dev/null; then
    if pm2 list | grep -q "urban-nucleus"; then
        print_status "success" "Urban Nucleus app is running in PM2"
        pm2 status
    else
        print_status "warning" "Urban Nucleus app not found in PM2, starting it..."
        cd /var/www/urban-nucleus
        pm2 start ecosystem.config.js --env production
        pm2 save
        sleep 3
        
        if pm2 list | grep -q "urban-nucleus"; then
            print_status "success" "Urban Nucleus app started successfully"
        else
            print_status "error" "Failed to start Urban Nucleus app"
        fi
    fi
else
    print_status "error" "PM2 not installed"
    print_status "info" "Installing PM2..."
    npm install -g pm2
    
    if command -v pm2 &> /dev/null; then
        print_status "success" "PM2 installed successfully"
        cd /var/www/urban-nucleus
        pm2 start ecosystem.config.js --env production
        pm2 save
        pm2 startup
    else
        print_status "error" "Failed to install PM2"
    fi
fi

# 7. Check port 3000
print_status "info" "Checking if port 3000 is open..."
if netstat -tuln | grep -q ":3000 "; then
    print_status "success" "Port 3000 is open"
else
    print_status "warning" "Port 3000 is not open"
    print_status "info" "Checking firewall..."
    
    if command -v ufw &> /dev/null; then
        ufw allow 3000
        print_status "info" "Firewall rule added for port 3000"
    fi
fi

# 8. Test application health
print_status "info" "Testing application health..."
sleep 5
if curl -s http://localhost:3000/health > /dev/null; then
    print_status "success" "Application health check passed"
else
    print_status "warning" "Application health check failed"
    print_status "info" "Checking application logs..."
    
    if [ -f "/var/log/urban-nucleus/err.log" ]; then
        echo "Last 10 error log entries:"
        tail -10 /var/log/urban-nucleus/err.log
    fi
fi

# 9. Check Nginx configuration
print_status "info" "Checking Nginx configuration..."
if nginx -t > /dev/null 2>&1; then
    print_status "success" "Nginx configuration is valid"
    systemctl reload nginx
else
    print_status "error" "Nginx configuration has errors"
    nginx -t
fi

# 10. Final status check
echo ""
print_status "info" "Final status check..."
echo ""

# Check all services
services=("mysql" "nginx")
for service in "${services[@]}"; do
    if systemctl is-active --quiet $service; then
        print_status "success" "$service: Running"
    else
        print_status "error" "$service: Not running"
    fi
done

# Check PM2
if pm2 list | grep -q "urban-nucleus"; then
    print_status "success" "PM2: Urban Nucleus app running"
else
    print_status "error" "PM2: Urban Nucleus app not running"
fi

# Check port
if netstat -tuln | grep -q ":3000 "; then
    print_status "success" "Port 3000: Open"
else
    print_status "error" "Port 3000: Closed"
fi

echo ""
print_status "success" "VPS error fix script completed!"
print_status "info" "If you still have issues, check the logs:"
echo "  - PM2 logs: pm2 logs urban-nucleus"
echo "  - Nginx logs: tail -f /var/log/nginx/error.log"
echo "  - MySQL logs: tail -f /var/log/mysql/error.log"
echo ""
print_status "info" "Restart the application if needed:"
echo "  - pm2 restart urban-nucleus"
echo "  - systemctl restart nginx"
echo "  - systemctl restart mysql"






