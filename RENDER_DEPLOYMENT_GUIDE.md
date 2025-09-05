# 🚀 Urban Nucleus - Render.com Deployment Guide

## 📋 **What We're Setting Up:**

- **Website:** Hosted on Render.com (free tier)
- **Database:** MySQL on your VPS (31.97.239.99)
- **Domain:** Render provides free subdomain + SSL

## ✅ **Files Created:**

1. `package.json` - Dependencies and scripts
2. `render.yaml` - Render deployment configuration
3. `env.production` - Environment variables
4. Updated `server.js` - Port configuration

## 🚀 **Deployment Steps:**

### **Step 1: Prepare Your VPS Database**

**On your VPS, allow external connections:**
```bash
# Edit MySQL config
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf

# Find this line and comment it out:
# bind-address = 127.0.0.1

# Restart MySQL
sudo systemctl restart mysql

# Create user for external access
mysql -u root -p
CREATE USER 'render_user'@'%' IDENTIFIED BY 'secure_password_123';
GRANT ALL PRIVILEGES ON urban_nucleus.* TO 'render_user'@'%';
FLUSH PRIVILEGES;
EXIT;
```

### **Step 2: Update Environment Variables**

**Edit `env.production` with your details:**
- Update `DB_PASSWORD` to the new user password
- Update `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
- Update `JWT_SECRET` to a secure random string
- Update email credentials

### **Step 3: Deploy to Render**

1. **Create GitHub repository** with your code
2. **Go to Render.com** and sign up
3. **Connect your GitHub** repository
4. **Create new Web Service**
5. **Configure:**
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node.js
   - **Plan:** Free

### **Step 4: Set Environment Variables in Render**

**In Render dashboard, add these environment variables:**
- `NODE_ENV=production`
- `PORT=10000`
- `DB_HOST=31.97.239.99`
- `DB_USER=render_user`
- `DB_PASSWORD=secure_password_123`
- `DB_NAME=urban_nucleus`
- `DB_PORT=3306`
- `DOMAIN_URL=https://your-app-name.onrender.com`
- `RAZORPAY_KEY_ID=your_live_key`
- `RAZORPAY_KEY_SECRET=your_live_secret`
- `JWT_SECRET=your-secure-jwt-secret`

## 🎉 **Benefits:**

- ✅ **Free hosting** on Render
- ✅ **Automatic SSL** certificates
- ✅ **Easy deployment** from GitHub
- ✅ **Auto-scaling** and monitoring
- ✅ **Professional subdomain** (your-app.onrender.com)
- ✅ **Database on VPS** (your data stays with you)

## 🔧 **After Deployment:**

1. **Test your website** on the Render URL
2. **Update your domain** to point to Render (optional)
3. **Monitor performance** in Render dashboard
4. **Set up custom domain** if needed

## 💡 **Next Steps:**

1. **Prepare VPS database** for external access
2. **Update environment variables**
3. **Deploy to Render**
4. **Test everything works**

**Your website will be live on Render with automatic SSL and professional hosting! 🚀**
