import fs from 'fs';
import https from 'https';

const perks = [
  { id: 'ArmsKeeper', url: 'https://static.wikia.nocookie.net/fallout/images/c/c5/FO76_Arms_Keeper.png' },
  { id: 'Gladiator', url: 'https://static.wikia.nocookie.net/fallout/images/4/4a/FO76_Gladiator.png' },
  { id: 'ConcentratedFire', url: 'https://static.wikia.nocookie.net/fallout/images/1/18/FO76_Concentrated_Fire.png' },
  { id: 'LeadBelly', url: 'https://static.wikia.nocookie.net/fallout/images/c/c5/FO76_Lead_Belly.png' },
  { id: 'Inspirational', url: 'https://static.wikia.nocookie.net/fallout/images/d/d3/FO76_Inspirational.png' },
  { id: 'Hacker', url: 'https://static.wikia.nocookie.net/fallout/images/6/6c/FO76_Hacker.png' },
  { id: 'ActionBoy', url: 'https://static.wikia.nocookie.net/fallout/images/f/f3/FO76_Action_Boy.png' },
  { id: 'StarchedGenes', url: 'https://static.wikia.nocookie.net/fallout/images/9/91/FO76_Starched_Genes.png' }
];

const downloadBase64 = (url) => {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Referer': 'https://fallout.fandom.com/',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      }
    };
    https.get(url, options, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 304) {
        if (response.headers.location) {
            downloadBase64(response.headers.location).then(resolve).catch(reject);
        } else {
            reject(new Error(`Redirect without location: ${response.statusCode}`));
        }
        return;
      }
      if (response.statusCode !== 200) {
          reject(new Error(`Failed to download, status code: ${response.statusCode}`));
          return;
      }
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve(`data:image/png;base64,${buffer.toString('base64')}`);
      });
    }).on('error', reject);
  });
};

async function run() {
  let output = 'export const PERK_IMAGES: Record<string, string> = {\n';
  for (const perk of perks) {
    console.log(`Downloading ${perk.id}...`);
    try {
      const base64 = await downloadBase64(perk.url);
      output += `  ${perk.id}: '${base64}',\n`;
      console.log(`Success: ${perk.id}`);
    } catch (e) {
      console.error(`Failed: ${perk.id}`, e);
    }
  }
  output += '};\n';
  fs.writeFileSync('./src/data/perkImages.ts', output);
  console.log('Done!');
}

run();
