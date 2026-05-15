import fs from 'fs';
import path from 'path';

const perks = [
  { id: 'all_night_long', url: 'https://static.wikia.nocookie.net/fallout/images/4/4e/FO76_All_Night_Long.png' },
  { id: 'ammosmith', url: 'https://static.wikia.nocookie.net/fallout/images/3/36/FO76_Ammosmith.png' }
];

const dir = path.join(process.cwd(), 'public', 'perks');

async function main() {
  for (const perk of perks) {
    const filepath = path.join(dir, `${perk.id}.jpg`);
    console.log(`Downloading ${perk.id}...`);
    try {
      const res = await fetch(perk.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
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
