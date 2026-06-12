const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const rootDir = path.join(__dirname, '..', '..', '..');
const backendDir = path.join(rootDir, 'backend', 'planner');
const frontendDir = path.join(rootDir, 'frontend', 'planner');

console.log('🚀 Сборка desktop-приложения Планер\n');

// Step 1: Build backend
console.log('📦 Шаг 1: Сборка backend...');
try {
  execSync('npx tsc', { cwd: backendDir, stdio: 'inherit', shell: true });
  console.log('✅ Backend собран\n');
} catch (e) {
  console.error('❌ Ошибка сборки backend:', e.message);
  process.exit(1);
}

// Step 2: Ensure backend node_modules exist (for production runtime)
console.log('📦 Шаг 2: Проверка backend node_modules...');
const backendNodeModules = path.join(backendDir, 'node_modules');
if (!fs.existsSync(backendNodeModules)) {
  console.log('   Устанавливаю backend dependencies...');
  execSync('npm install', { cwd: backendDir, stdio: 'inherit', shell: true });
}
console.log('✅ Backend dependencies готовы\n');

// Step 3: Build frontend (already done by npm run build before this script)
console.log('📦 Шаг 3: Frontend уже собран (npm run build)\n');

// Step 4: Copy frontend dist into backend dist so server.js can serve it
console.log('📦 Шаг 4: Копирование frontend dist в backend...');
const frontendDist = path.join(frontendDir, 'dist');
const backendDist = path.join(backendDir, 'dist');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      if (!fs.existsSync(destPath)) fs.mkdirSync(destPath, { recursive: true });
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
copyDir(frontendDist, backendDist);
console.log('✅ Frontend скопирован в backend/dist\n');

// Step 5: Run electron-builder
console.log('📦 Шаг 5: Запуск electron-builder...\n');
try {
  execSync('npx electron-builder --win', { cwd: frontendDir, stdio: 'inherit', shell: true });
  console.log('\n🎉 ГОТОВО! Установщик в release/');
} catch (e) {
  console.error('❌ Ошибка electron-builder:', e.message);
  process.exit(1);
}
