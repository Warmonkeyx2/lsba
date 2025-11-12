# LSBA Data Management Guide

## Overview
The LSBA Management System now includes comprehensive data backup, import, and export capabilities to help you manage your boxing association data safely and efficiently.

## Features

### 🔒 **Data Backup**
- **Full System Backup**: Creates complete backups of all LSBA data
- **Automatic Timestamps**: Each backup is timestamped for easy tracking
- **Last Backup Tracking**: Shows when your last backup was created
- **Complete Data Coverage**: Includes boxers, sponsors, fights, tournaments, betting data, and settings

### 📤 **Data Export**
- **Selective Export**: Export specific data collections (boxers, sponsors, fights, etc.)
- **JSON Format**: Industry-standard format for data portability
- **Analysis-Ready**: Perfect for reporting and data analysis
- **Partial Backups**: Create focused backups of specific data sets

### 📥 **Data Import**
- **Restore from Backup**: Import complete backups to restore your system
- **Merge Data**: Import data that merges with existing records
- **Template Support**: Download import templates for custom data entry
- **Validation**: Built-in validation to prevent data corruption

### 🔧 **Database Maintenance**
- **Clear All Data**: Complete database reset (with multiple confirmations)
- **Safe Operations**: Multiple confirmation steps for destructive operations
- **Backup Reminders**: Prompts to backup before maintenance operations

## How to Access

1. **Open the Application**
2. **Navigate to Settings**: Click the settings dropdown in the top navigation
3. **Go to Data Management Tab**: Click on "Data Management" tab

## Backup Operations

### Creating a Full Backup
1. Go to **Settings > Data Management > Backup**
2. Click **"Create Full Backup"**
3. Wait for the process to complete
4. The backup file will be automatically downloaded to your device

### Backup File Format
```json
{
  "version": "1.0.0",
  "timestamp": "2024-11-12T10:30:00.000Z",
  "data": {
    "boxers": [...],
    "sponsors": [...],
    "fights": [...],
    "tournaments": [...],
    "betting": [...],
    "rankings": [...],
    "licenses": [...],
    "roles": [...],
    "permissions": [...],
    "app_settings": [...]
  },
  "metadata": {
    "totalRecords": 1250,
    "containers": ["boxers", "sponsors", ...],
    "exportedBy": "LSBA Management System"
  }
}
```

## Import Operations

### Restoring from Backup
1. Go to **Settings > Data Management > Import**
2. Click **"Select Backup File"**
3. Choose your backup JSON file
4. Wait for the import process to complete
5. Existing records will be updated, new records will be created

### Import Template
1. Go to **Settings > Data Management > Import**
2. Click **"Download Import Template"**
3. Edit the template with your data
4. Import the modified template file

## Export Operations

### Full Data Export
- Use the **Backup** tab for complete system exports

### Selective Exports
1. Go to **Settings > Data Management > Export**
2. Choose specific data types:
   - **Export Boxers**: All fighter profiles and records
   - **Export Sponsors**: All sponsor information
   - **Export Fights**: All fight cards and results
   - **Export Tournaments**: All tournament data
   - **Export Betting Data**: All betting pools and wagers
   - **Export Settings**: System configuration and settings

## Database Maintenance

### ⚠️ Clear All Data
**WARNING**: This permanently deletes ALL data from your system.

1. Go to **Settings > Data Management > Maintenance**
2. Click **"Clear All Data"** (in the red danger zone)
3. Confirm the first warning dialog
4. Confirm the second "FINAL WARNING" dialog
5. All data will be permanently deleted

**Important**: Always create a backup before clearing data!

## Best Practices

### 🎯 **Regular Backups**
- Create backups before major events or tournaments
- Weekly backups for active associations
- Before any system maintenance or updates
- Before importing new data

### 📋 **Data Management**
- Use selective exports for specific reporting needs
- Keep backup files in secure, accessible locations
- Test restore procedures periodically
- Document your backup schedule

### 🔒 **Security**
- Store backup files securely
- Don't share backup files publicly (they contain sensitive data)
- Use cloud storage or external drives for backup storage
- Keep multiple backup copies

## File Formats

### Supported Import Formats
- **JSON**: Primary format for backups and imports
- **Template JSON**: Structured template files

### Export Formats
- **JSON**: All exports are in JSON format
- **Timestamped Files**: All files include date/time stamps

## Troubleshooting

### Common Issues

**Import Fails**
- Check file format (must be valid JSON)
- Verify file was exported from LSBA system
- Ensure file isn't corrupted

**Export Takes Long Time**
- Large datasets may take several minutes
- Don't close browser during export
- Check available disk space

**Backup Not Working**
- Verify Azure CosmosDB connection
- Check browser download permissions
- Try smaller selective exports first

### Error Messages

**"Invalid backup file format"**
- File is not a valid LSBA backup
- Use only files exported from this system

**"Failed to import data"**
- Database connection issue
- File corruption
- Check console for detailed error messages

## Data Recovery

### If Data is Lost
1. **Don't Panic**: Stop using the system immediately
2. **Locate Latest Backup**: Find your most recent backup file
3. **Clear and Restore**: Clear existing data and import from backup
4. **Verify Data**: Check that all critical data was restored
5. **Resume Operations**: Begin normal operations

### Recovery Steps
1. Settings > Data Management > Maintenance > Clear All Data
2. Settings > Data Management > Import > Select backup file
3. Wait for import completion
4. Verify data in Dashboard and other sections

## Data Migration

### Moving to New System
1. **Export Full Backup** from old system
2. **Setup New System** with Azure CosmosDB
3. **Import Backup** to new system
4. **Verify Data** integrity
5. **Update Configurations** as needed

### Sharing Data Between Systems
1. Use **selective exports** for specific data
2. Import exported data to target system
3. Resolve any ID conflicts manually
4. Verify data consistency

## API Information

The backup/import system works with Azure CosmosDB containers:
- **boxers**: Fighter profiles and records
- **sponsors**: Sponsor information and relationships
- **fights**: Fight cards and results
- **tournaments**: Tournament brackets and results
- **betting**: Betting pools and wagers
- **rankings**: Ranking calculations and history
- **licenses**: License management data
- **roles**: User roles and permissions
- **permissions**: Permission settings
- **app_settings**: Application configuration

## Support

For technical support with data management:
1. Check this documentation first
2. Verify Azure CosmosDB connection
3. Check browser console for error messages
4. Create test backups with small datasets first
5. Contact system administrator if issues persist

---

**Remember**: Your data is valuable. Regular backups are your best protection against data loss.