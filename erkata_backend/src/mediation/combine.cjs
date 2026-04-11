const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const rootName = path.basename(rootDir);

const outputDir = path.join(rootDir, `${rootName}_combined`);

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

const IGNORE_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build',
  'ios', 'android', '.dart_tool',
  `${rootName}_combined`
]);

const IGNORE_EXT = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp',
  '.mp4', '.mp3', '.zip', '.tar', '.gz', '.exe',
  '.lock'
]);

function getOutputFileName(dir) {
  const relative = path.relative(rootDir, dir);
  if (!relative) return 'root.txt';
  return relative.split(path.sep).join('__') + '.txt';
}

function processDirectory(dir) {
  const fileName = getOutputFileName(dir);
  const outputFile = path.join(outputDir, fileName);

  fs.writeFileSync(outputFile, '');

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      processDirectory(fullPath);
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (IGNORE_EXT.has(ext)) continue;

    if (entry.isFile()) {
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const header = `\n\n===== FILE: ${entry.name} =====\n\n`;
        fs.appendFileSync(outputFile, header + content);
      } catch {}
    }
  }
}

processDirectory(rootDir);

console.log(`Done: ${outputDir}`);