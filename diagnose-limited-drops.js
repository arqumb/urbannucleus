const mysql = require('mysql2/promise');

// Database configuration - using environment variables or default VPS settings
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Arqum789', // Default VPS password
  database: process.env.DB_NAME || 'urban_nucleus',
  port: process.env.DB_PORT || 3306
};

async function diagnoseLimitedDrops() {
  let connection;
  
  try {
    console.log('🔗 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database successfully');
    
    console.log('\n📊 LIMITED EDITION DROPS DIAGNOSTIC');
    console.log('====================================');
    
    // 1. Check if limited_edition_drops table exists
    console.log('\n🔍 CHECK 1: Database Tables');
    console.log('----------------------------');
    
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = 'urban_nucleus' 
      AND TABLE_NAME IN ('limited_edition_drops', 'limited_edition_drop_products')
    `);
    
    const tableNames = tables.map(t => t.TABLE_NAME);
    console.log(`✅ Found tables: ${tableNames.join(', ')}`);
    
    if (!tableNames.includes('limited_edition_drops')) {
      console.log('❌ limited_edition_drops table not found!');
      return;
    }
    
    if (!tableNames.includes('limited_edition_drop_products')) {
      console.log('❌ limited_edition_drop_products table not found!');
      return;
    }
    
    // 2. Check all limited edition drops
    console.log('\n🔍 CHECK 2: All Limited Edition Drops');
    console.log('-------------------------------------');
    
    const [allDrops] = await connection.execute(`
      SELECT id, title, description, start_date, end_date, is_active, created_at
      FROM limited_edition_drops
      ORDER BY created_at DESC
    `);
    
    if (allDrops.length === 0) {
      console.log('❌ No limited edition drops found in database');
      console.log('💡 Run: node setup-limited-drops.js to create sample drops');
      return;
    }
    
    console.log(`✅ Found ${allDrops.length} limited edition drop(s):`);
    allDrops.forEach((drop, index) => {
      console.log(`\n${index + 1}. Drop ID: ${drop.id}`);
      console.log(`   Title: ${drop.title}`);
      console.log(`   Description: ${drop.description}`);
      console.log(`   Start Date: ${drop.start_date}`);
      console.log(`   End Date: ${drop.end_date}`);
      console.log(`   Active: ${drop.is_active ? 'Yes' : 'No'}`);
      console.log(`   Created: ${drop.created_at}`);
      
      // Check if drop is currently active
      const now = new Date();
      const startDate = new Date(drop.start_date);
      const endDate = new Date(drop.end_date);
      
      if (drop.is_active && now >= startDate && now <= endDate) {
        console.log(`   Status: 🟢 ACTIVE (Currently running)`);
      } else if (now > endDate) {
        console.log(`   Status: 🔴 EXPIRED (End date passed)`);
      } else if (now < startDate) {
        console.log(`   Status: 🟡 SCHEDULED (Not started yet)`);
      } else {
        console.log(`   Status: ⚫ INACTIVE (Manually disabled)`);
      }
    });
    
    // 3. Check active drops specifically
    console.log('\n🔍 CHECK 3: Currently Active Drops');
    console.log('----------------------------------');
    
    const [activeDrops] = await connection.execute(`
      SELECT id, title, description, start_date, end_date
      FROM limited_edition_drops 
      WHERE is_active = 1 
      AND start_date <= NOW() 
      AND end_date >= NOW()
      ORDER BY created_at DESC
    `);
    
    if (activeDrops.length === 0) {
      console.log('❌ No currently active limited edition drops');
      console.log('💡 This is why the frontend shows static content');
    } else {
      console.log(`✅ Found ${activeDrops.length} currently active drop(s)`);
      activeDrops.forEach((drop, index) => {
        console.log(`\n${index + 1}. ${drop.title}`);
        console.log(`   ID: ${drop.id}`);
        console.log(`   End Date: ${drop.end_date}`);
        
        // Calculate time remaining
        const endTime = new Date(drop.end_date).getTime();
        const now = new Date().getTime();
        const timeLeft = endTime - now;
        
        if (timeLeft > 0) {
          const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
          const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
          console.log(`   Time Remaining: ${days}d ${hours}h ${minutes}m`);
        }
      });
    }
    
    // 4. Check products in active drops
    if (activeDrops.length > 0) {
      console.log('\n🔍 CHECK 4: Products in Active Drops');
      console.log('------------------------------------');
      
      for (const drop of activeDrops) {
        console.log(`\n📦 Drop: ${drop.title} (ID: ${drop.id})`);
        
        const [dropProducts] = await connection.execute(`
          SELECT p.id, p.name, p.price, p.compare_at_price, p.image_url, ledp.position,
                 GROUP_CONCAT(pi.image_url ORDER BY pi.position ASC SEPARATOR '|') as product_images
          FROM limited_edition_drop_products ledp
          INNER JOIN products p ON ledp.product_id = p.id
          LEFT JOIN product_images pi ON p.id = pi.product_id
          WHERE ledp.drop_id = ?
          GROUP BY p.id, p.name, p.price, p.compare_at_price, p.image_url, ledp.position
          ORDER BY ledp.position ASC
        `, [drop.id]);
        
        if (dropProducts.length === 0) {
          console.log('   ❌ No products found in this drop');
        } else {
          console.log(`   ✅ Found ${dropProducts.length} product(s):`);
          dropProducts.forEach((product, index) => {
            console.log(`   ${index + 1}. ${product.name}`);
            console.log(`      ID: ${product.id}`);
            console.log(`      Price: ₹${product.price}`);
            console.log(`      Compare Price: ${product.compare_at_price ? '₹' + product.compare_at_price : 'N/A'}`);
            console.log(`      Position: ${product.position}`);
            console.log(`      Main Image: ${product.image_url || 'None'}`);
            console.log(`      Additional Images: ${product.product_images ? product.product_images.split('|').length : 0}`);
          });
        }
      }
    }
    
    // 5. Test API endpoint simulation
    console.log('\n🔍 CHECK 5: API Endpoint Simulation');
    console.log('-----------------------------------');
    
    const [apiTest] = await connection.execute(`
      SELECT id, title, description, start_date, end_date
      FROM limited_edition_drops 
      WHERE is_active = 1 
      AND start_date <= NOW() 
      AND end_date >= NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `);
    
    if (apiTest.length === 0) {
      console.log('❌ API would return: { active: false }');
      console.log('💡 Frontend will show static content');
    } else {
      const drop = apiTest[0];
      console.log('✅ API would return active drop:');
      console.log(`   Drop ID: ${drop.id}`);
      console.log(`   Title: ${drop.title}`);
      console.log(`   End Date: ${drop.end_date}`);
      
      // Get products for this drop
      const [apiProducts] = await connection.execute(`
        SELECT p.id, p.name, p.price, p.compare_at_price, p.image_url, ledp.position,
               GROUP_CONCAT(pi.image_url ORDER BY pi.position ASC SEPARATOR '|') as product_images
        FROM limited_edition_drop_products ledp
        INNER JOIN products p ON ledp.product_id = p.id
        LEFT JOIN product_images pi ON p.id = pi.product_id
        WHERE ledp.drop_id = ?
        GROUP BY p.id, p.name, p.price, p.compare_at_price, p.image_url, ledp.position
        ORDER BY ledp.position ASC
      `, [drop.id]);
      
      console.log(`   Products: ${apiProducts.length} found`);
      apiProducts.forEach((product, index) => {
        console.log(`     ${index + 1}. ${product.name} (₹${product.price})`);
      });
    }
    
    console.log('\n📋 SUMMARY & RECOMMENDATIONS');
    console.log('============================');
    
    if (activeDrops.length === 0) {
      console.log('🎯 IMMEDIATE ACTIONS REQUIRED:');
      console.log('1. Run: node setup-limited-drops.js');
      console.log('2. Copy updated backend/server.js to VPS');
      console.log('3. Restart PM2: pm2 restart urban-nucleus');
      console.log('4. Test frontend limited drops section');
    } else {
      console.log('✅ Limited drops are properly configured!');
      console.log('🎯 NEXT STEPS:');
      console.log('1. Copy updated backend/server.js to VPS');
      console.log('2. Restart PM2: pm2 restart urban-nucleus');
      console.log('3. Test frontend limited drops section');
      console.log('4. Verify countdown timer and product display');
    }
    
  } catch (error) {
    console.error('❌ Error during diagnosis:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the diagnosis
diagnoseLimitedDrops();
