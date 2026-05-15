import fs from 'fs';
import path from 'path';

const perks = [
  { id: 'arms_keeper', name: 'Arms Keeper', color: '#4a5568', icon: 'M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16' },
  { id: 'gladiator', name: 'Gladiator', color: '#c53030', icon: 'M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4' },
  { id: 'concentrated_fire', name: 'Concentrated Fire', color: '#dd6b20', icon: 'M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0' },
  { id: 'lead_belly', name: 'Lead Belly', color: '#38a169', icon: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' },
  { id: 'inspirational', name: 'Inspirational', color: '#3182ce', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
  { id: 'hacker', name: 'Hacker', color: '#805ad5', icon: 'M4 17l6-6-6-6M12 19h8' },
  { id: 'action_boy', name: 'Action Boy', color: '#d69e2e', icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z' },
  { id: 'starched_genes', name: 'Starched Genes', color: '#e53e3e', icon: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' }
];

const dir = path.join(process.cwd(), 'public', 'perks');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

for (const perk of perks) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <rect width="400" height="400" fill="${perk.color}" />
  <rect width="380" height="380" x="10" y="10" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="10,10" opacity="0.5" />
  <circle cx="200" cy="180" r="100" fill="#fff" opacity="0.2" />
  <svg x="100" y="80" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="${perk.icon}" />
  </svg>
  <text x="200" y="320" font-family="sans-serif" font-size="40" font-weight="bold" fill="#fff" text-anchor="middle" dominant-baseline="middle">
    ${perk.name}
  </text>
</svg>`;
  
  fs.writeFileSync(path.join(dir, `${perk.id}.svg`), svg);
}
console.log('SVGs generated');
