function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export type PassportCardSvgInput = {
  communityId: string;
  fullName: string;
  role: string;
  city: string;
  joinedLabel: string;
  reputation: number;
  reputationMax?: number;
};

export function buildPassportCardSvg(input: PassportCardSvgInput): string {
  const {
    communityId,
    fullName,
    role,
    city,
    joinedLabel,
    reputation,
    reputationMax = 1000,
  } = input;

  const barWidth = Math.min(100, Math.round((reputation / Math.max(reputationMax, 1)) * 100));
  const id = escapeXml(communityId || "DEV-????");
  const name = escapeXml(fullName || "BetterDev member");
  const roleText = escapeXml(role);
  const cityText = escapeXml(city || "—");
  const joined = escapeXml(joinedLabel || "—");
  const rep = escapeXml(String(reputation));

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400">
  <defs>
    <linearGradient id="iconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e91e8c"/>
      <stop offset="100%" stop-color="#38bdf8"/>
    </linearGradient>
    <linearGradient id="repGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#e91e8c"/>
    </linearGradient>
  </defs>
  <rect width="640" height="400" rx="24" fill="#0a0a0c"/>
  <rect x="1" y="1" width="638" height="398" rx="23" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="2"/>
  <rect x="24" y="24" width="592" height="352" rx="16" fill="rgba(255,255,255,0.04)"/>

  <text x="40" y="56" fill="rgba(255,255,255,0.45)" font-family="system-ui, sans-serif" font-size="10" font-weight="600" letter-spacing="2">COMMUNITY ID</text>
  <text x="40" y="96" fill="#ffffff" font-family="ui-monospace, monospace" font-size="36" font-weight="700">${id}</text>

  <rect x="556" y="40" width="48" height="48" rx="10" fill="url(#iconGrad)"/>
  <text x="580" y="72" fill="#ffffff" font-family="ui-monospace, monospace" font-size="18" font-weight="700" text-anchor="middle">&lt;/&gt;</text>

  <line x1="40" y1="120" x2="600" y2="120" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>

  <text x="40" y="152" fill="rgba(255,255,255,0.4)" font-family="system-ui, sans-serif" font-size="10" font-weight="600" letter-spacing="1.8">MEMBER</text>
  <text x="40" y="182" fill="#ffffff" font-family="system-ui, sans-serif" font-size="20" font-weight="700">${name}</text>
  <text x="40" y="208" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="14" font-weight="600">${roleText}</text>

  <text x="40" y="252" fill="rgba(255,255,255,0.4)" font-family="system-ui, sans-serif" font-size="10" font-weight="600" letter-spacing="1.5">CITY</text>
  <text x="40" y="274" fill="#ffffff" font-family="system-ui, sans-serif" font-size="14" font-weight="600">${cityText}</text>

  <text x="200" y="252" fill="rgba(255,255,255,0.4)" font-family="system-ui, sans-serif" font-size="10" font-weight="600" letter-spacing="1.5">JOINED</text>
  <text x="200" y="274" fill="#ffffff" font-family="system-ui, sans-serif" font-size="14" font-weight="600">${joined}</text>

  <text x="40" y="320" fill="rgba(255,255,255,0.4)" font-family="system-ui, sans-serif" font-size="10" font-weight="600" letter-spacing="1.5">REPUTATION</text>
  <text x="600" y="320" fill="#ffffff" font-family="system-ui, sans-serif" font-size="14" font-weight="700" text-anchor="end">${rep}</text>
  <rect x="40" y="332" width="560" height="8" rx="4" fill="rgba(255,255,255,0.1)"/>
  <rect x="40" y="332" width="${(560 * barWidth) / 100}" height="8" rx="4" fill="url(#repGrad)"/>
</svg>`;
}
