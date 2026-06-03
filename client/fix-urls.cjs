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
  if (filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace user profile images
    content = content.replace(/`http:\/\/localhost:5000\$\{user\.profile_image\}`/g, "(user.profile_image?.startsWith('http') ? user.profile_image : `http://localhost:5000${user.profile_image}`)");
    
    // Replace student profile images
    content = content.replace(/`http:\/\/localhost:5000\$\{pass\.student\.profile_image\}`/g, "(pass.student.profile_image?.startsWith('http') ? pass.student.profile_image : `http://localhost:5000${pass.student.profile_image}`)");
    
    // Replace document URLs
    content = content.replace(/`http:\/\/localhost:5000\$\{pass\.document_url\}`/g, "(pass.document_url?.startsWith('http') ? pass.document_url : `http://localhost:5000${pass.document_url}`)");

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed', filePath);
    }
  }
});
