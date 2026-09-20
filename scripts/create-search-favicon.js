const sharp = require('c:/Users/dell/Downloads/amar-site/node_modules/sharp');
const fs = require('fs');

async function createFavicons() {
  const source = 'C:/Users/dell/.gemini/antigravity-ide/brain/46238f21-51a4-42a4-8d3a-ccb69eb14b36/.user_uploaded/media_1789938078183.jpg';

  // Base square crop with alpha channel guaranteed (RGBA)
  const base = sharp(source)
    .extract({ left: 0, top: 4, width: 952, height: 952 })
    .ensureAlpha();

  // 1. 192x192 PNG for Googlebot & high-res search favicon
  const png192 = await base.clone().resize(192, 192, { kernel: 'lanczos3' }).png().toBuffer();
  fs.writeFileSync('public/favicon-192x192.png', png192);

  // 2. 48x48 PNG (Google's canonical multiple of 48)
  const png48 = await base.clone().resize(48, 48, { kernel: 'lanczos3' }).png().toBuffer();
  fs.writeFileSync('public/favicon-48x48.png', png48);

  // 3. 512x512 PNG
  const png512 = await base.clone().resize(512, 512, { kernel: 'lanczos3' }).png().toBuffer();
  fs.writeFileSync('public/favicon.png', png512);

  // 4. App router icon
  fs.writeFileSync('src/app/icon.png', png192);

  // 5. Valid ICO file containing 48x48 RGBA PNG (PNG color type 6)
  const icoHeader = Buffer.alloc(22);
  icoHeader.writeUInt16LE(0, 0);       // Reserved
  icoHeader.writeUInt16LE(1, 2);       // ICO type (1)
  icoHeader.writeUInt16LE(1, 4);       // Image count (1)
  icoHeader.writeUInt8(48, 6);         // Width 48
  icoHeader.writeUInt8(48, 7);         // Height 48
  icoHeader.writeUInt8(0, 8);          // Color palette (0)
  icoHeader.writeUInt8(0, 9);          // Reserved
  icoHeader.writeUInt16LE(1, 10);      // Color planes
  icoHeader.writeUInt16LE(32, 12);     // Bits per pixel (32-bit RGBA)
  icoHeader.writeUInt32LE(png48.length, 14); // Image data size
  icoHeader.writeUInt32LE(22, 18);     // Offset of image data (header size 22)

  const icoBuffer = Buffer.concat([icoHeader, png48]);
  fs.writeFileSync('public/favicon.ico', icoBuffer);
  fs.writeFileSync('src/app/favicon.ico', icoBuffer);

  console.log('Favicons generated successfully with RGBA color type.');
}

createFavicons().catch(err => {
  console.error(err);
  process.exit(1);
});
