# Cloudinary Setup Guide

## Why Cloudinary?
Render.com has an **ephemeral file system** - uploaded files disappear when you redeploy. Cloudinary provides persistent cloud storage for images.

## Setup Steps:

### 1. Create Cloudinary Account
1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. You'll get 25GB storage and 25GB bandwidth free

### 2. Get Your Credentials
After signing up, go to your dashboard and find:
- **Cloud Name** (e.g., `my-cloud-name`)
- **API Key** (e.g., `123456789012345`)
- **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz`)

### 3. Update Render Environment Variables
In your Render dashboard:
1. Go to your service
2. Go to "Environment" tab
3. Add these variables:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name_here
   CLOUDINARY_API_KEY=your_api_key_here
   CLOUDINARY_API_SECRET=your_api_secret_here
   ```

### 4. Redeploy
After adding the environment variables, redeploy your service.

## Benefits:
- ✅ **Persistent Storage**: Images survive redeploys
- ✅ **Automatic Optimization**: Images are automatically optimized
- ✅ **CDN Delivery**: Fast image loading worldwide
- ✅ **Free Tier**: 25GB storage + 25GB bandwidth
- ✅ **Automatic Resizing**: Images are resized to 800x800 max

## How It Works:
1. When you upload an image, it goes to Cloudinary
2. Cloudinary returns a permanent URL (e.g., `https://res.cloudinary.com/your-cloud/image/upload/v1234567890/urban-nucleus/products/filename.jpg`)
3. This URL is stored in your database
4. Images are served directly from Cloudinary's CDN

## Fallback:
If Cloudinary is not configured, the system falls back to local storage (which will still have the ephemeral issue on Render).

## Cost:
- **Free Tier**: 25GB storage, 25GB bandwidth/month
- **Paid Plans**: Start at $89/month for more storage/bandwidth
- For most small-medium stores, the free tier is sufficient
