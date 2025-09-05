#!/bin/bash

# Script to copy updated files to VPS
echo "🚀 Copying updated files to VPS..."

# Files that need to be copied
FILES=(
    "backend/server.js"
    "backend/email-config.js"
    "backend/env.production"
)

# Copy each file
for file in "${FILES[@]}"; do
    echo "📁 Copying $file..."
    # You would use scp or rsync here, but since you're using FileZilla, just copy these files manually
    echo "   ✅ $file needs to be copied to VPS"
done

echo "🎉 All files ready for copying!"
echo ""
echo "📋 Manual steps:"
echo "1. Copy these files to your VPS using FileZilla:"
echo "   - backend/server.js"
echo "   - backend/email-config.js" 
echo "   - backend/env.production"
echo ""
echo "2. Restart PM2 on your VPS:"
echo "   pm2 restart urban-nucleus"
echo ""
echo "3. Test your login functionality!"
