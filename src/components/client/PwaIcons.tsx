import React from "react";

export function RealisticDumbbellIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="dbPlateGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="35%" stopColor="#3b82f6" />
          <stop offset="80%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#172554" />
        </linearGradient>
        <linearGradient id="dbChromeBar" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#cbd5e1" />
          <stop offset="45%" stopColor="#ffffff" />
          <stop offset="70%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
        <linearGradient id="dbRimGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
      </defs>
      <rect x="9.2" y="10.8" width="5.6" height="2.4" rx="0.8" transform="rotate(-45 12 12)" fill="url(#dbChromeBar)" />
      <line x1="10.5" y1="10.5" x2="13.5" y2="13.5" stroke="#475569" strokeWidth="0.5" strokeDasharray="0.8 0.8" />
      <rect x="7.2" y="9.8" width="1.6" height="4.4" rx="0.6" transform="rotate(-45 8 12)" fill="#e2e8f0" />
      <rect x="15.2" y="9.8" width="1.6" height="4.4" rx="0.6" transform="rotate(-45 16 12)" fill="#e2e8f0" />
      <rect x="4.2" y="7.2" width="3.2" height="9.6" rx="1.6" transform="rotate(-45 5.8 12)" fill="url(#dbPlateGrad)" stroke="#93c5fd" strokeWidth="0.6" />
      <rect x="1.8" y="8.8" width="2.6" height="6.4" rx="1.2" transform="rotate(-45 3.1 12)" fill="url(#dbRimGrad)" stroke="#60a5fa" strokeWidth="0.5" />
      <rect x="16.6" y="7.2" width="3.2" height="9.6" rx="1.6" transform="rotate(-45 18.2 12)" fill="url(#dbPlateGrad)" stroke="#93c5fd" strokeWidth="0.6" />
      <rect x="19.6" y="8.8" width="2.6" height="6.4" rx="1.2" transform="rotate(-45 20.9 12)" fill="url(#dbRimGrad)" stroke="#60a5fa" strokeWidth="0.5" />
    </svg>
  );
}

export function RealisticWhatsAppIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="waBgGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="60%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <path d="M12 2C6.48 2 2 6.48 2 12C2 13.85 2.5 15.58 3.38 17.07L2 22L7.09 20.67C8.53 21.52 10.21 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" fill="url(#waBgGrad)" />
      <path d="M12 2.8C7 2.8 3 6.8 3 11.8C3 13.5 3.5 15 4.3 16.3L3.6 18.8L6.2 18.1C7.4 18.9 8.8 19.3 10.3 19.3C15.3 19.3 19.3 15.3 19.3 10.3C19.3 5.3 15.3 2.8 12 2.8Z" fill="#ffffff" opacity="0.12" />
      <path d="M17.05 14.38C16.77 14.24 15.39 13.56 15.13 13.47C14.88 13.37 14.69 13.32 14.51 13.6C14.32 13.88 13.79 14.51 13.63 14.69C13.47 14.88 13.31 14.9 13.03 14.76C12.75 14.62 11.86 14.33 10.8 13.39C9.97 12.65 9.41 11.74 9.25 11.46C9.09 11.18 9.23 11.03 9.37 10.89C9.5 10.76 9.66 10.55 9.8 10.39C9.94 10.23 9.99 10.11 10.08 9.92C10.17 9.74 10.13 9.57 10.06 9.43C9.99 9.29 9.43 7.92 9.2 7.35C8.97 6.8 8.74 6.87 8.57 6.86H8.04C7.85 6.86 7.55 6.93 7.3 7.21C7.05 7.48 6.34 8.14 6.34 9.5C6.34 10.86 7.33 12.16 7.47 12.35C7.61 12.53 9.41 15.32 12.18 16.51C12.84 16.8 13.35 16.97 13.75 17.1C14.41 17.31 15.01 17.28 15.49 17.21C16.02 17.13 17.12 16.54 17.35 15.9C17.58 15.25 17.58 14.7 17.51 14.58C17.44 14.47 17.25 14.4 17.05 14.38Z" fill="#ffffff" />
    </svg>
  );
}

