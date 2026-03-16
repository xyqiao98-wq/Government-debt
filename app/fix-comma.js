const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/data/historicalDebtData.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Replace all occurrences of "}\n  {" with "},\n  {"
// This assumes each object is separated by newline and two spaces before {
let newContent = content.replace(/\}\n  \{/g, '},\n  {');

// Also handle possible variations: maybe 4 spaces? but we saw pattern
// Let's do a more general regex: }\s*{ with newline in between
newContent = newContent.replace(/\}\s*\{/g, '}, {');

fs.writeFileSync(filePath, newContent);
console.log('Fixed commas in historicalDebtData.ts');