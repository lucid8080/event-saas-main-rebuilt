import { prisma } from "../lib/db";

interface SystemPromptExport {
  id: string;
  category: string;
  subcategory: string | null;
  name: string;
  description: string | null;
  content: string;
  version: number;
  isActive: boolean;
  metadata: any;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

async function exportSystemPromptsForProduction() {
  try {
    console.log("🚀 Exporting system prompts for production deployment...\n");

    // Get all active system prompts
    const systemPrompts = await prisma.systemPrompt.findMany({
      where: { isActive: true },
      orderBy: [
        { category: 'asc' },
        { subcategory: 'asc' },
        { version: 'desc' }
      ]
    });

    console.log(`📋 Found ${systemPrompts.length} active system prompts to export`);

    // Group by category for better organization
    const promptsByCategory: { [key: string]: SystemPromptExport[] } = {};
    
    systemPrompts.forEach(prompt => {
      if (!promptsByCategory[prompt.category]) {
        promptsByCategory[prompt.category] = [];
      }
      promptsByCategory[prompt.category].push(prompt);
    });

    // Display summary by category
    console.log("\n📊 Prompts by Category:");
    Object.entries(promptsByCategory).forEach(([category, prompts]) => {
      console.log(`   ${category}: ${prompts.length} prompts`);
    });

    // Create SQL insert statements for production
    console.log("\n🔧 Generating SQL for production deployment...");
    
    const sqlStatements: string[] = [];
    
    // First, clear existing prompts (optional - comment out if you want to keep existing)
    sqlStatements.push("-- Clear existing system prompts (optional)");
    sqlStatements.push("-- DELETE FROM system_prompts;");
    sqlStatements.push("");

    // Generate INSERT statements
    systemPrompts.forEach(prompt => {
      const sql = `INSERT INTO system_prompts (
  id, category, subcategory, name, description, content, version, isActive, metadata, createdBy, updatedBy, createdAt, updatedAt
) VALUES (
  '${prompt.id}',
  '${prompt.category}',
  ${prompt.subcategory ? `'${prompt.subcategory}'` : 'NULL'},
  '${prompt.name.replace(/'/g, "''")}',
  ${prompt.description ? `'${prompt.description.replace(/'/g, "''")}'` : 'NULL'},
  '${prompt.content.replace(/'/g, "''")}',
  ${prompt.version},
  ${prompt.isActive ? 'true' : 'false'},
  '${JSON.stringify(prompt.metadata).replace(/'/g, "''")}',
  ${prompt.createdBy ? `'${prompt.createdBy}'` : 'NULL'},
  ${prompt.updatedBy ? `'${prompt.updatedBy}'` : 'NULL'},
  '${prompt.createdAt.toISOString()}',
  '${prompt.updatedAt.toISOString()}'
);`;
      
      sqlStatements.push(sql);
    });

    // Write to file
    const fs = require('fs');
    const path = require('path');
    
    const outputPath = path.join(__dirname, '../production-system-prompts.sql');
    fs.writeFileSync(outputPath, sqlStatements.join('\n\n'));
    
    console.log(`✅ SQL file generated: ${outputPath}`);
    console.log(`📄 Total SQL statements: ${sqlStatements.length - 3}`); // Subtract the comment lines

    // Also create a JSON backup
    const jsonOutputPath = path.join(__dirname, '../production-system-prompts.json');
    fs.writeFileSync(jsonOutputPath, JSON.stringify(systemPrompts, null, 2));
    
    console.log(`✅ JSON backup created: ${jsonOutputPath}`);

    // Create deployment instructions
    const instructions = `
# 🚀 System Prompts Production Deployment Guide

## 📋 What was exported:
- **Total Prompts**: ${systemPrompts.length}
- **Categories**: ${Object.keys(promptsByCategory).join(', ')}
- **SQL File**: production-system-prompts.sql
- **JSON Backup**: production-system-prompts.json

## 🔧 Deployment Options:

### Option 1: Direct SQL Execution (Recommended)
1. Connect to your production database
2. Run the SQL file: \`psql -d your_database -f production-system-prompts.sql\`
3. Verify with: \`SELECT COUNT(*) FROM system_prompts WHERE isActive = true;\`

### Option 2: Database Migration
1. Add the SQL to a new migration file
2. Run: \`npx prisma migrate deploy\`

### Option 3: API Endpoint (if available)
1. Use your admin API to create prompts
2. Import the JSON file through your System Prompts Management interface

### Option 4: Manual Database Insert
1. Copy the SQL statements from production-system-prompts.sql
2. Execute them in your production database management tool

## ✅ Verification Steps:
1. Check prompt count: \`SELECT COUNT(*) FROM system_prompts WHERE isActive = true;\`
2. Test image generation with different styles
3. Verify System Prompts Management shows all prompts
4. Test that \`generateEnhancedPromptWithSystemPrompts\` works correctly

## 🎯 Expected Results:
- All 43 optimized prompts available in production
- Image generation uses database prompts instead of hardcoded fallbacks
- System Prompts Management shows all prompts
- Better AI performance with optimized prompt lengths
`;

    const instructionsPath = path.join(__dirname, '../PRODUCTION_DEPLOYMENT_INSTRUCTIONS.md');
    fs.writeFileSync(instructionsPath, instructions);
    
    console.log(`✅ Deployment instructions created: ${instructionsPath}`);

    console.log("\n🎉 System prompts export completed successfully!");
    console.log("\n📁 Generated files:");
    console.log(`   - production-system-prompts.sql (SQL for direct execution)`);
    console.log(`   - production-system-prompts.json (JSON backup)`);
    console.log(`   - PRODUCTION_DEPLOYMENT_INSTRUCTIONS.md (deployment guide)`);

  } catch (error) {
    console.error("❌ Error exporting system prompts:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the export
exportSystemPromptsForProduction(); 