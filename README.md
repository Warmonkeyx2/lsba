# LSBA Management System

A comprehensive web application for managing Local State Boxing Association operations, including boxer registration, fight cards, tournaments, betting, and sponsor management.

## 🚀 Features

- **Boxer Management**: Registration, profiles, rankings, and licensing
- **Fight Card Management**: Create and manage fight events
- **Tournament System**: Bracket-style tournament management
- **Betting System**: Comprehensive betting pools and odds management
- **Sponsor Management**: Track sponsorships and partnerships
- **Role-Based Permissions**: Manage user roles and access control
- **Data Backup & Import/Export**: Comprehensive data management with full backup/restore capabilities
- **Real-time Data**: Integrated with Azure CosmosDB for persistent storage

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **Database**: Azure CosmosDB (migrated from Supabase)
- **UI Components**: Radix UI primitives
- **Icons**: Phosphor Icons, Lucide React
- **Validation**: Zod
- **Error Handling**: React Error Boundary

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Azure CosmosDB account

## 🔧 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   Copy `.env.example` to `.env` and update with your Azure CosmosDB credentials:
   ```env
   VITE_COSMOSDB_ENDPOINT=https://your-cosmosdb-account.documents.azure.com:443/
   VITE_COSMOSDB_KEY=your-cosmosdb-primary-key
   VITE_COSMOSDB_DATABASE_ID=lsba
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 💾 Data Management

The LSBA Management System includes comprehensive data backup and import/export capabilities:

- **Full System Backups**: Create complete backups of all your data
- **Selective Exports**: Export specific data types (boxers, sponsors, fights, etc.)
- **Data Import**: Restore from backups or import template data
- **Database Maintenance**: Safe data management tools

For detailed instructions, see the [Data Management Guide](./DATA_MANAGEMENT_GUIDE.md).

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # Reusable UI components
│   ├── Settings.tsx     # Main settings with data management
│   ├── DataImportExport.tsx  # Backup/import/export functionality
│   └── ...              # Other feature components
├── lib/                 # Utility libraries
│   ├── cosmosdb.ts     # Azure CosmosDB client
│   ├── validation.ts   # Data validation schemas
│   └── ...             # Other utilities
├── types/              # TypeScript type definitions
└── styles/             # CSS and styling files
```

Our mission: Keep boxing fair, profitable, and connected.

⚙️ Features

Fighter Management: Create, edit, and track fighter stats and records.

Event Scheduling: Organize fight cards, venues, and match details.

Betting Oversight: Calculate splits between LSBA, sponsors, casinos, and fighters.

Sponsor Integration: Assign sponsors per event and manage payouts.

Analytics & Reports: View fight outcomes, earnings, and betting trends.
