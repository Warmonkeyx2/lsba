#!/bin/bash

# Azure CosmosDB Setup Script for LSBA Management System

echo "🗄️ Azure CosmosDB Setup for LSBA Management System"
echo "================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
RESOURCE_GROUP="lsba-resources"
COSMOSDB_ACCOUNT="lsba-cosmosdb"
DATABASE_NAME="lsba"
LOCATION="East US"

echo ""
echo -e "${BLUE}This script will help you set up Azure CosmosDB for the LSBA Management System${NC}"
echo ""

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo -e "${RED}❌ Azure CLI is not installed${NC}"
    echo "Please install Azure CLI: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

echo -e "${GREEN}✅ Azure CLI is installed${NC}"

# Check if logged in
if ! az account show &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Azure${NC}"
    echo "Logging in to Azure..."
    az login
fi

echo -e "${GREEN}✅ Logged in to Azure${NC}"

# Get or set resource group
echo ""
read -p "Enter Resource Group name (default: $RESOURCE_GROUP): " input_rg
RESOURCE_GROUP=${input_rg:-$RESOURCE_GROUP}

# Get or set CosmosDB account name
read -p "Enter CosmosDB Account name (default: $COSMOSDB_ACCOUNT): " input_account
COSMOSDB_ACCOUNT=${input_account:-$COSMOSDB_ACCOUNT}

# Get or set location
echo ""
echo "Available locations: East US, West US 2, Central US, West Europe, Southeast Asia"
read -p "Enter Azure location (default: $LOCATION): " input_location
LOCATION=${input_location:-$LOCATION}

echo ""
echo "Configuration:"
echo "- Resource Group: $RESOURCE_GROUP"
echo "- CosmosDB Account: $COSMOSDB_ACCOUNT"
echo "- Database: $DATABASE_NAME"
echo "- Location: $LOCATION"
echo ""

read -p "Continue with this configuration? (y/N): " confirm
if [[ $confirm != [yY] && $confirm != [yY][eE][sS] ]]; then
    echo "Setup cancelled."
    exit 0
fi

echo ""
echo "🚀 Starting Azure CosmosDB setup..."

# Create resource group if it doesn't exist
echo ""
echo "1. Creating resource group..."
if az group create --name "$RESOURCE_GROUP" --location "$LOCATION" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Resource group '$RESOURCE_GROUP' created/verified${NC}"
else
    echo -e "${RED}❌ Failed to create resource group${NC}"
    exit 1
fi

# Create CosmosDB account
echo ""
echo "2. Creating CosmosDB account (this may take a few minutes)..."
if az cosmosdb create \
    --name "$COSMOSDB_ACCOUNT" \
    --resource-group "$RESOURCE_GROUP" \
    --default-consistency-level Session \
    --locations regionName="$LOCATION" failoverPriority=0 isZoneRedundant=False \
    --enable-public-network true > /dev/null 2>&1; then
    echo -e "${GREEN}✅ CosmosDB account '$COSMOSDB_ACCOUNT' created${NC}"
else
    echo -e "${RED}❌ Failed to create CosmosDB account${NC}"
    exit 1
fi

# Create database
echo ""
echo "3. Creating database..."
if az cosmosdb sql database create \
    --account-name "$COSMOSDB_ACCOUNT" \
    --resource-group "$RESOURCE_GROUP" \
    --name "$DATABASE_NAME" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database '$DATABASE_NAME' created${NC}"
else
    echo -e "${RED}❌ Failed to create database${NC}"
    exit 1
fi

# Create containers
echo ""
echo "4. Creating containers..."

containers=(
    "boxers"
    "fights" 
    "sponsors"
    "tournaments"
    "betting"
    "rankings"
    "licenses"
    "roles"
    "permissions"
    "app_settings"
)

for container in "${containers[@]}"; do
    echo "   Creating container: $container"
    if az cosmosdb sql container create \
        --account-name "$COSMOSDB_ACCOUNT" \
        --resource-group "$RESOURCE_GROUP" \
        --database-name "$DATABASE_NAME" \
        --name "$container" \
        --partition-key-path "/id" \
        --throughput 400 > /dev/null 2>&1; then
        echo -e "   ${GREEN}✅ Container '$container' created${NC}"
    else
        echo -e "   ${YELLOW}⚠️  Container '$container' may already exist${NC}"
    fi
done

# Get connection details
echo ""
echo "5. Retrieving connection details..."

ENDPOINT=$(az cosmosdb show \
    --name "$COSMOSDB_ACCOUNT" \
    --resource-group "$RESOURCE_GROUP" \
    --query documentEndpoint \
    --output tsv)

PRIMARY_KEY=$(az cosmosdb keys list \
    --name "$COSMOSDB_ACCOUNT" \
    --resource-group "$RESOURCE_GROUP" \
    --type keys \
    --query primaryMasterKey \
    --output tsv)

# Create environment file
echo ""
echo "6. Creating environment configuration..."

cat > .env.production << EOF
# Azure CosmosDB Configuration - PRODUCTION
VITE_COSMOSDB_ENDPOINT=$ENDPOINT
VITE_COSMOSDB_KEY=$PRIMARY_KEY
VITE_COSMOSDB_DATABASE_ID=$DATABASE_NAME

# Application Configuration
VITE_APP_NAME=LSBA Management System
VITE_APP_VERSION=1.0.0
VITE_NODE_ENV=production
EOF

echo -e "${GREEN}✅ Environment file '.env.production' created${NC}"

# Display results
echo ""
echo "================================================="
echo "🎉 AZURE COSMOSDB SETUP COMPLETE!"
echo "================================================="
echo ""
echo "Your CosmosDB instance has been created with:"
echo ""
echo "📊 Account Details:"
echo "   • Account Name: $COSMOSDB_ACCOUNT"
echo "   • Resource Group: $RESOURCE_GROUP"
echo "   • Database: $DATABASE_NAME"
echo "   • Location: $LOCATION"
echo ""
echo "🔗 Connection Details:"
echo "   • Endpoint: $ENDPOINT"
echo "   • Primary Key: [SAVED TO .env.production]"
echo ""
echo "📦 Containers Created:"
for container in "${containers[@]}"; do
    echo "   • $container"
done
echo ""
echo "📄 Configuration Files:"
echo "   • .env.production - Ready for deployment"
echo ""
echo "🚀 Next Steps:"
echo "1. Copy the environment variables to your deployment platform"
echo "2. Deploy your application using:"
echo "   • npm run build (to build)"
echo "   • Deploy dist/ folder to your hosting platform"
echo ""
echo "💡 Deployment Platforms:"
echo "   • Azure Static Web Apps: az staticwebapp create ..."
echo "   • Vercel: vercel --prod"
echo "   • Netlify: netlify deploy --prod --dir=dist"
echo ""
echo "For detailed deployment instructions, see DEPLOYMENT.md"
echo ""
echo "🔐 Security Note:"
echo "   • Keep your primary key secure"
echo "   • Consider using Azure Key Vault for production"
echo "   • Set up firewall rules for production deployment"

echo ""
echo -e "${GREEN}✅ Setup complete! Your LSBA Management System is ready to deploy with Azure CosmosDB.${NC}"