export function RealisticMembershipIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shPlate" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="50%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#4338ca" />
        </linearGradient>
      </defs>
      <path d="M12 2L4 5V11.09C4 16.14 7.41 20.85 12 22C16.59 20.85 20 16.14 20 11.09V5L12 2Z" fill="url(#shPlate)" stroke="#a5b4fc" strokeWidth="0.8" strokeLinejoin="round" />
      <path d="M12 3.2L5.5 5.8V11.2C5.5 15.4 8.3 19.3 12 20.5V3.2Z" fill="#ffffff" opacity="0.2" />
      <path d="M9 11.8L11 13.8L15.2 9.5" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function RealisticNutritionIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="nutriFlame" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="45%" stopColor="#f59e0b" />
          <stop offset="85%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#c2410c" />
        </linearGradient>
        <linearGradient id="nutriInner" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="70%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <path d="M12 2C10.6 4.6 9 7.2 9 9.8C9 11.2 9.5 12.3 10.3 13.2C10.7 12.1 11.3 11.3 12 10.7C12.8 11.3 13.4 12.1 13.8 13.2C14.6 12.3 15 11.2 15 9.8C15 7.2 13.4 4.6 12 2Z" fill="url(#nutriFlame)" />
      <path d="M12 5.2C8.6 9.2 6.2 12.6 6.2 15.6C6.2 19 8.8 21.8 12 21.8C15.2 21.8 17.8 19 17.8 15.6C17.8 12.6 15.4 9.2 12 5.2Z" fill="url(#nutriFlame)" />
      <path d="M12 11.2C10.2 13.6 9 15.2 9 16.8C9 18.5 10.3 19.8 12 19.8C13.7 19.8 15 18.5 15 16.8C15 15.2 13.8 13.6 12 11.2Z" fill="url(#nutriInner)" />
      <ellipse cx="9.8" cy="14.2" rx="1.2" ry="2.8" transform="rotate(-22 9.8 14.2)" fill="#ffffff" opacity="0.4" />
    </svg>
  );
}

export function RealisticOfflineGymIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="offBolt" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="url(#offBolt)" stroke="#93c5fd" strokeWidth="1" strokeLinejoin="round" />
      <path d="M13 3.5L5.5 13H11.5L10.8 18.5L17.5 11H12.2L13 3.5Z" fill="#ffffff" opacity="0.3" />
    </svg>
  );
}

export function RealisticDocumentIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="docGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1e40af" />
        </linearGradient>
        <linearGradient id="docFold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#bfdbfe" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>
      </defs>
      {/* Page Body */}
      <path d="M5 4C5 2.89543 5.89543 2 7 2H14L20 8V20C20 21.1046 19.1046 22 18 22H7C5.89543 22 5 21.1046 5 20V4Z" fill="url(#docGrad)" stroke="#93c5fd" strokeWidth="0.8" />
      {/* Folded Corner */}
      <path d="M14 2V6C14 7.10457 14.8954 8 16 8H20L14 2Z" fill="url(#docFold)" />
      {/* Embossed Text Lines */}
      <line x1="8" y1="11" x2="16" y2="11" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" opacity="0.85" />
      <line x1="8" y1="14.5" x2="16" y2="14.5" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" opacity="0.85" />
      <line x1="8" y1="18" x2="13" y2="18" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" opacity="0.85" />
    </svg>
  );
}

