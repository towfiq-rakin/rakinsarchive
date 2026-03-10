import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
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
const extensionlessFiles = [];

files.forEach(file => {
  if (file.endsWith('.html') && !file.path?.endsWith('index.html') && !file.endsWith('404.html')) {
    // Specifically ignore index.html and 404.html, but process all other generated notes
    const filenameNoExt = file.substring(0, file.length - 5);
    if (!filenameNoExt.endsWith('index')) {
        fs.renameSync(file, filenameNoExt);
        const relativePath = path.relative(publicDir, filenameNoExt);
        extensionlessFiles.push(`gs://archive.rakin.me/${relativePath.replace(/\\/g, '/')}`);
        console.log(`Renamed: ${relativePath}.html -> ${relativePath}`);
    }
  }
});

fs.writeFileSync('extensionless_files.txt', extensionlessFiles.join('\n'));
console.log(`Finished processing. ${extensionlessFiles.length} files will need content-type updates.`);
