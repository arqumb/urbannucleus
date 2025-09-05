# Urban Nucleus VPS Error Fixes - Complete Guide

## 🚨 Issues Fixed

### 1. **Static File Serving Path Mismatch**
- **Problem**: Server.js was hardcoded to serve from `/var/www/urban-nucleus/` which caused issues
- **Fix**: Added dynamic path detection for both local and VPS environments
- **File**: `backend/server.js`

### 2. **Database Connection Issues**
- **Problem**: Basic MySQL connection without retry logic or error handling
- **Fix**: Added connection retry logic, timeout settings, and better error handling
- **File**: `backend/server.js`

### 3. **Server Startup Errors**
- **Problem**: No error handling for port conflicts or permission issues
- **Fix**: Added comprehensive error handling and graceful shutdown
- **File**: `backend/server.js`

### 4. **Environment Configuration**
- **Problem**: Missing production environment configuration
- **Fix**: Created `env.production` file with proper VPS settings
- **File**: `backend/env.production`

### 5. **PM2 Configuration**
- **Problem**: Basic PM2 setup without proper production settings
- **Fix**: Enhanced PM2 config with better error handling and environment detection
- **File**: `ecosystem.config.js`

## 📁 Files Modified/Created

### Modified Files:
- `backend/server.js` - Enhanced with error handling and dynamic paths
- `ecosystem.config.js` - Improved PM2 configuration

### New Files Created:
- `backend/env.production` - Production environment variables
- `fix-vps-errors.sh` - Comprehensive VPS error fix script
- `setup-database-vps-quick.sh` - Quick database setup script
- `VPS_ERROR_FIXES_INSTRUCTIONS.md` - This guide

## 🚀 Deployment Steps

### Step 1: Copy Fixed Files to VPS
```bash
# Using FileZilla, copy these files to your VPS:
# - backend/server.js
# - ecosystem.config.js
# - backend/env.production
# - fix-vps-errors.sh
# - setup-database-vps-quick.sh
# - FINAL_COMPLETE_DATABASE_SETUP.sql
```

### Step 2: Run the Error Fix Script
```bash
# SSH into your VPS
ssh root@31.97.239.99

# Navigate to project directory
cd /var/www/urban-nucleus

# Make scripts executable
chmod +x fix-vps-errors.sh
chmod +x setup-database-vps-quick.sh

# Run the comprehensive fix script
sudo ./fix-vps-errors.sh
```

### Step 3: Setup Database (if needed)
```bash
# If database setup is needed, run:
sudo ./setup-database-vps-quick.sh
```

### Step 4: Restart Services
```bash
# Restart PM2 application
pm2 restart urban-nucleus

# Restart Nginx
systemctl restart nginx

# Restart MySQL (if needed)
systemctl restart mysql
```

## 🔧 Manual Fixes (if scripts don't work)

### 1. Fix File Permissions
```bash
chown -R www-data:www-data /var/www/urban-nucleus
chmod -R 755 /var/www/urban-nucleus
chmod -R 777 /var/www/urban-nucleus/uploads
```

### 2. Check Service Status
```bash
# Check MySQL
systemctl status mysql

# Check Nginx
systemctl status nginx

# Check PM2
pm2 status
```

### 3. Check Logs
```bash
# PM2 logs
pm2 logs urban-nucleus

# Nginx logs
tail -f /var/log/nginx/error.log

# MySQL logs
tail -f /var/log/mysql/error.log
```

### 4. Test Database Connection
```bash
mysql -u urban_user -p'@Arqum789' -e "USE urban_nucleus; SELECT 'Connected!' as status;"
```

## 🌐 Test Your Website

### 1. Test Health Endpoint
```bash
curl http://31.97.239.99:3000/health
```

### 2. Test Website
- Open `http://31.97.239.99` in your browser
- Check if the homepage loads
- Test admin panel at `http://31.97.239.99/admin.html`

### 3. Test API Endpoints
```bash
# Test products endpoint
curl http://31.97.239.99:3000/products

# Test categories endpoint
curl http://31.97.239.99:3000/categories
```

## 🚨 Common Issues and Solutions

### Issue 1: Port 3000 Already in Use
```bash
# Check what's using port 3000
netstat -tuln | grep :3000

# Kill the process
sudo kill -9 <PID>

# Or restart PM2
pm2 restart urban-nucleus
```

### Issue 2: Database Connection Failed
```bash
# Check MySQL service
systemctl status mysql

# Test connection
mysql -u urban_user -p'@Arqum789' -e "USE urban_nucleus;"

# Check MySQL logs
tail -f /var/log/mysql/error.log
```

### Issue 3: Permission Denied
```bash
# Fix ownership
chown -R www-data:www-data /var/www/urban-nucleus

# Fix permissions
chmod -R 755 /var/www/urban-nucleus
chmod -R 777 /var/www/urban-nucleus/uploads
```

### Issue 4: Nginx Configuration Error
```bash
# Test nginx config
nginx -t

# If valid, reload
systemctl reload nginx

# If invalid, check the config file
nano /etc/nginx/sites-available/urban-nucleus
```

## 📞 Support Commands

### Quick Status Check
```bash
# All services status
systemctl status mysql nginx
pm2 status
netstat -tuln | grep :3000
```

### Restart Everything
```bash
# Restart all services
systemctl restart mysql
systemctl restart nginx
pm2 restart urban-nucleus
```

### View Real-time Logs
```bash
# PM2 logs
pm2 logs urban-nucleus --lines 100

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## ✅ Success Checklist

- [ ] All files copied to VPS
- [ ] Error fix script run successfully
- [ ] Database connection working
- [ ] PM2 application running
- [ ] Nginx serving static files
- [ ] Website accessible at IP address
- [ ] Admin panel working
- [ ] API endpoints responding
- [ ] No error logs showing

## 🎯 Next Steps

1. **Test all functionality** - Browse your website thoroughly
2. **Check admin panel** - Ensure you can manage products/categories
3. **Test payment flow** - Verify Razorpay integration works
4. **Monitor logs** - Keep an eye on error logs for any new issues
5. **Performance optimization** - Consider implementing caching if needed

## 📝 Notes

- The fixes maintain your existing database structure and logic
- All changes are backward compatible
- The scripts are designed to be safe and non-destructive
- If you encounter new errors, check the logs first
- Always backup your VPS before running major changes

---

**Need Help?** Check the logs first, then run the error fix script. The script will diagnose and fix most common issues automatically.

