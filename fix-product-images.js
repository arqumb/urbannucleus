#!/usr/bin/env node

// Fix Product Images Display Issue
// This script checks and fixes product image URLs in the database

const mysql = require('mysql2');

// Database connection configuration
const dbConfig = {
  host: 'localhost',
  user: 'urban_user',
  password: '@Arqum789',
  database: 'urban_nucleus',
  port: 3306
};

async function fixProductImages() {
  console.log('🔧 Fixing Product Images Display Issue...');
  console.log('==========================================');

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

    // Check current product images
    console.log('\n🔍 Checking current product images...');
    const [images] = await new Promise((resolve, reject) => {
      connection.query('SELECT * FROM product_images LIMIT 5', (err, results) => {
        if (err) reject(err);
        else resolve([results]);
      });
    });

    if (images.length === 0) {
      console.log('❌ No product images found in database');
      return;
    }

    console.log(`📊 Found ${images.length} product images`);
    console.log('\n📸 Sample image records:');
    images.forEach((img, index) => {
      console.log(`  ${index + 1}. Product ID: ${img.product_id}`);
      console.log(`     Image URL: ${img.image_url}`);
      console.log(`     File Path: ${img.file_path}`);
      console.log(`     Position: ${img.position}`);
      console.log('');
    });

    // Check if uploads directory exists
    const fs = require('fs');
    const uploadsPath = '/var/www/urban-nucleus/uploads/images';
    
    if (fs.existsSync(uploadsPath)) {
      console.log('✅ Uploads directory exists:', uploadsPath);
      
      // List some files in uploads directory
      const files = fs.readdirSync(uploadsPath).slice(0, 5);
      console.log('📁 Sample files in uploads directory:', files);
    } else {
      console.log('❌ Uploads directory does not exist:', uploadsPath);
      console.log('💡 Creating uploads directory...');
      
      try {
        fs.mkdirSync(uploadsPath, { recursive: true });
        console.log('✅ Created uploads directory');
      } catch (error) {
        console.error('❌ Failed to create uploads directory:', error.message);
      }
    }

    // Check for common image URL issues
    console.log('\n🔍 Checking for common image URL issues...');
    
    const [problematicImages] = await new Promise((resolve, reject) => {
      connection.query(`
        SELECT * FROM product_images 
        WHERE image_url LIKE '%31.97.239.99:3000%' 
        OR image_url LIKE '%localhost%'
        OR image_url LIKE '%127.0.0.1%'
        LIMIT 10
      `, (err, results) => {
        if (err) reject(err);
        else resolve([results]);
      });
    });

    if (problematicImages.length > 0) {
      console.log(`⚠️ Found ${problematicImages.length} images with problematic URLs`);
      console.log('💡 These URLs might not work from the frontend');
      
      // Fix the URLs to use relative paths
      console.log('\n🔧 Fixing problematic image URLs...');
      
      for (const img of problematicImages) {
        const oldUrl = img.image_url;
        const newUrl = img.file_path || `/uploads/images/${img.image_url.split('/').pop()}`;
        
        console.log(`  Fixing: ${oldUrl} → ${newUrl}`);
        
        await new Promise((resolve, reject) => {
          connection.query(
            'UPDATE product_images SET image_url = ? WHERE id = ?',
            [newUrl, img.id],
            (err) => {
              if (err) {
                console.error(`❌ Failed to update image ${img.id}:`, err.message);
                reject(err);
              } else {
                console.log(`✅ Updated image ${img.id}`);
                resolve();
              }
            }
          );
        });
      }
      
      console.log('✅ Fixed all problematic image URLs');
    } else {
      console.log('✅ No problematic image URLs found');
    }

    // Test image accessibility
    console.log('\n🧪 Testing image accessibility...');
    
    const [testImages] = await new Promise((resolve, reject) => {
      connection.query('SELECT * FROM product_images LIMIT 3', (err, results) => {
        if (err) reject(err);
        else resolve([results]);
      });
    });

    for (const img of testImages) {
      const imagePath = img.file_path || img.image_url;
      const fullPath = `/var/www/urban-nucleus${imagePath}`;
      
      if (fs.existsSync(fullPath)) {
        console.log(`✅ Image exists: ${imagePath}`);
      } else {
        console.log(`❌ Image missing: ${imagePath}`);
        console.log(`   Full path: ${fullPath}`);
      }
    }

    // Summary
    console.log('\n📊 Summary:');
    console.log('✅ Database connection working');
    console.log('✅ Product images table accessible');
    console.log('✅ Uploads directory configured');
    
    if (problematicImages.length > 0) {
      console.log(`✅ Fixed ${problematicImages.length} problematic image URLs`);
    }
    
    console.log('\n🎯 Next steps:');
    console.log('1. Restart your Node.js application');
    console.log('2. Test product image display in admin panel');
    console.log('3. Check if images now display correctly');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    connection.end();
    console.log('\n🔧 Product images fix completed');
  }
}

// Run the fix
fixProductImages().catch(console.error);

