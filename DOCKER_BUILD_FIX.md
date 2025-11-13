# LSBA Docker Build Fix Instructions

## 🐳 Docker Build Error Resolution

### The Error You Saw:
```
Cannot find package '@vitejs/plugin-react-swc' imported from vite.config.ts
```

### ✅ **FIXED!** 

The issue was that the Dockerfile was using `npm ci --only=production`, which excludes devDependencies needed for the build process.

## 🔧 **What I Fixed:**

### 1. Updated Dockerfile:
```dockerfile
# Changed from:
RUN npm ci --only=production

# To:
RUN npm ci
```

This ensures all dependencies (including devDependencies) are installed for the build.

### 2. Alternative Optimized Dockerfile:
Created `Dockerfile.optimized` with:
- Better layer caching
- Health checks
- Proper security permissions
- Build verification

## 🚀 **Test the Fix:**

### Option 1: Test Docker Build Locally
```bash
cd /workspaces/lsba
docker build -t lsba-frontend .
```

### Option 2: Use Optimized Dockerfile
```bash
docker build -f Dockerfile.optimized -t lsba-frontend-opt .
```

### Option 3: Test with Docker Compose
```bash
docker-compose build
docker-compose up
```

## 📋 **For Vercel Deployment:**

Good news! Vercel doesn't use Docker, so this fix is mainly for:
- Self-hosted deployments
- Docker-based cloud platforms
- Local development with Docker

**For Vercel**: Just ensure your dashboard settings are:
- Framework: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

## 🎯 **Root Cause:**

Vite needs its plugins (`@vitejs/plugin-react-swc`) during build time, but these are in `devDependencies`. The original Dockerfile excluded them, causing the build to fail.

## ✅ **Next Steps:**

1. **For Docker**: Use the updated Dockerfile
2. **For Vercel**: Continue with dashboard deployment
3. **For other platforms**: This fix applies universally

Your LSBA app should now build successfully in any environment! 🎉