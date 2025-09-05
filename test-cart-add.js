// Test script to check cart add functionality
const API_BASE_URL = 'https://urbannucleus.in';

async function testCartAdd() {
    try {
        console.log('🧪 Testing cart add functionality...');
        
        // Test data
        const testCartItem = {
            userId: 1, // Assuming user ID 1 exists
            productId: 2, // Assuming product ID 2 exists
            size: 'N/A',
            quantity: 1
        };
        
        console.log('Sending request to:', `${API_BASE_URL}/cart/add`);
        console.log('Request data:', testCartItem);
        
        const response = await fetch(`${API_BASE_URL}/cart/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testCartItem)
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error response:', errorText);
            return;
        }
        
        const result = await response.json();
        console.log('✅ Success response:', result);
        
    } catch (error) {
        console.error('❌ Network error:', error.message);
    }
}

testCartAdd();
