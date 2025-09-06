#!/usr/bin/env node

// Quick Diagnostic Script for Product Images Issue
// Run this on your VPS to identify the exact problem

const mysql = require('mysql2');
const fs = require('fs');

const dbConfig = {
  host: 'localhost',
  user: 'urban_user',
  password: '@Arqum789',
  database: 'urban_nucleus',
  port: 3306
};

async function diagnoseImages() {
  console.log('🔍 DIAGNOSING PRODUCT IMAGES ISSUE...');
  console.log('=====================================');

  const connection = mysql.createConnection(dbConfig);

  try {
    // Test database connection
    await new Promise((resolve, reject) => {
      connection.connect((err) => {
        if (err) {
          console.log('❌ Database connection failed:', err.message);
          reject(err);
        } else {
          console.log('✅ Database connection successful');
          resolve();
        }
      });
    });

    // Check 1: Product images in database
    console.log('\n📊 CHECK 1: Database Image Records');
    console.log('-----------------------------------');
    
    const [images] = await new Promise((resolve, reject) => {
      connection.query(`
        SELECT 
          pi.id,
          pi.product_id,
          pi.image_url,
          pi.file_path,
          p.name as product_name
        FROM product_images pi
        JOIN products p ON pi.product_id = p.id
        LIMIT 10
      `, (err, results) => {
        if (err) reject(err);
        else resolve([results]);
      });
    });

    if (images.length === 0) {
      console.log('❌ NO PRODUCT IMAGES FOUND IN DATABASE!');
      console.log('💡 This means images were never uploaded or database is empty');
      return;
    }

    console.log(`📸 Found ${images.length} product images in database:`);
    images.forEach((img, index) => {
      console.log(`\n  ${index + 1}. Product: ${img.product_name}`);
      console.log(`     Image URL: ${img.image_url}`);
      console.log(`     File Path: ${img.file_path}`);
      console.log(`     Status: ${img.image_url.startsWith('/uploads/') ? '✅ Relative Path' : '❌ Full URL'}`);
    });

    // Check 2: File system
    console.log('\n📁 CHECK 2: File System');
    console.log('------------------------');
    
    const uploadsPath = '/var/www/urban-nucleus/uploads/images';
    
    if (!fs.existsSync(uploadsPath)) {
      console.log('❌ UPLOADS DIRECTORY DOES NOT EXIST!');
      console.log(`   Expected: ${uploadsPath}`);
      console.log('💡 Creating uploads directory...');
      
      try {
        fs.mkdirSync(uploadsPath, { recursive: true });
        console.log('✅ Created uploads directory');
      } catch (error) {
        console.error('❌ Failed to create directory:', error.message);
      }
    } else {
      console.log('✅ Uploads directory exists');
      
      const files = fs.readdirSync(uploadsPath);
      console.log(`📁 Found ${files.length} files in uploads directory`);
      
      if (files.length > 0) {
        console.log('📄 Sample files:', files.slice(0, 5));
      } else {
        console.log('⚠️ Uploads directory is empty!');
      }
    }

    // Check 3: Image file accessibility
    console.log('\n🔍 CHECK 3: Image File Accessibility');
    console.log('------------------------------------');
    
    for (const img of images.slice(0, 3)) {
      const imagePath = img.file_path || img.image_url;
      let fullPath;
      
      if (imagePath.startsWith('/uploads/')) {
        fullPath = `/var/www/urban-nucleus${imagePath}`;
      } else if (imagePath.startsWith('uploads/')) {
        fullPath = `/var/www/urban-nucleus/${imagePath}`;
      } else {
        fullPath = `/var/www/urban-nucleus/uploads/images/${imagePath.split('/').pop()}`;
      }
      
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        console.log(`✅ Image exists: ${imagePath}`);
        console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB`);
        console.log(`   Full path: ${fullPath}`);
      } else {
        console.log(`❌ Image missing: ${imagePath}`);
        console.log(`   Expected path: ${fullPath}`);
      }
    }

    // Check 4: URL patterns
    console.log('\n🔗 CHECK 4: URL Pattern Analysis');
    console.log('--------------------------------');
    
    const urlPatterns = {
      relative: 0,
      fullDomain: 0,
      localhost: 0,
      other: 0
    };

    images.forEach(img => {
      if (img.image_url.startsWith('/uploads/')) {
        urlPatterns.relative++;
      } else if (img.image_url.includes('31.97.239.99')) {
        urlPatterns.fullDomain++;
      } else if (img.image_url.includes('localhost') || img.image_url.includes('127.0.0.1')) {
        urlPatterns.localhost++;
      } else {
        urlPatterns.other++;
      }
    });

    console.log('📊 URL Pattern Distribution:');
    console.log(`   Relative paths (/uploads/...): ${urlPatterns.relative}`);
    console.log(`   Full domain URLs: ${urlPatterns.fullDomain}`);
    console.log(`   Localhost URLs: ${urlPatterns.localhost}`);
    console.log(`   Other patterns: ${urlPatterns.other}`);

    // Check 5: Server configuration
    console.log('\n⚙️ CHECK 5: Server Configuration');
    console.log('--------------------------------');
    
    console.log('🔍 Checking if server.js has been updated...');
    
    const serverPath = '/var/www/urban-nucleus/backend/server.js';
    if (fs.existsSync(serverPath)) {
      const serverContent = fs.readFileSync(serverPath, 'utf8');
      
      if (serverContent.includes('http://31.97.239.99:${PORT}')) {
        console.log('❌ SERVER.JS NOT UPDATED! Still contains full domain URLs');
        console.log('💡 You need to copy the fixed backend/server.js file to your VPS');
      } else if (serverContent.includes('/uploads/images/')) {
        console.log('✅ SERVER.JS UPDATED! Uses relative paths');
      } else {
        console.log('⚠️ SERVER.JS content unclear - manual verification needed');
      }
    } else {
      console.log('❌ SERVER.JS NOT FOUND!');
    }

    // Summary and recommendations
    console.log('\n📋 SUMMARY & RECOMMENDATIONS');
    console.log('=============================');
    
    if (urlPatterns.fullDomain > 0 || urlPatterns.localhost > 0) {
      console.log('🚨 ISSUE IDENTIFIED: Full domain URLs in database');
      console.log('💡 SOLUTION: Run the image fix script to convert URLs');
    }
    
    if (!fs.existsSync(uploadsPath) || fs.readdirSync(uploadsPath).length === 0) {
      console.log('🚨 ISSUE IDENTIFIED: Missing or empty uploads directory');
      console.log('💡 SOLUTION: Create uploads directory and set permissions');
    }
    
    console.log('\n🎯 IMMEDIATE ACTIONS REQUIRED:');
    console.log('1. Copy fixed backend/server.js to VPS');
    console.log('2. Run: node fix-product-images.js');
    console.log('3. Restart: pm2 restart urban-nucleus');
    console.log('4. Test image display in admin panel');

  } catch (error) {
    console.error('❌ Diagnostic failed:', error.message);
  } finally {
    connection.end();
    console.log('\n🔍 Diagnostic completed');
  }
}

// Run diagnostic
diagnoseImages().catch(console.error);





