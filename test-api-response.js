// Simple test to check what the categories API returns
const API_BASE_URL = 'https://urbannucleus.in';

async function testCategoriesAPI() {
    try {
        console.log('🔍 Testing categories API...');
        console.log('API URL:', `${API_BASE_URL}/categories`);
        
        const response = await fetch(`${API_BASE_URL}/categories`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const categories = await response.json();
        console.log('✅ API Response received');
        console.log('Number of categories:', categories.length);
        
        console.log('\n📋 Categories data:');
        categories.forEach((category, index) => {
            console.log(`\nCategory ${index + 1}:`);
            console.log(`  - ID: ${category.id}`);
            console.log(`  - Name: ${category.name}`);
            console.log(`  - Image: ${category.image || 'NULL/UNDEFINED'}`);
            console.log(`  - Image type: ${typeof category.image}`);
            if (category.image) {
                console.log(`  - Image URL: ${category.image}`);
            }
        });
        
        // Check if any categories have images
        const categoriesWithImages = categories.filter(cat => cat.image);
        console.log(`\n📊 Summary:`);
        console.log(`  - Total categories: ${categories.length}`);
        console.log(`  - Categories with images: ${categoriesWithImages.length}`);
        console.log(`  - Categories without images: ${categories.length - categoriesWithImages.length}`);
        
    } catch (error) {
        console.error('❌ Error testing API:', error.message);
    }
}

testCategoriesAPI();
