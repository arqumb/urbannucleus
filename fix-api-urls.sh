#!/bin/bash

# Fix API_BASE_URL in all HTML files
# This script updates the API_BASE_URL from IP only to IP:3000

echo "🔧 Fixing API_BASE_URL in all HTML files..."
echo "============================================="

# Function to fix API URLs in a file
fix_api_url() {
    local file=$1
    if [ -f "$file" ]; then
        echo "Fixing: $file"
        # Replace the old API_BASE_URL with the correct one
        sed -i 's|const API_BASE_URL = '\''http://31.97.239.99'\''|const API_BASE_URL = '\''http://31.97.239.99:3000'\''|g' "$file"
        sed -i 's|<script>const API_BASE_URL = '\''http://31.97.239.99'\''</script>|<script>const API_BASE_URL = '\''http://31.97.239.99:3000'\''</script>|g' "$file"
        echo "✅ Fixed: $file"
    else
        echo "❌ File not found: $file"
    fi
}

# List of HTML files to fix
html_files=(
    "about.html"
    "collections.html"
    "category.html"
    "cart.optimized.html"
    "cart.html"
    "checkout.html"
    "contact.html"
    "category.optimized.html"
    "faq.html"
    "index.html"
    "forgot-password.html"
    "login.html"
    "privacy-policy.html"
    "product-detail.optimized.html"
    "profile.html"
    "product-detail.html"
    "subcategory.html"
    "signup.html"
    "terms-of-service.html"
    "shipping-policy.html"
    "return-policy.html"
    "reset-password.html"
)

# Fix each file
for file in "${html_files[@]}"; do
    fix_api_url "$file"
done

echo ""
echo "🎉 API_BASE_URL fix completed!"
echo "All HTML files now point to http://31.97.239.99:3000"
echo ""
echo "Next steps:"
echo "1. Copy these fixed files to your VPS"
echo "2. Restart your Node.js application"
echo "3. Test the admin panel product saving"








