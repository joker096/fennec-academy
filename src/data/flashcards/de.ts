import { ContextualExample } from '../../services/geminiService';

export const DE_OFFLINE_EXAMPLES: Record<number, ContextualExample[]> = {
  1: [
    { sentence: 'Hallo! Wie geht es dir?', translation: 'Привет! Как дела?', source: 'social media' },
    { sentence: 'Hallo, ich möchte ein Zimmer reservieren.', translation: 'Привет, я хотел бы забронировать номер.', source: 'books' }
  ],
  2: [
    { sentence: 'Auf Wiedersehen, bis bald.', translation: 'До свидания, до скорой встречи.', source: 'social media' },
    { sentence: 'Er sagte Auf Wiedersehen und ging.', translation: 'Он сказал до свидания и ушел.', source: 'books' }
  ],
  3: [
    { sentence: 'Vielen Dank für deine Hilfe.', translation: 'Большое спасибо за твою помощь.', source: 'social media' },
    { sentence: 'Danke für alles.', translation: 'Спасибо за все.', source: 'news' }
  ],
  4: [
    { sentence: 'Einen Kaffee, bitte.', translation: 'Кофе, пожалуйста.', source: 'social media' },
    { sentence: 'Helfen Sie mir bitte.', translation: 'Помогите мне, пожалуйста.', source: 'books' }
  ],
  5: [
    { sentence: 'Ja, das stimmt.', translation: 'Да, это верно.', source: 'news' },
    { sentence: 'Er sagte ja.', translation: 'Он сказал да.', source: 'books' }
  ],
  6: [
    { sentence: 'Nein, ich möchte nicht.', translation: 'Нет, я не хочу.', source: 'social media' },
    { sentence: 'Die Antwort ist nein.', translation: 'Ответ — нет.', source: 'news' }
  ],
  7: [
    { sentence: 'Wie geht es dir heute?', translation: 'Как у тебя сегодня дела?', source: 'social media' },
    { sentence: 'Hallo, wie geht es dir?', translation: 'Привет, как дела?', source: 'books' }
  ],
  8: [
    { sentence: 'Mir geht es gut, danke.', translation: 'У меня все хорошо, спасибо.', source: 'social media' },
    { sentence: 'Es geht mir gut.', translation: 'Я в порядке.', source: 'books' }
  ],
  9: [
    { sentence: 'Mein Hund ist sehr lieb.', translation: 'Моя собака очень милая.', source: 'social media' },
    { sentence: 'Der Hund bellt.', translation: 'Собака лает.', source: 'news' }
  ],
  10: [
    { sentence: 'Ich habe eine kleine Katze.', translation: 'У меня есть маленькая кошка.', source: 'social media' },
    { sentence: 'Die Katze schläft.', translation: 'Кошка спит.', source: 'books' }
  ],
  11: [
    { sentence: 'Der Vogel singt am Morgen.', translation: 'Птица поет по утрам.', source: 'books' },
    { sentence: 'Ich sah einen blauen Vogel.', translation: 'Я видел синюю птицу.', source: 'social media' }
  ],
  12: [
    { sentence: 'Der Fisch schwimmt im Fluss.', translation: 'Рыба плавает в реке.', source: 'books' },
    { sentence: 'Ich habe einen Goldfisch gekauft.', translation: 'Я купил золотую рыбку.', source: 'social media' }
  ],
  13: [
    { sentence: 'Ich mag die Farbe Rot.', translation: 'Мне нравится красный цвет.', source: 'social media' },
    { sentence: 'Der Apfel ist rot.', translation: 'Яблоко красное.', source: 'books' }
  ],
  14: [
    { sentence: 'Der Himmel ist blau.', translation: 'Небо синее.', source: 'news' },
    { sentence: 'Ich habe ein blaues Hemd.', translation: 'У меня есть синяя рубашка.', source: 'social media' }
  ],
  15: [
    { sentence: 'Das Gras ist grün.', translation: 'Трава зеленая.', source: 'books' },
    { sentence: 'Die Ampel ist grün.', translation: 'Светофор зеленый.', source: 'news' }
  ],
  16: [
    { sentence: 'Die Sonne ist gelb.', translation: 'Солнце желтое.', source: 'books' },
    { sentence: 'Ich habe ein gelbes Auto.', translation: 'У меня есть желтая машина.', source: 'social media' }
  ],
  17: [
    { sentence: 'Ich habe nur eins.', translation: 'У меня только один.', source: 'social media' },
    { sentence: 'Nummer eins auf der Liste.', translation: 'Номер один в списке.', source: 'news' }
  ],
  18: [
    { sentence: 'Zwei Kaffee, bitte.', translation: 'Два кофе, пожалуйста.', source: 'social media' },
    { sentence: 'Ich habe zwei Brüder.', translation: 'У меня два брата.', source: 'books' }
  ],
  19: [
    { sentence: 'Drei sind viele.', translation: 'Трое — это много.', source: 'books' },
    { sentence: 'Es bleiben drei Tage.', translation: 'Осталось три дня.', source: 'news' }
  ],
  20: [
    { sentence: 'Es gibt vier Jahreszeiten.', translation: 'Есть четыре времени года.', source: 'books' },
    { sentence: 'Es war vier Uhr.', translation: 'Было четыре часа.', source: 'news' }
  ]
};
