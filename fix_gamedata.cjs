const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/data/gameData.ts');
let content = fs.readFileSync(filePath, 'utf8');

// The issue is that we have things like {'en':'What's up?'} which is invalid.
// Or {'it':'Dov\\'è...?'} which is also problematic if it was intended to be escaped.

// Let's find all translations: { ... } blocks and fix them.
content = content.replace(/translations: \{([^}]+)\}/g, (match, p1) => {
  // p1 is something like 'sr':'Здраво','en':'Hello',...
  // We want to make sure it's valid JS.
  // The easiest way is to convert it back to double quotes, parse it, and then stringify it correctly.
  
  // This is hard because of the nested single quotes.
  // Let's try to fix the specific cases first.
  let fixed = p1;
  
  // Fix double backslashes followed by single quote (which was probably a single backslash before)
  fixed = fixed.replace(/\\\\'/g, "\\'");
  
  // Fix unescaped single quotes between single quotes.
  // This is very hard with regex.
  
  return `translations: {${fixed}}`;
});

// Actually, let's just use a more robust approach.
// We know the structure is 'key':'value'
// We can try to match these pairs.

content = content.replace(/translations: \{([^}]+)\}/g, (match, p1) => {
    const pairs = p1.split(/,(?='[a-z]{2}':)/);
    const fixedPairs = pairs.map(pair => {
        const matchPair = pair.match(/'([a-z]{2})':'(.*)'/);
        if (matchPair) {
            const key = matchPair[1];
            let value = matchPair[2];
            // Escape any unescaped single quotes in value
            // But don't escape already escaped ones.
            value = value.replace(/(?<!\\)'/g, "\\'");
            // Also fix the double backslash issue if it exists
            value = value.replace(/\\\\'/g, "\\'");
            return `'${key}':'${value}'`;
        }
        return pair;
    });
    return `translations: {${fixedPairs.join(',')}}`;
});

fs.writeFileSync(filePath, content);
console.log('Fixed gameData.ts');
