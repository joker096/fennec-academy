const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/data/translations.ts');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
  // RU
  [/ai_assistant_hint: 'Гав! Попробуй это\.\.\.',/g, "ai_assistant_hint: 'Попробуйте этот вариант...',"],
  [/ai_assistant_cheer: 'Гав! Отличная работа!',/g, "ai_assistant_cheer: 'Отличная работа!',"],
  [/ai_assistant_mistake: 'Скулит\.\.\. \(В следующий раз получится!\)',/g, "ai_assistant_mistake: 'В следующий раз обязательно получится!',"],
  [/ai_assistant_ready: 'ИИ-помощник готова помочь! Нажмите на нее во время уроков, чтобы получить подсказку\.',/g, "ai_assistant_ready: 'ИИ-помощник готов помочь! Нажмите на него во время уроков, чтобы получить подсказку.',"],
  
  // ES
  [/ai_assistant_hint: '¡Guau! Intenta esto\.\.\.',/g, "ai_assistant_hint: 'Intenta esto...',"],
  [/ai_assistant_cheer: '¡Guau! ¡Buen trabajo!',/g, "ai_assistant_cheer: '¡Buen trabajo!',"],
  [/ai_assistant_mistake: 'Gime\.\.\. \(¡Lo harás mejor la próxima vez!\)',/g, "ai_assistant_mistake: '¡Lo harás mejor la próxima vez!',"],
  [/ai_assistant_ready: '¡Albóndiga está listo para ayudar! Haz clic en él durante las lecciones para obtener pistas\.',/g, "ai_assistant_ready: '¡El Asistente de IA está listo para ayudar! Haz clic en él durante las lecciones para obtener pistas.',"],
  
  // FR
  [/ai_assistant_hint: 'Ouaf ! Essaie ça\.\.\.',/g, "ai_assistant_hint: 'Essayez ceci...',"],
  [/ai_assistant_cheer: 'Ouaf ! Bon travail !',/g, "ai_assistant_cheer: 'Bon travail !',"],
  [/ai_assistant_mistake: 'Gemit\.\.\. \(Tu feras mieux la prochaine fois !\)',/g, "ai_assistant_mistake: 'Vous ferez mieux la prochaine fois !',"],
  [/ai_assistant_ready: 'Canigou est prêt à aider ! Cliquez sur lui pendant les leçons pour obtenir des indices\.',/g, "ai_assistant_ready: 'L\\'Assistant IA est prêt à aider ! Cliquez sur lui pendant les leçons pour obtenir des indices.',"],
  
  // DE
  [/ai_assistant_hint: 'Wuff! Versuch das\.\.\.',/g, "ai_assistant_hint: 'Versuchen Sie dies...',"],
  [/ai_assistant_cheer: 'Wuff! Gute Arbeit!',/g, "ai_assistant_cheer: 'Gute Arbeit!',"],
  [/ai_assistant_mistake: 'Winselt\.\.\. \(Nächstes Mal klappt es!\)',/g, "ai_assistant_mistake: 'Nächstes Mal klappt es!',"],
  
  // JA
  [/ai_assistant_hint: 'ワン！これを試して\.\.\.',/g, "ai_assistant_hint: 'これを試してみてください...',"],
  [/ai_assistant_cheer: 'ワン！よくやった！',/g, "ai_assistant_cheer: 'よくできました！',"],
  [/ai_assistant_mistake: 'クンクン\.\.\.（次はうまくいくよ！）',/g, "ai_assistant_mistake: '次はうまくいきますよ！',"],
  [/ai_assistant_ready: 'ドッグミートは助ける準備ができています！レッスン中に彼をクリックしてヒントをもらいましょう\。',/g, "ai_assistant_ready: 'AIアシスタントがサポートします！レッスン中にクリックしてヒントをもらいましょう。',"],
  
  // ZH
  [/ai_assistant_hint: '汪！试试这个\.\.\.',/g, "ai_assistant_hint: '试试这个...',"],
  [/ai_assistant_cheer: '汪！干得好！',/g, "ai_assistant_cheer: '干得好！',"],
  [/ai_assistant_mistake: '呜呜\.\.\.（下次会更好的！）',/g, "ai_assistant_mistake: '下次会更好的！',"],
  [/ai_assistant_ready: '狗肉准备好帮忙了！在课程中点击它以获取提示\。',/g, "ai_assistant_ready: 'AI助手准备好帮忙了！在课程中点击它以获取提示。',"]
];

replacements.forEach(([regex, replacement]) => {
  content = content.replace(regex, replacement);
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('Hints updated.');
