const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'data', 'translations.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// Replace specific words
content = content.replace(/Chapas/g, 'Créditos');
content = content.replace(/chapas/g, 'créditos');
content = content.replace(/Creditsules/g, 'Crédits');
content = content.replace(/Kronkorken/g, 'Credits');
content = content.replace(/キャップ/g, 'クレジット');
content = content.replace(/瓶盖/g, '积分');

fs.writeFileSync(filePath, content);
console.log('Done');
