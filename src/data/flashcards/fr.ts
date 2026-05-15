import { ContextualExample } from '../../services/geminiService';

export const FR_OFFLINE_EXAMPLES: Record<number, ContextualExample[]> = {
  1: [
    { sentence: 'Bonjour! Comment allez-vous?', translation: 'Привет! Как у вас дела?', source: 'social media' },
    { sentence: 'Bonjour, je voudrais un café.', translation: 'Привет, я хотел бы кофе.', source: 'books' },
    { sentence: 'Il a dit bonjour avec un grand sourire.', translation: 'Он сказал привет с большой улыбкой.', source: 'books' }
  ],
  2: [
    { sentence: 'Au revoir, à demain.', translation: 'До свидания, до завтра.', source: 'social media' },
    { sentence: 'Elle a dit au revoir et est partie.', translation: 'Она сказала до свидания и ушла.', source: 'books' },
    { sentence: 'C’est l’heure de dire au revoir.', translation: 'Пришло время сказать до свидания.', source: 'news' }
  ],
  3: [
    { sentence: 'Merci beaucoup pour votre aide.', translation: 'Большое спасибо за вашу помощь.', source: 'social media' },
    { sentence: 'Merci à tous d’être venus.', translation: 'Спасибо всем, что пришли.', source: 'news' },
    { sentence: 'Non merci, j’ai déjà mangé.', translation: 'Нет, спасибо, я уже поел.', source: 'books' }
  ],
  4: [
    { sentence: 'S’il vous plaît, aidez-moi.', translation: 'Пожалуйста, помогите мне.', source: 'books' },
    { sentence: 'Un café, s’il vous plaît.', translation: 'Кофе, пожалуйста.', source: 'social media' }
  ],
  5: [
    { sentence: 'Oui, je suis d’accord.', translation: 'Да, я согласен.', source: 'news' },
    { sentence: 'Il a dit oui.', translation: 'Он сказал да.', source: 'books' }
  ],
  6: [
    { sentence: 'Non, je ne veux pas.', translation: 'Нет, я не хочу.', source: 'social media' },
    { sentence: 'La réponse est non.', translation: 'Ответ — нет.', source: 'news' }
  ],
  7: [
    { sentence: 'Comment ça va? Ça fait longtemps!', translation: 'Как дела? Давно не виделись!', source: 'social media' },
    { sentence: 'Bonjour, comment ça va aujourd’hui?', translation: 'Привет, как дела сегодня?', source: 'books' }
  ],
  8: [
    { sentence: 'Je vais bien, merci.', translation: 'Я в порядке, спасибо.', source: 'social media' },
    { sentence: 'Elle va bien.', translation: 'Она в порядке.', source: 'books' }
  ],
  9: [
    { sentence: 'Mon chien est très gentil.', translation: 'Моя собака очень добрая.', source: 'social media' },
    { sentence: 'Le chien aboie.', translation: 'Собака лает.', source: 'news' }
  ],
  10: [
    { sentence: 'J’ai un petit chat.', translation: 'У меня есть маленький кот.', source: 'social media' },
    { sentence: 'Le chat dort.', translation: 'Кот спит.', source: 'books' }
  ],
  11: [
    { sentence: 'L’oiseau chante le matin.', translation: 'Птица поет по утрам.', source: 'books' },
    { sentence: 'J’ai vu un oiseau bleu.', translation: 'Я видел синюю птицу.', source: 'social media' }
  ],
  12: [
    { sentence: 'Le poisson nage dans la rivière.', translation: 'Рыба плавает в реке.', source: 'books' },
    { sentence: 'J’ai acheté un poisson rouge.', translation: 'Я купил золотую рыбку.', source: 'social media' }
  ],
  13: [
    { sentence: 'J’aime la couleur rouge.', translation: 'Мне нравится красный цвет.', source: 'social media' },
    { sentence: 'La pomme est rouge.', translation: 'Яблоко красное.', source: 'books' }
  ],
  14: [
    { sentence: 'Le ciel est bleu.', translation: 'Небо синее.', source: 'news' },
    { sentence: 'J’ai une chemise bleue.', translation: 'У меня есть синяя рубашка.', source: 'social media' }
  ],
  15: [
    { sentence: 'L’herbe est verte.', translation: 'Трава зеленая.', source: 'books' },
    { sentence: 'Le feu est au vert.', translation: 'Светофор горит зеленым.', source: 'news' }
  ],
  16: [
    { sentence: 'Le soleil est jaune.', translation: 'Солнце желтое.', source: 'books' },
    { sentence: 'J’ai une voiture jaune.', translation: 'У меня есть желтая машина.', source: 'social media' }
  ],
  17: [
    { sentence: 'J’en ai un seul.', translation: 'У меня только один.', source: 'social media' },
    { sentence: 'Numéro un sur la liste.', translation: 'Номер один в списке.', source: 'news' }
  ],
  18: [
    { sentence: 'Deux cafés, s’il vous plaît.', translation: 'Два кофе, пожалуйста.', source: 'social media' },
    { sentence: 'J’ai deux frères.', translation: 'У меня два брата.', source: 'books' }
  ],
  19: [
    { sentence: 'Trois, c’est beaucoup.', translation: 'Трое — это много.', source: 'books' },
    { sentence: 'Il reste trois jours.', translation: 'Осталось три дня.', source: 'news' }
  ],
  20: [
    { sentence: 'Il y a quatre saisons.', translation: 'Есть четыре сезона.', source: 'books' },
    { sentence: 'Il était quatre heures.', translation: 'Было четыре часа.', source: 'news' }
  ]
};
