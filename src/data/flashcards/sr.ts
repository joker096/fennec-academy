import { ContextualExample } from '../../services/geminiService';

export const SR_OFFLINE_EXAMPLES: Record<number, ContextualExample[]> = {
  1: [
    { sentence: 'Здраво! Како си данас?', translation: 'Привет! Как ты сегодня?', source: 'social media' },
    { sentence: 'Здраво, желео бих да резервишем сто.', translation: 'Привет, я хотел бы забронировать столик.', source: 'books' }
  ],
  2: [
    { sentence: 'Довиђења, видимо се сутра.', translation: 'До свидания, увидимся завтра.', source: 'social media' },
    { sentence: 'Рекао је довиђења и затворио врата.', translation: 'Он сказал до свидания и закрыл дверь.', source: 'books' }
  ],
  3: [
    { sentence: 'Хвала пуно на помоћи.', translation: 'Большое спасибо за помощь.', source: 'social media' },
    { sentence: 'Хвала свима што сте дошли.', translation: 'Спасибо всем, что пришли.', source: 'news' }
  ],
  4: [
    { sentence: 'Једну кафу, молим.', translation: 'Один кофе, пожалуйста.', source: 'social media' },
    { sentence: 'Помозите ми, молим вас.', translation: 'Помогите мне, пожалуйста.', source: 'books' }
  ],
  5: [
    { sentence: 'Да, то је тачно.', translation: 'Да, это верно.', source: 'news' },
    { sentence: 'Рекао је да.', translation: 'Он сказал да.', source: 'books' }
  ],
  6: [
    { sentence: 'Не, не желим.', translation: 'Нет, я не хочу.', source: 'social media' },
    { sentence: 'Одговор је не.', translation: 'Ответ — нет.', source: 'news' }
  ],
  7: [
    { sentence: 'Како си данас?', translation: 'Как ты сегодня?', source: 'social media' },
    { sentence: 'Здраво, како си?', translation: 'Привет, как дела?', source: 'books' }
  ],
  8: [
    { sentence: 'Добро сам, хвала.', translation: 'Я в порядке, спасибо.', source: 'social media' },
    { sentence: 'Све је у реду.', translation: 'Все хорошо.', source: 'books' }
  ],
  9: [
    { sentence: 'Мој пас је веома добар.', translation: 'Моя собака очень хорошая.', source: 'social media' },
    { sentence: 'Пас лаје.', translation: 'Собака лает.', source: 'news' }
  ],
  10: [
    { sentence: 'Имам малу мачку.', translation: 'У меня есть маленькая кошка.', source: 'social media' },
    { sentence: 'Мачка спава.', translation: 'Кошка спит.', source: 'books' }
  ],
  11: [
    { sentence: 'Птица пева ујутру.', translation: 'Птица поет по утрам.', source: 'books' },
    { sentence: 'Видео сам плаву птицу.', translation: 'Я видел синюю птицу.', source: 'social media' }
  ],
  12: [
    { sentence: 'Риба плива у реци.', translation: 'Риба плавает в реке.', source: 'books' },
    { sentence: 'Купио сам златну рибицу.', translation: 'Я купил золотую рыбку.', source: 'social media' }
  ],
  13: [
    { sentence: 'Волим црвену боју.', translation: 'Мне нравится красный цвет.', source: 'social media' },
    { sentence: 'Јабука је црвена.', translation: 'Яблоко красное.', source: 'books' }
  ],
  14: [
    { sentence: 'Небо је плаво.', translation: 'Небо синее.', source: 'news' },
    { sentence: 'Имам плаву кошуљу.', translation: 'У меня есть синяя рубашка.', source: 'social media' }
  ],
  15: [
    { sentence: 'Трава је зелена.', translation: 'Трава зеленая.', source: 'books' },
    { sentence: 'Семафор је зелен.', translation: 'Светофор зеленый.', source: 'news' }
  ],
  16: [
    { sentence: 'Сунце је жуто.', translation: 'Сунце желтое.', source: 'books' },
    { sentence: 'Имам жути ауто.', translation: 'У меня есть желтая машина.', source: 'social media' }
  ],
  17: [
    { sentence: 'Имам само један.', translation: 'У меня только один.', source: 'social media' },
    { sentence: 'Број један на листи.', translation: 'Номер один в списке.', source: 'news' }
  ],
  18: [
    { sentence: 'Две кафе, молим.', translation: 'Два кофе, пожалуйста.', source: 'social media' },
    { sentence: 'Имам два брата.', translation: 'У меня два брата.', source: 'books' }
  ],
  19: [
    { sentence: 'Три су много.', translation: 'Трое — это много.', source: 'books' },
    { sentence: 'Остало је још три дана.', translation: 'Осталось еще три дня.', source: 'news' }
  ],
  20: [
    { sentence: 'Постоје четири годишња доба.', translation: 'Есть четыре времени года.', source: 'books' },
    { sentence: 'Било је четири сата.', translation: 'Было четыре часа.', source: 'news' }
  ]
};
