# LSBA Deployment Guide

## 🚀 Production Deployment

### Azure Static Web Apps (Recommended)

1. **Prerequisites**
   - Azure account with active subscription
   - Azure CLI installed
   - GitHub repository with your code

2. **Build the application**
   ```bash
   npm run build
   ```

3. **Deploy using Azure CLI**
   ```bash
   # Login to Azure
   az login

   # Create resource group (if not exists)
   az group create --name lsba-resources --location "East US"

   # Create static web app
   az staticwebapp create \
     --name lsba-management \
     --resource-group lsba-resources \
     --source dist/ \
     --location "East US" \
     --branch main \
     --app-location "/" \
     --output-location "dist"
   ```

4. **Configure Environment Variables in Azure**
   ```bash
   # Set environment variables
   az staticwebapp appsettings set \
     --name lsba-management \
     --setting-names "VITE_COSMOSDB_ENDPOINT=https://your-account.documents.azure.com:443/"

   az staticwebapp appsettings set \
     --name lsba-management \
     --setting-names "VITE_COSMOSDB_KEY=your-primary-key"

   az staticwebapp appsettings set \
     --name lsba-management \
     --setting-names "VITE_COSMOSDB_DATABASE_ID=lsba"
   ```

### Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login and Deploy**
   ```bash
   vercel login
   vercel --prod
   ```

3. **Configure Environment Variables**
   Add in Vercel dashboard or via CLI:
   ```bash
   vercel env add VITE_COSMOSDB_ENDPOINT
   vercel env add VITE_COSMOSDB_KEY
   vercel env add VITE_COSMOSDB_DATABASE_ID
   ```

### Netlify Deployment

1. **Build and Deploy**
   ```bash
   npm run build
   npx netlify-cli deploy --prod --dir=dist
   ```

2. **Environment Variables**
   Set in Netlify dashboard under Site settings > Environment variables

## 🗄️ Azure CosmosDB Setup

### 1. Create CosmosDB Account

```bash
# Create CosmosDB account
az cosmosdb create \
  --name lsba-cosmosdb \
  --resource-group lsba-resources \
  --default-consistency-level Session \
  --locations regionName="East US" failoverPriority=0 isZoneRedundant=False
```

### 2. Create Database

```bash
# Create database
az cosmosdb sql database create \
  --account-name lsba-cosmosdb \
  --resource-group lsba-resources \
  --name lsba
```

### 3. Create Containers

The application will automatically create containers on first run, or create manually:

```bash
# Create containers
CONTAINERS=(
  "boxers::/id"
  "fights::/id"
  "sponsors::/id"
  "tournaments::/id"
  "betting::/id"
  "rankings::/id"
  "licenses::/id"
  "roles::/id"
  "permissions::/id"
  "app_settings::/id"
)

for container_info in "${CONTAINERS[@]}"; do
  IFS="::" read -r container_name partition_key <<< "$container_info"
  az cosmosdb sql container create \
    --account-name lsba-cosmosdb \
    --resource-group lsba-resources \
    --database-name lsba \
    --name "$container_name" \
    --partition-key-path "$partition_key" \
    --throughput 400
done
```

### 4. Get Connection Details

```bash
# Get endpoint
az cosmosdb show \
  --name lsba-cosmosdb \
  --resource-group lsba-resources \
  --query documentEndpoint \
  --output tsv

# Get primary key
az cosmosdb keys list \
  --name lsba-cosmosdb \
  --resource-group lsba-resources \
  --type keys \
  --query primaryMasterKey \
  --output tsv
```

## 🔐 Security Configuration

### 1. CosmosDB Firewall

```bash
# Allow specific IPs (replace with your deployment IPs)
az cosmosdb network-rule add \
  --account-name lsba-cosmosdb \
  --resource-group lsba-resources \
  --ip-address "52.73.186.202"  # Example: Vercel IP range

# Or allow all (for development only)
az cosmosdb update \
  --name lsba-cosmosdb \
  --resource-group lsba-resources \
  --enable-public-network true
```

### 2. Key Rotation

```bash
# Regenerate primary key (use secondary key in production during rotation)
az cosmosdb keys regenerate \
  --name lsba-cosmosdb \
  --resource-group lsba-resources \
  --key-kind primary
```

## 📊 Monitoring and Maintenance

### 1. Application Insights (Optional)

```bash
# Create Application Insights
az monitor app-insights component create \
  --app lsba-insights \
  --resource-group lsba-resources \
  --location "East US" \
  --kind web \
  --application-type web
```

### 2. Monitoring Queries

Use these queries in Azure Portal:

```sql
-- Check RU consumption
SELECT TOP 10 *
FROM c
ORDER BY c._ts DESC

-- Monitor error rates
SELECT 
  COUNT(1) as ErrorCount,
  c.errorType
FROM c
WHERE c.level = "error"
GROUP BY c.errorType
```

### 3. Backup Strategy

CosmosDB provides automatic backups, but consider:
- Enable point-in-time restore
- Set up alerts for RU consumption
- Monitor storage usage

## 🚨 Troubleshooting

### Common Deployment Issues

1. **Environment Variables Not Loading**
   - Check variable names match exactly (case-sensitive)
   - Ensure variables are set in deployment platform
   - Verify VITE_ prefix for client-side variables

2. **CosmosDB Connection Errors**
   - Verify endpoint URL format
   - Check firewall settings
   - Validate primary key

3. **Build Errors**
   ```bash
   # Clean and rebuild
   npm run clean
   npm install
   npm run build
   ```

4. **Performance Issues**
   - Monitor CosmosDB RU consumption
   - Check for expensive queries
   - Consider partitioning strategy

### Support

- Check application logs in deployment platform
- Monitor CosmosDB metrics in Azure Portal
- Use browser developer tools for client-side debugging

## 📈 Scaling Considerations

1. **CosmosDB Scaling**
   - Monitor RU consumption
   - Consider autoscale vs manual throughput
   - Optimize partition keys for even distribution

2. **Application Scaling**
   - Use CDN for static assets
   - Implement caching strategies
   - Consider serverless functions for complex operations

3. **Cost Optimization**
   - Use reserved capacity for predictable workloads
   - Monitor and optimize RU usage
   - Consider different consistency levels based on use case