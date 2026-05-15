import fs from 'fs';
import path from 'path';

const perks = [
  { id: 'memory_master', url: 'https://static.wikia.nocookie.net/fallout/images/5/52/FO76_Night_Person.png' },
  { id: 'dedicated_learner', url: 'https://static.wikia.nocookie.net/fallout/images/d/d3/FO76_Inspirational.png' },
  { id: 'deep_focus', url: 'https://static.wikia.nocookie.net/fallout/images/1/18/FO76_Concentrated_Fire.png' },
  { id: 'resilient_learner', url: 'https://static.wikia.nocookie.net/fallout/images/9/90/FO76_Lifegiver.png' },
  { id: 'linguist', url: 'https://static.wikia.nocookie.net/fallout/images/c/c1/FO76_Hard_Bargain.png' },
  { id: 'mentor', url: 'https://static.wikia.nocookie.net/fallout/images/d/d5/FO76_Team_Medic.png' },
  { id: 'energy_surge', url: 'https://static.wikia.nocookie.net/fallout/images/f/f3/FO76_Action_Boy.png' },
  { id: 'streak_guard', url: 'https://static.wikia.nocookie.net/fallout/images/f/f6/FO76_Mysterious_Stranger.png' },
  { id: 'gladiator', url: 'https://static.wikia.nocookie.net/fallout/images/c/c4/FO76_Gladiator.png' },
  { id: 'concentrated_fire', url: 'https://static.wikia.nocookie.net/fallout/images/9/91/FO76_Refractor.png' },
  { id: 'hacker', url: 'https://static.wikia.nocookie.net/fallout/images/3/36/FO76_Hacker.png' }
];

const dir = path.join(process.cwd(), 'public', 'perks');

async function main() {
  for (const perk of perks) {
    const filepath = path.join(dir, `${perk.id}.jpg`);
    console.log(`Downloading ${perk.id}...`);
    try {
      // Try to find the actual image URL by first fetching the fandom page or using a search-like logic
      // But for now, let's try a different static subdomain if available or just stick to the specific ones that worked before
      
      const res = await fetch(perk.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': '*/*',
          'Referer': 'https://fallout.fandom.com/'
        }
      });
      
      if (res.status === 404) {
         // Try to find it by just name if the hash is wrong? No, we need the hash.
         // Let's try to use a more reliable pattern if possible.
         // Actually, concentrated_fire worked in the previous turn's script.
         // Let's see what was in download-perks2.ts
      }

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
