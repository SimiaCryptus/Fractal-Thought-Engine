#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');
const { glob } = require('glob');
function levenshteinDistance(str1, str2) {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    return matrix[str2.length][str1.length];
}
function findClosestMatch(targetPath, availableFiles) {
    let minDistance = Infinity;
    let closestMatch = null;
    const targetName = path.basename(targetPath, path.extname(targetPath)).toLowerCase();
    for (const file of availableFiles) {
        const fileName = path.basename(file, '.md').toLowerCase();
        const distance = levenshteinDistance(targetName, fileName);
        if (distance < minDistance) {
            minDistance = distance;
            closestMatch = file;
        }
    }
    for (const file of availableFiles) {
        const distance = levenshteinDistance(targetPath.toLowerCase(), file.toLowerCase());
        if (distance < minDistance) {
            minDistance = distance;
            closestMatch = file;
        }
    }
    return closestMatch;
}
function extractMarkdownLinks(content) {
    const linkRegex = /\[([^\[\]]+)\]\(([^)\s]+)\)/g;
    const links = [];
    let match;
    while ((match = linkRegex.exec(content)) !== null) {
        const link = match[2];
        if (link.endsWith('.md') && !link.startsWith('http')) {
            links.push({
                full: match[0],
                text: match[1],
                path: link,
                index: match.index
            });
        }
    }
    return links;
}
function extractFrontmatterLinks(frontmatter) {
    const linkFields = [
        'parent_document',
        'child_documents',
        'related_documents',
        'cross_synthesis_with',
        'inspired_by',
        'has_inspired'
    ];
    const links = [];
    for (const field of linkFields) {
        if (frontmatter[field]) {
            if (Array.isArray(frontmatter[field])) {
                frontmatter[field].forEach((link, index) => {
                    if (link && typeof link === 'string' && link.endsWith('.md')) {
                        links.push({
                            field,
                            path: link,
                            isArray: true,
                            arrayIndex: index
                        });
                    }
                });
            } else if (typeof frontmatter[field] === 'string' && frontmatter[field].endsWith('.md')) {
                links.push({
                    field,
                    path: frontmatter[field],
                    isArray: false
                });
            }
        }
    }
    return links;
}
function normalizePath(filePath, baseDir) {
    let normalized = filePath.replace(/^\.?\//, '');
    if (!normalized.startsWith('_posts/')) {
        normalized = path.join('_posts', normalized);
    }
    if (!normalized.endsWith('.md')) {
        normalized += '.md';
    }
    return normalized;
}

function createRelativePath(sourceFile, targetFile) {
    const sourceDir = path.dirname(sourceFile);
    let relativePath = path.relative(sourceDir, targetFile);
    relativePath = relativePath.replace(/\\/g, '/');
    if (!relativePath.startsWith('.') && !relativePath.startsWith('/')) {
        relativePath = './' + relativePath;
    }
    return relativePath;
}
async function fileExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}
async function processFile(filePath, availableFiles) {
    console.log(`\nProcessing: ${filePath}`);
    let content, parsed;
    const allLinks = []; 
    
    try {
        content = await fs.readFile(filePath, 'utf-8');
        parsed = matter(content);
    } catch (error) {
        if (error.name === 'YAMLException') {
            console.log(`  ❌ YAML parsing error: ${error.message}`);
            console.log(`  ⚠️  Skipping file due to malformed frontmatter`);
            console.log(`  💡 Fix the YAML syntax in the frontmatter first`);
            return {
                file: filePath,
                fixes: [],
                modified: false,
                error: 'YAML parsing error'
            };
        }
        throw error; 
    }
    let modified = false;
    const fixes = [];
    let fullContent = content;
    const frontmatterLinks = extractFrontmatterLinks(parsed.data);
    for (const link of frontmatterLinks) {
        const normalizedPath = normalizePath(link.path, path.dirname(filePath));
        const exists = await fileExists(normalizedPath);
        allLinks.push({
            type: 'frontmatter',
            field: link.field,
            from: filePath,
            to: link.path,
            normalizedTo: normalizedPath,
            exists: exists,
            isArray: link.isArray,
            arrayIndex: link.arrayIndex
        });
        if (!exists) {
            const closestMatch = findClosestMatch(link.path, availableFiles);
            if (closestMatch) {
                const relativePath = createRelativePath(filePath, closestMatch);
                console.log(`  ❌ Broken frontmatter link: ${link.field} -> ${link.path}`);
                console.log(`  ✅ Fixed with: ${relativePath}`);
                fixes.push({
                    type: 'frontmatter',
                    field: link.field,
                    old: link.path,
                    new: relativePath
                });
                if (link.isArray) {
                    parsed.data[link.field][link.arrayIndex] = relativePath;
                } else {
                    parsed.data[link.field] = relativePath;
                }
                modified = true;
            }
        } else {
            const properRelativePath = createRelativePath(filePath, normalizedPath);
            if (link.path !== properRelativePath) {
                const linkAbsolutePath = path.resolve(path.dirname(filePath), link.path);
                const properAbsolutePath = path.resolve(path.dirname(filePath), properRelativePath);
                
                if (linkAbsolutePath === properAbsolutePath) {
                    continue;
                }
                
                console.log(`  ⚠️  Improper relative path in frontmatter: ${link.field} -> ${link.path}`);
                console.log(`  ✅ Fixed with proper relative path: ${properRelativePath}`);
                fixes.push({
                    type: 'frontmatter',
                    field: link.field,
                    old: link.path,
                    new: properRelativePath,
                    reason: 'improper relative path'
                });
                
                if (link.isArray) {
                    parsed.data[link.field][link.arrayIndex] = properRelativePath;
                } else {
                    parsed.data[link.field] = properRelativePath;
                }
                modified = true;
            }
        }
    }
    const markdownLinks = extractMarkdownLinks(fullContent);
    markdownLinks.sort((a, b) => b.index - a.index);
    for (const link of markdownLinks) {
        const normalizedPath = normalizePath(link.path, path.dirname(filePath));
        const exists = await fileExists(normalizedPath);
        allLinks.push({
            type: 'markdown',
            linkText: link.text,
            from: filePath,
            to: link.path,
            normalizedTo: normalizedPath,
            exists: exists,
            position: link.index
        });
        if (!exists) {
            const closestMatch = findClosestMatch(link.path, availableFiles);
            if (closestMatch) {
                const relativePath = createRelativePath(filePath, closestMatch);
                console.log(`  ❌ Broken markdown link: [${link.text}](${link.path})`);
                console.log(`  ✅ Fixed with: ${relativePath}`);
                fixes.push({
                    type: 'markdown',
                    text: link.text,
                    old: link.path,
                    new: relativePath
                });
                const newLink = `[${link.text}](${relativePath})`;
                fullContent = fullContent.substring(0, link.index) +
                    newLink +
                    fullContent.substring(link.index + link.full.length);

                modified = true;
            }
        } else {
            const properRelativePath = createRelativePath(filePath, normalizedPath);
            if (link.path !== properRelativePath) {
                const linkAbsolutePath = path.resolve(path.dirname(filePath), link.path);
                const properAbsolutePath = path.resolve(path.dirname(filePath), properRelativePath);
                if (linkAbsolutePath === properAbsolutePath) {
                    continue;
                }
                if (link.path !== properRelativePath) {
                    console.log(`  ⚠️  Improper relative path: [${link.text}](${link.path})`);
                    console.log(`  ✅ Fixed with proper relative path: ${properRelativePath}`);
                    fixes.push({
                        type: 'markdown',
                        text: link.text,
                        old: link.path,
                        new: properRelativePath,
                        reason: 'improper relative path'
                    });
                    const newLink = `[${link.text}](${properRelativePath})`;
                    fullContent = fullContent.substring(0, link.index) +
                        newLink +
                        fullContent.substring(link.index + link.full.length);
                    modified = true;
                }
            }
        }
    }
    if (modified) {
        if (fixes.some(f => f.type === 'frontmatter')) {
            const modifiedParsed = matter(fullContent);
            const updatedContent = matter.stringify(modifiedParsed.content, parsed.data);
            await fs.writeFile(filePath, updatedContent);
        } else {
            await fs.writeFile(filePath, fullContent);
        }
        console.log(`  💾 Saved ${fixes.length} fixes to ${filePath}`);
    } else {
        console.log(`  ✓ No broken links found`);
    }
    return {
        file: filePath,
        fixes,
        modified,
        allLinks
    };
}
async function validateAndFixLinks() {
    console.log('🔍 Markdown Link Validator and Fixer');
    console.log('====================================\n');
    try {
        const files = await glob('_posts/**/*.md');
        console.log(`Found ${files.length} markdown files in _posts/\n`);
        const availableFiles = files.map(f => f);
        const results = [];
        const allLinksData = [];
        for (const file of files) {
            const result = await processFile(file, availableFiles);
            results.push(result);
            allLinksData.push(...result.allLinks);
        }
        console.log('\n\n📊 Summary');
        console.log('==========');
        const modifiedFiles = results.filter(r => r.modified);
        const errorFiles = results.filter(r => r.error);
        const totalFixes = results.reduce((sum, r) => sum + r.fixes.length, 0);
        console.log(`Total files processed: ${files.length}`);
        console.log(`Files with errors: ${errorFiles.length}`);
        console.log(`Files with broken links: ${modifiedFiles.length}`);
        console.log(`Total links fixed: ${totalFixes}`);
        if (errorFiles.length > 0) {
            console.log('\n❌ Files with errors:');
            errorFiles.forEach(r => {
                console.log(`  - ${r.file}: ${r.error}`);
            });
        }
        if (modifiedFiles.length > 0) {
            console.log('\n📝 Modified files:');
            modifiedFiles.forEach(r => {
                console.log(`  - ${r.file} (${r.fixes.length} fixes)`);
                r.fixes.forEach(fix => {
                    console.log(`    • ${fix.type}: ${fix.old} → ${fix.new}`);
                });
            });
        }
        const report = {
            timestamp: new Date().toISOString(),
            totalFiles: files.length,
            modifiedFiles: modifiedFiles.length,
            totalFixes: totalFixes,
            details: results.filter(r => r.modified)
        };
        await fs.writeFile(
            'link-validation-report.json',
            JSON.stringify(report, null, 2)
        );
        console.log('\n📄 Detailed report saved to: link-validation-report.json');
        const linksReport = {
            timestamp: new Date().toISOString(),
            totalLinks: allLinksData.length,
            linksByType: {
                frontmatter: allLinksData.filter(l => l.type === 'frontmatter').length,
                markdown: allLinksData.filter(l => l.type === 'markdown').length
            },
            brokenLinks: allLinksData.filter(l => !l.exists).length,
            links: allLinksData.map(link => ({
                type: link.type,
                from: link.from,
                to: link.to,
                normalizedTo: link.normalizedTo,
                exists: link.exists,
                ...(link.type === 'frontmatter' ? {
                    field: link.field,
                    isArray: link.isArray,
                    arrayIndex: link.arrayIndex
                } : {
                    linkText: link.linkText,
                    position: link.position
                })
            }))
        };
        const linksByFile = {};
        allLinksData.forEach(link => {
            if (!linksByFile[link.from]) {
                linksByFile[link.from] = [];
            }
            linksByFile[link.from].push(link);
        });
        linksReport.linksByFile = linksByFile;
        const incomingLinks = {};
        allLinksData.forEach(link => {
            const target = link.normalizedTo;
            if (!incomingLinks[target]) {
                incomingLinks[target] = [];
            }
            incomingLinks[target].push({
                from: link.from,
                type: link.type,
                ...(link.type === 'frontmatter' ? {field: link.field} : {linkText: link.linkText})
            });
        });
        linksReport.incomingLinks = incomingLinks;
        await fs.writeFile(
            'all-links-report.json',
            JSON.stringify(linksReport, null, 2)
        );
        console.log('📄 All links report saved to: all-links-report.json');
        const csvHeader = 'Type,From,To,Exists,Field/LinkText,Details\n';
        const csvRows = allLinksData.map(link => {
            const fieldOrText = link.type === 'frontmatter' ? link.field : link.linkText;
            const details = link.type === 'frontmatter'
                ? (link.isArray ? `Array[${link.arrayIndex}]` : 'Single value')
                : `Position: ${link.position}`;
            return `"${link.type}","${link.from}","${link.to}","${link.exists}","${fieldOrText}","${details}"`;
        }).join('\n');
        await fs.writeFile(
            'all-links-report.csv',
            csvHeader + csvRows
        );
        console.log('📄 Links CSV report saved to: all-links-report.csv');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}
if (require.main === module) {
    validateAndFixLinks();
}
module.exports = {
    validateAndFixLinks,
    levenshteinDistance,
    findClosestMatch,
    extractMarkdownLinks,
    extractFrontmatterLinks,
    createRelativePath
};