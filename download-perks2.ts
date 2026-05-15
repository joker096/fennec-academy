import fs from 'fs';
import path from 'path';

const perks = [
  { id: 'arms_keeper', url: 'https://static.wikia.nocookie.net/fallout/images/c/c5/FO76_Arms_Keeper.png' },
  { id: 'gladiator', url: 'https://static.wikia.nocookie.net/fallout/images/4/4a/FO76_Gladiator.png' },
  { id: 'concentrated_fire', url: 'https://static.wikia.nocookie.net/fallout/images/1/18/FO76_Concentrated_Fire.png' },
  { id: 'lead_belly', url: 'https://static.wikia.nocookie.net/fallout/images/c/c5/FO76_Lead_Belly.png' },
  { id: 'inspirational', url: 'https://static.wikia.nocookie.net/fallout/images/d/d3/FO76_Inspirational.png' },
  { id: 'hacker', url: 'https://static.wikia.nocookie.net/fallout/images/6/6c/FO76_Hacker.png' },
  { id: 'action_boy', url: 'https://static.wikia.nocookie.net/fallout/images/f/f3/FO76_Action_Boy.png' },
  { id: 'starched_genes', url: 'https://static.wikia.nocookie.net/fallout/images/9/91/FO76_Starched_Genes.png' }
];

const dir = path.join(process.cwd(), 'public', 'perks');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

async function main() {
  for (const perk of perks) {
    const filepath = path.join(dir, `${perk.id}.png`);
    console.log(`Downloading ${perk.id}...`);
    try {
      const res = await fetch(perk.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://fallout.fandom.com/'
        }
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch ${res.status} ${res.statusText}`);
      }
      const buffer = await res.arrayBuffer();
      fs.writeFileSync(filepath, Buffer.from(buffer));
      console.log(`Downloaded ${perk.id}`);
    } catch (err) {
      console.error(`Error downloading ${perk.id}:`, err);
    }
  }
}

main();
