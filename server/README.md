# LSBA Management System API Server

## Setup Instructions

### 1. Configure Azure Cosmos DB Firewall

Your CosmosDB account is blocking connections. To fix this:

1. Go to your Azure Portal
2. Navigate to your Cosmos DB account: `lsba-stats-db-2025`
3. Go to "Firewall and virtual networks" in the left menu
4. Choose one of these options:

   **Option A: Allow all networks (easiest for development)**
   - Select "Allow access from: All networks"
   - Click "Save"

   **Option B: Allow specific IP (more secure)**
   - Select "Allow access from: Selected networks"
   - Add your current IP: `172.210.53.224`
   - Click "Save"

   **Option C: Allow Azure services**
   - Check "Allow access from Azure portal"
   - Check "Accept connections from within Azure datacenters"
   - Click "Save"

### 2. Start the API Server

```bash
cd /workspaces/lsba/server
npm run dev
```

The server will run on http://localhost:3001

### 3. Start the Frontend

```bash
cd /workspaces/lsba
npm run dev
```

The frontend will run on http://localhost:5000

## API Endpoints

- `GET /health` - Health check
- `POST /api/{container}` - Create item
- `GET /api/{container}` - List all items
- `GET /api/{container}/{id}` - Get specific item
- `PUT /api/{container}/{id}` - Update item
- `DELETE /api/{container}/{id}` - Delete item
- `POST /api/{container}/batch` - Create multiple items
- `POST /api/sync` - Bulk sync local-only items

## Environment Variables

### Server (.env)
```
COSMOSDB_ENDPOINT=your-endpoint
COSMOSDB_KEY=your-key
COSMOSDB_DATABASE_ID=LSBADatabase
PORT=3001
ALLOWED_ORIGINS=http://localhost:5000
```

### Client (.env)
```
VITE_API_URL=http://localhost:3001
```

## Security Benefits

- ✅ CosmosDB credentials are only on the server
- ✅ Client never has direct database access
- ✅ API provides validation and error handling
- ✅ CORS protection
- ✅ Rate limiting and security headers via Helmet

## Troubleshooting

### "CosmosDB firewall" error
- Follow step 1 above to configure firewall settings

### "Port already in use"
- Kill existing processes: `pkill -f node`
- Try a different port by changing `PORT` in server/.env

### "CORS error"
- Make sure `ALLOWED_ORIGINS` in server/.env includes your frontend URL
- Check that both servers are running