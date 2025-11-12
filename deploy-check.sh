#!/bin/bash

# LSBA Web Application Deployment Verification Script

echo "🥊 LSBA Management System - Deployment Verification"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if command exists
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✅ $1 is installed${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 is not installed${NC}"
        return 1
    fi
}

# Function to check file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅ $1 exists${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 not found${NC}"
        return 1
    fi
}

echo ""
echo "1. Checking Prerequisites..."
echo "----------------------------"
check_command "node"
check_command "npm"

echo ""
echo "2. Checking Project Structure..."
echo "--------------------------------"
check_file "package.json"
check_file "vite.config.ts"
check_file "tsconfig.json"
check_file "src/lib/cosmosdb.ts"
check_file ".env.example"

echo ""
echo "3. Checking Dependencies..."
echo "---------------------------"
if grep -q "@azure/cosmos" package.json; then
    echo -e "${GREEN}✅ Azure CosmosDB SDK installed${NC}"
else
    echo -e "${RED}❌ Azure CosmosDB SDK not found${NC}"
fi

if grep -q "react" package.json; then
    echo -e "${GREEN}✅ React dependencies found${NC}"
else
    echo -e "${RED}❌ React dependencies missing${NC}"
fi

echo ""
echo "4. Running Build Test..."
echo "------------------------"
echo "Building application for production..."

if npm run build > build.log 2>&1; then
    echo -e "${GREEN}✅ Build successful${NC}"
    
    if [ -d "dist" ]; then
        echo -e "${GREEN}✅ dist/ directory created${NC}"
        
        # Check if main files exist
        if [ -f "dist/index.html" ]; then
            echo -e "${GREEN}✅ index.html generated${NC}"
        else
            echo -e "${RED}❌ index.html not found in dist/${NC}"
        fi
        
        # Check for JavaScript bundles
        if ls dist/assets/*.js 1> /dev/null 2>&1; then
            echo -e "${GREEN}✅ JavaScript bundles created${NC}"
        else
            echo -e "${RED}❌ No JavaScript bundles found${NC}"
        fi
        
        # Check for CSS files
        if ls dist/assets/*.css 1> /dev/null 2>&1; then
            echo -e "${GREEN}✅ CSS files created${NC}"
        else
            echo -e "${YELLOW}⚠️  No CSS files found (might be inlined)${NC}"
        fi
        
    else
        echo -e "${RED}❌ dist/ directory not created${NC}"
    fi
else
    echo -e "${RED}❌ Build failed${NC}"
    echo "Check build.log for details"
fi

echo ""
echo "5. Environment Configuration Check..."
echo "------------------------------------"
if [ -f ".env.example" ]; then
    echo -e "${GREEN}✅ Environment template exists${NC}"
    
    # Check for required environment variables
    required_vars=("VITE_COSMOSDB_ENDPOINT" "VITE_COSMOSDB_KEY" "VITE_COSMOSDB_DATABASE_ID")
    for var in "${required_vars[@]}"; do
        if grep -q "$var" .env.example; then
            echo -e "${GREEN}✅ $var template found${NC}"
        else
            echo -e "${RED}❌ $var template missing${NC}"
        fi
    done
else
    echo -e "${RED}❌ .env.example not found${NC}"
fi

echo ""
echo "6. Azure CosmosDB Integration Check..."
echo "-------------------------------------"
if grep -q "CosmosClient" src/lib/cosmosdb.ts; then
    echo -e "${GREEN}✅ CosmosDB client configured${NC}"
else
    echo -e "${RED}❌ CosmosDB client not configured${NC}"
fi

if grep -q "initializeCosmosDB" src/lib/cosmosdb.ts; then
    echo -e "${GREEN}✅ Database initialization function exists${NC}"
else
    echo -e "${RED}❌ Database initialization missing${NC}"
fi

echo ""
echo "7. Web Application Readiness..."
echo "-------------------------------"

# Check if it's a proper web app structure
if [ -f "dist/index.html" ] && ls dist/assets/*.js 1> /dev/null 2>&1; then
    echo -e "${GREEN}✅ Ready for static web hosting${NC}"
    echo -e "${GREEN}✅ Can be deployed to Azure Static Web Apps${NC}"
    echo -e "${GREEN}✅ Can be deployed to Vercel${NC}"
    echo -e "${GREEN}✅ Can be deployed to Netlify${NC}"
    echo -e "${GREEN}✅ Can be deployed to any static hosting service${NC}"
else
    echo -e "${RED}❌ Not ready for web deployment${NC}"
fi

echo ""
echo "=================================================="
echo "🎯 DEPLOYMENT STATUS SUMMARY"
echo "=================================================="

# Final recommendation
if npm run build > /dev/null 2>&1 && [ -f "dist/index.html" ] && [ -f "src/lib/cosmosdb.ts" ]; then
    echo -e "${GREEN}🚀 READY FOR DEPLOYMENT!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Set up Azure CosmosDB account"
    echo "2. Configure environment variables with your CosmosDB credentials"
    echo "3. Deploy using your preferred platform (see DEPLOYMENT.md)"
    echo ""
    echo "Recommended deployment platforms:"
    echo "• Azure Static Web Apps (best integration with CosmosDB)"
    echo "• Vercel (fast and easy)"
    echo "• Netlify (reliable hosting)"
else
    echo -e "${RED}❌ NOT READY - Please fix the issues above${NC}"
fi

echo ""
echo "For detailed deployment instructions, see:"
echo "• README.md - Setup and configuration"
echo "• DEPLOYMENT.md - Step-by-step deployment guide"
echo "• DEPLOYMENT_CHECKLIST.md - Complete verification checklist"

# Cleanup
rm -f build.log