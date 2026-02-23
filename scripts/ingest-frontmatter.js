#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');
 const matter = require('gray-matter');
function parseCsvLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (inQuotes) {
            if (char === '"') {
                if (i + 1 < line.length && line[i + 1] === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = false;
                }
            } else {
                current += char;
            }
        } else {
            if (char === '"') {
                inQuotes = true;
            } else if (char === ',') {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
    }
    result.push(current);
    return result;
}


 async function ingestFrontmatter() {
    console.log('📥 Frontmatter Ingestor');
    console.log('=======================\n');

    const dataDir = '_data';

    try {
        // Check if _data exists
        try {
            await fs.access(dataDir);
        } catch {
            console.error(`❌ Directory '${dataDir}' not found.`);
            process.exit(1);
        }


        const files = await fs.readdir(dataDir);
        const csvFiles = files.filter(f => f.endsWith('.csv'));
        
        if (csvFiles.length === 0) {
             console.error(`❌ No CSV files found in '${dataDir}'.`);
            process.exit(1);
        }


        // Aggregate updates by filepath
        const updatesByFile = {};

        for (const file of csvFiles) {
            const content = await fs.readFile(path.join(dataDir, file), 'utf-8');
            const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');
            
            if (lines.length < 2) continue;
            
            const header = parseCsvLine(lines[0]);
            // Expect header: filepath, keyName
            if (header.length < 2 || header[0] !== 'filepath') continue;
            
            const keyName = header[1];
            
            for (let i = 1; i < lines.length; i++) {
                const cols = parseCsvLine(lines[i]);
                if (cols.length < 2) continue;
                
                const fpath = cols[0];
                const val = cols[1];
                
                if (!updatesByFile[fpath]) updatesByFile[fpath] = {};
                updatesByFile[fpath][keyName] = val;
            }
        }

        let updatedCount = 0;
        let errorCount = 0;
        const filePaths = Object.keys(updatesByFile);

        // Process Rows

        for (const targetFile of filePaths) {

            try {
                // Read original file to preserve content and existing keys
                const originalContent = await fs.readFile(targetFile, 'utf-8');
                const parsed = matter(originalContent);
                
                let hasChanges = false;
                const fileUpdates = updatesByFile[targetFile];

                for (const [key, rawValue] of Object.entries(fileUpdates)) {
                    if (rawValue === undefined || rawValue === '') continue;

                    let finalValue = rawValue;

                    // Type Inference
                    // 1. Try JSON (for arrays/objects)
                    if (rawValue.startsWith('[') || rawValue.startsWith('{')) {
                        try {
                            finalValue = JSON.parse(rawValue);
                        } catch (e) {
                            // Keep as string if parse fails
                        }
                    } 
                    // 2. Booleans
                    else if (rawValue.toLowerCase() === 'true') finalValue = true;
                    else if (rawValue.toLowerCase() === 'false') finalValue = false;
                    // 3. Numbers (be careful not to convert "2023-01-01" to a number)
                    else if (!isNaN(rawValue) && rawValue.trim() !== '') {
                        // Only convert if it doesn't look like a date or version string
                        if (!rawValue.includes('-') && !rawValue.includes('.')) {
                             finalValue = Number(rawValue);
                        }
                    }

                    // Check if value is actually different
                    const currentVal = parsed.data[key];
                    
                    // Simple equality check (JSON stringify for objects/arrays to compare)
                    const isDifferent = JSON.stringify(currentVal) !== JSON.stringify(finalValue);

                    if (isDifferent) {
                        parsed.data[key] = finalValue;
                        hasChanges = true;
                    }
                }

                if (hasChanges) {
                    // Reconstruct file
                    const newContent = matter.stringify(parsed.content, parsed.data);
                    await fs.writeFile(targetFile, newContent);
                    console.log(`✅ Updated ${targetFile}`);
                    updatedCount++;
                }

            } catch (err) {
                console.error(`❌ Error processing ${targetFile}: ${err.message}`);
                errorCount++;
            }
        }

        console.log('\n📊 Summary');
        console.log('==========');
        console.log(`Total files processed: ${filePaths.length}`);
        console.log(`Files updated: ${updatedCount}`);
        console.log(`Errors: ${errorCount}`);

    } catch (error) {
        console.error('❌ Fatal Error:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    ingestFrontmatter();
}