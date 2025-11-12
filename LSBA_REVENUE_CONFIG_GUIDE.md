# LSBA Revenue Configuration System

## ✅ **Feature Complete: LSBA Percentage Control**

I've successfully implemented a comprehensive revenue configuration system that allows you to control exactly what percentage LSBA gets from bets and wages for fights.

---

## 🎯 **New Features Added**

### 📊 **LSBA Revenue Configuration Panel**
- **Location**: Settings → LSBA Revenue tab
- **Full Control**: Manage all LSBA revenue percentages from one interface
- **Real-time Preview**: See revenue calculations with example scenarios
- **Validation**: Built-in validation to prevent invalid percentage settings

### 💰 **Betting Revenue Controls**
- **LSBA Fee Percentage**: Percentage of betting winnings that goes to LSBA (Default: 10%)
- **Betting Commission**: Commission on all betting activity regardless of outcome (Default: 5%)
- **Minimum LSBA Fee**: Minimum fee LSBA charges per transaction (Default: $50)
- **Maximum LSBA Fee**: Optional cap on LSBA fees per transaction (Default: $5,000)

### 🥊 **Fight Wage Controls** 
- **Base Fight Wage Percentage**: Standard percentage of fighter wages (Default: 15%)
- **Main Event Percentage**: Higher percentage for main event fights (Default: 20%)
- **Undercard Percentage**: Lower percentage for undercard fights (Default: 12%) 
- **Tournament Percentage**: Specific percentage for tournament fights (Default: 18%)

### 🏟️ **Event & Revenue Sharing**
- **Event Organization Fee**: Fee for organizing and sanctioning events (Default: 10%)
- **Casino Commission**: Casino's share of betting revenue (Default: 20%)
- **Sponsor Fee**: Fee charged to sponsors for event participation (Default: 5%)

---

## 🛠️ **Technical Implementation**

### Updated Types (`src/types/betting.ts`)
```typescript
export interface PayoutSettings {
  // LSBA Fee Percentages for Betting
  lsbaFeePercentage: number;
  lsbaBettingCommission: number;
  
  // LSBA Percentage for Fight Wages/Purses
  lsbaFightWagePercentage: number;
  lsbaEventFeePercentage: number;
  
  // Revenue Sharing
  casinoCommissionPercentage: number;
  sponsorCommissionPercentage: number;
  
  // Administrative Settings
  minimumLsbaFee: number;
  maximumLsbaFee?: number;
  
  // Fight-specific percentages
  mainEventWagePercentage: number;
  underCardWagePercentage: number;
  tournamentWagePercentage: number;
}
```

### New Component (`src/components/LSBARevenueConfig.tsx`)
- **Tabbed Interface**: Organized into Betting Revenue, Fight Wages, Event Fees, and Revenue Preview
- **Form Validation**: Ensures percentages are within reasonable ranges
- **Real-time Calculations**: Shows preview calculations with example amounts
- **Persistent Storage**: Saves settings to Azure CosmosDB

### Database Integration
- **Container**: `payout_settings` (auto-created in Azure CosmosDB)
- **Backup Support**: Included in data backup/export system
- **Environment**: Fully integrated with existing Azure CosmosDB setup

---

## 🎮 **How to Use**

### 1. **Access Settings**
```
Navigation → Settings Dropdown → Settings → LSBA Revenue Tab
```

### 2. **Configure Betting Revenue**
- Set LSBA fee percentage (0-50%)
- Set betting commission rate (0-25%) 
- Configure minimum/maximum fee limits
- All changes auto-validated

### 3. **Configure Fight Wages**
- Set different percentages for different fight types:
  - Main Events: Higher percentage (default 20%)
  - Undercard: Lower percentage (default 12%)
  - Tournaments: Tournament-specific (default 18%)

### 4. **Set Event Fees**
- Organization fee for sanctioning events
- Revenue sharing with casinos and sponsors
- Flexible percentage controls

### 5. **Preview Revenue**
- See calculations with example amounts
- $10,000 betting scenario preview
- $50,000 fight purse scenario preview

---

## 💡 **Revenue Examples**

### Betting Scenario ($10,000 total betting)
- **LSBA Fee (10%)**: $1,000
- **Betting Commission (5%)**: $500
- **Total LSBA Revenue**: $1,500

### Fight Wages ($50,000 total purse)
- **Main Event (20%)**: $10,000
- **Undercard (12%)**: $6,000
- **Tournament (18%)**: $9,000
- **Event Fee (10%)**: $5,000

### Revenue Sharing
- **LSBA**: Configured percentages
- **Casino**: 20% of betting revenue
- **Sponsors**: 5% participation fee

---

## 🔒 **Security & Validation**

### Input Validation
- **Percentage Limits**: 0-50% for most settings
- **Fee Minimums**: Cannot be negative
- **Real-time Validation**: Instant feedback on invalid inputs

### Data Persistence
- **Azure CosmosDB**: Secure cloud storage
- **Backup Integration**: Included in system backups
- **Access Control**: Only accessible through Settings interface

---

## 🚀 **Integration Points**

### With Existing Systems
- **Betting System**: Uses payout settings for all calculations
- **Fight Management**: Applies wage percentages automatically
- **Tournament System**: Uses tournament-specific percentages
- **Backup System**: Includes payout settings in all backups

### Future Enhancements Ready
- **Historical Tracking**: Can track percentage changes over time
- **Event-Specific Rates**: Can override rates for special events
- **Automated Calculations**: Ready for automated payout processing

---

## 📊 **Default Settings**

```javascript
{
  // Betting
  lsbaFeePercentage: 10,           // 10% of winnings
  lsbaBettingCommission: 5,        // 5% of all bets
  
  // Fight Wages  
  lsbaFightWagePercentage: 15,     // 15% base rate
  mainEventWagePercentage: 20,     // 20% for main events
  underCardWagePercentage: 12,     // 12% for undercard
  tournamentWagePercentage: 18,    // 18% for tournaments
  
  // Event & Sharing
  lsbaEventFeePercentage: 10,      // 10% organization fee
  casinoCommissionPercentage: 20,   // 20% to casino
  sponsorCommissionPercentage: 5,   // 5% sponsor fee
  
  // Limits
  minimumLsbaFee: 50,              // $50 minimum
  maximumLsbaFee: 5000             // $5000 maximum
}
```

---

## ✅ **Status: Production Ready**

- **✅ Build Complete**: Successfully compiles with no errors
- **✅ TypeScript Safe**: Full type safety and validation  
- **✅ Azure Integration**: Works with existing CosmosDB setup
- **✅ Backup Compatible**: Included in data management system
- **✅ User Interface**: Intuitive tabbed configuration interface
- **✅ Real-time Preview**: Live calculation preview system

**You now have complete control over LSBA revenue percentages for all betting and fight wage scenarios!** 🎉