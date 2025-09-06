// Check what user data is stored in localStorage
console.log('=== User Data Check ===');

// Check if currentUser exists in localStorage
const currentUser = localStorage.getItem('currentUser');
console.log('Raw currentUser data:', currentUser);

if (currentUser) {
    try {
        const user = JSON.parse(currentUser);
        console.log('Parsed user object:', user);
        console.log('User ID:', user.id);
        console.log('Username:', user.username);
        console.log('Email:', user.email);
    } catch (error) {
        console.error('Error parsing user data:', error);
    }
} else {
    console.log('No currentUser found in localStorage');
}

// Check all localStorage items
console.log('\n=== All localStorage items ===');
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    console.log(`${key}:`, value);
}




