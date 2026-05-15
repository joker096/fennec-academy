const fs = require('fs');
const content = fs.readFileSync('src/data/translations.ts', 'utf8');

const lines = content.split('\n');
let currentLang = null;
let currentObject = null;
const results = {};

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  const objectMatch = line.match(/export const ([A-Z_]+):/);
  if (objectMatch) {
    currentObject = objectMatch[1];
    results[currentObject] = {};
    continue;
  }

  if (!currentObject) continue;

  const langMatch = line.match(/^\s*([a-z]{2}): \{/);
  if (langMatch) {
    currentLang = langMatch[1];
    results[currentObject][currentLang] = { keys: new Set(), duplicates: [] };
    continue;
  }

  const keyMatch = line.match(/^\s*([a-z0-9_]+):/);
  if (currentLang && keyMatch) {
    const key = keyMatch[1];
    if (results[currentObject][currentLang].keys.has(key)) {
      results[currentObject][currentLang].duplicates.push({ key, line: i + 1 });
    } else {
      results[currentObject][currentLang].keys.add(key);
    }
  }
}

for (const obj in results) {
  for (const lang in results[obj]) {
    if (results[obj][lang].duplicates.length > 0) {
      console.log(`Object: ${obj}, Language: ${lang}`);
      results[obj][lang].duplicates.forEach(d => {
        console.log(`  Duplicate key: "${d.key}" at line ${d.line}`);
      });
    }
  }
}
