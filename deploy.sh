#!/bin/bash

# LSBA Quick Deployment Script
# Run this script to deploy to your preferred cloud platform

echo "🚀 LSBA Cloud Deployment Assistant"
echo "======================================"

# Check if git repo is clean
if [[ -n $(git status -s) ]]; then
    echo "⚠️  You have uncommitted changes. Committing them now..."
    git add .
    git commit -m "Prepare for cloud deployment - $(date)"
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main

echo ""
echo "Choose your deployment platform:"
echo "1) Vercel + Railway (Recommended)"
echo "2) Netlify + Railway"
echo "3) Azure Static Web Apps"
echo "4) Docker (Self-hosted)"
echo "5) Manual setup guide"

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo ""
        echo "🔧 Setting up Vercel + Railway deployment..."
        echo ""
        echo "STEP 1 - Deploy API to Railway:"
        echo "1. Go to https://railway.app"
        echo "2. Connect your GitHub account"
        echo "3. Create new project from GitHub repo"
        echo "4. Select /server as root directory"
        echo "5. Add these environment variables:"
        echo "   COSMOSDB_ENDPOINT=your_cosmos_endpoint"
        echo "   COSMOSDB_KEY=your_cosmos_key"
        echo "   COSMOSDB_DATABASE_ID=LSBADatabase"
        echo "   PORT=3001"
        echo "   ALLOWED_ORIGINS=https://your-app.vercel.app"
        echo ""
        echo "STEP 2 - Deploy Frontend to Vercel:"
        echo "1. Go to https://vercel.com"
        echo "2. Import your GitHub repository"
        echo "3. Set build command: npm run build"
        echo "4. Set output directory: dist"
        echo "5. Add environment variable: VITE_API_URL=https://your-api.railway.app"
        echo ""
        echo "✅ Your app will be live at: https://your-app.vercel.app"
        ;;
    2)
        echo ""
        echo "🔧 Setting up Netlify + Railway deployment..."
        echo ""
        echo "STEP 1 - Deploy API to Railway (same as option 1)"
        echo ""
        echo "STEP 2 - Deploy Frontend to Netlify:"
        echo "1. Go to https://netlify.com"
        echo "2. Connect your GitHub account"
        echo "3. Import your repository"
        echo "4. Build command: npm run build"
        echo "5. Publish directory: dist"
        echo "6. Environment variables: VITE_API_URL=https://your-api.railway.app"
        echo ""
        echo "✅ Your app will be live at: https://your-app.netlify.app"
        ;;
    3)
        echo ""
        echo "🔧 Azure Static Web Apps deployment..."
        echo "1. Install Azure CLI: curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash"
        echo "2. Login: az login"
        echo "3. Create resource group: az group create --name lsba-rg --location 'East US'"
        echo "4. Deploy: az staticwebapp create --name lsba-app --resource-group lsba-rg --source https://github.com/$(git config user.name)/lsba --location 'East US 2' --branch main --app-location '/' --api-location 'server' --output-location 'dist'"
        ;;
    4)
        echo ""
        echo "🐳 Docker deployment setup..."
        echo "1. Make sure you have a VPS with Docker installed"
        echo "2. Copy your .env file to the server"
        echo "3. Run: docker-compose up -d"
        echo "4. Your app will be available on port 80"
        echo ""
        echo "For HTTPS, set up Nginx reverse proxy with Let's Encrypt"
        ;;
    5)
        echo ""
        echo "📚 Opening manual setup guide..."
        echo "Please check CLOUD_DEPLOYMENT.md for detailed instructions"
        ;;
    *)
        echo "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment configuration complete!"
echo "📖 For detailed instructions, see: CLOUD_DEPLOYMENT.md"
echo "🔧 Need help? Check the deployment guide for troubleshooting"