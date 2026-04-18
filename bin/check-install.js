const fs = require('fs');
const path = require('path');

const expressPkg = path.join(__dirname, '..', 'node_modules', 'express', 'package.json');

if (!fs.existsSync(expressPkg)) {
    console.error('\n❌ Missing dependencies: module "express" was not found.');
    console.error('Run these commands from the repository root and try again:\n');
    console.error('  npm install');
    console.error('  npm start\n');
    console.error('If install fails on "canvas", use Node 20 (see .nvmrc):');
    console.error('  nvm install 20');
    console.error('  nvm use 20\n');
    process.exit(1);
}

const nodeMajor = Number(process.versions.node.split('.')[0]);
if (nodeMajor !== 20) {
    console.warn(`⚠️  Recommended Node version is 20.x (current: ${process.version}).`);
}
