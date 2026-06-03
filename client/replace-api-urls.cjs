const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(path.join(__dirname, 'src'), function(filePath) {
  if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace fetch('http://localhost:5000...
    content = content.replace(/'http:\/\/localhost:5000(.*?)'/g, "`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}$1`");

    // Replace fetch(`http://localhost:5000...
    content = content.replace(/`http:\/\/localhost:5000(.*?)`/g, "`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}$1`");

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed API URLs in', filePath);
    }
  }
});
