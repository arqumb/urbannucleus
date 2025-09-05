#!/bin/bash

# Urban Nucleus Database Setup Script for VPS
# Run this script on your VPS after the main deployment

echo "🗄️ Setting up Urban Nucleus database..."

# Database credentials
DB_NAME="urban_nucleus"
DB_USER="urban_user"
DB_PASS="@Arqum789"
DB_HOST="localhost"

# Create database if it doesn't exist
echo "📁 Creating database..."
mysql -u root -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Create user if it doesn't exist
echo "👤 Creating database user..."
mysql -u root -e "CREATE USER IF NOT EXISTS '$DB_USER'@'$DB_HOST' IDENTIFIED BY '$DB_PASS';"
mysql -u root -e "GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'$DB_HOST';"
mysql -u root -e "FLUSH PRIVILEGES;"

# Test connection
echo "🔍 Testing database connection..."
mysql -u "$DB_USER" -p"$DB_PASS" -h "$DB_HOST" -e "USE $DB_NAME; SELECT 'Database connection successful!' as status;"

if [ $? -eq 0 ]; then
    echo "✅ Database connection successful!"
else
    echo "❌ Database connection failed!"
    exit 1
fi

# Create basic tables structure
echo "📋 Creating database tables..."

mysql -u "$DB_USER" -p"$DB_PASS" -h "$DB_HOST" "$DB_NAME" << 'EOF'

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    phone_verified TINYINT(1) DEFAULT 0,
    google_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subcategories table
CREATE TABLE IF NOT EXISTS subcategories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    category_id INT,
    subcategory_id INT,
    inventory INT DEFAULT 0,
    status ENUM('active', 'inactive', 'draft') DEFAULT 'active',
    compare_at_price DECIMAL(10,2),
    cost_per_item DECIMAL(10,2),
    sku VARCHAR(100),
    barcode VARCHAR(100),
    track_inventory BOOLEAN DEFAULT TRUE,
    continue_selling BOOLEAN DEFAULT FALSE,
    weight DECIMAL(8,2),
    product_type VARCHAR(100),
    vendor VARCHAR(100),
    collections TEXT,
    tags TEXT,
    seo_title VARCHAR(255),
    seo_meta_description TEXT,
    seo_url_handle VARCHAR(255),
    archived BOOLEAN DEFAULT FALSE,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE SET NULL
);

-- Product images table
CREATE TABLE IF NOT EXISTS product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    file_path VARCHAR(500),
    position INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Product videos table
CREATE TABLE IF NOT EXISTS product_videos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    video_url VARCHAR(500) NOT NULL,
    file_path VARCHAR(500),
    position INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Product variants table
CREATE TABLE IF NOT EXISTS product_variants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    option_name VARCHAR(100) NOT NULL,
    option_value VARCHAR(100) NOT NULL,
    sku VARCHAR(100),
    price DECIMAL(10,2),
    inventory INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Cart table
CREATE TABLE IF NOT EXISTS cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT DEFAULT 1,
    size VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_address TEXT,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    payment_method VARCHAR(50) DEFAULT 'upi',
    is_cod BOOLEAN DEFAULT FALSE,
    cod_advance_paid DECIMAL(10,2) DEFAULT 0,
    cod_remaining_amount DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    size VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Category images table
CREATE TABLE IF NOT EXISTS category_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    position INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Insert default categories
INSERT IGNORE INTO categories (id, name, description) VALUES 
(1, 'Fashion', 'Trendy fashion items'),
(2, 'Electronics', 'Latest electronic gadgets'),
(3, 'Home & Living', 'Home decor and lifestyle products');

-- Insert default subcategories
INSERT IGNORE INTO subcategories (id, category_id, name, description) VALUES 
(1, 1, 'Men\'s Clothing', 'Stylish men\'s apparel'),
(2, 1, 'Women\'s Clothing', 'Elegant women\'s fashion'),
(3, 2, 'Smartphones', 'Latest mobile phones'),
(4, 3, 'Furniture', 'Modern furniture pieces');

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_subcategory ON products(subcategory_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_cart_user ON cart(user_id);

EOF

if [ $? -eq 0 ]; then
    echo "✅ Database tables created successfully!"
else
    echo "❌ Error creating database tables!"
    exit 1
fi

# Test the setup
echo "🔍 Testing database setup..."
mysql -u "$DB_USER" -p"$DB_PASS" -h "$DB_HOST" "$DB_NAME" -e "
SELECT 
    'Users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'Categories', COUNT(*) FROM categories
UNION ALL
SELECT 'Subcategories', COUNT(*) FROM subcategories
UNION ALL
SELECT 'Products', COUNT(*) FROM products;
"

echo ""
echo "🎉 Database setup completed successfully!"
echo ""
echo "📊 Database information:"
echo "   - Database: $DB_NAME"
echo "   - User: $DB_USER"
echo "   - Host: $DB_HOST"
echo ""
echo "🔍 To connect to database manually:"
echo "   mysql -u $DB_USER -p$DB_PASS -h $DB_HOST $DB_NAME"
echo ""
echo "📝 Next steps:"
echo "   1. Import your existing data (if any)"
echo "   2. Test the application"
echo "   3. Check PM2 status: pm2 status"
echo "   4. Check application logs: pm2 logs urban-nucleus"
