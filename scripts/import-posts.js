#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');
const yaml = require('js-yaml');
const { glob } = require('glob');

async function ensureDir(dirPath) {
    try {
        await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
        if (error.code !== 'EEXIST') throw error;
    }
}
// Regex to find markdown image references (local paths, not absolute paths or URLs)
const localImageRegex = /!\[([^\]]*)\]\(([^(/][^)]*\.(?:png|jpg|jpeg|gif|webp|svg))\)/gi;
// List of frontmatter fields that may contain image paths
const imageFrontmatterFields = [
    'featured_image',
    'og_image',
    'schema_image',
    'image',
    'thumbnail',
    'cover_image',
    'banner_image'
];


async function copyImageFromPostDir(imageName, postDir, postSlug) {
    const sourcePath = path.join(postDir, imageName);
    // Put images in /assets/images/{post-slug}/
    const destDir = path.join('assets', 'images', postSlug);
    const destPath = path.join(destDir, imageName);
    try {
         await ensureDir(path.dirname(destPath));
        await fs.copyFile(sourcePath, destPath);
        return '/' + destPath.replace(/\\/g, '/'); // Return absolute path with forward slashes
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log(`    ⚠️  Image not found: ${sourcePath}`);
            return null;
        }
        throw error;
    }
}
async function processFrontmatterImages(frontmatterData, postDir, postSlug) {
    for (const field of imageFrontmatterFields) {
        if (frontmatterData[field] && typeof frontmatterData[field] === 'string') {
            const imageName = frontmatterData[field];
            // Skip if it looks like a URL or absolute path
             if (imageName.startsWith('http') || imageName.startsWith('/')) {
                continue;
            }
            // Check if it looks like an image filename
            if (/\.(png|jpg|jpeg|gif|webp|svg)$/i.test(imageName)) {
                const newPath = await copyImageFromPostDir(imageName, postDir, postSlug);
                if (newPath) {
                    frontmatterData[field] = newPath;
                    console.log(`    📷 Frontmatter ${field}: ${imageName} -> ${newPath}`);
                }
            }
        }
    }
    return frontmatterData;
}


async function processImagesForImport(content, postDir, postSlug) {
    const images = [];
    let match;
    // Find all local image references (filenames without paths)
    const regex = new RegExp(localImageRegex.source, localImageRegex.flags);
    while ((match = regex.exec(content)) !== null) {
        // Skip if it looks like a URL or absolute path
         if (match[2].startsWith('http') || match[2].startsWith('/')) {
            continue;
        }
        images.push({
            fullMatch: match[0],
            altText: match[1],
            imageName: match[2]
        });
    }
    let updatedContent = content;
    for (const img of images) {
        const newPath = await copyImageFromPostDir(img.imageName, postDir, postSlug);
        if (newPath) {
            // Replace the filename with the full path
            const newRef = `![${img.altText}](${newPath})`;
            updatedContent = updatedContent.replace(img.fullMatch, newRef);
            console.log(`    📷 Copied: ${img.imageName} -> ${newPath}`);
        }
    }
    return updatedContent;
}


