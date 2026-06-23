const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf8');
const replaced = content.replace(/layoutId=\{`.*?`\}/g, '');
fs.writeFileSync('src/App.tsx', replaced);
console.log('Done!');
