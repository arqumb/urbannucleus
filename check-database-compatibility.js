#!/usr/bin/env node

// Database Compatibility Check Script
// This script checks if your database has all required fields for product creation

const mysql = require('mysql2');

// Database connection configuration
const dbConfig = {
  host: 'localhost',
  user: 'urban_user',
  password: '@Arqum789',
  database: 'urban_nucleus',
  port: 3306
};

// Required fields for products table
const requiredFields = [
  'id', 'name', 'slug', 'description', 'short_description', 'price', 'sale_price',
  'compare_at_price', 'cost_price', 'cost_per_item', 'sku', 'barcode', 'category_id',
  'subcategory_id', 'brand', 'model', 'vendor', 'product_type', 'weight', 'dimensions',
  'material', 'color', 'collections', 'tags', 'track_inventory', 'continue_selling',
  'inventory', 'is_featured', 'is_active', 'is_luxury', 'is_limited_edition',
  'limited_edition', 'limited_edition_drop_id', 'limited_quantity', 'sold_quantity',
  'views_count', 'rating', 'total_reviews', 'status', 'archived', 'image_url',
  'seo_title', 'meta_title', 'seo_description', 'meta_description', 'meta_keywords',
  'url_handle', 'created_at', 'updated_at'
];

async function checkDatabaseCompatibility() {
  console.log('🔍 Checking Database Compatibility...');
  console.log('=====================================');

  const connection = mysql.createConnection(dbConfig);

  try {
    // Test connection
    await new Promise((resolve, reject) => {
      connection.connect((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('✅ Database connection successful');
          resolve();
        }
      });
    });

    // Check if products table exists
    const [tables] = await new Promise((resolve, reject) => {
      connection.query('SHOW TABLES LIKE "products"', (err, results) => {
        if (err) reject(err);
        else resolve([results]);
      });
    });

    if (tables.length === 0) {
      console.log('❌ Products table does not exist!');
      console.log('💡 Run the FINAL_COMPLETE_DATABASE_SETUP.sql script first');
      return;
    }

    console.log('✅ Products table exists');

    // Get table structure
    const [columns] = await new Promise((resolve, reject) => {
      connection.query('DESCRIBE products', (err, results) => {
        if (err) reject(err);
        else resolve([results]);
      });
    });

    console.log(`\n📊 Products table has ${columns.length} columns:`);
    
    const existingFields = columns.map(col => col.Field);
    const missingFields = requiredFields.filter(field => !existingFields.includes(field));
    const extraFields = existingFields.filter(field => !requiredFields.includes(field));

    // Display existing fields
    console.log('\n✅ Existing fields:');
    existingFields.forEach(field => {
      const column = columns.find(col => col.Field === field);
      const type = column ? column.Type : 'unknown';
      const nullable = column && column.Null === 'YES' ? 'NULL' : 'NOT NULL';
      console.log(`  - ${field} (${type}, ${nullable})`);
    });

    // Display missing fields
    if (missingFields.length > 0) {
      console.log('\n❌ Missing fields:');
      missingFields.forEach(field => {
        console.log(`  - ${field}`);
      });
    }

    // Display extra fields
    if (extraFields.length > 0) {
      console.log('\n⚠️ Extra fields (not required):');
      extraFields.forEach(field => {
        const column = columns.find(col => col.Field === field);
        const type = column ? column.Type : 'unknown';
        console.log(`  - ${field} (${type})`);
      });
    }

    // Check essential fields for product creation
    const essentialFields = ['name', 'slug', 'price', 'category_id', 'status', 'inventory'];
    const missingEssential = essentialFields.filter(field => !existingFields.includes(field));

    if (missingEssential.length === 0) {
      console.log('\n🎉 All essential fields are present! Product creation should work.');
    } else {
      console.log('\n🚨 Missing essential fields for product creation:');
      missingEssential.forEach(field => {
        console.log(`  - ${field}`);
      });
      console.log('\n💡 You need to add these fields to your products table');
    }

    // Test a simple query
    console.log('\n🧪 Testing simple query...');
    const [testResults] = await new Promise((resolve, reject) => {
      connection.query('SELECT COUNT(*) as count FROM products', (err, results) => {
        if (err) reject(err);
        else resolve([results]);
      });
    });

    console.log(`✅ Query test successful. Products count: ${testResults[0].count}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Error code:', error.code);
    console.error('SQL State:', error.sqlState);
  } finally {
    connection.end();
    console.log('\n🔍 Database compatibility check completed');
  }
}

// Run the check
checkDatabaseCompatibility().catch(console.error);





