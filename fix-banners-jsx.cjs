const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'admin', 'Banners.tsx');

try {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix the JSX structure around line 695
  // Remove any duplicate closing parentheses and braces
  content = content.replace(/\)\)\}\s*\)\)\}/g, '))}');
  
  // Fix Fragment structure - ensure proper closing
  content = content.replace(
    /(\s+)\)\)\}\s*<\/>\s*\)\s*<\/div>/g,
    '$1))}}\n$1  </>\n$1)\n$1</div>'
  );
  
  // Remove any extra closing parentheses before Fragment closing
  content = content.replace(/\)\)\}\s*\n\s*<\/>/, '))}\n                  </>');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Fixed JSX syntax errors in Banners.tsx');
  
} catch (error) {
  console.error('❌ Error fixing file:', error.message);
  process.exit(1);
}