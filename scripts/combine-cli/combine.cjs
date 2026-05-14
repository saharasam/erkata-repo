#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const net = require('net'); // Added for Communication Server
const os = require('os');   // Added for Network Address identification

const rootDir = path.resolve(process.cwd());
const rootName = path.basename(rootDir);
const outputDir = path.resolve(path.join(rootDir, `${rootName}_combined`));
let SERVER_PORT = 4242; // Default port

// ---------- ANSI COLORS ----------
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  blue: "\x1b[34m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
  dim: "\x1b[2m"
};

function printHeader() {
  process.stdout.write("\x1B[2J\x1B[0f"); // Clear screen
  console.log(`${colors.magenta}${colors.bright}=============================================`);
  console.log(`   COMBINE CLI - Project Synchronization`);
  console.log(`=============================================${colors.reset}\n`);
}

// GLOBAL STATE for Phase 3 Sync
let lastJsonPayload = null; // Store the latest JSON for new connections

// ---------- Network Logic ----------
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const interfaceName in interfaces) {
    const addresses = interfaces[interfaceName];
    for (const addr of addresses) {
      if (addr.family === 'IPv4' && !addr.internal) {
        return addr.address;
      }
    }
  }
  return '127.0.0.1';
}

// ---------- Communication Server ----------
let connectedClients = [];
const server = net.createServer((socket) => {
  const clientAddr = socket.remoteAddress;
  console.log(`${colors.cyan}[Server] Phone connected: ${clientAddr}${colors.reset}`);
  connectedClients.push(socket);

  // Send the LATEST data immediately upon connection
  if (lastJsonPayload) {
    try {
      const base64Data = Buffer.from(lastJsonPayload).toString('base64');
      socket.write(base64Data + "\n---END_OF_TRANSMISSION---\n");
    } catch (err) {
      console.error(`${colors.red}[Server] Initial sync failed: ${err.message}${colors.reset}`);
    }
  }

  socket.on('error', () => {});
  socket.on('close', () => {
    connectedClients = connectedClients.filter(c => c !== socket);
    console.log(`${colors.dim}[Server] Phone disconnected: ${clientAddr}${colors.reset}`);
  });
});

function startServer(port) {
  server.listen(port, '0.0.0.0', () => {
    console.log(`${colors.blue}---------------------------------------------`);
    console.log(`${colors.bright}COMMUNICATION SERVER ACTIVE`);
    console.log(`${colors.reset}Network Address: ${colors.green}${getLocalIpAddress()}`);
    console.log(`${colors.reset}Port:            ${colors.green}${port}`);
    console.log(`${colors.blue}---------------------------------------------${colors.reset}\n`);
  });
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    SERVER_PORT++;
    startServer(SERVER_PORT);
  } else {
    console.error(`${colors.red}[Server] Fatal Error: ${err.message}${colors.reset}`);
  }
});

function broadcastToPhones(content) {
  if (connectedClients.length === 0) return;
  
  const base64Data = Buffer.from(content).toString('base64');
  
  process.stdout.write(`${colors.yellow}[Sync] Broadcasting update to ${connectedClients.length} device(s)...${colors.reset}\r`);
  connectedClients.forEach(client => {
    try {
      client.write(base64Data + "\n---END_OF_TRANSMISSION---\n");
    } catch (err) {
      console.error(`\n${colors.red}[Server] Broadcast failed: ${err.message}${colors.reset}`);
    }
  });
}

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

let portArg = args.find(a => a.startsWith('--port=') || a.startsWith('-p='))?.split('=')[1];
if (!portArg) {
  const pIndex = args.findIndex(a => a === '--port' || a === '-p');
  if (pIndex !== -1 && args[pIndex + 1]) portArg = args[pIndex + 1];
}
if (portArg) SERVER_PORT = parseInt(portArg, 10);

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

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

function shouldIgnore(name, fullPath) {
  if (IGNORE_DIRS.has(name)) return true;
  if (name.endsWith('_combined')) return true;
  if (name.startsWith('.')) return true;

  const absPath = path.resolve(fullPath);
  if (absPath === path.resolve(outputDir)) return true;
  if (absPath.startsWith(outputDir + path.sep)) return true;

  return false;
}

