import { ContextualExample } from '../../services/geminiService';

export const JA_OFFLINE_EXAMPLES: Record<number, ContextualExample[]> = {
  1: [
    { sentence: 'こんにちは！お元気ですか？', translation: 'Привет! Как дела?', source: 'social media' },
    { sentence: 'こんにちは、予約をお願いします。', translation: 'Привет, я хотел бы забронировать.', source: 'books' }
  ],
  2: [
    { sentence: 'さようなら、また明日。', translation: 'До свидания, до завтра.', source: 'social media' },
    { sentence: '彼はさようならと言って去った。', translation: 'Он сказал до свидания и ушел.', source: 'books' }
  ],
  3: [
    { sentence: '手伝ってくれてありがとう。', translation: 'Спасибо за помощь.', source: 'social media' },
    { sentence: '皆さん、ありがとうございます。', translation: 'Всем спасибо.', source: 'news' }
  ],
  4: [
    { sentence: 'コーヒーをお願いします。', translation: 'Кофе, пожалуйста.', source: 'social media' },
    { sentence: '助けてください、お願いします。', translation: 'Пожалуйста, помогите мне.', source: 'books' }
  ],
  5: [
    { sentence: 'はい、そうです。', translation: 'Да, это так.', source: 'news' },
    { sentence: '彼ははいと答えました。', translation: 'Он ответил да.', source: 'books' }
  ],
  6: [
    { sentence: 'いいえ、結構です。', translation: 'Нет, спасибо.', source: 'social media' },
    { sentence: '答えはいいえです。', translation: 'Ответ — нет.', source: 'news' }
  ],
  7: [
    { sentence: '今日はお元気ですか？', translation: 'Как вы сегодня?', source: 'social media' },
    { sentence: 'こんにちは、お元気ですか？', translation: 'Привет, как дела?', source: 'books' }
  ],
  8: [
    { sentence: '元気です、ありがとう。', translation: 'Я в порядке, спасибо.', source: 'social media' },
    { sentence: '私は元気です。', translation: 'Я в порядке.', source: 'books' }
  ],
  9: [
    { sentence: '私の犬はとても可愛いです。', translation: 'Моя собака очень милая.', source: 'social media' },
    { sentence: '犬が吠えています。', translation: 'Собака лает.', source: 'news' }
  ],
  10: [
    { sentence: '小さな猫を飼っています。', translation: 'У меня есть маленький кот.', source: 'social media' },
    { sentence: '猫が寝ています。', translation: 'Кот спит.', source: 'books' }
  ],
  11: [
    { sentence: '鳥が朝に鳴いています。', translation: 'Птица поет по утрам.', source: 'books' },
    { sentence: '青い鳥を見ました。', translation: 'Я видел синюю птицу.', source: 'social media' }
  ],
  12: [
    { sentence: '魚が川で泳いでいます。', translation: 'Рыба плавает в реке.', source: 'books' },
    { sentence: '金魚を買いました。', translation: 'Я купил золотую рыбку.', source: 'social media' }
  ],
  13: [
    { sentence: '赤色が好きです。', translation: 'Мне нравится красный цвет.', source: 'social media' },
    { sentence: 'りんごは赤いです。', translation: 'Яблоко красное.', source: 'books' }
  ],
  14: [
    { sentence: '空は青いです。', translation: 'Небо синее.', source: 'news' },
    { sentence: '青いシャツを持っています。', translation: 'У меня есть синяя рубашка.', source: 'social media' }
  ],
  15: [
    { sentence: '芝生は緑です。', translation: 'Трава зеленая.', source: 'books' },
    { sentence: '信号が緑になりました。', translation: 'Светофор стал зеленым.', source: 'news' }
  ],
  16: [
    { sentence: '太陽は黄色いです。', translation: 'Солнце желтое.', source: 'books' },
    { sentence: '黄色い車を持っています。', translation: 'У меня есть желтая машина.', source: 'social media' }
  ],
  17: [
    { sentence: '一つだけ持っています。', translation: 'У меня только один.', source: 'social media' },
    { sentence: 'リストの一番目です。', translation: 'Первый в списке.', source: 'news' }
  ],
  18: [
    { sentence: 'コーヒーを二つお願いします。', translation: 'Два кофе, пожалуйста.', source: 'social media' },
    { sentence: '兄弟が二人います。', translation: 'У меня два брата.', source: 'books' }
  ],
  19: [
    { sentence: '三つは多いです。', translation: 'Три — это много.', source: 'books' },
    { sentence: 'あと三日です。', translation: 'Осталось три дня.', source: 'news' }
  ],
  20: [
    { sentence: '四季があります。', translation: 'Есть четыре сезона.', source: 'books' },
    { sentence: '四時でした。', translation: 'Было четыре часа.', source: 'news' }
  ]
};
