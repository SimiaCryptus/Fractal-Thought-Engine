#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');
const { glob } = require('glob');

function toCsvValue(val) {
    if (val === undefined || val === null) return '';
    let stringVal;
    if (typeof val === 'object') {
        stringVal = JSON.stringify(val);
    } else {
        stringVal = String(val);
    }
    if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n') || stringVal.includes('\r')) {
        return `"${stringVal.replace(/"/g, '""')}"`;
    }
    return stringVal;
}


 async function extractFrontmatter() {
    console.log('🔍 Frontmatter Extractor');
    console.log('========================\n');

    try {
        const files = await glob('post_data/**/frontmatter.yaml');
        console.log(`Found ${files.length} frontmatter files.\n`);

        const allData = [];
        const allKeys = new Set(['frontmatter_path']); // Ensure path is first

        // 1. Read all files and collect data + keys
        for (const file of files) {
            try {
                const content = await fs.readFile(file, 'utf-8');
                
                const parsed = yaml.load(content);

                if (!parsed || typeof parsed !== 'object') {
                    console.warn(`⚠️ Skipping ${file}: empty or invalid YAML`);
                    continue;
                }

                const relativePath = path.relative('.', file);
                

                const rowData = {
                    frontmatter_path: relativePath,
                    ...parsed
                };

                // Track all unique keys found across all files
                Object.keys(parsed).forEach(k => allKeys.add(k));
                
                allData.push(rowData);
            } catch (err) {
                console.error(`❌ Error reading ${file}: ${err.message}`);
            }
        }

        // 2. Create _data directory
        const dataDir = '_data';
        try {
            await fs.mkdir(dataDir, { recursive: true });
        } catch (err) {
            // ignore if exists
        }

        // 3. Export CSVs per key  
        const keysToExport = Array.from(allKeys).filter(k => k !== 'frontmatter_path');
        
        for (const key of keysToExport) {
            const csvRows = [];
            // Header: frontmatter_path, key_name
            csvRows.push(`frontmatter_path,${toCsvValue(key)}`);
            
            for (const row of allData) {
                const fileVal = toCsvValue(row.frontmatter_path);
                const dataVal = toCsvValue(row[key]);
                csvRows.push(`${fileVal},${dataVal}`);
            }
            
            // Sanitize filename
            const safeName = key.replace(/[^a-z0-9_\-]/gi, '_');
            const outputPath = path.join(dataDir, `${safeName}.csv`);
            
            await fs.writeFile(outputPath, csvRows.join('\n'));
        }

        console.log(`✅ Exported ${keysToExport.length} CSV files to '${dataDir}/'`);
        console.log(`   Total records processed: ${allData.length}`);

    } catch (error) {
        console.error('❌ Fatal Error:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    extractFrontmatter();
}