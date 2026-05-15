import fs from 'fs';
import path from 'path';
import https from 'https';

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

async function downloadImage(url: string, filepath: string) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadImage(res.headers.location!, filepath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to get '${url}' (${res.statusCode})`));
        return;
      }
      const file = fs.createWriteStream(filepath);
      res.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
      file.on('error', (err) => {
        fs.unlink(filepath, () => reject(err));
      });
    }).on('error', reject);
  });
}

async function main() {
  for (const perk of perks) {
    const filepath = path.join(dir, `${perk.id}.png`);
    console.log(`Downloading ${perk.id}...`);
    try {
      await downloadImage(perk.url, filepath);
      console.log(`Downloaded ${perk.id}`);
    } catch (err) {
      console.error(`Error downloading ${perk.id}:`, err);
    }
  }
}

main();
