#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');
const { glob } = require('glob');

async function normalizeFeaturedImages() {
    console.log('🖼️  Featured Image Normalizer');
    console.log('=============================\n');

    const inputDir = 'post_data';
    
    try {
        await fs.access(inputDir);
    } catch {
        console.error(`❌ Directory '${inputDir}' not found.`);
        process.exit(1);
    }

    const frontmatterFiles = await glob(`${inputDir}/**/frontmatter.yaml`);
    console.log(`Found ${frontmatterFiles.length} frontmatter files.\n`);

    let updatedCount = 0;
    let removedCount = 0;

    for (const file of frontmatterFiles) {
        const dir = path.dirname(file);
        
        let content;
        try {
            content = await fs.readFile(file, 'utf8');
        } catch (err) {
            console.error(`❌ Error reading ${file}: ${err.message}`);
            continue;
        }

        let data;
        try {
            data = yaml.load(content);
        } catch (err) {
            console.error(`❌ Error parsing YAML in ${file}: ${err.message}`);
            continue;
        }

        // Check if featured_image is set
        if (data && data.featured_image) {
            const originalImage = data.featured_image;
            
            // Skip if it looks like a URL
            if (typeof originalImage === 'string' && (originalImage.match(/^https?:\/\//) || originalImage.startsWith('//'))) {
                continue;
            }

            const imagePath = path.join(dir, originalImage);
            let fileExists = false;

            try {
                await fs.access(imagePath);
                fileExists = true;
            } catch {
                fileExists = false;
            }

            if (!fileExists) {
                console.log(`  🗑️  Removing missing featured_image in ${path.relative(inputDir, dir)}: ${originalImage}`);
                delete data.featured_image;
                removedCount++;
                
                try {
                    await fs.writeFile(file, yaml.dump(data));
                } catch (err) {
                    console.error(`  ❌ Error writing ${file}: ${err.message}`);
                }
            } else {
                // File exists. If it's not main.png, copy it to main.png and update yaml
                if (originalImage !== 'main.png') {
                    const destPath = path.join(dir, 'main.png');
                    try {
                        await fs.copyFile(imagePath, destPath);
                        data.featured_image = 'main.png';
                        
                        await fs.writeFile(file, yaml.dump(data));
                        console.log(`  ✅ Copied & Updated in ${path.relative(inputDir, dir)}: ${originalImage} -> main.png`);
                        updatedCount++;
                    } catch (err) {
                        console.error(`  ❌ Error copying/updating in ${dir}: ${err.message}`);
                    }
                }
            }
        } else if (data) {
            const mainPngPath = path.join(dir, 'main.png');
            try {
                await fs.access(mainPngPath);
                data.featured_image = 'main.png';
                
                await fs.writeFile(file, yaml.dump(data));
                console.log(`  ✅ Set missing featured_image in ${path.relative(inputDir, dir)}: found main.png`);
                updatedCount++;
            } catch {
                // main.png does not exist
            }
        }
    }

    console.log('\n📊 Summary');
    console.log('==========');
    console.log(`Updated (renamed to main.png): ${updatedCount}`);
    console.log(`Removed (missing files): ${removedCount}`);
}

if (require.main === module) {
    normalizeFeaturedImages();
}