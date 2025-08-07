# 🚀 System Prompts Import/Export Guide

## 📋 Overview

Your System Prompts Management now includes powerful import/export functionality that allows you to:

- **Export** all system prompts to a JSON file for backup or transfer
- **Import** prompts from JSON files or pasted data
- **Transfer** prompts between development and production environments
- **Backup** your optimized prompts before making changes
- **Share** prompt configurations with team members

## 🎯 New Features Added

### ✅ **Import/Export Button**
- Located in the System Prompts Management header
- Toggles the import/export panel
- Provides easy access to data transfer functions

### ✅ **Export Functionality**
- Exports all active system prompts to JSON format
- Includes metadata like version, export date, and total count
- Downloads automatically as a timestamped file
- Compatible with the existing production deployment format

### ✅ **Import Functionality**
- Supports both file upload and direct JSON pasting
- Validates JSON format and required fields
- Updates existing prompts or creates new ones
- Provides detailed feedback on import results

### ✅ **API Endpoint**
- New `/api/admin/system-prompts/import` endpoint
- Handles bulk import operations
- Includes error handling and validation
- Supports both create and update operations

## 🔧 How to Use

### **Step 1: Access Import/Export Panel**

1. Navigate to your System Prompts Management interface
2. Click the **"Import/Export"** button in the header
3. The import/export panel will appear below the header

### **Step 2: Export Prompts**

1. **Click "Export All Prompts"** in the Export section
2. A JSON file will be downloaded automatically
3. The filename includes the current date (e.g., `system-prompts-export-2025-01-02.json`)

**Export Format:**
```json
{
  "version": "1.0",
  "exportedAt": "2025-01-02T10:30:00.000Z",
  "totalPrompts": 43,
  "prompts": [
    {
      "category": "style_preset",
      "subcategory": "cyberpunk",
      "name": "Cyberpunk Style",
      "description": "Futuristic cyberpunk aesthetic",
      "content": "futuristic cyberpunk style with neon lighting...",
      "version": 1,
      "isActive": true,
      "metadata": {}
    }
  ]
}
```

### **Step 3: Import Prompts**

**Option A: File Upload**
1. Click **"Choose File"** in the Import section
2. Select a JSON file with the correct format
3. Click **"Import Prompts"**

**Option B: Direct JSON Pasting**
1. Paste JSON data into the text area
2. Ensure the format matches the export format
3. Click **"Import Prompts"**

## 📊 Import/Export Workflow

### **Development to Production Transfer**

1. **Export from Development:**
   ```bash
   # In your development environment
   # Use System Prompts Management → Export All Prompts
   # This creates: system-prompts-export-2025-01-02.json
   ```

2. **Import to Production:**
   ```bash
   # In your production environment
   # Use System Prompts Management → Import/Export → Import Prompts
   # Upload the exported JSON file
   ```

3. **Verify Transfer:**
   ```sql
   -- Check that prompts were imported
   SELECT COUNT(*) FROM system_prompts WHERE isActive = true;
   -- Should match your development count
   ```

### **Backup and Restore**

1. **Create Backup:**
   - Export prompts before making major changes
   - Save the JSON file with a descriptive name

2. **Restore from Backup:**
   - Import the backup JSON file
   - Existing prompts will be updated
   - New prompts will be created

### **Team Collaboration**

1. **Share Prompt Configurations:**
   - Export optimized prompts
   - Share the JSON file with team members
   - They can import to their environments

2. **Version Control:**
   - Include exported JSON files in your repository
   - Track prompt changes over time
   - Roll back to previous versions if needed

## 🔍 Import Validation

The import process validates:

### **Required Fields:**
- `category` - Prompt category (e.g., "style_preset", "event_type")
- `name` - Human-readable prompt name
- `content` - The actual prompt content

### **Optional Fields:**
- `subcategory` - Subcategory identifier
- `description` - Prompt description
- `version` - Version number (defaults to 1)
- `isActive` - Whether prompt is active (defaults to true)
- `metadata` - Additional metadata object

### **Import Behavior:**
- **Existing prompts** (same category + subcategory + name) are **updated**
- **New prompts** are **created**
- **Invalid prompts** are **skipped** with error logging

## 📈 Benefits

### **For Development:**
- Easy transfer of optimized prompts to production
- Backup before making changes
- Version control of prompt configurations
- Team collaboration on prompt optimization

### **For Production:**
- Quick deployment of prompt updates
- Rollback capability to previous versions
- Consistent prompt management across environments
- Reduced manual configuration errors

### **For Maintenance:**
- Automated prompt synchronization
- Backup and disaster recovery
- Audit trail of prompt changes
- Simplified environment management

## 🚨 Important Notes

### **Before Importing:**
- **Backup your current prompts** if you're updating existing ones
- **Test the import** in a development environment first
- **Verify the JSON format** matches the expected structure
- **Check for conflicts** with existing prompt names

### **After Importing:**
- **Verify the import results** in the success message
- **Test image generation** with the imported prompts
- **Check the System Prompts Management** interface
- **Monitor for any errors** in the console logs

### **Security Considerations:**
- Only **admin and HERO users** can import/export prompts
- **Validate JSON content** before importing
- **Review imported prompts** for malicious content
- **Use HTTPS** for all import/export operations

## 🔧 Troubleshooting

### **Import Fails:**
1. **Check JSON format** - Ensure valid JSON syntax
2. **Verify required fields** - category, name, and content are required
3. **Check file encoding** - Use UTF-8 encoding
4. **Review error messages** - Look for specific validation errors

### **Export Fails:**
1. **Check permissions** - Ensure you have admin/HERO role
2. **Verify database connection** - Check if prompts can be fetched
3. **Check browser settings** - Ensure downloads are allowed
4. **Review console logs** - Look for JavaScript errors

### **Prompts Don't Appear:**
1. **Refresh the interface** - Import doesn't auto-refresh the list
2. **Check import results** - Verify the success message
3. **Check database** - Query the system_prompts table directly
4. **Verify permissions** - Ensure you can view the prompts

## 📞 Support

If you encounter issues:

1. **Check the console logs** for detailed error messages
2. **Verify the JSON format** matches the export format
3. **Test with a single prompt** first before bulk import
4. **Use the test script** to validate your data: `npx tsx scripts/test-import-export.ts`

---

**🎉 Your System Prompts Management now has powerful import/export capabilities for seamless prompt management across environments!** 