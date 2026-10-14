// 빌드 전에 지난 산출물을 지운다.
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
fs.rmSync(path.join(root, 'dist'), { recursive: true, force: true });
fs.rmSync(path.join(root, 'tokens.css'), { force: true });
