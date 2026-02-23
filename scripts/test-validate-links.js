#!/usr/bin/env node
const {
    levenshteinDistance,
    findClosestMatch,
    extractMarkdownLinks,
    extractFrontmatterLinks
} = require('./validate-links');

// Test Levenshtein distance
console.log('Testing Levenshtein distance:');
console.log('Distance between "kitten" and "sitting":', levenshteinDistance('kitten', 'sitting')); // Should be 3
console.log('Distance between "consciousness" and "conciousness":', levenshteinDistance('consciousness', 'conciousness')); // Should be 1

// Test markdown link extraction
const testContent = `
This is a test with [a link](test.md) and [another link](https://example.com).
Also [broken link](non-existent.md) here.
`;

console.log('\nTesting markdown link extraction:');
console.log(extractMarkdownLinks(testContent));

// Test frontmatter link extraction
const testFrontmatter = {
    title: 'Test',
    parent_document: 'parent.md',
    child_documents: ['child1.md', 'child2.md'],
    related_documents: ['related.md'],
    some_other_field: 'not a link'
};

console.log('\nTesting frontmatter link extraction:');
console.log(extractFrontmatterLinks(testFrontmatter));

// Test closest match
const availableFiles = [
    '_posts/consciousness-exploration.md',
    '_posts/quantum-consciousness.md',
    '_posts/recursive-optimization.md'
];

console.log('\nTesting closest match:');
console.log('Closest to "conciousness-exploration":',
    findClosestMatch('conciousness-exploration', availableFiles));
console.log('Closest to "quantum-conciousness.md":',
    findClosestMatch('quantum-conciousness.md', availableFiles));