export function RealisticRefreshIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="refGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="60%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      <path d="M21 12C21 16.9706 16.9706 21 12 21C7.8 21 4.25 18.15 3.25 14.3" stroke="url(#refGrad)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M3 12C3 7.02944 7.02944 3 12 3C16.2 3 19.75 5.85 20.75 9.7" stroke="url(#refGrad)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M22 6L21 10H17" stroke="url(#refGrad)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 18L3 14H7" stroke="url(#refGrad)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function RealisticShieldIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shGuardGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="50%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
      </defs>
      <path d="M12 2L4 5.5V11.2C4 16.4 7.4 21.1 12 22.3C16.6 21.1 20 16.4 20 11.2V5.5L12 2Z" fill="url(#shGuardGrad)" stroke="#93c5fd" strokeWidth="0.8" strokeLinejoin="round" />
      <path d="M12 3.4L5.2 6.3V11.4C5.2 15.6 8 19.4 12 20.8V3.4Z" fill="#ffffff" opacity="0.22" />
      <path d="M8.8 11.8L10.8 13.8L15.2 9.4" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function RealisticDashboardIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="dashTile1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id="dashTile2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="8" height="8" rx="2.5" fill="url(#dashTile1)" stroke="#93c5fd" strokeWidth="0.6" />
      <rect x="13" y="3" width="8" height="8" rx="2.5" fill="url(#dashTile2)" stroke="#60a5fa" strokeWidth="0.6" opacity="0.9" />
      <rect x="3" y="13" width="8" height="8" rx="2.5" fill="url(#dashTile2)" stroke="#60a5fa" strokeWidth="0.6" opacity="0.9" />
      <rect x="13" y="13" width="8" height="8" rx="2.5" fill="url(#dashTile1)" stroke="#93c5fd" strokeWidth="0.6" />
    </svg>
  );
}

export function RealisticUserIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="usrGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="60%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#3730a3" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="7" r="4.5" fill="url(#usrGrad)" stroke="#a5b4fc" strokeWidth="0.8" />
      <path d="M4 20C4 16.5 7.5 14 12 14C16.5 14 20 16.5 20 20" fill="url(#usrGrad)" stroke="#a5b4fc" strokeWidth="0.8" />
    </svg>
  );
}

export function RealisticOrdersIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="orderGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="60%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>
      <path d="M4 8H20L19 20C19 21.1 18.1 22 17 22H7C5.9 22 5 21.1 5 20L4 8Z" fill="url(#orderGrad)" stroke="#fde68a" strokeWidth="0.8" />
      <path d="M9 10V6C9 4.34315 10.3431 3 12 3C13.6569 3 15 4.34315 15 6V10" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function RealisticProductsIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="pkgGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
      </defs>
      <path d="M12 2L21 6.8V17.2L12 22L3 17.2V6.8L12 2Z" fill="url(#pkgGrad)" stroke="#93c5fd" strokeWidth="0.8" strokeLinejoin="round" />
      <line x1="12" y1="2" x2="12" y2="22" stroke="#bfdbfe" strokeWidth="1" opacity="0.6" />
      <path d="M3 6.8L12 11.5L21 6.8" stroke="#bfdbfe" strokeWidth="1" opacity="0.6" />
    </svg>
  );
}

export function RealisticSettingsIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gearGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="50%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="8" fill="url(#gearGrad)" stroke="#cbd5e1" strokeWidth="0.8" />
      <circle cx="12" cy="12" r="3.2" fill="#0f172a" stroke="#94a3b8" strokeWidth="1.2" />
      <path d="M12 2V4M12 20V22M2 12H4M20 12H22M4.9 4.9L6.3 6.3M17.7 17.7L19.1 19.1M4.9 19.1L6.3 17.7M17.7 6.3L19.1 4.9" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function RealisticSparklesIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="spkGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="60%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>
      </defs>
      <path d="M12 2C12 7.52285 7.52285 12 2 12C7.52285 12 12 16.4772 12 22C12 16.4772 16.4772 12 22 12C16.4772 12 12 7.52285 12 2Z" fill="url(#spkGrad)" stroke="#dbeafe" strokeWidth="0.6" />
      <circle cx="12" cy="12" r="1.8" fill="#ffffff" />
    </svg>
  );
}

