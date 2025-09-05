const mysql = require('mysql2/promise');

// Database configuration - using environment variables or default VPS settings
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Arqum789', // Default VPS password
  database: process.env.DB_NAME || 'urban_nucleus',
  port: process.env.DB_PORT || 3306
};

async function testConnection() {
  let connection;
  
  try {
    console.log('🔗 Testing database connection...');
    console.log('📊 Connection config:', {
      host: dbConfig.host,
      user: dbConfig.user,
      database: dbConfig.database,
      port: dbConfig.port,
      password: dbConfig.password ? '***' : 'none'
    });
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database successfully!');
    
    // Test a simple query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Database query test successful:', rows[0]);
    
    // Check if urban_nucleus database exists
    const [databases] = await connection.execute('SHOW DATABASES');
    const dbExists = databases.some(db => db.Database === 'urban_nucleus');
    
    if (dbExists) {
      console.log('✅ urban_nucleus database exists');
      
      // Check if limited_edition_drops table exists
      const [tables] = await connection.execute(`
        SELECT TABLE_NAME 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = 'urban_nucleus' 
        AND TABLE_NAME = 'limited_edition_drops'
      `);
      
      if (tables.length > 0) {
        console.log('✅ limited_edition_drops table exists');
        
        // Check if there are any drops
        const [drops] = await connection.execute('SELECT COUNT(*) as count FROM limited_edition_drops');
        console.log(`📊 Found ${drops[0].count} limited edition drop(s) in database`);
      } else {
        console.log('❌ limited_edition_drops table does not exist');
        console.log('💡 You may need to run the database setup script first');
      }
    } else {
      console.log('❌ urban_nucleus database does not exist');
      console.log('💡 You need to create the database first');
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_NO_PASSWORD_ERROR') {
      console.log('\n💡 SOLUTION: MySQL root user requires a password');
      console.log('Try one of these:');
      console.log('1. Set environment variable: export DB_PASSWORD="your_password"');
      console.log('2. Or modify the script with the correct password');
      console.log('3. Or create a MySQL user with proper permissions');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('\n💡 SOLUTION: Database does not exist');
      console.log('Run: mysql -u root -p -e "CREATE DATABASE urban_nucleus;"');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 SOLUTION: MySQL service is not running');
      console.log('Run: systemctl start mysql');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the test
testConnection();