function askMode() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    process.stdout.write(`${colors.yellow}${colors.bright}Select Output Mode:${colors.reset}\n`);
    process.stdout.write(`  1) Per-directory (multiple .txt files)\n`);
    process.stdout.write(`  2) Single file (consolidated all.txt)\n\n`);
    rl.question(`${colors.cyan}Mode [1/2] (default 1): ${colors.reset}`, (answer) => {
      rl.close();
      resolve(answer.trim() === '2' ? 'single' : 'multi');
    });
  });
}

function askOutputName(defaultName = 'all.txt') {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(`\n${colors.cyan}Enter output filename (default: ${defaultName}): ${colors.reset}`, (answer) => {
      rl.close();
      resolve(answer.trim() || defaultName);
    });
  });
}

function ensureTxtExtension(filename) {
  if (!filename) return 'all.txt';
  if (filename.toLowerCase().endsWith('.txt')) return filename;
  const ext = path.extname(filename);
  if (ext) return filename.slice(0, -ext.length) + '.txt';
  return filename + '.txt';
}

function getOutputFileName(dir) {
  const relative = path.relative(rootDir, dir);
  if (!relative) return 'root.txt';
  return relative.split(path.sep).join('__') + '.txt';
}

function readFileSyncSmart(filePath) {
  const buffer = fs.readFileSync(filePath);
  if (buffer.length >= 2) {
    if (buffer[0] === 0xFF && buffer[1] === 0xFE) return buffer.toString('utf16le');
    if (buffer[0] === 0xFE && buffer[1] === 0xFF) {
      const swapped = Buffer.from(buffer);
      for (let i = 0; i < swapped.length - 1; i += 2) {
        const temp = swapped[i]; swapped[i] = swapped[i + 1]; swapped[i + 1] = temp;
      }
      return swapped.toString('utf16le');
    }
  }
  if (buffer.length >= 3 && buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) return buffer.toString('utf8');
  let nulls = 0;
  const checkLen = Math.min(buffer.length, 512);
  for (let i = 0; i < checkLen; i++) if (buffer[i] === 0) nulls++;
  if (checkLen > 0 && nulls > checkLen / 4) return buffer.toString('utf16le');
  return buffer.toString('utf8');
}


// ---------- File Data Collection ----------
function collectFiles(dir, allFiles = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (shouldIgnore(entry.name, fullPath)) continue;

    if (entry.isDirectory()) {
      collectFiles(fullPath, allFiles);
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (IGNORE_EXT.has(ext)) continue;
      try {
        const content = readFileSyncSmart(fullPath);
        const relative = path.relative(rootDir, fullPath);
        allFiles.push({
          name: entry.name,
          path: relative,
          content: content
        });
      } catch (err) {}
    }
  }
  return allFiles;
}

