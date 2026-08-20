const sharp = require('sharp');
const fs = require('fs');

async function createSecureMarketingVisuals() {
  console.log('Generating secure, non-leaking marketing graphics...');

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. Training Plan Marketing Visual (Tablet with Cover + Teaser Badges)
  // ─────────────────────────────────────────────────────────────────────────────
  // Cover page only (no workouts on cover, just branding)
  const coverImg = await sharp('public/assets/split-cover.png')
    .resize(960, 540)
    .png()
    .toBuffer();

  // Create rounded cover with metallic border
  const roundedCover = await sharp(coverImg)
    .composite([
      {
        input: Buffer.from(`
          <svg width="960" height="540">
            <rect width="960" height="540" rx="16" fill="none" stroke="#2563eb" stroke-width="2" opacity="0.8"/>
          </svg>
        `),
        blend: 'over'
      }
    ])
    .png()
    .toBuffer();

  // 1200x900 canvas with dark ambient background and marketing badges
  const bgTraining = Buffer.from(`
    <svg width="1200" height="850" viewBox="0 0 1200 850" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="blueGlow" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#1e3a8a" stop-opacity="0.4"/>
          <stop offset="60%" stop-color="#0c1322" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#07090e" stop-opacity="1"/>
        </radialGradient>
        <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#111827" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#07090e" stop-opacity="0.95"/>
        </linearGradient>
      </defs>

      <rect width="1200" height="850" fill="#07090e"/>
      <rect width="1200" height="850" fill="url(#blueGlow)"/>

      <!-- Device / Guide Frame -->
      <rect x="100" y="60" width="1000" height="580" rx="24" fill="#0b101b" stroke="#1e293b" stroke-width="2"/>
      
      <!-- Top Bar of tablet -->
      <rect x="100" y="60" width="1000" height="40" rx="24" fill="#0f172a"/>
      <circle cx="130" cy="80" r="5" fill="#ef4444" opacity="0.8"/>
      <circle cx="150" cy="80" r="5" fill="#eab308" opacity="0.8"/>
      <circle cx="170" cy="80" r="5" fill="#22c55e" opacity="0.8"/>
      <text x="600" y="85" text-anchor="middle" fill="#64748b" font-family="Arial, sans-serif" font-size="12" font-weight="bold">AMAR X SPLIT — OFFICIAL TRAINING SYSTEM</text>

      <!-- Bottom Badges / Teasers -->
      <g transform="translate(100, 670)">
        <!-- Badge 1 -->
        <rect x="0" y="0" width="310" height="70" rx="10" fill="#0f172a" stroke="#1e293b" stroke-width="1.5"/>
        <text x="25" y="32" fill="#38bdf8" font-family="Arial, sans-serif" font-size="13" font-weight="900">12-WEEK HYPERTROPHY</text>
        <text x="25" y="52" fill="#94a3b8" font-family="Arial, sans-serif" font-size="11">Push · Pull · Legs Protocols</text>

        <!-- Badge 2 -->
        <rect x="345" y="0" width="310" height="70" rx="10" fill="#0f172a" stroke="#1e293b" stroke-width="1.5"/>
        <text x="370" y="32" fill="#38bdf8" font-family="Arial, sans-serif" font-size="13" font-weight="900">PROGRESSION SYSTEM</text>
        <text x="370" y="52" fill="#94a3b8" font-family="Arial, sans-serif" font-size="11">Sets, Reps, RPE &amp; Rest Cues</text>

        <!-- Badge 3 -->
        <rect x="690" y="0" width="310" height="70" rx="10" fill="#0f172a" stroke="#2563eb" stroke-width="1.5"/>
        <text x="715" y="32" fill="#60a5fa" font-family="Arial, sans-serif" font-size="13" font-weight="900">OFFLINE APP INCLUDED</text>
        <text x="715" y="52" fill="#94a3b8" font-family="Arial, sans-serif" font-size="11">Access &amp; Save Directly to Phone</text>
      </g>
    </svg>
  `);

  await sharp(bgTraining)
    .composite([
      { input: roundedCover, top: 100, left: 120 },
    ])
    .png({ quality: 95 })
    .toFile('public/assets/training-plan-marketing.png');

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. Coaching System Marketing Visual (Pillars + Progress System)
  // ─────────────────────────────────────────────────────────────────────────────
  const coachingSvg = Buffer.from(`
    <svg width="1200" height="700" viewBox="0 0 1200 700" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bgC" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stop-color="#172554" stop-opacity="0.5"/>
          <stop offset="100%" stop-color="#07090e" stop-opacity="1"/>
        </radialGradient>
        <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f172a"/>
          <stop offset="100%" stop-color="#020617"/>
        </linearGradient>
      </defs>

      <rect width="1200" height="700" fill="#07090e"/>
      <rect width="1200" height="700" fill="url(#bgC)"/>

      <!-- Center Logo / System Title -->
      <g transform="translate(600, 100)" text-anchor="middle">
        <rect x="-160" y="-30" width="320" height="60" rx="30" fill="#1e3a8a" fill-opacity="0.3" stroke="#3b82f6" stroke-width="1.5"/>
        <text y="7" fill="#60a5fa" font-family="Arial Black, sans-serif" font-size="16" font-weight="900" letter-spacing="2">LIVING COACHING ECOSYSTEM</text>
      </g>

      <!-- 4 Pillars Cards Grid -->
      <!-- Pillar 1: Training -->
      <g transform="translate(80, 180)">
        <rect width="240" height="380" rx="16" fill="url(#cardGrad)" stroke="#1e293b" stroke-width="1.5"/>
        <rect x="20" y="20" width="44" height="44" rx="10" fill="#2563eb" fill-opacity="0.15" stroke="#3b82f6" stroke-width="1"/>
        <text x="42" y="48" text-anchor="middle" fill="#60a5fa" font-size="20">🏋️</text>
        <text x="20" y="100" fill="#ffffff" font-family="Arial, sans-serif" font-size="16" font-weight="bold">Custom Training</text>
        <text x="20" y="125" fill="#38bdf8" font-family="Arial, sans-serif" font-size="11" font-weight="bold">TAILORED TO YOUR GOALS</text>
        
        <text x="20" y="170" fill="#94a3b8" font-family="Arial, sans-serif" font-size="12">✓ Push / Pull / Legs structure</text>
        <text x="20" y="205" fill="#94a3b8" font-family="Arial, sans-serif" font-size="12">✓ Weak point specialization</text>
        <text x="20" y="240" fill="#94a3b8" font-family="Arial, sans-serif" font-size="12">✓ Progressive overload plan</text>
        <text x="20" y="275" fill="#94a3b8" font-family="Arial, sans-serif" font-size="12">✓ Video exercise execution</text>

        <rect x="20" y="320" width="200" height="32" rx="6" fill="#1e293b"/>
        <text x="120" y="341" text-anchor="middle" fill="#38bdf8" font-family="Arial, sans-serif" font-size="11" font-weight="bold">ADAPTED WEEKLY</text>
      </g>

      <!-- Pillar 2: Nutrition -->
      <g transform="translate(350, 180)">
        <rect width="240" height="380" rx="16" fill="url(#cardGrad)" stroke="#1e293b" stroke-width="1.5"/>
        <rect x="20" y="20" width="44" height="44" rx="10" fill="#10b981" fill-opacity="0.15" stroke="#10b981" stroke-width="1"/>
        <text x="42" y="48" text-anchor="middle" fill="#34d399" font-size="20">🥗</text>
        <text x="20" y="100" fill="#ffffff" font-family="Arial, sans-serif" font-size="16" font-weight="bold">Calculated Diet</text>
        <text x="20" y="125" fill="#34d399" font-family="Arial, sans-serif" font-size="11" font-weight="bold">GRAM-ACCURATE MACROS</text>
        
        <text x="20" y="170" fill="#94a3b8" font-family="Arial, sans-serif" font-size="12">✓ Flexible healthy foods</text>
        <text x="20" y="205" fill="#94a3b8" font-family="Arial, sans-serif" font-size="12">✓ Budget-friendly options</text>
        <text x="20" y="240" fill="#94a3b8" font-family="Arial, sans-serif" font-size="12">✓ Exact protein &amp; carb ratio</text>
        <text x="20" y="275" fill="#94a3b8" font-family="Arial, sans-serif" font-size="12">✓ Meal swaps &amp; alternatives</text>

        <rect x="20" y="320" width="200" height="32" rx="6" fill="#1e293b"/>
        <text x="120" y="341" text-anchor="middle" fill="#34d399" font-family="Arial, sans-serif" font-size="11" font-weight="bold">NO STARVATION</text>
      </g>

      <!-- Pillar 3: Supplements & Cardio -->
      <g transform="translate(620, 180)">
        <rect width="240" height="380" rx="16" fill="url(#cardGrad)" stroke="#1e293b" stroke-width="1.5"/>
        <rect x="20" y="20" width="44" height="44" rx="10" fill="#a855f7" fill-opacity="0.15" stroke="#a855f7" stroke-width="1"/>
        <text x="42" y="48" text-anchor="middle" fill="#c084fc" font-size="20">💊</text>
        <text x="20" y="100" fill="#ffffff" font-family="Arial, sans-serif" font-size="16" font-weight="bold">Supplements</text>
        <text x="20" y="125" fill="#c084fc" font-family="Arial, sans-serif" font-size="11" font-weight="bold">SCIENCE-BACKED PROTOCOL</text>
        
        <text x="20" y="170" fill="#94a3b8" font-family="Arial, sans-serif" font-size="12">✓ Only what is needed</text>
        <text x="20" y="205" fill="#94a3b8" font-family="Arial, sans-serif" font-size="12">✓ Safe, proven ingredients</text>
        <text x="20" y="240" fill="#94a3b8" font-family="Arial, sans-serif" font-size="12">✓ Cardio timing &amp; heart rate</text>
        <text x="20" y="275" fill="#94a3b8" font-family="Arial, sans-serif" font-size="12">✓ Recovery optimization</text>

        <rect x="20" y="320" width="200" height="32" rx="6" fill="#1e293b"/>
        <text x="120" y="341" text-anchor="middle" fill="#c084fc" font-family="Arial, sans-serif" font-size="11" font-weight="bold">ZERO WASTED MONEY</text>
      </g>

      <!-- Pillar 4: Weekly WhatsApp Followup -->
      <g transform="translate(890, 180)">
        <rect width="240" height="380" rx="16" fill="url(#cardGrad)" stroke="#2563eb" stroke-width="2"/>
        <rect x="20" y="20" width="44" height="44" rx="10" fill="#2563eb" fill-opacity="0.2" stroke="#3b82f6" stroke-width="1.5"/>
        <text x="42" y="48" text-anchor="middle" fill="#60a5fa" font-size="20">📱</text>
        <text x="20" y="100" fill="#ffffff" font-family="Arial, sans-serif" font-size="16" font-weight="bold">Weekly Follow-Up</text>
        <text x="20" y="125" fill="#60a5fa" font-family="Arial, sans-serif" font-size="11" font-weight="bold">DIRECT COACH ACCESS</text>
        
        <text x="20" y="170" fill="#94a3b8" font-family="Arial, sans-serif" font-size="12">✓ Weekly photo check-ins</text>
        <text x="20" y="205" fill="#94a3b8" font-family="Arial, sans-serif" font-size="12">✓ Weight &amp; tape metrics</text>
        <text x="20" y="240" fill="#94a3b8" font-family="Arial, sans-serif" font-size="12">✓ Continuous plan tweaks</text>
        <text x="20" y="275" fill="#94a3b8" font-family="Arial, sans-serif" font-size="12">✓ 1-on-1 direct WhatsApp</text>

        <rect x="20" y="320" width="200" height="32" rx="6" fill="#2563eb"/>
        <text x="120" y="341" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="11" font-weight="bold">GUARANTEED RESULTS</text>
      </g>
    </svg>
  `);

  await sharp(coachingSvg)
    .png({ quality: 95 })
    .toFile('public/assets/coaching-system-marketing.png');

  // Copy to legacy names as fallback
  fs.copyFileSync('public/assets/training-plan-marketing.png', 'public/assets/training-dashboard.png');
  fs.copyFileSync('public/assets/coaching-system-marketing.png', 'public/assets/coaching-dashboard.png');

  console.log('Secure marketing graphics generated successfully!');
}

createSecureMarketingVisuals().catch(err => {
  console.error(err);
  process.exit(1);
});