async function importPosts() {
    console.log('📥 Post Importer');
    console.log('================\n');

    const inputDir = 'post_data';
    const outputDir = '_posts';

    try {
        // Check if post_data exists
        try {
            await fs.access(inputDir);
        } catch {
            console.error(`❌ Directory '${inputDir}' not found.`);
            process.exit(1);
        }

        // Find all frontmatter.yaml files to identify post directories
        const frontmatterFiles = await glob(`${inputDir}/**/frontmatter.yaml`);
        console.log(`Found ${frontmatterFiles.length} post directories in ${inputDir}/\n`);

        if (frontmatterFiles.length === 0) {
            console.log('No posts to import.');
            return;
        }

        let importedCount = 0;
        let errorCount = 0;

        for (const frontmatterPath of frontmatterFiles) {
            const postDir = path.dirname(frontmatterPath);
            // Derive post slug from directory name for image organization
            const postSlug = path.basename(postDir);

            try {
                // Read frontmatter
                const frontmatterContent = await fs.readFile(frontmatterPath, 'utf-8');
                let frontmatterData;

                try {
                    frontmatterData = yaml.load(frontmatterContent);
                } catch (yamlError) {
                    console.log(`  ❌ YAML parsing error in ${frontmatterPath}: ${yamlError.message}`);
                    errorCount++;
                    continue;
                }

                // Process frontmatter images
                frontmatterData = await processFrontmatterImages(frontmatterData, postDir, postSlug);
// Define content files to look for
               const contentFiles = [
                    { filename: 'content.md', title: 'Article', id: 'article' },
                    { filename: 'tutorial.md', title: 'Tutorial', id: 'tutorial' },
                    { filename: 'comic.md', title: 'Comic', id: 'comic' },
                    { filename: 'comic_seq.md', title: 'Comic 2', id: 'comic_seq' },
                    { filename: 'comic_seq_seq.md', title: 'Comic 3', id: 'comic_seq_seq' },
                    { filename: 'narrative.md', title: 'Narrative', id: 'narrative' },
                    { filename: 'narrative_seq.md', title: 'Narrative 2', id: 'narrative_seq' },
                    { filename: 'narrative_seq_seq.md', title: 'Narrative 3', id: 'narrative_seq_seq' },
                    { filename: 'gametheory.md', title: 'Game Theory', id: 'gametheory' },
                    { filename: 'socratic.md', title: 'Socratic Dialog', id: 'socratic' },
                    { filename: 'perspectives.md', title: 'Multi-Perspective', id: 'perspectives' },
                    { filename: 'dialectical.md', title: 'Dialectic', id: 'dialectical' },
                    { filename: 'persuasive.md', title: 'Persuasive', id: 'persuasive' },
                    { filename: 'statemachine.md', title: 'State Machine', id: 'statemachine' },
                    { filename: 'design.md', title: 'Software Design', id: 'design' },
                    { filename: 'counterfactual.md', title: 'Counterfactual Analysis', id: 'counterfactual' },
                    { filename: 'genetic.md', title: 'Genetic Optimization', id: 'genetic' },
                    { filename: 'mathematical.md', title: 'Mathematical Reasoning', id: 'mathematical' },
                    { filename: 'brainstorming.md', title: 'Brainstorming', id: 'brainstorming' },
                    { filename: 'interactive.md', title: 'Interactive Experience', id: 'interactive' },
                    { filename: 'script.md', title: 'Creative Writing', id: 'script' },
                    { filename: 'technical_explanation.md', title: 'Technical Documentation', id: 'technical_explanation' },
                    { filename: 'web_research.md', title: 'Research', id: 'web_research' }
                ];
                const loadedContents = [];
                for (const fileInfo of contentFiles) {
                    const filePath = path.join(postDir, fileInfo.filename);
                    try {
                        let content = await fs.readFile(filePath, 'utf-8');
                        if (content && content.trim()) {
                            // Process images for this content file
                            content = await processImagesForImport(content, postDir, postSlug);
                            loadedContents.push({ ...fileInfo, content });
                        }
                    } catch (error) {
                        if (error.code !== 'ENOENT') throw error;
                    }
                }

                let bodyContent = '';
                if (loadedContents.length === 0) {
                     console.log(`  ⚠️  No content found for ${postDir}`);
                } else if (loadedContents.length === 1 && loadedContents[0].id === 'article') {
                    bodyContent = loadedContents[0].content;
                } else {
                    // Auto-tag based on which content variants were included
                    if (!frontmatterData.content_formats) {
                        frontmatterData.content_formats = loadedContents.map(item => item.id);
                    }
                    // Auto-add format-specific tags
                    const formatTagMap = {
                        'comic': 'Creative-Writing',
                        'comic_seq': 'Creative-Writing',
                        'comic_seq_seq': 'Creative-Writing',
                        'narrative': 'Creative-Writing',
                        'narrative_seq': 'Creative-Writing',
                        'narrative_seq_seq': 'Creative-Writing',
                        'gametheory': 'Game-Theory',
                        'socratic': 'Philosophy-of-Mind',
                        'perspectives': 'Multi-Perspective-Analysis',
                        'dialectical': 'Theoretical-Framework',
                        'persuasive': 'Persuasive-Essay',
                        'statemachine': 'Computational-Analysis',
                        'design': 'Software-Design',
                        'tutorial': 'Tutorial'
                    };
                    if (!frontmatterData.tags) {
                        frontmatterData.tags = [];
                    }
                    const autoTags = new Set(frontmatterData.tags);
                    for (const item of loadedContents) {
                        if (formatTagMap[item.id]) {
                            autoTags.add(formatTagMap[item.id]);
                        }
                    }
                    frontmatterData.tags = Array.from(autoTags);

                    // Generate tabs
                    bodyContent += '<div class="tab-nav">\n';
                    loadedContents.forEach((item, idx) => {
                        const activeClass = idx === 0 ? ' active' : '';
                        bodyContent += `<button class="tab-btn${activeClass}" onclick="openTab(event, '${item.id}')">${item.title}</button>\n`;
                    });
                    bodyContent += '</div>\n\n';

                    loadedContents.forEach((item, idx) => {
                        const displayStyle = idx === 0 ? 'block' : 'none';
                        bodyContent += `<div id="${item.id}" class="tab-content" style="display: ${displayStyle};" markdown="1">\n\n`;
                        bodyContent += item.content + '\n\n';
                        bodyContent += '</div>\n';
                    });
                }


                // Reconstruct the output path
                // post_data/2024/01/my-post/ -> _posts/2024/01/my-post.md
                const relativePath = path.relative(inputDir, postDir);
                const outputPath = path.join(outputDir, relativePath + '.md');

                // Ensure output directory exists
                await ensureDir(path.dirname(outputPath));

                // Combine frontmatter and content
                const combinedContent = matter.stringify(bodyContent.trim(), frontmatterData);

                await fs.writeFile(outputPath, combinedContent);

                console.log(`✅ Imported: ${postDir}/ -> ${outputPath}`);
                importedCount++;

            } catch (error) {
                console.log(`❌ Error processing ${postDir}: ${error.message}`);
                errorCount++;
            }
        }

        console.log('\n📊 Summary');
        console.log('==========');
        console.log(`Total directories processed: ${frontmatterFiles.length}`);
        console.log(`Successfully imported: ${importedCount}`);
        console.log(`Errors: ${errorCount}`);
        console.log(`\nOutput directory: ${outputDir}/`);

    } catch (error) {
        console.error('❌ Fatal Error:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    importPosts();
}

module.exports = { importPosts };