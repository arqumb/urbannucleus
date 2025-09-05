#!/bin/bash

# Urban Nucleus VPS Troubleshooting Script
# Run this script to diagnose and fix common issues

echo "🔍 Urban Nucleus VPS Troubleshooting Script"
echo "=========================================="

# Function to check service status
check_service() {
    local service_name=$1
    local display_name=$2
    
    if systemctl is-active --quiet $service_name; then
        echo "✅ $display_name: Running"
    else
        echo "❌ $display_name: Not running"
        echo "   Attempting to start $display_name..."
        systemctl start $service_name
        systemctl enable $service_name
        
        if systemctl is-active --quiet $service_name; then
            echo "   ✅ $display_name started successfully"
        else
            echo "   ❌ Failed to start $display_name"
            echo "   Check logs: journalctl -u $service_name -f"
        fi
    fi
}

# Function to check port
check_port() {
    local port=$1
    local service_name=$2
    
    if netstat -tuln | grep -q ":$port "; then
        echo "✅ Port $port ($service_name): Open"
    else
        echo "❌ Port $port ($service_name): Closed"
    fi
}

# Function to check PM2 status
check_pm2() {
    echo ""
    echo "📊 PM2 Status:"
    if command -v pm2 &> /dev/null; then
        pm2 status
    else
        echo "❌ PM2 not installed"
        echo "   Installing PM2..."
        npm install -g pm2
    fi
}

# Function to check application logs
check_logs() {
    echo ""
    echo "📋 Application Logs:"
    if [ -f "/var/log/urban-nucleus/err.log" ]; then
        echo "Last 10 error log entries:"
        tail -10 /var/log/urban-nucleus/err.log
    else
        echo "❌ Error log file not found"
    fi
    
    if [ -f "/var/log/urban-nucleus/out.log" ]; then
        echo ""
        echo "Last 10 output log entries:"
        tail -10 /var/log/urban-nucleus/out.log
    else
        echo "❌ Output log file not found"
    fi
}

# Function to check database connection
check_database() {
    echo ""
    echo "🗄️ Database Connection Test:"
    
    if mysql -u urban_user -p'@Arqum789' -e "USE urban_nucleus; SELECT 'Database connection successful!' as status;" 2>/dev/null; then
        echo "✅ Database connection successful"
        
        echo ""
        echo "📊 Database Tables:"
        mysql -u urban_user -p'@Arqum789' urban_nucleus -e "SHOW TABLES;"
        
        echo ""
        echo "📈 Record Counts:"
        mysql -u urban_user -p'@Arqum789' urban_nucleus -e "
        SELECT 
            'Users' as table_name, COUNT(*) as record_count FROM users
        UNION ALL
        SELECT 'Categories', COUNT(*) FROM categories
        UNION ALL
        SELECT 'Subcategories', COUNT(*) FROM subcategories
        UNION ALL
        SELECT 'Products', COUNT(*) FROM products;
        "
    else
        echo "❌ Database connection failed"
        echo "   Checking MySQL service..."
        check_service mysql "MySQL"
        
        echo "   Testing root connection..."
        if mysql -u root -e "SELECT 'Root connection successful' as status;" 2>/dev/null; then
            echo "   ✅ Root connection successful"
            echo "   Attempting to recreate database user..."
            
            mysql -u root -e "
            DROP USER IF EXISTS 'urban_user'@'localhost';
            CREATE USER 'urban_user'@'localhost' IDENTIFIED BY '@Arqum789';
            GRANT ALL PRIVILEGES ON urban_nucleus.* TO 'urban_user'@'localhost';
            FLUSH PRIVILEGES;
            "
            
            echo "   Database user recreated. Testing connection..."
            if mysql -u urban_user -p'@Arqum789' -e "USE urban_nucleus; SELECT 'Connection successful!' as status;" 2>/dev/null; then
                echo "   ✅ Database connection now working"
            else
                echo "   ❌ Still cannot connect"
            fi
        else
            echo "   ❌ Root connection failed"
        fi
    fi
}

