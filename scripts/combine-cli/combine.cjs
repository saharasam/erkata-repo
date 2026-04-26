#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rootDir = process.cwd();
const rootName = path.basename(rootDir);
const outputDir = path.join(rootDir, `${rootName}_combined`);

// ---------- Args Parsing ----------
const args = process.argv.slice(2);
const isWatch = args.includes('--watch') || args.includes('-w');

let modeArg = args.find(a => a.startsWith('--mode=') || a.startsWith('-m='))?.split('=')[1];
if (!modeArg) {
  const mIndex = args.findIndex(a => a === '--mode' || a === '-m');
  if (mIndex !== -1 && args[mIndex + 1]) modeArg = args[mIndex + 1];
}

let outputNameArg = args.find(a => a.startsWith('--output=') || a.startsWith('-o='))?.split('=')[1];
if (!outputNameArg) {
  const oIndex = args.findIndex(a => a === '--output' || a === '-o');
  if (oIndex !== -1 && args[oIndex + 1]) outputNameArg = args[oIndex + 1];
}

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

function askOutputName() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(
      'Enter output filename (default: all.txt): ',
      (answer) => {
        rl.close();
        resolve(answer.trim() || 'all.txt');
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
  let mode = modeArg === '2' ? 'single' : (modeArg === '1' ? 'multi' : null);
  if (!mode) {
    mode = await askMode();
  }

  let singleFileName = outputNameArg || 'all.txt';
  if (mode === 'single' && !outputNameArg) {
    // Only ask if not provided via flags and we are in single mode
    if (!modeArg) {
      singleFileName = await askOutputName();
    }
  }

  const run = () => {
    console.log(`[${new Date().toLocaleTimeString()}] Combining files...`);
    if (mode === 'single') {
      const outputFile = path.join(outputDir, singleFileName);
      fs.writeFileSync(outputFile, '');
      processAllFiles(rootDir, outputFile);
      console.log(`Done: ${outputFile}`);
    } else {
      processDirectory(rootDir);
      console.log(`Done: ${outputDir}`);
    }
  };

  // Initial run
  run();

  if (isWatch) {
    console.log(`Watching for changes in ${rootDir}... (Ctrl+C to stop)`);
    let timer;
    fs.watch(rootDir, { recursive: true }, (event, filename) => {
      if (filename) {
        // Basic filtering to avoid unnecessary rebuilds
        const parts = filename.split(/[\\/]/);
        if (parts.some(p => IGNORE_DIRS.has(p))) return;
        
        const ext = path.extname(filename).toLowerCase();
        if (IGNORE_EXT.has(ext)) return;

        clearTimeout(timer);
        timer = setTimeout(() => {
          try {
            run();
          } catch (err) {
            console.error('Error updating combined files:', err.message);
          }
        }, 500);
      }
    });
  }
})();