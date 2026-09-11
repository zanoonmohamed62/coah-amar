---
name: iphone-ios
description: Realistic Apple iOS & iPhone 3D glassmorphic graphic design system. Creates hyper-realistic squircle tiles, specular gloss curves, ambient backlight glows, and layered vector icons for PWA, mobile apps, and admin suites.
---

# Realistic iOS & iPhone 3D Glass Graphic Design System (`iphone-ios`)

> Specification and design blueprint for creating authentic, luxury Apple iOS & iPhone-grade graphic icons, tiles, buttons, and badges.

---

## 1. Core Philosophy & Visual Rules

1. **Continuous Squircle Geometry (Superellipse)**:
   - Never use generic rounded corners or flat circles for primary tiles.
   - iOS continuous curvature ratios:
     - Large Hero Tiles (56x56px to 64x64px): `rounded-[18px]` to `rounded-[22px]`, `rx="20"`
     - Medium Action Cards / Badges (40x40px to 48x48px): `rounded-[14px]` to `rounded-[16px]`, `rx="14"`
     - Small Navigation / Toolbar Icons (32x32px to 36x36px): `rounded-[10px]` to `rounded-[12px]`, `rx="10"`
     - App Icons (100x100px or 512x512px): `rx="22"` at 100 viewBox, `rx="105"` at 512 viewBox.

2. **Specular Glass Reflection (Curved Gloss Highlight)**:
   - Every 3D glass surface contains an internal specular reflection along the upper rim or upper half.
   - Path representation:
     ```svg
     <path d="M2 8C2 5.8 3.8 4 6 4H18C20.2 4 22 5.8 22 8V10C16 11 8 9 2 10V8Z" fill="#ffffff" opacity="0.18" />
     ```
   - In Tailwind/CSS containers:
     ```tsx
     <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 via-white/5 to-transparent pointer-events-none" />
     ```

3. **Multi-Stop Lighting Gradients (3-Stop to 4-Stop)**:
   - Avoid flat colors or 2-stop harsh transitions.
   - Always blend from a specular highlight tint, through a saturated brand core, down to a deep luxury shadow anchor.

4. **Layered Depth & Dual Borders**:
   - Primary border: 1px with `border-white/20` or color-tinted `border-blue-400/35`.
   - Inset highlight shadow: `shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_10px_24px_-4px_rgba(...,0.35)]`.
   - Ambient Backlight Blur: An underlying blurred layer with `opacity-80 blur-sm` or `blur-md` creating a neon glow.

---

## 2. Color Palettes & Lighting Tokens

| Name | Role | Gradient Stops | Glow Color |
|------|------|----------------|------------|
| **Electric Royal Blue** | Training Split, App Base, Primary CTAs | `#93c5fd` -> `#3b82f6` -> `#1d4ed8` -> `#172554` | `rgba(37, 99, 235, 0.45)` |
| **Obsidian Emerald** | WhatsApp, Active Status, Revenue | `#6ee7b7` -> `#34d399` -> `#10b981` -> `#065f46` | `rgba(16, 185, 129, 0.35)` |
| **Radiant Amber / Gold** | Nutrition, Orders, Invoices, Billing | `#fef08a` -> `#fbbf24` -> `#f59e0b` -> `#b45309` | `rgba(245, 158, 11, 0.35)` |
| **Velvet Indigo / Violet** | Membership, Users, Entitlements | `#c084fc` -> `#818cf8` -> `#6366f1` -> `#3730a3` | `rgba(99, 102, 241, 0.35)` |
| **Ruby Cherry Red** | Offline Warnings, Sign Out, Destructive | `#fca5a5` -> `#f87171` -> `#ef4444` -> `#991b1b` | `rgba(239, 68, 68, 0.35)` |
| **Titanium Slate / Chrome** | Settings, Secondary Controls, Bars | `#ffffff` -> `#cbd5e1` -> `#94a3b8` -> `#334155` | `rgba(148, 163, 184, 0.25)` |

---

## 3. SVG Architecture Blueprint

Every realistic iOS graphic icon must follow this 5-layer SVG stack:

```svg
<svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- 1. Multi-stop lighting gradient -->
    <linearGradient id="mainGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#93c5fd" />
      <stop offset="50%" stopColor="#3b82f6" />
      <stop offset="100%" stopColor="#1d4ed8" />
    </linearGradient>
  </defs>

  <!-- 2. Primary 3D Body with bevel stroke -->
  <path d="..." fill="url(#mainGrad)" stroke="#bfdbfe" strokeWidth="0.8" strokeLinejoin="round" />

  <!-- 3. Specular upper curved reflection -->
  <path d="..." fill="#ffffff" opacity="0.22" />

  <!-- 4. Razor Chrome core highlights -->
  <path d="..." stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />

  <!-- 5. Fine focal point (accent node / diamond / dot) -->
  <circle cx="12" cy="12" r="1.5" fill="#ffffff" />
</svg>
```

