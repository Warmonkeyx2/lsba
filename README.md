# LSBA Management System

A comprehensive web application for managing Local State Boxing Association operations, including boxer registration, fight cards, tournaments, betting, and sponsor management.

## 🚀 Features

- **Boxer Management**: Registration, profiles, rankings, and licensing
- **Fight Card Management**: Create and manage fight events
- **Tournament System**: Bracket-style tournament management
- **Betting System**: Comprehensive betting pools and odds management
- **Sponsor Management**: Track sponsorships and partnerships
- **Role-Based Permissions**: Manage user roles and access control
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

Our mission: Keep boxing fair, profitable, and connected.

⚙️ Features

Fighter Management: Create, edit, and track fighter stats and records.

Event Scheduling: Organize fight cards, venues, and match details.

Betting Oversight: Calculate splits between LSBA, sponsors, casinos, and fighters.

Sponsor Integration: Assign sponsors per event and manage payouts.

Analytics & Reports: View fight outcomes, earnings, and betting trends.
