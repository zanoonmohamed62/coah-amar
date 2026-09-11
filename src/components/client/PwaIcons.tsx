import React from "react";

export function RealisticDumbbellIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Plate gradients with metallic blue specular shine */}
        <linearGradient id="dbPlateGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="35%" stopColor="#3b82f6" />
          <stop offset="80%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#172554" />
        </linearGradient>
        {/* Steel chrome bar gradient */}
        <linearGradient id="dbChromeBar" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#cbd5e1" />
          <stop offset="45%" stopColor="#ffffff" />
          <stop offset="70%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
        {/* Deep rim gradient */}
        <linearGradient id="dbRimGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
      </defs>

      {/* Chrome knurled handle bar */}
      <rect
        x="9.2"
        y="10.8"
        width="5.6"
        height="2.4"
        rx="0.8"
        transform="rotate(-45 12 12)"
        fill="url(#dbChromeBar)"
      />

      {/* Bar knurling grips */}
      <line x1="10.5" y1="10.5" x2="13.5" y2="13.5" stroke="#475569" strokeWidth="0.5" strokeDasharray="0.8 0.8" />

      {/* Left Inner Collar */}
      <rect
        x="7.2"
        y="9.8"
        width="1.6"
        height="4.4"
        rx="0.6"
        transform="rotate(-45 8 12)"
        fill="#e2e8f0"
      />

      {/* Right Inner Collar */}
      <rect
        x="15.2"
        y="9.8"
        width="1.6"
        height="4.4"
        rx="0.6"
        transform="rotate(-45 16 12)"
        fill="#e2e8f0"
      />

      {/* Left Main Heavy Plate */}
      <rect
        x="4.2"
        y="7.2"
        width="3.2"
        height="9.6"
        rx="1.6"
        transform="rotate(-45 5.8 12)"
        fill="url(#dbPlateGrad)"
        stroke="#93c5fd"
        strokeWidth="0.6"
      />

      {/* Left Outer Cap Plate */}
      <rect
        x="1.8"
        y="8.8"
        width="2.6"
        height="6.4"
        rx="1.2"
        transform="rotate(-45 3.1 12)"
        fill="url(#dbRimGrad)"
        stroke="#60a5fa"
        strokeWidth="0.5"
      />

      {/* Right Main Heavy Plate */}
      <rect
        x="16.6"
        y="7.2"
        width="3.2"
        height="9.6"
        rx="1.6"
        transform="rotate(-45 18.2 12)"
        fill="url(#dbPlateGrad)"
        stroke="#93c5fd"
        strokeWidth="0.6"
      />

      {/* Right Outer Cap Plate */}
      <rect
        x="19.6"
        y="8.8"
        width="2.6"
        height="6.4"
        rx="1.2"
        transform="rotate(-45 20.9 12)"
        fill="url(#dbRimGrad)"
        stroke="#60a5fa"
        strokeWidth="0.5"
      />
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
      {/* Speech Bubble */}
      <path
        d="M12 2C6.48 2 2 6.48 2 12C2 13.85 2.5 15.58 3.38 17.07L2 22L7.09 20.67C8.53 21.52 10.21 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z"
        fill="url(#waBgGrad)"
      />
      {/* Top Gloss Highlight */}
      <path
        d="M12 2.8C7 2.8 3 6.8 3 11.8C3 13.5 3.5 15 4.3 16.3L3.6 18.8L6.2 18.1C7.4 18.9 8.8 19.3 10.3 19.3C15.3 19.3 19.3 15.3 19.3 10.3C19.3 5.3 15.3 2.8 12 2.8Z"
        fill="#ffffff"
        opacity="0.12"
      />
      {/* Phone Receiver */}
      <path
        d="M17.05 14.38C16.77 14.24 15.39 13.56 15.13 13.47C14.88 13.37 14.69 13.32 14.51 13.6C14.32 13.88 13.79 14.51 13.63 14.69C13.47 14.88 13.31 14.9 13.03 14.76C12.75 14.62 11.86 14.33 10.8 13.39C9.97 12.65 9.41 11.74 9.25 11.46C9.09 11.18 9.23 11.03 9.37 10.89C9.5 10.76 9.66 10.55 9.8 10.39C9.94 10.23 9.99 10.11 10.08 9.92C10.17 9.74 10.13 9.57 10.06 9.43C9.99 9.29 9.43 7.92 9.2 7.35C8.97 6.8 8.74 6.87 8.57 6.86H8.04C7.85 6.86 7.55 6.93 7.3 7.21C7.05 7.48 6.34 8.14 6.34 9.5C6.34 10.86 7.33 12.16 7.47 12.35C7.61 12.53 9.41 15.32 12.18 16.51C12.84 16.8 13.35 16.97 13.75 17.1C14.41 17.31 15.01 17.28 15.49 17.21C16.02 17.13 17.12 16.54 17.35 15.9C17.58 15.25 17.58 14.7 17.51 14.58C17.44 14.47 17.25 14.4 17.05 14.38Z"
        fill="#ffffff"
      />
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
      {/* Shield Frame */}
      <path
        d="M12 2L4 5V11.09C4 16.14 7.41 20.85 12 22C16.59 20.85 20 16.14 20 11.09V5L12 2Z"
        fill="url(#shPlate)"
        stroke="#a5b4fc"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      {/* Specular Bevel Highlight */}
      <path
        d="M12 3.2L5.5 5.8V11.2C5.5 15.4 8.3 19.3 12 20.5V3.2Z"
        fill="#ffffff"
        opacity="0.2"
      />
      {/* Crisp White Checkmark */}
      <path
        d="M9 11.8L11 13.8L15.2 9.5"
        stroke="#ffffff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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

      {/* Main Organic Energetic Flame */}
      <path
        d="M12 2C10.6 4.6 9 7.2 9 9.8C9 11.2 9.5 12.3 10.3 13.2C10.7 12.1 11.3 11.3 12 10.7C12.8 11.3 13.4 12.1 13.8 13.2C14.6 12.3 15 11.2 15 9.8C15 7.2 13.4 4.6 12 2Z"
        fill="url(#nutriFlame)"
      />
      <path
        d="M12 5.2C8.6 9.2 6.2 12.6 6.2 15.6C6.2 19 8.8 21.8 12 21.8C15.2 21.8 17.8 19 17.8 15.6C17.8 12.6 15.4 9.2 12 5.2Z"
        fill="url(#nutriFlame)"
      />

      {/* Inner Glowing Core */}
      <path
        d="M12 11.2C10.2 13.6 9 15.2 9 16.8C9 18.5 10.3 19.8 12 19.8C13.7 19.8 15 18.5 15 16.8C15 15.2 13.8 13.6 12 11.2Z"
        fill="url(#nutriInner)"
      />

      {/* Specular Highlight */}
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
      <path
        d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
        fill="url(#offBolt)"
        stroke="#93c5fd"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path
        d="M13 3.5L5.5 13H11.5L10.8 18.5L17.5 11H12.2L13 3.5Z"
        fill="#ffffff"
        opacity="0.3"
      />
    </svg>
  );
}