---

## 4. Reusable Component Templates

### A. Realistic iOS Squircle Action Tile
```tsx
<div className="group relative rounded-[22px] bg-gradient-to-b from-[#0e1626]/90 via-[#0a101b]/95 to-[#060911] border border-white/10 hover:border-white/20 p-4 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1 shadow-[0_8px_24px_rgba(0,0,0,0.4)] active:scale-[0.98] overflow-hidden">
  {/* Apple Continuous Squircle Glass Tile */}
  <div className="w-14 h-14 rounded-[18px] bg-gradient-to-b from-blue-600/35 to-blue-900/15 border border-blue-400/35 shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_10px_24px_-4px_rgba(37,99,235,0.35)] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-300 relative overflow-hidden backdrop-blur-xl">
    {/* Internal Specular Glass Highlight */}
    <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-transparent pointer-events-none" />
    <RealisticDumbbellIcon className="w-7 h-7 shrink-0" />
  </div>
  <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors tracking-tight">
    جدول التمرين
  </span>
  <span className="text-[11px] text-slate-400 mt-0.5">
    التمارين والمجموعات
  </span>
</div>
```

### B. Realistic iOS 3D Squircle Pill Button
```tsx
<button className="relative group h-12 px-6 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold text-sm rounded-[18px] transition-all duration-200 flex items-center justify-center gap-2.5 shadow-[0_8px_24px_rgba(37,99,235,0.45),inset_0_1px_1px_rgba(255,255,255,0.35)] active:scale-[0.98] border border-blue-300/30 overflow-hidden">
  {/* Specular gloss top reflection */}
  <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent pointer-events-none" />
  <RealisticDocumentIcon className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
  <span>فتح جدول التمرين</span>
</button>
```

### C. Realistic Coach Amar Avatar & Brand Squircle
```tsx
<div className="relative shrink-0">
  {/* Ambient Backlight Glow */}
  <div className="absolute -inset-1 bg-gradient-to-tr from-blue-600/40 via-cyan-500/30 to-blue-400/20 rounded-[18px] blur-sm pointer-events-none opacity-80" />
  {/* Apple Continuous Squircle Glass Frame */}
  <div className="relative overflow-hidden w-10 h-10 rounded-[14px] border border-blue-400/35 bg-[#090e18] shadow-[0_4px_16px_rgba(37,99,235,0.4),inset_0_1px_1px_rgba(255,255,255,0.35)]">
    <img src="/icons/logo-amar.png" alt="Coach Amar" className="w-full h-full object-cover select-none" />
    <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-transparent pointer-events-none" />
  </div>
  {/* Emerald Verified Indicator */}
  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#070a0f] flex items-center justify-center border border-white/20 shadow-md">
    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
  </div>
</div>
```

---

## 5. Usage in Project Codebase

All icons are exported from `@/components/client/PwaIcons`:
- `RealisticAppIcon` (Electric athletic X split app icon)
- `RealisticDumbbellIcon` (Training split & gym workouts)
- `RealisticWhatsAppIcon` (1-on-1 coach communication)
- `RealisticMembershipIcon` / `RealisticShieldIcon` (Subscriptions & guarantees)
- `RealisticNutritionIcon` (Diet, macros, and calorie guides)
- `RealisticOfflineGymIcon` (Cached local gym mode)
- `RealisticOfflineWifiIcon` (Offline warning and reconnection state)
- `RealisticDocumentIcon` (PDF plans, invoices, CMS contracts)
- `RealisticDashboardIcon` (Matrix overview tiles)
- `RealisticUserIcon` (Athletes & member profiles)
- `RealisticOrdersIcon` (Purchases & transactions)
- `RealisticProductsIcon` (Plans, packages, supplements)
- `RealisticRevenueIcon` / `RealisticTrendingUpIcon` (Financial performance)
- `RealisticCreditCardIcon` (Payment gateways & billing)
- `RealisticTeamIcon` (Admins & coaches)
- `RealisticCmsIcon` (Web content management)
- `RealisticSettingsIcon` (System preferences)
- `RealisticSparklesIcon` (Live app link & premium flair)
- `RealisticLogOutIcon` (Secure session exit)
- `RealisticCoachAvatar` (Verified 3D glass coach profile)