# Function to check application files
check_files() {
    echo ""
    echo "📁 Application Files Check:"
    
    local app_dir="/var/www/urban-nucleus"
    
    if [ -d "$app_dir" ]; then
        echo "✅ Application directory exists: $app_dir"
        
        if [ -f "$app_dir/backend/server.js" ]; then
            echo "✅ Server.js found"
        else
            echo "❌ Server.js not found"
        fi
        
        if [ -f "$app_dir/ecosystem.config.js" ]; then
            echo "✅ PM2 config found"
        else
            echo "❌ PM2 config not found"
        fi
        
        if [ -d "$app_dir/uploads" ]; then
            echo "✅ Uploads directory exists"
        else
            echo "❌ Uploads directory missing"
            echo "   Creating uploads directory..."
            mkdir -p "$app_dir/uploads/images"
            mkdir -p "$app_dir/uploads/videos"
            mkdir -p "$app_dir/uploads/hero-slides"
            chown -R www-data:www-data "$app_dir/uploads"
            chmod -R 755 "$app_dir/uploads"
        fi
        
        echo ""
        echo "📦 Checking dependencies..."
        if [ -f "$app_dir/package.json" ]; then
            echo "   Main package.json found"
            if [ -d "$app_dir/node_modules" ]; then
                echo "   ✅ Main dependencies installed"
            else
                echo "   ❌ Main dependencies missing"
                echo "   Installing main dependencies..."
                cd "$app_dir" && npm install
            fi
        fi
        
        if [ -f "$app_dir/backend/package.json" ]; then
            echo "   Backend package.json found"
            if [ -d "$app_dir/backend/node_modules" ]; then
                echo "   ✅ Backend dependencies installed"
            else
                echo "   ❌ Backend dependencies missing"
                echo "   Installing backend dependencies..."
                cd "$app_dir/backend" && npm install
            fi
        fi
        
    else
        echo "❌ Application directory not found: $app_dir"
        echo "   Please upload your application files first"
    fi
}

# Function to restart services
restart_services() {
    echo ""
    echo "🔄 Restarting Services:"
    
    echo "   Restarting Nginx..."
    systemctl restart nginx
    
    echo "   Restarting MySQL..."
    systemctl restart mysql
    
    echo "   Restarting PM2..."
    pm2 restart all
    
    echo "   Services restarted"
}

# Function to show system information
show_system_info() {
    echo ""
    echo "💻 System Information:"
    echo "   OS: $(lsb_release -d | cut -f2)"
    echo "   Kernel: $(uname -r)"
    echo "   Memory: $(free -h | grep Mem | awk '{print $2}')"
    echo "   Disk: $(df -h / | tail -1 | awk '{print $4}') available"
    echo "   Node.js: $(node --version 2>/dev/null || echo 'Not installed')"
    echo "   NPM: $(npm --version 2>/dev/null || echo 'Not installed')"
    echo "   PM2: $(pm2 --version 2>/dev/null || echo 'Not installed')"
}

# Main troubleshooting flow
echo "1. Checking system services..."
check_service nginx "Nginx"
check_service mysql "MySQL"

echo ""
echo "2. Checking ports..."
check_port 80 "HTTP (Nginx)"
check_port 3000 "Node.js App"
check_port 3306 "MySQL"

echo ""
echo "3. Checking PM2..."
check_pm2

echo ""
echo "4. Checking application files..."
check_files

echo ""
echo "5. Checking database..."
check_database

echo ""
echo "6. Checking logs..."
check_logs

echo ""
echo "7. System information..."
show_system_info

echo ""
echo "🔧 Troubleshooting Options:"
echo "   To restart all services: ./troubleshoot-vps.sh restart"
echo "   To check specific service: systemctl status [service_name]"
echo "   To view PM2 logs: pm2 logs urban-nucleus"
echo "   To restart PM2: pm2 restart all"

# Handle restart option
if [ "$1" = "restart" ]; then
    echo ""
    echo "🔄 Restarting all services..."
    restart_services
fi

echo ""
echo "✅ Troubleshooting completed!"
echo "   If issues persist, check the logs above for specific error messages"
