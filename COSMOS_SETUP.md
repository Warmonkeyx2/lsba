# Fix Azure Cosmos DB Firewall

Your API server failed to connect because of Cosmos DB firewall settings.

## Quick Fix (Choose One)

### Option 1: Allow All Networks (Easiest)
1. Go to [Azure Portal](https://portal.azure.com)
2. Find your Cosmos DB account: **lsba-stats-db-2025**
3. Click "Firewall and virtual networks" 
4. Select **"All networks"**
5. Click **"Save"**

### Option 2: Allow Specific IP
1. In the same firewall settings
2. Select **"Selected networks"**
3. Add IP: **172.210.53.224**
4. Click **"Save"**

### Option 3: Development Mode (Local Storage)
If you can't access Azure settings right now, I can temporarily switch the app to use local browser storage instead of Cosmos DB.

## After Fixing Firewall

```bash
# Restart the API server
cd /workspaces/lsba/server
npm run dev
```

The error should be gone and you'll see:
```
CosmosDB initialized successfully
LSBA API Server running on port 3001
```

## Benefits of This Setup

- 🔒 **Secure**: Your database keys are only on the server
- 📊 **Reliable**: Proper error handling and validation  
- 🔄 **Auto-sync**: Local changes automatically persist to database
- 📦 **Better backups**: All data properly captured in exports

Would you like me to:
1. **Wait for you to fix the firewall** (recommended), or
2. **Switch to local storage mode** for now?