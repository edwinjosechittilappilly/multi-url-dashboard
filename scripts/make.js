const fs = require('fs');
const path = require('path');

// Add your build/make logic here
console.log('Running make script...');

// Example: Create directories if they don't exist
const dirs = ['dist', 'build'];
dirs.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
}); 