// ---------- Main Entry ----------
(async () => {
  printHeader();

  let mode = modeArg === '2' ? 'single' : (modeArg === '1' ? 'multi' : null);
  let singleFileName = outputNameArg;

  // Auto-detection: Skip prompts if output already exists
  if (!mode && fs.existsSync(outputDir)) {
    const files = fs.readdirSync(outputDir);
    const hasMultiMarkers = files.some(f => f.includes('__') || f === 'root.txt');

    if (hasMultiMarkers) {
      mode = 'multi';
      console.log(`${colors.dim}[Auto] Detected existing Multi-file output. Using Multi-mode.${colors.reset}`);
    } else {
      const existingTxt = files.filter(f => f.endsWith('.txt') && !f.startsWith('.') && f !== 'all.txt' && f !== 'root.txt');
      if (existingTxt.length > 0) {
        mode = 'single';
        singleFileName = existingTxt[0];
        console.log(`${colors.dim}[Auto] Detected existing output: ${colors.green}${singleFileName}${colors.reset}`);
      } else if (files.includes('all.txt')) {
        mode = 'single';
        singleFileName = 'all.txt';
        console.log(`${colors.dim}[Auto] Detected existing output: ${colors.green}all.txt${colors.reset}`);
      }
    }
  }

  // If no mode provided via args or detected, ask the user
  if (!mode) {
    mode = await askMode();
  }

  // If single file mode and no filename provided via args or detected, ask the user
  if (mode === 'single' && !singleFileName) {
    let defaultName = 'all.txt';
    if (fs.existsSync(outputDir)) {
      const existing = fs.readdirSync(outputDir).find(f => f.endsWith('.txt') && f !== 'root.txt' && f !== 'all.txt');
      if (existing) defaultName = existing;
    }
    singleFileName = await askOutputName(defaultName);
  }

  singleFileName = ensureTxtExtension(singleFileName || 'all.txt');


  console.log(`\n${colors.green}Configuration finalized. Starting services...${colors.reset}\n`);

  // Start Communication Server
  startServer(SERVER_PORT);

  let isRunning = false;
  const run = () => {
    if (isRunning) return;
    isRunning = true;
    const lockFile = path.join(outputDir, '.combine.lock');
    if (fs.existsSync(lockFile)) { isRunning = false; return; }

    try {
      fs.writeFileSync(lockFile, process.pid.toString());
      process.stdout.write(`${colors.dim}[${new Date().toLocaleTimeString()}]${colors.reset} Scanning files... `);
      
      const filesData = collectFiles(rootDir);
      const projectName = singleFileName ? path.basename(singleFileName, '.txt') : rootName;
      
      const payload = {
        projectName: projectName,
        files: filesData
      };
      
      lastJsonPayload = JSON.stringify(payload);
      broadcastToPhones(lastJsonPayload);
      
      // Determine what files SHOULD exist based on current mode
      const activeFileNames = new Set();
      if (mode === 'single') {
        activeFileNames.add(singleFileName || 'all.txt');
      } else {
        filesData.forEach(f => {
          const dir = path.dirname(path.join(rootDir, f.path));
          activeFileNames.add(getOutputFileName(dir));
        });
      }

      // Cleanup: Remove any existing .txt files that aren't in our active set
      if (fs.existsSync(outputDir)) {
        fs.readdirSync(outputDir).forEach(f => {
          if (f.endsWith('.txt') && !activeFileNames.has(f)) {
            try { fs.unlinkSync(path.join(outputDir, f)); } catch (err) {}
          }
        });
      }

      // Handle file writing based on mode
      if (mode === 'single') {
        const outputFile = path.join(outputDir, singleFileName || 'all.txt');
        const combinedText = filesData.map(f => `===== FILE: ${f.path} =====\n${f.content}`).join('\n\n');
        fs.writeFileSync(outputFile, combinedText);
      } else {
        // Multi-mode: Group by directory and write per-directory files
        const filesByDir = {};
        filesData.forEach(f => {
          const dir = path.dirname(path.join(rootDir, f.path));
          const outName = getOutputFileName(dir);
          if (!filesByDir[outName]) filesByDir[outName] = [];
          filesByDir[outName].push(f);
        });

        for (const [outName, files] of Object.entries(filesByDir)) {
          const content = files.map(f => `===== FILE: ${f.name} =====\n\n${f.content}`).join('\n\n');
          fs.writeFileSync(path.join(outputDir, outName), content);
        }
      }
      
      process.stdout.write(`${colors.green}Done (${filesData.length} files)${colors.reset}\n`);
    } catch (err) {
      console.error(`\n${colors.red}Run error: ${err.message}${colors.reset}`);
    } finally {
      if (fs.existsSync(lockFile)) fs.unlinkSync(lockFile);
      isRunning = false;
    }
  };

  run();

  if (isWatch) {
    console.log(`${colors.magenta}Watching for changes... (Ctrl+C to stop)${colors.reset}`);
    setInterval(run, 60 * 1000);
    let timer;
    fs.watch(rootDir, { recursive: true }, (event, filename) => {
      if (filename) {
        const fullPath = path.join(rootDir, filename);
        if (shouldIgnore(path.basename(filename), fullPath)) return;
        if (IGNORE_EXT.has(path.extname(filename).toLowerCase())) return;
        clearTimeout(timer);
        timer = setTimeout(() => { try { run(); } catch (err) {} }, 500);
      }
    });
  }
})();