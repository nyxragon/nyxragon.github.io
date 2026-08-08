const fs = require("fs");
const path = require("path");

const src = path.join(process.cwd(), "images");
const dest = path.join(process.cwd(), "public", "images");

if (!fs.existsSync(src)) {
  process.exit(0);
}

fs.mkdirSync(dest, { recursive: true });

for (const file of fs.readdirSync(src)) {
  const srcFile = path.join(src, file);
  if (!fs.statSync(srcFile).isFile()) continue;
  fs.copyFileSync(srcFile, path.join(dest, file));
}

console.log("Synced images/ → public/images/");
