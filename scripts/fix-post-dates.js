#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');
const { glob } = require('glob');

async function fixPostDates() {
    console.log('🔍 Post Date Validator and Fixer');
    console.log('================================\n');

    try {
        // Find all markdown files in _posts recursively
        const files = await glob('_posts/**/*.md');
        console.log(`Found ${files.length} markdown files in _posts/\n`);

        let modifiedCount = 0;
        let errorCount = 0;

        for (const file of files) {
            const filename = path.basename(file);
            
            // Extract date from filename: YYYY-MM-DD-title.md
            const match = filename.match(/^(\d{4}-\d{2}-\d{2})-(.+)\.md$/);
            
            if (!match) {
                // File doesn't follow the Jekyll date pattern, skip it
                continue;
            }

            const filenameDateStr = match[1];
            
            try {
                const content = await fs.readFile(file, 'utf-8');
                
                // Regex to capture frontmatter while preserving delimiters and line endings
                // Group 1: Opening delimiter
                // Group 2: Frontmatter content
                // Group 3: Closing delimiter
                const fmRegex = /^(---\r?\n)([\s\S]*?)(\r?\n---)/;
                const fmMatch = content.match(fmRegex);

                if (!fmMatch) {
                    // No frontmatter found
                    continue;
                }

                const openingDelim = fmMatch[1];
                const rawFrontmatter = fmMatch[2];
                const closingDelim = fmMatch[3];
                
                let newFrontmatter = rawFrontmatter;
                let needsSave = false;

                // Regex to find the date field
                // Looks for "date:" at start of line, followed by value
                const dateRegex = /^date:\s*(.*)$/m;
                const dateMatch = rawFrontmatter.match(dateRegex);

                if (dateMatch) {
                    const currentDateVal = dateMatch[1].trim();
                    // Remove quotes for comparison if present
                    const cleanDateVal = currentDateVal.replace(/^["']|["']$/g, '');
                    
                    // Check if the date part matches
                    // We only care if the YYYY-MM-DD part matches (ignoring time if present in file but not in filename)
                    if (!cleanDateVal.startsWith(filenameDateStr)) {
                        console.log(`  📝 Updating ${filename}`);
                        console.log(`     Current: ${cleanDateVal} -> New: ${filenameDateStr}`);
                        
                        // Replace the whole line with the new date
                        // We use the filename date string directly
                        newFrontmatter = rawFrontmatter.replace(dateRegex, `date: ${filenameDateStr}`);
                        needsSave = true;
                    }
                } else {
                    console.log(`  📝 Updating ${filename}`);
                    console.log(`     Date missing -> New: ${filenameDateStr}`);
                    
                    // Insert date field. 
                    // Try to insert after 'title', otherwise at the end of frontmatter
                    if (/^title:/m.test(newFrontmatter)) {
                        newFrontmatter = newFrontmatter.replace(/^(title:.*)$/m, `$1\ndate: ${filenameDateStr}`);
                    } else {
                        newFrontmatter = `${newFrontmatter}\ndate: ${filenameDateStr}`;
                    }
                    needsSave = true;
                }

                if (needsSave) {
                    // Reconstruct file content using original delimiters
                    const newContent = content.replace(fmMatch[0], `${openingDelim}${newFrontmatter}${closingDelim}`);
                    await fs.writeFile(file, newContent);
                    modifiedCount++;
                }

            } catch (err) {
                console.error(`  ❌ Error processing ${file}: ${err.message}`);
                errorCount++;
            }
        }

        console.log('\n📊 Summary');
        console.log('==========');
        console.log(`Total files scanned: ${files.length}`);
        console.log(`Files updated: ${modifiedCount}`);
        console.log(`Errors: ${errorCount}`);

    } catch (error) {
        console.error('❌ Fatal Error:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    fixPostDates();
}

module.exports = { fixPostDates };