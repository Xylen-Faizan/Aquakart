const fs = require('fs');
const path = require('path');

// Source and destination directories
const srcDir = path.join(__dirname, 'app', '(tabs)', '(customer)');
const destDir = path.join(__dirname, 'app', '(tabs)');

// Files to move
const filesToMove = ['index.tsx', 'account.tsx', 'favorites.tsx', 'orders.tsx'];

// Move each file
filesToMove.forEach(file => {
  const srcPath = path.join(srcDir, file);
  const destPath = path.join(destDir, file);
  
  if (fs.existsSync(srcPath)) {
    fs.renameSync(srcPath, destPath);
    console.log(`Moved ${file} to ${destPath}`);
  } else {
    console.log(`Source file not found: ${srcPath}`);
  }
});

// Remove the now empty (customer) directory
if (fs.existsSync(srcDir) && fs.readdirSync(srcDir).length === 0) {
  fs.rmdirSync(srcDir);
  console.log(`Removed empty directory: ${srcDir}`);
}
