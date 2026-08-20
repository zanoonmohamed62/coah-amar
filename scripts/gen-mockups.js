const sharp = require('sharp');
const fs = require('fs');

async function createMockups() {
  console.log('Generating realistic marketing mockups from actual PDF pages...');

  // 1. Resize individual real pages for composition
  const cover = await sharp('public/assets/split-cover.png')
    .resize(1100, 618)
    .png()
    .toBuffer();

  const push = await sharp('public/assets/split-push-en.png')
    .resize(1000, 562)
    .png()
    .toBuffer();

  const exercises = await sharp('public/assets/split-exercises.png')
    .resize(900, 506)
    .png()
    .toBuffer();

  // Create Training Plan realistic layered PDF presentation
  // Canvas width: 1400, height: 1000 with dark ambient studio background
  const bgTraining = Buffer.from(`
    <svg width="1400" height="1000" viewBox="0 0 1400 1000" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="radialGlow" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stop-color="#1e293b" stop-opacity="0.6"/>
          <stop offset="100%" stop-color="#07090e" stop-opacity="1"/>
        </radialGradient>
        <filter id="shadowBig" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="25" stdDeviation="30" flood-color="#000000" flood-opacity="0.8"/>
        </filter>
        <filter id="shadowBlue" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="15" stdDeviation="25" flood-color="#2563eb" flood-opacity="0.3"/>
        </filter>
      </defs>
      <rect width="1400" height="1000" fill="#07090e"/>
      <circle cx="700" cy="500" r="500" fill="url(#radialGlow)"/>
      <circle cx="1000" cy="300" r="250" fill="#2563eb" opacity="0.08" filter="blur(80px)"/>
      <circle cx="300" cy="700" r="200" fill="#0284c7" opacity="0.06" filter="blur(60px)"/>
    </svg>
  `);

  // Add rounded corners and border to page buffers
  async function wrapPage(imgBuf, width, height, glow = false) {
    const roundedMask = Buffer.from(`
      <svg width="${width}" height="${height}">
        <rect width="${width}" height="${height}" rx="16" fill="#fff"/>
      </svg>
    `);
    const borderSvg = Buffer.from(`
      <svg width="${width}" height="${height}">
        <rect width="${width}" height="${height}" rx="16" fill="none" stroke="${glow ? '#3b82f6' : '#334155'}" stroke-width="${glow ? '3' : '1.5'}" opacity="0.9"/>
      </svg>
    `);
    
    return sharp(imgBuf)
      .resize(width, height)
      .composite([
        { input: roundedMask, blend: 'dest-in' },
        { input: borderSvg, blend: 'over' }
      ])
      .png()
      .toBuffer();
  }

  const wrappedExercises = await wrapPage(exercises, 850, 478);
  const wrappedPush = await wrapPage(push, 950, 534);
  const wrappedCover = await wrapPage(cover, 1050, 590, true);

  // Composite Training Plan Showcase (Realistic 3D Stack of Real PDF)
  await sharp(bgTraining)
    .composite([
      // Back page (Exercises)
      { input: wrappedExercises, top: 80, left: 100 },
      // Middle page (Push Workout)
      { input: wrappedPush, top: 220, left: 240 },
      // Front page (Main Cover)
      { input: wrappedCover, top: 350, left: 180 },
    ])
    .png({ quality: 95 })
    .toFile('public/assets/training-plan-real.png');

  // Also create a 16:9 banner preview for coaching-detail section
  const bgCoaching = Buffer.from(`
    <svg width="1400" height="850" viewBox="0 0 1400 850" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgG" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0a0f1d"/>
          <stop offset="100%" stop-color="#050811"/>
        </linearGradient>
      </defs>
      <rect width="1400" height="850" fill="url(#bgG)"/>
      <circle cx="400" cy="400" r="300" fill="#2563eb" opacity="0.1" filter="blur(90px)"/>
    </svg>
  `);

  const wrappedPull = await wrapPage(await sharp('public/assets/split-pull-en.png').resize(800, 450).png().toBuffer(), 800, 450);
  const wrappedPushMain = await wrapPage(await sharp('public/assets/split-push-en.png').resize(920, 517).png().toBuffer(), 920, 517, true);

  await sharp(bgCoaching)
    .composite([
      { input: wrappedPull, top: 120, left: 80 },
      { input: wrappedPushMain, top: 240, left: 400 },
    ])
    .png({ quality: 95 })
    .toFile('public/assets/coaching-plan-real.png');

  // Also replace existing fake images directly so everything looks real and sharp
  fs.copyFileSync('public/assets/training-plan-real.png', 'public/assets/training-dashboard.png');
  fs.copyFileSync('public/assets/coaching-plan-real.png', 'public/assets/coaching-dashboard.png');

  console.log('Realistic PDF marketing mockups created successfully!');
}

createMockups().catch(err => {
  console.error('Error creating mockups:', err);
  process.exit(1);
});
