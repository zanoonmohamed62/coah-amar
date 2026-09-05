const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svg = fs.readFileSync('public/icons/icon.svg', 'utf8');

const buf = Buffer.from(svg);

// Ensure directories exist
fs.writeFileSync('public/icons/icon.svg', svg, 'utf8');

async function generate() {
  await sharp(buf).resize(192, 192).png().toFile('public/icons/icon-192.png');
  await sharp(buf).resize(512, 512).png().toFile('public/icons/icon-512.png');
  await sharp(buf).resize(180, 180).png().toFile('public/apple-touch-icon.png');
  
  // App router icons
  await sharp(buf).resize(32, 32).png().toFile('src/app/icon.png');
  await sharp(buf).resize(180, 180).png().toFile('src/app/apple-icon.png');
  
  // Also create 32x32 favicon.ico and overwrite src/app/favicon.ico and public/favicon.ico
  const ico32 = await sharp(buf).resize(32, 32).png().toBuffer();
  fs.writeFileSync('src/app/favicon.ico', ico32);
  fs.writeFileSync('public/favicon.ico', ico32);
  
  console.log('All blue icons and favicons generated successfully!');
}

generate().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
