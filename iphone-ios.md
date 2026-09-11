# Realistic iOS & iPhone 3D Glass Graphic Design System (`iphone-ios`)

> Specification and design blueprint for creating authentic, luxury Apple iOS & iPhone-grade graphic icons, tiles, buttons, and badges.
> Registered as an Agent Skill under `.agents/skills/iphone-ios/SKILL.md`.

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

## 3. Usage in Project Codebase

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
