import { ContextualExample } from '../../services/geminiService';

export const IT_OFFLINE_EXAMPLES: Record<number, ContextualExample[]> = {
  1: [
    { sentence: 'Ciao! Come stai oggi?', translation: 'Привет! Как ты сегодня?', source: 'social media' },
    { sentence: 'Ciao, vorrei un caffè.', translation: 'Привет, я хотел бы кофе.', source: 'books' },
    { sentence: 'Il primo saluto della giornata è sempre un "ciao" caloroso.', translation: 'Первое приветствие дня — это всегда теплое "привет".', source: 'news' }
  ],
  2: [
    { sentence: 'Arrivederci, a presto.', translation: 'До свидания, до скорой встречи.', source: 'social media' },
    { sentence: 'Ha detto arrivederci ed è uscito.', translation: 'Он сказал до свидания и вышел.', source: 'books' },
    { sentence: 'L’incontro si è concluso con un formale arrivederci.', translation: 'Встреча завершилась формальным прощанием.', source: 'news' }
  ],
  3: [
    { sentence: 'Grazie mille per il tuo aiuto.', translation: 'Большое спасибо за твою помощь.', source: 'social media' },
    { sentence: 'Grazie a tutti per essere venuti.', translation: 'Спасибо всем, что пришли.', source: 'news' },
    { sentence: 'Dobbiamo dire grazie per le piccole cose.', translation: 'Мы должны говорить спасибо за мелочи.', source: 'books' }
  ],
  4: [
    { sentence: 'Un caffè, per favore.', translation: 'Кофе, пожалуйста.', source: 'social media' },
    { sentence: 'Aiutami, per favore.', translation: 'Помоги мне, пожалуйста.', source: 'books' },
    { sentence: 'Per favore, chiudi la porta quando esci.', translation: 'Пожалуйста, закрой дверь, когда будешь выходить.', source: 'news' }
  ],
  5: [
    { sentence: 'Sì, sono d’accordo.', translation: 'Да, я согласен.', source: 'news' },
    { sentence: 'Ha detto di sì.', translation: 'Он сказал да.', source: 'books' },
    { sentence: 'Sì, verrò alla festa stasera.', translation: 'Да, я приду на вечеринку сегодня вечером.', source: 'social media' }
  ],
  6: [
    { sentence: 'No, non voglio.', translation: 'Нет, я не хочу.', source: 'social media' },
    { sentence: 'La risposta è no.', translation: 'Ответ — нет.', source: 'news' },
    { sentence: 'No, non ho visto quel film.', translation: 'Нет, я не видел этот фильм.', source: 'books' }
  ],
  7: [
    { sentence: 'Come stai oggi?', translation: 'Как ты сегодня?', source: 'social media' },
    { sentence: 'Ciao, come stai?', translation: 'Привет, как дела?', source: 'books' },
    { sentence: 'Mi ha chiesto come stai dopo tanto tempo.', translation: 'Он спросил меня, как дела, спустя долгое время.', source: 'news' }
  ],
  8: [
    { sentence: 'Sto bene, grazie.', translation: 'Я в порядке, спасибо.', source: 'social media' },
    { sentence: 'Tutto bene.', translation: 'Все хорошо.', source: 'books' },
    { sentence: 'Oggi mi sento bene e sono felice.', translation: 'Сегодня я чувствую себя хорошо и я счастлив.', source: 'news' }
  ],
  9: [
    { sentence: 'Il mio cane è molto dolce.', translation: 'Моя собака очень милая.', source: 'social media' },
    { sentence: 'Il cane abbaia.', translation: 'Собака лает.', source: 'news' },
    { sentence: 'Ho portato il cane al parco stamattina.', translation: 'Я отвел собаку в парк сегодня утром.', source: 'books' }
  ],
  10: [
    { sentence: 'Ho un piccolo gatto.', translation: 'У меня есть маленький кот.', source: 'social media' },
    { sentence: 'Il gatto dorme sul divano.', translation: 'Кот спит на диване.', source: 'books' },
    { sentence: 'I gatti sono animali molto indipendenti.', translation: 'Кошки — очень независимые животные.', source: 'news' }
  ],
  11: [
    { sentence: 'L’uccello canta al mattino.', translation: 'Птица поет по утрам.', source: 'books' },
    { sentence: 'Ho visto un uccello blu.', translation: 'Я видел синюю птицу.', source: 'social media' }
  ],
  12: [
    { sentence: 'Il pesce nuota nel fiume.', translation: 'Рыба плавает в реке.', source: 'books' },
    { sentence: 'Ho comprato un pesce rosso.', translation: 'Я купил золотую рыбку.', source: 'social media' }
  ],
  13: [
    { sentence: 'Mi piace il colore rosso.', translation: 'Мне нравится красный цвет.', source: 'social media' },
    { sentence: 'La mela è rossa.', translation: 'Яблоко красное.', source: 'books' }
  ],
  14: [
    { sentence: 'Il cielo è blu.', translation: 'Небо синее.', source: 'news' },
    { sentence: 'Ho una camicia blu.', translation: 'У меня есть синяя рубашка.', source: 'social media' }
  ],
  15: [
    { sentence: 'L’erba è verde.', translation: 'Трава зеленая.', source: 'books' },
    { sentence: 'Il semaforo è verde.', translation: 'Светофор зеленый.', source: 'news' }
  ],
  16: [
    { sentence: 'Il sole è giallo.', translation: 'Солнце желтое.', source: 'books' },
    { sentence: 'Ho una macchina gialla.', translation: 'У меня есть желтая машина.', source: 'social media' }
  ],
  17: [
    { sentence: 'Ne ho solo uno.', translation: 'У меня только один.', source: 'social media' },
    { sentence: 'Numero uno sulla lista.', translation: 'Номер один в списке.', source: 'news' }
  ],
  18: [
    { sentence: 'Due caffè, per favore.', translation: 'Два кофе, пожалуйста.', source: 'social media' },
    { sentence: 'Ho due fratelli.', translation: 'У меня два брата.', source: 'books' }
  ],
  19: [
    { sentence: 'Tre sono molti.', translation: 'Трое — это много.', source: 'books' },
    { sentence: 'Mancano tre giorni.', translation: 'Осталось три дня.', source: 'news' }
  ],
  20: [
    { sentence: 'Ci sono quattro stagioni.', translation: 'Есть четыре сезона.', source: 'books' },
    { sentence: 'Erano le quattro.', translation: 'Было четыре часа.', source: 'news' }
  ]
};
