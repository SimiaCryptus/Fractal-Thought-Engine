#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');
const { glob } = require('glob');
const yaml = require('js-yaml');

async function ensureDir(dirPath) {
    try {
        await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
        if (error.code !== 'EEXIST') throw error;
    }
}
// Regex to find markdown image references to local assets (both absolute and relative paths)
const imageRegex = /!\[([^\]]*)\]\(((?:\.\.\/)*assets\/images\/[^)]+|\/assets\/images\/[^)]+)\)/g;

async function copyImageToPostDir(imagePath, outputDir) {
    // imagePath can be like /assets/images/foo/bar.png or ../../assets/images/foo/bar.png
    // Normalize to get the actual file path
    let sourcePath = imagePath;
    // Remove leading slash if present
    if (sourcePath.startsWith('/')) {
        sourcePath = sourcePath.slice(1);
    }
    // Remove relative path prefixes (../../) and keep from 'assets' onwards
    const assetsIndex = sourcePath.indexOf('assets/');
    if (assetsIndex !== -1) {
        sourcePath = sourcePath.slice(assetsIndex);
    }
    const imageName = path.basename(imagePath);
    const destPath = path.join(outputDir, imageName);
    try {
        await fs.copyFile(sourcePath, destPath);
        return imageName;
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log(`    ⚠️  Image not found: ${sourcePath}`);
            return null;
        }
        throw error;
    }
}
async function processImagesForExport(content, outputDir) {
    const images = [];
    let match;
    // Find all image references
    const regex = new RegExp(imageRegex.source, imageRegex.flags);
    while ((match = regex.exec(content)) !== null) {
        images.push({
            fullMatch: match[0],
            altText: match[1],
            imagePath: match[2]
        });
    }
    let updatedContent = content;
    for (const img of images) {
        const newName = await copyImageToPostDir(img.imagePath, outputDir);
        if (newName) {
            // Replace the full path with just the filename
            const newRef = `![${img.altText}](${newName})`;
            updatedContent = updatedContent.replace(img.fullMatch, newRef);
            console.log(`    📷 Copied: ${img.imagePath} -> ${newName}`);
        }
    }
    return updatedContent;
}


async function exportPosts() {
    console.log('📤 Post Exporter');
    console.log('================\n');

    const outputDir = 'post_data';

    try {
        // Find all markdown files in _posts
        const files = await glob('_posts/**/*.md');
        console.log(`Found ${files.length} markdown files in _posts/\n`);

        if (files.length === 0) {
            console.log('No files to export.');
            return;
        }

        let exportedCount = 0;
        let errorCount = 0;

        for (const filePath of files) {
            try {
                const content = await fs.readFile(filePath, 'utf-8');
                let parsed;

                try {
                    parsed = matter(content);
                } catch (yamlError) {
                    console.log(`  ❌ YAML parsing error in ${filePath}: ${yamlError.message}`);
                    errorCount++;
                    continue;
                }

                // Create output directory structure
                // _posts/2024/01/my-post.md -> post_data/2024/01/my-post/
                const relativePath = path.relative('_posts', filePath);
                const dirName = relativePath.replace(/\.md$/, '');
                const outputPath = path.join(outputDir, dirName);

                await ensureDir(outputPath);

                // Write frontmatter as YAML
                const frontmatterContent = yaml.dump(parsed.data);
                await fs.writeFile(
                    path.join(outputPath, 'frontmatter.yaml'),
                    frontmatterContent
                );

                // Process images and write content (without frontmatter)
                const bodyContent = await processImagesForExport(parsed.content.trim(), outputPath);
                await fs.writeFile(
                    path.join(outputPath, 'content.md'),
                    bodyContent
                );

                console.log(`✅ Exported: ${filePath} -> ${outputPath}/`);
                exportedCount++;

            } catch (error) {
                console.log(`❌ Error processing ${filePath}: ${error.message}`);
                errorCount++;
            }
        }

        console.log('\n📊 Summary');
        console.log('==========');
        console.log(`Total files processed: ${files.length}`);
        console.log(`Successfully exported: ${exportedCount}`);
        console.log(`Errors: ${errorCount}`);
        console.log(`\nOutput directory: ${outputDir}/`);

    } catch (error) {
        console.error('❌ Fatal Error:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    exportPosts();
}

module.exports = { exportPosts };