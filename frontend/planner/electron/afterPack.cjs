const path = require('path');
const fs = require('fs');

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

exports.default = async function(context) {
  const sourceNodeModules = path.join(__dirname, '..', '..', '..', 'backend', 'planner', 'node_modules');
  const destNodeModules = path.join(context.appOutDir, 'resources', 'backend', 'planner', 'node_modules');

  if (fs.existsSync(sourceNodeModules)) {
    console.log('[afterPack] Copying backend node_modules...');
    copyDir(sourceNodeModules, destNodeModules);
    console.log('[afterPack] Backend node_modules copied');
  } else {
    console.warn('[afterPack] Source node_modules not found:', sourceNodeModules);
  }
};