export function RealisticLogOutIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logoutGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="60%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#b91c1c" />
        </linearGradient>
      </defs>
      <path d="M9 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H9" stroke="url(#logoutGrad)" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M16 17L21 12L16 7" stroke="url(#logoutGrad)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="21" y1="12" x2="9" y2="12" stroke="url(#logoutGrad)" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function RealisticAppIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="appTileGrad" x1="0" y1="0" x2="100" y2="100">
          <stop offset="0%" stopColor="#17233d" />
          <stop offset="40%" stopColor="#0a101d" />
          <stop offset="100%" stopColor="#04070d" />
        </linearGradient>
        <linearGradient id="xNeonGrad" x1="20" y1="20" x2="80" y2="80">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="35%" stopColor="#38bdf8" />
          <stop offset="70%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <radialGradient id="xCenterCore" cx="50" cy="50" r="25" fx="50" fy="50">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Apple Squircle Base */}
      <rect x="2" y="2" width="96" height="96" rx="22" fill="url(#appTileGrad)" stroke="#3b82f6" strokeWidth="1.5" strokeOpacity="0.4" />
      {/* Specular curved gloss reflection */}
      <path d="M3 24C3 12.4 12.4 3 24 3H76C87.6 3 97 12.4 97 24V40C97 40 68 52 3 32V24Z" fill="#ffffff" opacity="0.08" />

      {/* Core Radial Glow */}
      <circle cx="50" cy="50" r="24" fill="url(#xCenterCore)" />

      {/* Electric X Split Geometry */}
      <g filter="drop-shadow(0px 4px 14px rgba(37,99,235,0.6))">
        {/* Main crossbar 1 */}
        <path d="M26 26L74 74M74 26L26 74" stroke="url(#xNeonGrad)" strokeWidth="13" strokeLinecap="round" />
        {/* Core highlight bar */}
        <path d="M26 26L74 74M74 26L26 74" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.65" />
      </g>

      {/* Center Diamond Core */}
      <rect x="44.5" y="44.5" width="11" height="11" transform="rotate(45 50 50)" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.8" />
    </svg>
  );
}

export function RealisticActivityIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="actGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="40%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="actGlow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>
      </defs>
      <path
        d="M3 12.5H7L9.5 5.5L14.5 19.5L17 12.5H21"
        stroke="url(#actGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 12.5H7L9.5 5.5L14.5 19.5L17 12.5H21"
        stroke="#ffffff"
        strokeWidth="0.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.75"
      />
      <circle cx="14.5" cy="19.5" r="1.5" fill="#38bdf8" />
      <circle cx="9.5" cy="5.5" r="1.5" fill="#67e8f9" />
    </svg>
  );
}

export function RealisticOfflineWifiIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="offWifiRed" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fca5a5" />
          <stop offset="50%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#b91c1c" />
        </linearGradient>
        <linearGradient id="offSlashChrome" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
      </defs>
      {/* Outer signal arc */}
      <path
        d="M3.5 8.5C9.3 3.5 18.7 3.5 24.5 8.5"
        stroke="url(#offWifiRed)"
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.4"
      />
      {/* Middle signal arc */}
      <path
        d="M7 12.5C11 9 17 9 21 12.5"
        stroke="url(#offWifiRed)"
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.6"
      />
      {/* Inner signal arc */}
      <path
        d="M10.5 16.5C12.5 14.5 15.5 14.5 17.5 16.5"
        stroke="url(#offWifiRed)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* Center signal beacon */}
      <circle cx="14" cy="21" r="2.2" fill="url(#offWifiRed)" stroke="#ffffff" strokeWidth="0.8" />
      {/* Chrome cut slash bar */}
      <line
        x1="4"
        y1="4"
        x2="24"
        y2="24"
        stroke="#070a0f"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <line
        x1="4"
        y1="4"
        x2="24"
        y2="24"
        stroke="url(#offSlashChrome)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function RealisticRevenueIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="revGrad" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="40%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#6ee7b7" />
        </linearGradient>
      </defs>
      <path
        d="M21 7L13.5 14.5L9.5 10.5L3 17"
        stroke="url(#revGrad)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 7L13.5 14.5L9.5 10.5L3 17"
        stroke="#ffffff"
        strokeWidth="0.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
      <path
        d="M15 7H21V13"
        stroke="url(#revGrad)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="21" cy="7" r="2" fill="#6ee7b7" stroke="#ffffff" strokeWidth="0.8" />
    </svg>
  );
}

