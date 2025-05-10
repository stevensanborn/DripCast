// copy-anchor-files.js
const fs = require('fs');
const path = require('path');

const filesToCopy = [
  {
    from: 'anchor/target/idl/dripcast.json',
    to: 'src/anchor/dripcast.json',
  },
  {
    from: 'anchor/target/types/dripcast.ts',
    to: 'src/anchor/dripcast.ts',
  },
];

filesToCopy.forEach(({ from, to }) => {
  const destDir = path.dirname(to);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(from, to);
  console.log(`Copied ${from} -> ${to}`);
});