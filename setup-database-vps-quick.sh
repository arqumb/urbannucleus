#!/bin/bash

# Quick Database Setup for VPS
# This script sets up the database quickly on your VPS

echo "🗄️ Quick Database Setup for VPS"
echo "================================"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

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

print_status "info" "Setting up database..."

# 1. Create database and user
print_status "info" "Creating database and user..."
mysql -u root -e "
CREATE DATABASE IF NOT EXISTS urban_nucleus;
CREATE USER IF NOT EXISTS 'urban_user'@'localhost' IDENTIFIED BY '@Arqum789';
GRANT ALL PRIVILEGES ON urban_nucleus.* TO 'urban_user'@'localhost';
FLUSH PRIVILEGES;
"

if [ $? -eq 0 ]; then
    print_status "success" "Database and user created successfully"
else
    print_status "error" "Failed to create database"
    exit 1
fi

# 2. Test connection
print_status "info" "Testing database connection..."
if mysql -u urban_user -p'@Arqum789' -e "USE urban_nucleus; SELECT 'Connection successful!' as status;" 2>/dev/null; then
    print_status "success" "Database connection test passed"
else
    print_status "error" "Database connection test failed"
    exit 1
fi

# 3. Import the complete database structure
print_status "info" "Importing database structure..."
if [ -f "FINAL_COMPLETE_DATABASE_SETUP.sql" ]; then
    mysql -u urban_user -p'@Arqum789' urban_nucleus < FINAL_COMPLETE_DATABASE_SETUP.sql
    
    if [ $? -eq 0 ]; then
        print_status "success" "Database structure imported successfully"
    else
        print_status "error" "Failed to import database structure"
        exit 1
    fi
else
    print_status "warning" "FINAL_COMPLETE_DATABASE_SETUP.sql not found"
    print_status "info" "Creating basic tables manually..."
    
    mysql -u urban_user -p'@Arqum789' urban_nucleus -e "
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(50),
        last_name VARCHAR(50),
        phone VARCHAR(20),
        phone_verified BOOLEAN DEFAULT FALSE,
        address TEXT,
        city VARCHAR(50),
        state VARCHAR(50),
        pincode VARCHAR(10),
        country VARCHAR(50) DEFAULT 'India',
        google_id VARCHAR(255),
        facebook_id VARCHAR(255),
        profile_image VARCHAR(255),
        is_verified BOOLEAN DEFAULT FALSE,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        image VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        short_description VARCHAR(500),
        price DECIMAL(10,2) NOT NULL,
        sale_price DECIMAL(10,2),
        compare_at_price DECIMAL(10,2),
        cost_price DECIMAL(10,2),
        sku VARCHAR(100) UNIQUE,
        category_id INT,
        brand VARCHAR(100),
        inventory INT DEFAULT 0,
        is_featured BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        image_url VARCHAR(500),
        status ENUM('active', 'inactive', 'sale', 'out_of_stock', 'draft', 'archived') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
    "
    
    if [ $? -eq 0 ]; then
        print_status "success" "Basic tables created successfully"
    else
        print_status "error" "Failed to create basic tables"
        exit 1
    fi
fi

# 4. Verify tables
print_status "info" "Verifying database tables..."
mysql -u urban_user -p'@Arqum789' urban_nucleus -e "SHOW TABLES;"

# 5. Check table counts
print_status "info" "Checking table record counts..."
mysql -u urban_user -p'@Arqum789' urban_nucleus -e "
SELECT 
    'Users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'Categories', COUNT(*) FROM categories
UNION ALL
SELECT 'Products', COUNT(*) FROM products;
"

print_status "success" "Database setup completed successfully!"
print_status "info" "Your Urban Nucleus database is ready to use"
print_status "info" "You can now start your application with: pm2 start ecosystem.config.js --env production"








