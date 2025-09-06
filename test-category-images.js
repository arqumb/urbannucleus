const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Arqum789',
  database: 'urban_nucleus',
  port: 3306
};

async function testCategoryImages() {
  let connection;
  
  try {
    console.log('🔗 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database successfully');
    
    console.log('\n📊 TESTING CATEGORY IMAGES FROM CATEGORY_IMAGES TABLE');
    console.log('=====================================================');
    
    // Check if category_images table exists
    console.log('\n🔍 Checking if category_images table exists...');
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = 'urban_nucleus' 
      AND TABLE_NAME = 'category_images'
    `);
    
    if (tables.length === 0) {
      console.log('❌ category_images table does not exist!');
      console.log('💡 You need to create this table first');
      return;
    }
    
    console.log('✅ category_images table exists');
    
    // Check what's in the category_images table
    console.log('\n🔍 Checking category_images table contents...');
    const [categoryImages] = await connection.execute('SELECT * FROM category_images ORDER BY category_id, position');
    
    console.log(`📊 Found ${categoryImages.length} category images:`);
    categoryImages.forEach((img, index) => {
      console.log(`   ${index + 1}. Category ID: ${img.category_id}, Image: ${img.image}, Position: ${img.position}`);
    });
    
    // Test the exact query used in the API
    console.log('\n🔍 Testing categories API query...');
    const [categories] = await connection.execute(`
      SELECT 
        c.id as category_id,
        c.name as category_name,
        ci.image as category_image,
        s.id as subcategory_id,
        s.name as subcategory_name
      FROM categories c
      LEFT JOIN subcategories s ON c.id = s.category_id
      LEFT JOIN (
        SELECT category_id, image, 
               ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY position ASC) as rn
        FROM category_images
      ) ci ON c.id = ci.category_id AND ci.rn = 1
      ORDER BY c.name, s.name
    `);
    
    console.log(`✅ Found ${categories.length} category records`);
    
    // Group subcategories under their categories (same logic as API)
    const categoriesGrouped = {};
    categories.forEach(row => {
      if (!categoriesGrouped[row.category_id]) {
        categoriesGrouped[row.category_id] = {
          id: row.category_id,
          name: row.category_name,
          image: row.category_image,
          subcategories: []
        };
      }
      if (row.subcategory_id) {
        categoriesGrouped[row.category_id].subcategories.push({
          id: row.subcategory_id,
          name: row.subcategory_name
        });
      }
    });
    
    const finalCategories = Object.values(categoriesGrouped);
    
    console.log('\n📋 CATEGORIES WITH IMAGES FROM CATEGORY_IMAGES TABLE:');
    console.log('====================================================');
    
    finalCategories.forEach((category, index) => {
      console.log(`\n${index + 1}. ${category.name}`);
      console.log(`   ID: ${category.id}`);
      console.log(`   Image: ${category.image || 'NO IMAGE'}`);
      console.log(`   Subcategories: ${category.subcategories.length}`);
      
      if (category.image) {
        console.log(`   ✅ HAS IMAGE: ${category.image}`);
      } else {
        console.log(`   ❌ NO IMAGE - will show fallback icon`);
      }
    });
    
    console.log('\n🎯 SUMMARY:');
    console.log('===========');
    const categoriesWithImages = finalCategories.filter(c => c.image);
    const categoriesWithoutImages = finalCategories.filter(c => !c.image);
    
    console.log(`Total Categories: ${finalCategories.length}`);
    console.log(`Categories with images: ${categoriesWithImages.length}`);
    console.log(`Categories without images: ${categoriesWithoutImages.length}`);
    
    if (categoriesWithoutImages.length > 0) {
      console.log('\n💡 TO ADD CATEGORY IMAGES:');
      console.log('1. Go to admin panel: http://31.97.239.99:3000/admin.html');
      console.log('2. Navigate to Categories section');
      console.log('3. Click on a category to edit it');
      console.log('4. Go to "Category Images" tab');
      console.log('5. Upload an image');
      console.log('6. Save the category');
    }
    
  } catch (error) {
    console.error('❌ Error testing category images:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the test
testCategoryImages();