export function RealisticCreditCardIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cardTileGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
        <linearGradient id="goldChip" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#a16207" />
        </linearGradient>
      </defs>
      <rect x="2" y="4" width="20" height="16" rx="4" fill="url(#cardTileGrad)" stroke="#93c5fd" strokeWidth="0.8" />
      {/* Specular gloss top curve */}
      <path d="M2 8C2 5.79086 3.79086 4 6 4H18C20.2091 4 22 5.79086 22 8V10C16 11 8 9 2 10V8Z" fill="#ffffff" opacity="0.2" />
      {/* Magnetic bar */}
      <rect x="2" y="8" width="20" height="3" fill="#0f172a" opacity="0.65" />
      {/* Gold Smart EMV Chip */}
      <rect x="5" y="13" width="4.5" height="3.5" rx="1" fill="url(#goldChip)" stroke="#fef08a" strokeWidth="0.4" />
      <line x1="12" y1="14.5" x2="19" y2="14.5" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
      <line x1="12" y1="16.5" x2="16" y2="16.5" stroke="#93c5fd" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

export function RealisticTeamIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="teamGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="50%" stopColor="#9333ea" />
          <stop offset="100%" stopColor="#581c87" />
        </linearGradient>
      </defs>
      <circle cx="9" cy="8" r="3.5" fill="url(#teamGrad)" stroke="#e9d5ff" strokeWidth="0.8" />
      <circle cx="16" cy="10" r="3" fill="url(#teamGrad)" stroke="#e9d5ff" strokeWidth="0.6" opacity="0.85" />
      <path
        d="M2 19C2 15.5 5 13.5 9 13.5C13 13.5 16 15.5 16 19"
        fill="url(#teamGrad)"
        stroke="#e9d5ff"
        strokeWidth="0.8"
      />
      <path
        d="M16 14.5C17.8 15 20.5 16.2 20.5 19"
        stroke="#c084fc"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.75"
      />
    </svg>
  );
}

export function RealisticCmsIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cmsGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="18" height="18" rx="4" fill="url(#cmsGrad)" stroke="#7dd3fc" strokeWidth="0.8" />
      <path d="M3 7C3 4.8 4.8 3 7 3H17C19.2 3 21 4.8 21 7V9C15 10 9 8 3 9V7Z" fill="#ffffff" opacity="0.18" />
      {/* Header bar */}
      <rect x="6" y="6.5" width="7" height="2.2" rx="0.8" fill="#ffffff" />
      {/* Text lines */}
      <rect x="6" y="11" width="12" height="1.6" rx="0.6" fill="#e0f2fe" opacity="0.85" />
      <rect x="6" y="14" width="9" height="1.6" rx="0.6" fill="#e0f2fe" opacity="0.85" />
      {/* Image tile */}
      <rect x="14" y="6" width="4" height="3" rx="0.8" fill="#ffffff" opacity="0.4" />
    </svg>
  );
}

export function RealisticCoachAvatar({ 
  size = "md",
  className = "",
  showBadge = true 
}: { 
  size?: "sm" | "md" | "lg";
  className?: string;
  showBadge?: boolean;
}) {
  const sizeMap = {
    sm: "w-8 h-8 rounded-[11px]",
    md: "w-10 h-10 rounded-[14px]",
    lg: "w-14 h-14 rounded-[18px]",
  };

  return (
    <div className={`relative shrink-0 ${className}`}>
      {/* Ambient Blue Backlight Glow */}
      <div className="absolute -inset-1 bg-gradient-to-tr from-blue-600/40 via-cyan-500/30 to-blue-400/20 rounded-[18px] blur-sm pointer-events-none opacity-80" />
      
      {/* Apple Continuous Squircle Glass Frame */}
      <div className={`relative overflow-hidden ${sizeMap[size]} border border-blue-400/35 bg-[#090e18] shadow-[0_4px_16px_rgba(37,99,235,0.4),inset_0_1px_1px_rgba(255,255,255,0.35)]`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/logo-amar.png"
          alt="Coach Amar"
          className="w-full h-full object-cover select-none"
        />
        {/* Specular curved gloss reflection */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Verified Coach Emerald Dot Badge */}
      {showBadge && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#070a0f] flex items-center justify-center border border-white/20 shadow-md">
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
        </div>
      )}
    </div>
  );
}
