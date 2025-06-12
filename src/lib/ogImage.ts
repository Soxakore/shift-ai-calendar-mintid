// Open Graph Image Generator Utility
// This creates a data URI SVG that can be used as an Open Graph image

export const generateOGImage = (
  title: string,
  subtitle?: string,
  bgColor = '#1e40af',
  textColor = '#ffffff'
): string => {
  const width = 1200;
  const height = 630;
  
  // Create SVG content
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${adjustBrightness(bgColor, -20)};stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="100%" height="100%" fill="url(#bg)"/>
      
      <!-- Grid pattern -->
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${textColor}" stroke-width="0.5" opacity="0.1"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
      
      <!-- Logo/Icon -->
      <g transform="translate(80, 80)">
        <rect x="0" y="0" width="60" height="60" rx="12" fill="${textColor}" opacity="0.9"/>
        <path d="M15 20 L25 30 L45 15" stroke="${bgColor}" stroke-width="3" fill="none" stroke-linecap="round"/>
        <circle cx="35" cy="35" r="8" fill="${bgColor}"/>
      </g>
      
      <!-- Main Title -->
      <text x="80" y="250" font-family="Arial, sans-serif" font-size="64" font-weight="bold" fill="${textColor}">
        ${escapeXML(title)}
      </text>
      
      ${subtitle ? `
      <!-- Subtitle -->
      <text x="80" y="320" font-family="Arial, sans-serif" font-size="32" font-weight="normal" fill="${textColor}" opacity="0.8">
        ${escapeXML(subtitle)}
      </text>
      ` : ''}
      
      <!-- Brand -->
      <text x="80" y="520" font-family="Arial, sans-serif" font-size="28" font-weight="600" fill="${textColor}" opacity="0.9">
        MinaTid Workforce Management
      </text>
      
      <!-- Decorative elements -->
      <circle cx="1000" cy="150" r="120" fill="${textColor}" opacity="0.05"/>
      <circle cx="1050" cy="450" r="80" fill="${textColor}" opacity="0.08"/>
      <rect x="900" y="500" width="200" height="4" fill="${textColor}" opacity="0.2"/>
    </svg>
  `.trim();

  // Convert to data URI
  const encoded = encodeURIComponent(svg);
  return `data:image/svg+xml,${encoded}`;
};

function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function adjustBrightness(color: string, percent: number): string {
  // Simple color adjustment for gradient effect
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const B = (num >> 8 & 0x00FF) + amt;
  const G = (num & 0x0000FF) + amt;
  
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + 
    (B < 255 ? B < 1 ? 0 : B : 255) * 0x100 + 
    (G < 255 ? G < 1 ? 0 : G : 255)).toString(16).slice(1);
}

// Predefined OG images for different pages
export const OG_IMAGES = {
  home: generateOGImage(
    'Smart Workforce Management',
    'Optimize schedules, track performance, manage teams'
  ),
  dashboard: generateOGImage(
    'Dashboard',
    'Real-time analytics and insights',
    '#059669'
  ),
  admin: generateOGImage(
    'Admin Panel',
    'Complete system management and control',
    '#dc2626'
  ),
  roles: generateOGImage(
    'Role-Based Demo',
    'Experience different user perspectives',
    '#7c3aed'
  ),
  login: generateOGImage(
    'Secure Login',
    'Access your workforce management account',
    '#1f2937'
  ),
  register: generateOGImage(
    'Join MinaTid',
    'Create your workforce management account',
    '#0891b2'
  )
};

// Favicon generator
export const generateFavicon = (size: number = 32): string => {
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#1e40af" rx="6"/>
      <path d="M${size * 0.2} ${size * 0.4} L${size * 0.4} ${size * 0.6} L${size * 0.8} ${size * 0.3}" 
            stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>
      <circle cx="${size * 0.7}" cy="${size * 0.7}" r="${size * 0.1}" fill="white"/>
    </svg>
  `;
  
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

export default generateOGImage;
