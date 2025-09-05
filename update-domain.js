// Script to update all IP addresses to domain name
const fs = require('fs');
const path = require('path');

// Configuration
const OLD_IP = '31.97.239.99';
const OLD_URL = 'http://31.97.239.99:3000';
const NEW_DOMAIN = 'urbannucleus.in'; // Your actual domain
const NEW_URL = `https://${NEW_DOMAIN}`;

// Files to update (relative to project root)
const FILES_TO_UPDATE = [
    'backend/env.production',
    'backend/payment-config.js',
    'product-detail.html',
    'collections.html',
    'admin.js',
    'checkout.html',
    'cart.html',
    'category.html',
    'about.html',
    'index.html',
    'contact.html',
    'faq.html',
    'login.html',
    'privacy-policy.html',
    'signup.html',
    'return-policy.html',
    'shipping-policy.html',
    'subcategory.html',
    'terms-of-service.html',
    'reset-password.html',
    'forgot-password.html',
    'profile.html',
    'cart.optimized.html',
    'product-detail.optimized.html',
    'category.optimized.html'
];

function updateFile(filePath) {
    try {
        const fullPath = path.join(__dirname, filePath);
        
        if (!fs.existsSync(fullPath)) {
            console.log(`⚠️  File not found: ${filePath}`);
            return;
        }
        
        let content = fs.readFileSync(fullPath, 'utf8');
        let updated = false;
        
        // Replace IP address with domain
        if (content.includes(OLD_IP)) {
            content = content.replace(new RegExp(OLD_IP, 'g'), NEW_DOMAIN);
            updated = true;
        }
        
        // Replace old URL with new URL
        if (content.includes(OLD_URL)) {
            content = content.replace(new RegExp(OLD_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), NEW_URL);
            updated = true;
        }
        
        // Replace HTTP with HTTPS for production
        if (content.includes(`http://${NEW_DOMAIN}`)) {
            content = content.replace(new RegExp(`http://${NEW_DOMAIN}`, 'g'), NEW_URL);
            updated = true;
        }
        
        if (updated) {
            fs.writeFileSync(fullPath, content, 'utf8');
            console.log(`✅ Updated: ${filePath}`);
        } else {
            console.log(`⏭️  No changes needed: ${filePath}`);
        }
        
    } catch (error) {
        console.error(`❌ Error updating ${filePath}:`, error.message);
    }
}

function main() {
    console.log('🌐 Updating domain configuration...');
    console.log(`📝 Old IP: ${OLD_IP}`);
    console.log(`📝 New Domain: ${NEW_DOMAIN}`);
    console.log(`📝 New URL: ${NEW_URL}`);
    console.log('');
    
    if (NEW_DOMAIN === 'yourdomain.com') {
        console.log('⚠️  WARNING: Please update NEW_DOMAIN variable with your actual domain name!');
        console.log('   Edit this script and change: const NEW_DOMAIN = "yourdomain.com";');
        console.log('   To: const NEW_DOMAIN = "yourdomain.com";');
        return;
    }
    
    FILES_TO_UPDATE.forEach(updateFile);
    
    console.log('');
    console.log('🎉 Domain update completed!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Copy updated files to VPS');
    console.log('2. Update DNS settings to point domain to your VPS IP');
    console.log('3. Set up SSL certificate');
    console.log('4. Restart PM2 on VPS');
}

main();
