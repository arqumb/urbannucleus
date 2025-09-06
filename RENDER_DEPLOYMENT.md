# 🚀 Render.com Deployment Guide

## 📋 Prerequisites
- GitHub repository with your code
- Render.com account
- VPS with MySQL database

## 🔧 Deployment Steps

### 1. Connect Repository to Render
1. Go to [render.com](https://render.com)
2. Sign up/Login with GitHub
3. Click "New +" → "Web Service"
4. Connect your repository: `arqumb/urbannucleus`

### 2. Configure Build Settings
- **Build Command**: `cd backend && npm install`
- **Start Command**: `cd backend && npm start`
- **Environment**: Node

### 3. Environment Variables
Add these environment variables in Render dashboard:

```
NODE_ENV=production
MYSQL_HOST=31.97.239.99
MYSQL_USER=render_user
MYSQL_PASSWORD=@Arqum123
MYSQL_DATABASE=urban_nucleus
MYSQL_PORT=3306
PORT=3000
DOMAIN_URL=https://your-app-name.onrender.com
```

### 4. VPS Database Configuration
Ensure your VPS MySQL allows external connections:

```bash
# Update MySQL config
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
# Change: bind-address = 0.0.0.0

# Create database user
sudo mysql
CREATE USER 'render_user'@'%' IDENTIFIED BY '@Arqum123';
GRANT ALL PRIVILEGES ON urban_nucleus.* TO 'render_user'@'%';
FLUSH PRIVILEGES;
```

### 5. Firewall Configuration
Add MySQL port to Hostinger firewall:
- Port 3306: MySQL
- Source: 0.0.0.0/0 (or Render IP ranges)

## ✅ After Deployment
- Your app will be available at: `https://your-app-name.onrender.com`
- Automatic HTTPS enabled
- Auto-deploy on git push

## 🔧 Troubleshooting
- Check Render logs for errors
- Verify database connection
- Ensure all environment variables are set
