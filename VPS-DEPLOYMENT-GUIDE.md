# Urban Nucleus VPS Deployment Guide

## 🚨 Current Issues & Solutions

Your VPS has several deployment issues that need to be fixed:

1. **Server not running** - PM2 configuration problems
2. **LiteSpeed instead of Nginx** - Wrong web server
3. **Database integration missing** - MySQL connection issues
4. **Website not accessible** - Configuration problems

## 🚀 Quick Fix (Recommended First Step)

Run the quick fix script to resolve immediate issues:

```bash
# Make scripts executable
chmod +x *.sh

# Run quick fix
./quick-fix-vps.sh
```

This script will:
- Stop LiteSpeed
- Install and configure Nginx
- Install MySQL and Node.js
- Set up PM2
- Create necessary directories
- Configure basic services

## 📋 Complete Deployment Process

### Step 1: Upload Files to VPS

Upload your entire `un` folder to `/var/www/urban-nucleus/` on your VPS:

```bash
# On your local machine, compress the folder
zip -r urban-nucleus.zip un/

# Upload to VPS (replace with your VPS IP)
scp urban-nucleus.zip root@31.97.239.99:/tmp/

# On VPS, extract and move
cd /tmp
unzip urban-nucleus.zip
mv un/* /var/www/urban-nucleus/
chown -R www-data:www-data /var/www/urban-nucleus
```

### Step 2: Run Full Deployment Script

```bash
cd /var/www/urban-nucleus
./deploy-vps.sh
```

### Step 3: Setup Database

```bash
./setup-database-vps.sh
```

### Step 4: Test Application

```bash
# Check if everything is working
./troubleshoot-vps.sh

# Check specific services
systemctl status nginx
systemctl status mysql
pm2 status
```

## 🔧 Manual Configuration Steps

### 1. Stop LiteSpeed

```bash
systemctl stop lsws
systemctl disable lsws
```

### 2. Install Nginx

```bash
apt update
apt install -y nginx
```

### 3. Configure Nginx

```bash
# Copy the provided config
cp nginx-urban-nucleus.conf /etc/nginx/sites-available/urban-nucleus

# Enable the site
ln -sf /etc/nginx/sites-available/urban-nucleus /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and restart
nginx -t
systemctl restart nginx
systemctl enable nginx
```

### 4. Install Node.js and PM2

```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install PM2
npm install -g pm2
```

### 5. Setup MySQL

```bash
# Create database and user
mysql -e "CREATE DATABASE IF NOT EXISTS urban_nucleus CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -e "CREATE USER IF NOT EXISTS 'urban_user'@'localhost' IDENTIFIED BY '@Arqum789';"
mysql -e "GRANT ALL PRIVILEGES ON urban_nucleus.* TO 'urban_user'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"

# Start and enable MySQL
systemctl start mysql
systemctl enable mysql
```

### 6. Install Dependencies

```bash
cd /var/www/urban-nucleus
npm install

cd backend
npm install
```

### 7. Start with PM2

```bash
cd /var/www/urban-nucleus
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

## 🌐 Access Your Website

After successful deployment:

- **Main Website**: http://31.97.239.99
- **Admin Panel**: http://31.97.239.99/admin.html
- **API Health Check**: http://31.97.239.99/health

## 🔍 Troubleshooting

### Common Issues & Solutions

#### 1. Website Still Not Accessible

```bash
# Check Nginx status
systemctl status nginx

# Check Nginx error logs
tail -f /var/log/nginx/error.log

# Check if port 80 is open
netstat -tuln | grep :80
```

#### 2. Node.js App Not Running

```bash
# Check PM2 status
pm2 status

# Check PM2 logs
pm2 logs urban-nucleus

# Restart PM2
pm2 restart all
```

#### 3. Database Connection Issues

```bash
# Test MySQL connection
mysql -u urban_user -p'@Arqum789' -e "USE urban_nucleus; SELECT 'Connected!' as status;"

# Check MySQL service
systemctl status mysql
```

#### 4. Permission Issues

```bash
# Fix file permissions
chown -R www-data:www-data /var/www/urban-nucleus
chmod -R 755 /var/www/urban-nucleus/uploads
```

### Run Troubleshooting Script

```bash
# Comprehensive troubleshooting
./troubleshoot-vps.sh

# Restart all services
./troubleshoot-vps.sh restart
```

## 📊 Monitoring & Maintenance

### Check Application Status

```bash
# PM2 status
pm2 status

# Service status
systemctl status nginx
systemctl status mysql

# Application logs
pm2 logs urban-nucleus
tail -f /var/log/urban-nucleus/err.log
```

### Restart Services

```bash
# Restart Nginx
systemctl restart nginx

# Restart MySQL
systemctl restart mysql

# Restart PM2
pm2 restart all
```

## 🔒 Security Considerations

### Firewall Configuration

```bash
# Allow necessary ports
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS

# Enable firewall
ufw --force enable
```

### SSL Certificate (Recommended)

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d yourdomain.com
```

## 📝 File Structure on VPS

```
/var/www/urban-nucleus/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── node_modules/
├── uploads/
│   ├── images/
│   ├── videos/
│   └── hero-slides/
├── ecosystem.config.js
├── package.json
└── *.html, *.js, *.css files
```

## 🆘 Getting Help

If you encounter issues:

1. **Run troubleshooting script**: `./troubleshoot-vps.sh`
2. **Check service logs**: `journalctl -u [service_name] -f`
3. **Check PM2 logs**: `pm2 logs urban-nucleus`
4. **Verify file permissions**: `ls -la /var/www/urban-nucleus/`

## ✅ Success Checklist

- [ ] LiteSpeed stopped and disabled
- [ ] Nginx installed and configured
- [ ] MySQL running and accessible
- [ ] Node.js and PM2 installed
- [ ] Application dependencies installed
- [ ] PM2 process running
- [ ] Website accessible on port 80
- [ ] Database tables created
- [ ] File permissions correct
- [ ] Firewall configured

## 🎯 Next Steps After Deployment

1. **Import your existing data** (if any)
2. **Configure SSL certificate** for HTTPS
3. **Set up automated backups**
4. **Configure monitoring and alerts**
5. **Test all website functionality**
6. **Set up domain name** (if you have one)

---

**Note**: This guide assumes you're running the commands as root or with sudo privileges on your VPS. If you're using a different user, prefix commands with `sudo` where necessary.
