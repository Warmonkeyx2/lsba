# LSBA Multi-User Deployment Guide

## Current Status
✅ **Ready for Multiple Users** - The system is architecturally sound for multi-user access.

## Quick Start for Testing
Your system is currently running and accessible at:
- **Frontend**: http://10.0.0.201:5000
- Users can access this URL in any web browser to use the system

## Production Deployment Options

### Option 1: Cloud Hosting (Recommended)
Deploy to platforms like:
- **Vercel** (Frontend) + **Railway/Heroku** (API)
- **Netlify** (Frontend) + **Azure App Service** (API)
- **Azure Static Web Apps** (Frontend + API together)

### Option 2: VPS/Server Deployment
Deploy to a VPS (DigitalOcean, Linode, AWS EC2):
1. Get a domain name (e.g., `lsba.yourdomain.com`)
2. Set up SSL certificate (Let's Encrypt)
3. Configure reverse proxy (Nginx)
4. Set up PM2 for process management

### Option 3: Local Network (Current Setup)
For local organization use:
- **Current Access**: http://10.0.0.201:5000
- **Local Network**: Anyone on your network can access this URL
- **Port Forwarding**: Configure router to allow external access

## Environment Variables Needed
```bash
# For API Server (.env in server/ directory)
COSMOSDB_ENDPOINT=your_cosmos_endpoint
COSMOSDB_KEY=your_cosmos_key
COSMOSDB_DATABASE_ID=LSBADatabase
PORT=3001
ALLOWED_ORIGINS=http://localhost:5000,https://your-domain.com

# For Frontend
VITE_API_URL=http://your-api-server:3001
```

## Security Checklist for Production
- [ ] Use HTTPS (SSL certificate)
- [ ] Restrict CORS origins to your domain
- [ ] Set up proper authentication (currently open access)
- [ ] Configure CosmosDB firewall properly
- [ ] Set up monitoring and logging
- [ ] Regular backups of CosmosDB data

## User Access Instructions
Send users this link format:
- **Development**: `http://10.0.0.201:5000`
- **Production**: `https://your-domain.com`

No user accounts required - they can immediately:
1. Register boxers and sponsors
2. Create fight cards
3. Place and settle bets
4. View leaderboards and rankings
5. Manage tournaments

## Current Features Available to All Users
- Real-time countdown timers for upcoming fights
- Shared boxer and sponsor directories
- Collaborative betting system with State ID verification
- Live leaderboards and rankings
- Tournament bracket management
- Fight card generation and sharing

## Support
The system automatically handles:
- Concurrent user access
- Data synchronization
- Real-time updates
- Shared state management