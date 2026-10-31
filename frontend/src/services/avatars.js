/**
 * KnowBridge Clean Vector Engineer Avatars
 * 100% SVG Data URLs — No external network, zero AI photo artifacts, ultra-crisp at any resolution.
 */

const encodeSvg = (svgString) => `data:image/svg+xml;utf8,${encodeURIComponent(svgString.trim())}`;

// 1. Indigo Tech Lead (Headphones & Glasses)
const SVG_INDIGO = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="gIndigo" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4F46E5" />
      <stop offset="100%" stop-color="#7C3AED" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="32" fill="url(#gIndigo)" />
  <!-- Head & Torso -->
  <circle cx="50" cy="40" r="18" fill="#F8FAFC" />
  <path d="M26 84 C26 64 36 58 50 58 C64 58 74 64 74 84 Z" fill="#E2E8F0" />
  <!-- Glasses -->
  <rect x="37" y="36" width="26" height="8" rx="4" fill="#1E1B4B" />
  <circle cx="43" cy="40" r="2.5" fill="#818CF8" />
  <circle cx="57" cy="40" r="2.5" fill="#818CF8" />
  <path d="M49 40 L51 40" stroke="#1E1B4B" stroke-width="2" />
  <!-- Headphones -->
  <path d="M29 38 A21 21 0 0 1 71 38" fill="none" stroke="#CBD5E1" stroke-width="4" stroke-linecap="round" />
  <rect x="27" y="34" width="5" height="13" rx="2.5" fill="#312E81" />
  <rect x="68" y="34" width="5" height="13" rx="2.5" fill="#312E81" />
</svg>
`;

// 2. Emerald SRE / Systems (Round Glasses & Collar)
const SVG_EMERALD = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="gEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#059669" />
      <stop offset="100%" stop-color="#0D9488" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="32" fill="url(#gEmerald)" />
  <!-- Head & Torso -->
  <circle cx="50" cy="40" r="18" fill="#F8FAFC" />
  <path d="M26 84 C26 64 36 58 50 58 C64 58 74 64 74 84 Z" fill="#CCFBF1" />
  <polygon points="50,68 43,58 57,58" fill="#047857" />
  <!-- Round Wire Glasses -->
  <circle cx="43" cy="40" r="5.5" fill="none" stroke="#064E3B" stroke-width="2" />
  <circle cx="57" cy="40" r="5.5" fill="none" stroke="#064E3B" stroke-width="2" />
  <line x1="48.5" y1="40" x2="51.5" y2="40" stroke="#064E3B" stroke-width="2" />
  <circle cx="43" cy="40" r="2" fill="#047857" />
  <circle cx="57" cy="40" r="2" fill="#047857" />
  <!-- Short Clean Hair -->
  <path d="M32 36 C32 26 40 22 50 22 C60 22 68 26 68 36 Z" fill="#064E3B" />
</svg>
`;

// 3. Violet Architect (Beanie & Focus Specs)
const SVG_VIOLET = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="gViolet" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8B5CF6" />
      <stop offset="100%" stop-color="#D946EF" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="32" fill="url(#gViolet)" />
  <!-- Head & Torso -->
  <circle cx="50" cy="42" r="17" fill="#FDF4FF" />
  <path d="M26 84 C26 64 36 59 50 59 C64 59 74 64 74 84 Z" fill="#F5D0FE" />
  <!-- Beanie Hat -->
  <path d="M31 38 C31 22 41 18 50 18 C59 18 69 22 69 38 Z" fill="#4C1D95" />
  <rect x="30" y="34" width="40" height="6" rx="3" fill="#5B21B6" />
  <!-- Glasses -->
  <rect x="39" y="40" width="10" height="6" rx="2" fill="#4C1D95" />
  <rect x="51" y="40" width="10" height="6" rx="2" fill="#4C1D95" />
  <line x1="49" y1="43" x2="51" y2="43" stroke="#4C1D95" stroke-width="2" />
  <circle cx="44" cy="43" r="1.5" fill="#E9D5FF" />
  <circle cx="56" cy="43" r="1.5" fill="#E9D5FF" />
