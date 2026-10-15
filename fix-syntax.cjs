const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'admin', 'Banners.tsx');
const content = fs.readFileSync(filePath, 'utf8');

// Split into lines
const lines = content.split('\n');

// Find and fix the problematic line 695 (index 694)
if (lines[694] && lines[694].trim() === ')}') {
  // Remove the extra line
  lines.splice(694, 1);
  
  // Write back to file
  fs.writeFileSync(filePath, lines.join('\n'));
  console.log('Fixed syntax error in Banners.tsx - removed extra )}');
} else {
  console.log('Line 695 content:', lines[694]);
  console.log('Could not find expected pattern')
}