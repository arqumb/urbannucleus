const mysql = require('mysql2/promise');

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
    console.log('✅ Connected to database');
    
    // Check if category_images table exists and has data
    console.log('\n📊 Checking category_images table...');
    const [categoryImages] = await connection.execute(`
      SELECT 
        ci.id,
        ci.category_id,
        ci.image,
        ci.position,
        c.name as category_name
      FROM category_images ci
      LEFT JOIN categories c ON ci.category_id = c.id
      ORDER BY ci.category_id, ci.position
    `);
    
    console.log(`Found ${categoryImages.length} category images:`);
    categoryImages.forEach(img => {
      console.log(`  - ID: ${img.id}, Category: ${img.category_name} (ID: ${img.category_id}), Image: ${img.image}, Position: ${img.position}`);
    });
    
    // Test the exact query used in the API
    console.log('\n🔍 Testing API query...');
    const [apiResults] = await connection.execute(`
      SELECT 
        c.id, 
        c.name, 
        ci.image
      FROM categories c
      LEFT JOIN (
        SELECT category_id, image, 
               ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY position ASC) as rn
        FROM category_images
      ) ci ON c.id = ci.category_id AND ci.rn = 1
      ORDER BY c.name
    `);
    
    console.log(`API query returned ${apiResults.length} categories:`);
    apiResults.forEach(cat => {
      console.log(`  - ID: ${cat.id}, Name: ${cat.name}, Image: ${cat.image || 'NULL'}`);
    });
    
    // Check if there are any categories without images
    console.log('\n❌ Categories without images:');
    const categoriesWithoutImages = apiResults.filter(cat => !cat.image);
    if (categoriesWithoutImages.length > 0) {
      categoriesWithoutImages.forEach(cat => {
        console.log(`  - ${cat.name} (ID: ${cat.id})`);
      });
    } else {
      console.log('  All categories have images!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

testCategoryImages();




