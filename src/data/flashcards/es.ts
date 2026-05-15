import { ContextualExample } from '../../services/geminiService';

export const ES_OFFLINE_EXAMPLES: Record<number, ContextualExample[]> = {
  1: [
    { sentence: '¡Hola! ¿Cómo estás hoy?', translation: 'Привет! Как ты сегодня?', source: 'social media' },
    { sentence: 'Hola, me gustaría reservar una mesa.', translation: 'Привет, я хотел бы забронировать столик.', source: 'books' },
    { sentence: 'Dijo hola con una gran sonrisa.', translation: 'Он сказал привет с большой улыбкой.', source: 'books' }
  ],
  2: [
    { sentence: 'Adiós, nos vemos mañana.', translation: 'До свидания, увидимся завтра.', source: 'social media' },
    { sentence: 'Dijo adiós y cerró la puerta.', translation: 'Он сказал до свидания и закрыл дверь.', source: 'books' },
    { sentence: 'Es hora de decir adiós a las vacaciones.', translation: 'Пришло время сказать до свидания отпуску.', source: 'news' }
  ],
  3: [
    { sentence: 'Muchas gracias por tu ayuda.', translation: 'Большое спасибо за твою помощь.', source: 'social media' },
    { sentence: 'Gracias a todos por venir.', translation: 'Спасибо всем, что пришли.', source: 'news' },
    { sentence: 'No, gracias, ya he comido.', translation: 'Нет, спасибо, я уже поел.', source: 'books' }
  ],
  4: [
    { sentence: 'Por favor, ¿me puede ayudar?', translation: 'Пожалуйста, вы можете мне помочь?', source: 'books' },
    { sentence: 'Un café, por favor.', translation: 'Кофе, пожалуйста.', source: 'social media' }
  ],
  5: [
    { sentence: 'Sí, estoy de acuerdo.', translation: 'Да, я согласен.', source: 'news' },
    { sentence: 'Dijo que sí con la cabeza.', translation: 'Он кивнул в знак согласия.', source: 'books' }
  ],
  6: [
    { sentence: 'No, no quiero ir.', translation: 'Нет, я не хочу идти.', source: 'social media' },
    { sentence: 'La respuesta es no.', translation: 'Ответ — нет.', source: 'news' }
  ],
  7: [
    { sentence: '¿Cómo estás? Hace mucho que no te veo.', translation: 'Как дела? Давно тебя не видел.', source: 'social media' },
    { sentence: 'Hola, ¿cómo estás hoy?', translation: 'Привет, как ты сегодня?', source: 'books' }
  ],
  8: [
    { sentence: 'Estoy bien, gracias por preguntar.', translation: 'Я в порядке, спасибо, что спросили.', source: 'social media' },
    { sentence: 'Dijo que estaba bien.', translation: 'Он сказал, что он в порядке.', source: 'books' }
  ],
  9: [
    { sentence: 'Mi perro es muy juguetón.', translation: 'Моя собака очень игривая.', source: 'social media' },
    { sentence: 'El perro ladró toda la noche.', translation: 'Собака лаяла всю ночь.', source: 'news' }
  ],
  10: [
    { sentence: 'Tengo un gato negro.', translation: 'У меня есть черный кот.', source: 'social media' },
    { sentence: 'El gato duerme en el sofá.', translation: 'Кот спит на диване.', source: 'books' }
  ],
  11: [
    { sentence: 'El pájaro canta por la mañana.', translation: 'Птица поет по утрам.', source: 'books' },
    { sentence: 'Vi un pájaro azul en el jardín.', translation: 'Я видел синюю птицу в саду.', source: 'social media' }
  ],
  12: [
    { sentence: 'El pez nada en el río.', translation: 'Рыба плавает в реке.', source: 'books' },
    { sentence: 'Compré un pez de colores.', translation: 'Я купил золотую рыбку.', source: 'social media' }
  ],
  13: [
    { sentence: 'Me gusta el color rojo.', translation: 'Мне нравится красный цвет.', source: 'social media' },
    { sentence: 'La manzana es roja.', translation: 'Яблоко красное.', source: 'books' }
  ],
  14: [
    { sentence: 'El cielo es azul.', translation: 'Небо синее.', source: 'news' },
    { sentence: 'Tengo una camisa azul.', translation: 'У меня есть синяя рубашка.', source: 'social media' }
  ],
  15: [
    { sentence: 'La hierba es verde.', translation: 'Трава зеленая.', source: 'books' },
    { sentence: 'El semáforo está en verde.', translation: 'Светофор горит зеленым.', source: 'news' }
  ],
  16: [
    { sentence: 'El sol es amarillo.', translation: 'Солнце желтое.', source: 'books' },
    { sentence: 'Tengo un coche amarillo.', translation: 'У меня есть желтая машина.', source: 'social media' }
  ],
  17: [
    { sentence: 'Tengo uno solo.', translation: 'У меня только один.', source: 'social media' },
    { sentence: 'Número uno en la lista.', translation: 'Номер один в списке.', source: 'news' }
  ],
  18: [
    { sentence: 'Dos cafés, por favor.', translation: 'Два кофе, пожалуйста.', source: 'social media' },
    { sentence: 'Tengo dos hermanos.', translation: 'У меня два брата.', source: 'books' }
  ],
  19: [
    { sentence: 'Tres son multitud.', translation: 'Трое — это толпа.', source: 'books' },
    { sentence: 'Faltan tres días.', translation: 'Осталось три дня.', source: 'news' }
  ],
  20: [
    { sentence: 'Cuatro estaciones tiene el año.', translation: 'В году четыре сезона.', source: 'books' },
    { sentence: 'Eran las cuatro de la tarde.', translation: 'Было четыре часа дня.', source: 'news' }
  ]
};
