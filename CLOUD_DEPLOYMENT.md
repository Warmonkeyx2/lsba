# LSBA Cloud Deployment Guide

## 🚀 Quick Deploy Options

### Option 1: Vercel + Railway (Recommended - Easiest)

#### Deploy API Server to Railway:
1. **Create Railway account**: https://railway.app
2. **Connect GitHub**: Link your repository
3. **Deploy API**:
   ```bash
   # Push your code to GitHub first
   git add .
   git commit -m "Add deployment configs"
   git push origin main
   ```
4. **In Railway dashboard**:
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Set Root Directory to: `server` (important!)
   - Add environment variables:
     ```
     COSMOSDB_ENDPOINT=your_cosmos_endpoint
     COSMOSDB_KEY=your_cosmos_key
     COSMOSDB_DATABASE_ID=LSBADatabase
     PORT=3001
     ALLOWED_ORIGINS=https://your-app.vercel.app
     ```
5. **Get your Railway URL**: Railway will give you a real URL like `https://web-production-abc123.railway.app`

#### Deploy Frontend to Vercel:
1. **Create Vercel account**: https://vercel.com
2. **Connect GitHub**: Link your repository
3. **Deploy frontend**:
   - Click "New Project" → Import your GitHub repo
   - Root Directory: `./` (leave as default)
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Add environment variable**:
   ```
   VITE_API_URL=https://your-api.railway.app
   ```
5. **Update vercel.json** with your actual Railway URL

### Option 2: Netlify + Railway

#### Deploy API to Railway (same as above)

#### Deploy Frontend to Netlify:
1. **Create Netlify account**: https://netlify.com
2. **Connect GitHub**: Link your repository
3. **Deploy**:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Environment variable: `VITE_API_URL=https://your-api.railway.app`

### Option 3: Azure (All-in-One)

#### Deploy to Azure Static Web Apps:
1. **Create Azure account**: https://azure.microsoft.com
2. **Install Azure CLI**:
   ```bash
   curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
   ```
3. **Login and deploy**:
   ```bash
   az login
   az staticwebapp create \
     --name lsba-app \
     --resource-group your-resource-group \
     --source https://github.com/your-username/lsba \
     --location "East US 2" \
     --branch main \
     --app-location "/" \
     --api-location "server" \
     --output-location "dist"
   ```

### Option 4: Docker Deployment (VPS/Cloud Server)

#### Prerequisites:
- VPS with Docker installed (DigitalOcean, AWS EC2, etc.)
- Domain name pointed to your server IP

#### Deploy with Docker Compose:
1. **Copy files to server**:
   ```bash
   scp -r . user@your-server:/home/user/lsba
   ```

2. **Create .env file on server**:
   ```bash
   cd /home/user/lsba
   cp server/.env.example .env
   # Edit .env with your CosmosDB credentials
   ```

3. **Deploy**:
   ```bash
   docker-compose up -d
   ```

4. **Set up Nginx reverse proxy** (for HTTPS):
   ```bash
   sudo apt update
   sudo apt install nginx certbot python3-certbot-nginx
   
   # Configure domain
   sudo nano /etc/nginx/sites-available/lsba
   ```

## 🔧 Post-Deployment Setup

### 1. Update CORS Settings
Update your API server's ALLOWED_ORIGINS with your actual domain:
```
ALLOWED_ORIGINS=https://your-app.vercel.app,https://your-domain.com
```

### 2. Configure CosmosDB
- Ensure your CosmosDB allows connections from your cloud provider
- Update firewall rules if needed

### 3. Test Your Deployment
Visit your deployed URL and verify:
- ✅ Frontend loads
- ✅ API health check: `https://your-api-url/health`
- ✅ Data loads from CosmosDB
- ✅ All features work (betting, timers, etc.)

## 🌐 Access Your LSBA System

After deployment, share this with users:
- **Main App**: `https://your-domain.com`
- **Features Available**:
  - Register boxers and sponsors
  - Create fight cards with countdown timers
  - Place and settle bets (with State ID verification)
  - View real-time leaderboards
  - Manage tournaments

## 💡 Pro Tips

1. **Start with Vercel + Railway** - easiest and free tier available
2. **Get a custom domain** for professional appearance
3. **Set up monitoring** with your cloud provider
4. **Enable automatic deployments** from your GitHub repository
5. **Set up backup strategy** for your CosmosDB data

## 📞 Support

If you encounter issues:
1. Check deployment logs in your cloud platform
2. Verify environment variables are set correctly
3. Test API health endpoint: `/health`
4. Check CosmosDB connection and firewall settings

Your LSBA system is now ready for global access! 🎉