</svg>
`;

// 4. Amber DevOps (Cap & Headset)
const SVG_AMBER = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="gAmber" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#EA580C" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="32" fill="url(#gAmber)" />
  <!-- Head & Torso -->
  <circle cx="50" cy="42" r="18" fill="#FFFBEB" />
  <path d="M26 84 C26 64 36 60 50 60 C64 60 74 64 74 84 Z" fill="#FEF3C7" />
  <!-- Backward Cap -->
  <path d="M32 38 C32 26 40 22 50 22 C60 22 68 26 68 38 Z" fill="#78350F" />
  <path d="M30 38 L22 36 L24 40 Z" fill="#78350F" />
  <!-- Eyes -->
  <circle cx="43" cy="43" r="2.5" fill="#78350F" />
  <circle cx="57" cy="43" r="2.5" fill="#78350F" />
  <!-- Headset Mic -->
  <path d="M68 38 C70 48 64 54 54 54" fill="none" stroke="#451A03" stroke-width="2.5" stroke-linecap="round" />
  <circle cx="52" cy="54" r="3" fill="#D97706" />
</svg>
`;

// 5. Rose Frontend / UI Lead (Geometric Hair & Minimal Specs)
const SVG_ROSE = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="gRose" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F43F5E" />
      <stop offset="100%" stop-color="#E11D48" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="32" fill="url(#gRose)" />
  <!-- Head & Torso -->
  <circle cx="50" cy="42" r="17" fill="#FFF1F2" />
  <path d="M26 84 C26 64 36 59 50 59 C64 59 74 64 74 84 Z" fill="#FFE4E6" />
  <!-- Sleek Haircut -->
  <path d="M31 46 C30 28 38 22 50 22 C62 22 70 28 69 46 C67 36 64 30 50 30 C36 30 33 36 31 46 Z" fill="#881337" />
  <!-- Minimalist Glasses -->
  <rect x="37" y="39" width="11" height="7" rx="3" fill="#881337" />
  <rect x="52" y="39" width="11" height="7" rx="3" fill="#881337" />
  <line x1="48" y1="42.5" x2="52" y2="42.5" stroke="#881337" stroke-width="2" />
  <circle cx="42.5" cy="42.5" r="1.5" fill="#FECDD3" />
  <circle cx="57.5" cy="42.5" r="1.5" fill="#FECDD3" />
</svg>
`;

// 6. Cyan Cloud / Security Engineer (HUD Visor & Hoodie)
const SVG_CYAN = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="gCyan" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284C7" />
      <stop offset="100%" stop-color="#06B6D4" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="32" fill="url(#gCyan)" />
  <!-- Head & Torso -->
  <circle cx="50" cy="42" r="18" fill="#F0F9FF" />
  <path d="M26 84 C26 64 35 57 50 57 C65 57 74 64 74 84 Z" fill="#0C4A6E" />
  <!-- Hoodie Collar -->
  <path d="M36 57 C36 70 42 74 50 74 C58 74 64 70 64 57 Z" fill="#0369A1" />
  <circle cx="50" cy="42" r="14" fill="#E0F2FE" />
  <!-- Cyan Tech HUD Visor -->
  <rect x="36" y="38" width="28" height="8" rx="4" fill="#082F49" />
  <line x1="39" y1="42" x2="61" y2="42" stroke="#38BDF8" stroke-width="2" stroke-linecap="round" />
</svg>
`;

export const AVATAR_PRESETS = [
  {
    id: 'avatar-indigo',
    name: 'Tech Lead (Indigo)',
    role: 'Tech Lead / Architect',
    src: encodeSvg(SVG_INDIGO),
    color: 'bg-indigo-600'
  },
  {
    id: 'avatar-emerald',
    name: 'Systems Engineer (Emerald)',
    role: 'SRE / Infrastructure',
    src: encodeSvg(SVG_EMERALD),
    color: 'bg-emerald-600'
  },
  {
    id: 'avatar-violet',
    name: 'Database Architect (Violet)',
    role: 'AI & Data Lead',
    src: encodeSvg(SVG_VIOLET),
    color: 'bg-purple-600'
  },
  {
    id: 'avatar-amber',
    name: 'DevOps Specialist (Amber)',
    role: 'Cloud / DevOps',
    src: encodeSvg(SVG_AMBER),
    color: 'bg-amber-600'
  },
  {
    id: 'avatar-rose',
    name: 'Frontend Lead (Rose)',
    role: 'Frontend & UI/UX',
    src: encodeSvg(SVG_ROSE),
    color: 'bg-rose-600'
  },
  {
    id: 'avatar-cyan',
    name: 'Security & Cloud (Cyan)',
    role: 'Security / Cloud Architect',
    src: encodeSvg(SVG_CYAN),
    color: 'bg-sky-600'
  }
];

export const DEFAULT_AVATAR = AVATAR_PRESETS[0].src;
