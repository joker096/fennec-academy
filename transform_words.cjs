const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src/data/gameData.ts');
const content = fs.readFileSync(filePath, 'utf8');

// 1. Extract all words to build a map of ID -> { lang -> word }
const wordsMap = {}; // { id: { en: 'Hello', ru: 'Привет', ... } }

// Regex to find all words in all languages
const wordRegex = /\{ id: (\d+), word: '(.*?)',/g;

// Split by language key to know which language we are in
const langSections = content.split(/\n  (\w{2}): \[/);
for (let i = 1; i < langSections.length; i += 2) {
  const lang = langSections[i];
  const sectionContent = langSections[i + 1].split('  ],')[0];
  let m;
  while ((m = wordRegex.exec(sectionContent)) !== null) {
    const id = m[1];
    const word = m[2];
    if (!wordsMap[id]) wordsMap[id] = {};
    wordsMap[id][lang] = word;
  }
}

// 2. Update the Word interface
let updatedContent = content.replace(
  /export interface Word \{[\s\S]*?\}/,
  `export interface Word {
  id: number;
  word: string;
  translation: string;
  translations: Record<string, string>;
  transcription: string;
}`
);

// 3. Update each word in WORDS_BY_LANG
updatedContent = updatedContent.replace(
  /\{ id: (\d+), word: '(.*?)', translation: '(.*?)', transcription: '(.*?)' \}/g,
  (match, id, word, translation, transcription) => {
    const translations = wordsMap[id] || { ru: translation };
    // Ensure the current translation is included if not already there
    if (!translations.ru) translations.ru = translation;
    
    const transStr = JSON.stringify(translations).replace(/"/g, "'");
    return `{ id: ${id}, word: '${word}', translation: '${translation}', translations: ${transStr}, transcription: '${transcription}' }`;
  }
);

fs.writeFileSync(filePath, updatedContent);
console.log('Successfully updated gameData.ts');
