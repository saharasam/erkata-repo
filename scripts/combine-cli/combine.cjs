#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rootDir = path.resolve(process.cwd());
const rootName = path.basename(rootDir);
const outputDir = path.resolve(path.join(rootDir, `${rootName}_combined`));

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
  'node_modules', '.git', 'dist', 'build', '.dart_tool',
  'ios', 'android', 'web', 'macos', 'linux', 'windows',
  'bin', 'obj', 'out', '.idea', '.vscode', 'scratch'
]);

const IGNORE_EXT = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp',
  '.mp4', '.mp3', '.zip', '.tar', '.gz', '.exe',
  '.lock', '.log', '.tmp', '.svg'
]);

// const IGNORE_FILES = new Set([
//   'all_upgrades_output.json',
// ]);

function shouldIgnore(name, fullPath, currentOutputFile = null) {
  if (IGNORE_DIRS.has(name)) return true;
  if (name.endsWith('_combined')) return true;
  if (name.startsWith('.')) return true;
  // if (IGNORE_FILES.has(name)) return true;

  const absPath = path.resolve(fullPath);
  if (absPath === path.resolve(outputDir)) return true;
  if (absPath.startsWith(outputDir + path.sep)) return true;
  if (currentOutputFile && absPath === path.resolve(currentOutputFile)) return true;

  return false;
}

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
      'Enter output filename (will be forced to .txt, default: all.txt): ',
      (answer) => {
        rl.close();
        resolve(answer.trim() || 'all.txt');
      }
    );
  });
}

function ensureTxtExtension(filename) {
  if (!filename) return 'all.txt';
  if (filename.toLowerCase().endsWith('.txt')) return filename;
  const ext = path.extname(filename);
  if (ext) {
    return filename.slice(0, -ext.length) + '.txt';
  }
  return filename + '.txt';
}

// ---------- helpers ----------
function getOutputFileName(dir) {
  const relative = path.relative(rootDir, dir);
  if (!relative) return 'root.txt';
  return relative.split(path.sep).join('__') + '.txt';
}

/**
 * Intelligently read a file by detecting its encoding (BOM or null-byte heuristic).
 */
function readFileSyncSmart(filePath) {
  const buffer = fs.readFileSync(filePath);

  if (buffer.length >= 2) {
    // UTF-16LE BOM: FF FE
    if (buffer[0] === 0xFF && buffer[1] === 0xFE) {
      return buffer.toString('utf16le');
    }
    // UTF-16BE BOM: FE FF
    if (buffer[0] === 0xFE && buffer[1] === 0xFF) {
      const swapped = Buffer.from(buffer);
      for (let i = 0; i < swapped.length - 1; i += 2) {
        const temp = swapped[i];
        swapped[i] = swapped[i + 1];
        swapped[i + 1] = temp;
      }
      return swapped.toString('utf16le');
    }
  }

  if (buffer.length >= 3 && buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
    // UTF-8 with BOM
    return buffer.toString('utf8');
  }

  // Heuristic for UTF-16 without BOM:
  // High density of null bytes usually indicates UTF-16.
  let nulls = 0;
  const checkLen = Math.min(buffer.length, 512);
  for (let i = 0; i < checkLen; i++) {
    if (buffer[i] === 0) nulls++;
  }

  if (checkLen > 0 && nulls > checkLen / 4) {
    return buffer.toString('utf16le');
  }

  return buffer.toString('utf8');
}

// ---------- mode 1: per-directory ----------
function processDirectory(dir) {
  const fileName = getOutputFileName(dir);
  const outputFile = path.join(outputDir, fileName);

  if (shouldIgnore(path.basename(dir), dir, outputFile)) return;

  fs.writeFileSync(outputFile, '');

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (shouldIgnore(entry.name, fullPath, outputFile)) continue;

    if (entry.isDirectory()) {
      processDirectory(fullPath);
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (IGNORE_EXT.has(ext)) continue;

    if (entry.isFile()) {
      try {
        const content = readFileSyncSmart(fullPath);
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

    if (shouldIgnore(entry.name, fullPath, outputFile)) continue;

    if (entry.isDirectory()) {
      processAllFiles(fullPath, outputFile);
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (IGNORE_EXT.has(ext)) continue;

    if (entry.isFile()) {
      try {
        const content = readFileSyncSmart(fullPath);
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
  let singleFileName = outputNameArg;

  // Auto-detect existing setup if in watch mode
  if (isWatch && !mode && fs.existsSync(outputDir)) {
    const existingFiles = fs.readdirSync(outputDir, { withFileTypes: true })
      .filter(e => e.isFile() && !e.name.startsWith('.'))
      .map(e => e.name);

    if (existingFiles.length > 0) {
      if (existingFiles.includes('all.txt')) {
        mode = 'single';
        singleFileName = 'all.txt';
        console.log(`[Watch] Detected existing 'all.txt'. Resuming in Single File mode...`);
      } else if (existingFiles.length === 1) {
        mode = 'single';
        singleFileName = ensureTxtExtension(existingFiles[0]);
        console.log(`[Watch] Detected existing combined file '${existingFiles[0]}'. Resuming as '${singleFileName}'...`);
      } else {
        mode = 'multi';
        console.log(`[Watch] Detected multiple combined files. Resuming in Per-Directory mode...`);
      }
    }
  }

  if (!mode) {
    mode = await askMode();
  }

  if (mode === 'single' && !singleFileName) {
    singleFileName = await askOutputName();
  }
  singleFileName = ensureTxtExtension(singleFileName);

  let isRunning = false;
  const run = () => {
    if (isRunning) return;
    isRunning = true;

    const lockFile = path.join(outputDir, '.combine.lock');
    if (fs.existsSync(lockFile)) {
      isRunning = false;
      return;
    }

    try {
      fs.writeFileSync(lockFile, process.pid.toString());
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
    } catch (err) {
      console.error('Run error:', err.message);
    } finally {
      if (fs.existsSync(lockFile)) fs.unlinkSync(lockFile);
      isRunning = false;
    }
  };

  // Initial run
  run();

  if (isWatch) {
    console.log(`Watching for changes in ${rootDir}... (Ctrl+C to stop)`);
    
    // look for changes every 1 minute
    setInterval(run, 60 * 1000);

    let timer;
    fs.watch(rootDir, { recursive: true }, (event, filename) => {
      if (filename) {
        const fullPath = path.join(rootDir, filename);
        if (shouldIgnore(path.basename(filename), fullPath)) return;
        
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
