// Domain Configuration for Urban Nucleus
// Update this file when you get your domain

const DOMAIN_CONFIG = {
    // Current IP-based setup
    CURRENT: {
        PROTOCOL: 'http',
        DOMAIN: '31.97.239.99',
        PORT: '3000',
        FULL_URL: 'http://31.97.239.99:3000'
    },
    
    // Your new domain (urbannucleus.in)
    PRODUCTION: {
        PROTOCOL: 'https',  // Use HTTPS for production
        DOMAIN: 'urbannucleus.in',  // Your actual domain
        PORT: '',  // No port needed for standard web ports
        FULL_URL: 'https://urbannucleus.in'
    },
    
    // Development/Local setup
    DEVELOPMENT: {
        PROTOCOL: 'http',
        DOMAIN: 'localhost',
        PORT: '3000',
        FULL_URL: 'http://localhost:3000'
    }
};

// Auto-detect environment
const isDevelopment = process.env.NODE_ENV !== 'production';
const isProduction = process.env.NODE_ENV === 'production';

// Get current configuration
function getCurrentConfig() {
    if (isDevelopment) {
        return DOMAIN_CONFIG.DEVELOPMENT;
    } else if (isProduction && DOMAIN_CONFIG.PRODUCTION.DOMAIN !== 'yourdomain.com') {
        return DOMAIN_CONFIG.PRODUCTION;
    } else {
        return DOMAIN_CONFIG.CURRENT;
    }
}

const currentConfig = getCurrentConfig();

module.exports = {
    DOMAIN_CONFIG,
    currentConfig,
    isDevelopment,
    isProduction
};

/*
DOMAIN SETUP INSTRUCTIONS:
==========================

1. BUY A DOMAIN:
   - Go to GoDaddy, Namecheap, or Google Domains
   - Search for available domains (e.g., urbannucleus.com)
   - Purchase the domain

2. POINT DOMAIN TO YOUR VPS:
   - In your domain registrar's DNS settings:
   - Add A record: @ → 31.97.239.99
   - Add A record: www → 31.97.239.99
   - Add CNAME record: www → yourdomain.com

3. UPDATE CONFIGURATION:
   - Replace 'yourdomain.com' with your actual domain
   - Update all files that use the IP address

4. SET UP SSL CERTIFICATE:
   - Use Let's Encrypt (free SSL)
   - Or buy SSL certificate from your domain provider

5. UPDATE NGINX CONFIGURATION:
   - Configure nginx to serve your domain
   - Set up SSL redirect

EXAMPLE DOMAIN NAMES:
- urbannucleus.com
- urbannucleus.in
- urbannucleus.shop
- urbannucleus.store
*/
