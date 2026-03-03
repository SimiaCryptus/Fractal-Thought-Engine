#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');
const MANIFEST_PATH = path.join('_data', '.frontmatter-manifest.json');


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
        const activeKeys = new Set();

        for (const file of csvFiles) {
            const content = await fs.readFile(path.join(dataDir, file), 'utf-8');
            const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');
            
            if (lines.length < 2) continue;
            
            const header = parseCsvLine(lines[0]);
            // Expect header: frontmatter_path, keyName
            if (header.length < 2 || header[0] !== 'frontmatter_path') continue;
            
            const keyName = header[1];
            activeKeys.add(keyName);
            
            
            for (let i = 1; i < lines.length; i++) {
                const cols = parseCsvLine(lines[i]);
                if (cols.length < 2) continue;
                
                const fpath = cols[0];
                const val = cols[1];
                
                if (!updatesByFile[fpath]) updatesByFile[fpath] = {};
                updatesByFile[fpath][keyName] = val;
            }
        }
        // Load previous manifest to detect deleted CSVs / removed keys
        let previousManifest = { keys: [], files: {} };
        try {
            const manifestContent = await fs.readFile(MANIFEST_PATH, 'utf-8');
            previousManifest = JSON.parse(manifestContent);
        } catch {
            // No previous manifest; nothing to prune
        }
        // Determine which keys were previously managed but are no longer active
        const previousKeys = new Set(previousManifest.keys || []);
        const removedKeys = [...previousKeys].filter(k => !activeKeys.has(k));
        // For removed keys, we need to prune them from all files that previously had them
        if (removedKeys.length > 0) {
            console.log(`🗑️  Pruning removed keys: ${removedKeys.join(', ')}\n`);
            const previousFiles = previousManifest.files || {};
            for (const [filePath, keys] of Object.entries(previousFiles)) {
                const keysToRemove = keys.filter(k => removedKeys.includes(k));
                if (keysToRemove.length === 0) continue;
                if (!updatesByFile[filePath]) {
                    updatesByFile[filePath] = {};
                }
                for (const key of keysToRemove) {
                    // Sentinel value to signal deletion
                    updatesByFile[filePath][key] = undefined;
                }
            }
        }


        let updatedCount = 0;
        let errorCount = 0;
        const filePaths = Object.keys(updatesByFile);

        // Process Rows

        for (const targetFile of filePaths) {

            try {
                // Read original YAML frontmatter file
                let parsed = {};
                try {
                    const originalContent = await fs.readFile(targetFile, 'utf-8');
                    parsed = yaml.load(originalContent) || {};
                } catch (readErr) {
                    if (readErr.code === 'ENOENT') {
                        // File doesn't exist yet; ensure parent directories exist
                        await fs.mkdir(path.dirname(targetFile), { recursive: true });
                        console.log(`📄 Creating new file ${targetFile}`);
                    } else {
                        throw readErr;
                    }
                }
                
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
                    // Force lowercase for tags and keywords
                    if (key === 'tags' || key === 'keywords') {
                        if (typeof finalValue === 'string') {
                            finalValue = finalValue.toLowerCase();
                        } else if (Array.isArray(finalValue)) {
                            finalValue = finalValue.map(v => typeof v === 'string' ? v.toLowerCase() : v);
                        }
                    }


                    // Check if value is actually different
                    const currentVal = parsed[key];
                    
                    // Simple equality check (JSON stringify for objects/arrays to compare)
                    const isDifferent = JSON.stringify(currentVal) !== JSON.stringify(finalValue);

                    if (isDifferent) {
                        parsed[key] = finalValue;
                        hasChanges = true;
                    }
                }

                if (hasChanges) {
                    // Write updated YAML back to frontmatter file
                    const newContent = yaml.dump(parsed, {
                        lineWidth: -1,
                        noRefs: true,
                        quotingType: '"',
                        forceQuotes: false
                    });
                    await fs.writeFile(targetFile, newContent);
                    console.log(`✅ Updated ${targetFile}`);
                    updatedCount++;
                }

            } catch (err) {
                console.error(`❌ Error processing ${targetFile}: ${err.message}`);
                errorCount++;
            }
        }
        // Save manifest for next run
        const manifestData = {
            keys: [...activeKeys],
            files: {}
        };
        for (const [filePath, updates] of Object.entries(updatesByFile)) {
            const managedKeys = Object.keys(updates).filter(k => updates[k] !== undefined);
            if (managedKeys.length > 0) {
                manifestData.files[filePath] = managedKeys;
            }
        }
        await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifestData, null, 2));


        console.log('\n📊 Summary');
        console.log('==========');
        console.log(`Total files processed: ${filePaths.length}`);
        console.log(`Files updated: ${updatedCount}`);
        console.log(`Errors: ${errorCount}`);
        if (removedKeys.length > 0) {
            console.log(`Keys pruned: ${removedKeys.join(', ')}`);
        }

    } catch (error) {
        console.error('❌ Fatal Error:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    ingestFrontmatter();
}