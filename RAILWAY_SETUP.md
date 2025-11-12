# 🚂 Railway API Server Deployment Guide

## 🎯 **Deploy Your API Server to Railway:**

### Step 1: Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub (recommended)
3. Connect your GitHub account

### Step 2: Deploy API Server
1. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `lsba` repository

2. **Configure Root Directory**:
   - After connecting, Railway will ask about the root directory
   - Set Root Directory to: `server`
   - This tells Railway to deploy only the API server part

3. **Environment Variables**:
   Add these in Railway dashboard → Variables:
   ```
   COSMOSDB_ENDPOINT=https://your-cosmos-account.documents.azure.com:443/
   COSMOSDB_KEY=your-cosmos-primary-key
   COSMOSDB_DATABASE_ID=LSBADatabase
   PORT=3001
   NODE_ENV=production
   ```

4. **Deploy**:
   - Railway will automatically build and deploy
   - You'll get a URL like: `https://your-app-name.railway.app`

### Step 3: Get Your Railway URL
After deployment, you'll see something like:
- `https://lsba-api-production-xxxx.railway.app`
- `https://web-production-xxxx.railway.app`

**This is your real API URL!** 

### Step 4: Update Vercel with Real URL
1. Go to Vercel dashboard
2. Your project → Settings → Environment Variables
3. Update `VITE_API_URL` with your actual Railway URL:
   ```
   VITE_API_URL=https://your-actual-railway-url.railway.app
   ```

## 🔧 **Quick Railway Alternative Commands:**

### Option A: Railway CLI (if you prefer terminal)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy from server directory
cd /workspaces/lsba/server
railway up
```

### Option B: One-Click Deploy
Use this Railway template button (I'll create one for you):

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/Warmonkeyx2/lsba&referralCode=bonus)

## 🎯 **What You'll Get:**
- **Real API URL**: `https://your-unique-name.railway.app`
- **Automatic HTTPS**: Railway provides SSL
- **Environment**: Production-ready with monitoring
- **Scaling**: Automatic scaling based on usage

## ✅ **After Railway Deployment:**
1. **Test your API**: Visit `https://your-url.railway.app/health`
2. **Update Vercel**: Change environment variable to real URL
3. **Redeploy Vercel**: Your frontend will connect to real API

## 💡 **Pro Tips:**
- **Free Tier**: Railway gives you $5 free monthly credit
- **Custom Domain**: You can add your own domain later
- **Monitoring**: Railway provides logs and metrics
- **Auto-Deploy**: Updates when you push to GitHub

Your API will be live at a real URL, not the placeholder example! 🚀