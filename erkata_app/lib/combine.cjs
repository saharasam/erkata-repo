#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rootDir = process.cwd();
const rootName = path.basename(rootDir);
const outputDir = path.join(rootDir, `${rootName}_combined`);

// ensure output folder exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// ignore rules
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

// ---------- prompt ----------
function askMode() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(
      'Output mode? (1 = per-directory, 2 = single file): ',
      (answer) => {
        rl.close();
        resolve(answer.trim() === '2' ? 'single' : 'multi');
      }
    );
  });
}

// ---------- helpers ----------
function getOutputFileName(dir) {
  const relative = path.relative(rootDir, dir);
  if (!relative) return 'root.txt';
  return relative.split(path.sep).join('__') + '.txt';
}

// ---------- mode 1: per-directory ----------
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

// ---------- mode 2: single file ----------
function processAllFiles(dir, outputFile) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      processAllFiles(fullPath, outputFile);
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (IGNORE_EXT.has(ext)) continue;

    if (entry.isFile()) {
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const relative = path.relative(rootDir, fullPath);
        const header = `\n\n===== FILE: ${relative} =====\n\n`;
        fs.appendFileSync(outputFile, header + content);
      } catch {}
    }
  }
}

// ---------- entry ----------
(async () => {
  const mode = await askMode();

  if (mode === 'single') {
    const outputFile = path.join(outputDir, 'all.txt');
    fs.writeFileSync(outputFile, '');
    processAllFiles(rootDir, outputFile);
    console.log(`Done: ${outputFile}`);
  } else {
    processDirectory(rootDir);
    console.log(`Done: ${outputDir}`);
  }
})();