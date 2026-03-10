import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

const publicDir = path.join(process.cwd(), 'public');
const files = walk(publicDir);

files.forEach(file => {
  if (file.endsWith('.html') && !file.endsWith('index.html') && !file.endsWith('404.html')) {
    const filenameNoExt = file.substring(0, file.length - 5);
    // Create a directory with the same name as the file (without extension)
    if (!fs.existsSync(filenameNoExt)) {
      fs.mkdirSync(filenameNoExt, { recursive: true });
    }
    
    // Copy the .html file into the new directory as index.html
    const indexPath = path.join(filenameNoExt, 'index.html');
    fs.copyFileSync(file, indexPath);
    console.log(`Created: ${indexPath}`);
  }
});
console.log('Finished generating index.html files for GCS routing.');
