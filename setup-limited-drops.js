const mysql = require('mysql2/promise');

// Database configuration - using environment variables or default VPS settings
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Arqum789', // Default VPS password
  database: process.env.DB_NAME || 'urban_nucleus',
  port: process.env.DB_PORT || 3306
};

async function setupLimitedDrops() {
  let connection;
  
  try {
    console.log('🔗 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database successfully');
    
    // 1. Create a sample limited edition drop
    console.log('\n📦 Creating sample limited edition drop...');
    const dropQuery = `
      INSERT INTO limited_edition_drops (title, description, start_date, end_date, is_active)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7); // 7 days from now
    
    const [dropResult] = await connection.execute(dropQuery, [
      'Summer 2024 Limited Collection',
      'Exclusive summer drops with premium quality and limited availability',
      startDate,
      endDate,
      true
    ]);
    
    const dropId = dropResult.insertId;
    console.log(`✅ Created limited edition drop with ID: ${dropId}`);
    
    // 2. Get some existing products to add to the drop
    console.log('\n🔍 Getting existing products...');
    const [products] = await connection.execute(`
      SELECT id, name, price, compare_at_price 
      FROM products 
      WHERE is_active = 1 
      LIMIT 3
    `);
    
    if (products.length === 0) {
      console.log('❌ No products found. Please add some products first.');
      return;
    }
    
    console.log(`✅ Found ${products.length} products to add to drop`);
    
    // 3. Add products to the limited edition drop
    console.log('\n🎯 Adding products to limited edition drop...');
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const position = i + 1;
      
      await connection.execute(`
        INSERT INTO limited_edition_drop_products (drop_id, product_id, position)
        VALUES (?, ?, ?)
      `, [dropId, product.id, position]);
      
      console.log(`✅ Added product "${product.name}" to drop (position: ${position})`);
    }
    
    // 4. Update products to be limited edition
    console.log('\n🏷️ Updating products as limited edition...');
    for (const product of products) {
      await connection.execute(`
        UPDATE products 
        SET is_limited_edition = 1, limited_edition = 1, limited_edition_drop_id = ?
        WHERE id = ?
      `, [dropId, product.id]);
      
      console.log(`✅ Updated product "${product.name}" as limited edition`);
    }
    
    // 5. Verify the setup
    console.log('\n🔍 Verifying limited edition drop setup...');
    const [verifyDrop] = await connection.execute(`
      SELECT led.*, COUNT(ledp.product_id) as product_count
      FROM limited_edition_drops led
      LEFT JOIN limited_edition_drop_products ledp ON led.id = ledp.drop_id
      WHERE led.id = ?
      GROUP BY led.id
    `, [dropId]);
    
    const [verifyProducts] = await connection.execute(`
      SELECT p.id, p.name, p.price, p.compare_at_price, ledp.position
      FROM products p
      INNER JOIN limited_edition_drop_products ledp ON p.id = ledp.product_id
      WHERE ledp.drop_id = ?
      ORDER BY ledp.position
    `, [dropId]);
    
    console.log('\n📊 LIMITED EDITION DROP SUMMARY:');
    console.log('================================');
    console.log(`Drop ID: ${verifyDrop[0].id}`);
    console.log(`Title: ${verifyDrop[0].title}`);
    console.log(`Description: ${verifyDrop[0].description}`);
    console.log(`Start Date: ${verifyDrop[0].start_date}`);
    console.log(`End Date: ${verifyDrop[0].end_date}`);
    console.log(`Active: ${verifyDrop[0].is_active ? 'Yes' : 'No'}`);
    console.log(`Products Count: ${verifyDrop[0].product_count}`);
    
    console.log('\n🎯 PRODUCTS IN DROP:');
    console.log('===================');
    verifyProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Price: ₹${product.price}`);
      console.log(`   Compare Price: ${product.compare_at_price ? '₹' + product.compare_at_price : 'N/A'}`);
      console.log(`   Position: ${product.position}`);
      console.log('');
    });
    
    console.log('🎉 Limited edition drop setup completed successfully!');
    console.log('\n📝 NEXT STEPS:');
    console.log('1. Copy the updated backend/server.js to your VPS');
    console.log('2. Restart PM2: pm2 restart urban-nucleus');
    console.log('3. Visit your website to see the limited drops section');
    console.log('4. The countdown timer should show the remaining time');
    console.log('5. Products should display with proper pricing and images');
    
  } catch (error) {
    console.error('❌ Error setting up limited drops:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the setup
setupLimitedDrops();
