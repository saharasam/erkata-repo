import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = process.cwd();
const outputDir = path.join(rootDir, 'combined');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

const IGNORE_FILES = new Set(['combined.txt']);
const IGNORE_DIRS = new Set(['node_modules', '.git', 'dist', 'build', 'combined']);
const IGNORE_EXT = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp',
  '.mp4', '.mp3', '.zip', '.tar', '.gz', '.exe'
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

    if (IGNORE_FILES.has(entry.name)) continue;

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

console.log('Done: output in /combined');