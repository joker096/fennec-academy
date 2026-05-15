import fs from 'fs';
import https from 'https';
import path from 'path';

const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent('Здраво')}&tl=sr&client=tw-ob`;

https.get(url, (res) => {
  console.log('Status:', res.statusCode);
  if (res.statusCode === 200) {
    const file = fs.createWriteStream('test.mp3');
    res.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log('Downloaded test.mp3');
    });
  }
}).on('error', (err) => {
  console.error('Error:', err.message);
});
