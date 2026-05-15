// Temporary helper - extracts the list of all translation keys from en.ts
// This is used to generate stub translations for other languages
import * as fs from 'fs';

const enContent = fs.readFileSync('src/data/translations/ui/en.ts', 'utf-8');
const match = enContent.match(/export const UI_TRANSLATIONS_EN: Record<string, string> = \{([\s\S]*)\};/);
if (match) {
  const body = match[1];
  const keys = [...body.matchAll(/^\s+(\w+):/gm)].map(m => m[1]);
  console.log('Total keys:', keys.length);
  console.log(keys.join(', '));
}