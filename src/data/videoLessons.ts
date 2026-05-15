export interface VideoLesson {
  id: string;
  targetLang: string; // 'es', 'fr', 'sr', 'de', 'it', 'ja', 'zh', 'ru', 'en', or 'all'
  title: Record<string, string>;
  description: Record<string, string>;
  url: Record<string, string>;
  thumbnail: string;
  topic: 'phonetics' | 'grammar' | 'travel' | 'culture';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
}

export const VIDEO_LESSONS: VideoLesson[] = [
  {
    id: 'all_polyglot_tips',
    targetLang: 'all',
    title: {
      en: 'How to Learn Any Language Fast',
      ru: 'Как быстро выучить любой язык',
      es: 'Cómo aprender cualquier idioma rápido'
    },
    description: {
      en: 'Tips and tricks from polyglots to accelerate your learning.',
      ru: 'Советы и хитрости от полиглотов для ускорения обучения.',
      es: 'Consejos y trucos de políglotas para acelerar tu aprendizaje.'
    },
    url: {
      en: 'https://www.youtube.com/watch?v=illAp_c2Zz4',
      ru: 'https://www.youtube.com/watch?v=illAp_c2Zz4', // Fallback or replace with actual RU video
      es: 'https://www.youtube.com/watch?v=illAp_c2Zz4'
    },
    thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=400&q=80',
    topic: 'culture',
    difficulty: 'intermediate',
    duration: '12:40'
  },
  {
    id: 'es_phonetics_1',
    targetLang: 'es',
    title: {
      en: 'Spanish Alphabet & Pronunciation',
      ru: 'Испанский алфавит и произношение',
      es: 'Alfabeto y pronunciación en español'
    },
    description: {
      en: 'Master the sounds of Spanish and speak like a native.',
      ru: 'Освойте звуки испанского языка и говорите как носитель.',
      es: 'Domina los sonidos del español y habla como un nativo.'
    },
    url: {
      en: 'https://www.youtube.com/watch?v=9RUpmhA-E14',
      ru: 'https://www.youtube.com/watch?v=9RUpmhA-E14',
      es: 'https://www.youtube.com/watch?v=9RUpmhA-E14'
    },
    thumbnail: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=400&q=80',
    topic: 'phonetics',
    difficulty: 'beginner',
    duration: '10:25'
  },
  {
    id: 'fr_travel_1',
    targetLang: 'fr',
    title: {
      en: 'Essential French Travel Phrases',
      ru: 'Базовые фразы для путешествий по Франции',
      es: 'Frases esenciales para viajar a Francia'
    },
    description: {
      en: 'Order food, ask for directions, and navigate Paris.',
      ru: 'Заказ еды, как спросить дорогу и ориентироваться в Париже.',
      es: 'Pide comida, pide direcciones y navega por París.'
    },
    url: {
      en: 'https://www.youtube.com/watch?v=0M8BqE-9eMw',
      ru: 'https://www.youtube.com/watch?v=0M8BqE-9eMw',
      es: 'https://www.youtube.com/watch?v=0M8BqE-9eMw'
    },
    thumbnail: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80',
    topic: 'travel',
    difficulty: 'beginner',
    duration: '15:10'
  },
  {
    id: 'de_grammar_1',
    targetLang: 'de',
    title: {
      en: 'German Cases Explained',
      ru: 'Немецкие падежи: объяснение',
      es: 'Los casos alemanes explicados'
    },
    description: {
      en: 'Understand Nominative, Accusative, Dative, and Genitive.',
      ru: 'Поймите именительный, винительный, дательный и родительный падежи.',
      es: 'Entiende el nominativo, acusativo, dativo y genitivo.'
    },
    url: {
      en: 'https://www.youtube.com/watch?v=1234567890',
      ru: 'https://www.youtube.com/watch?v=1234567890',
      es: 'https://www.youtube.com/watch?v=1234567890'
    },
    thumbnail: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=400&q=80',
    topic: 'grammar',
    difficulty: 'intermediate',
    duration: '18:30'
  },
  {
    id: 'it_travel_1',
    targetLang: 'it',
    title: {
      en: 'Italian for Tourists',
      ru: 'Итальянский для туристов',
      es: 'Italiano para turistas'
    },
    description: {
      en: 'Must-know phrases for your trip to Italy.',
      ru: 'Фразы, которые необходимо знать для поездки в Италию.',
      es: 'Frases imprescindibles para tu viaje a Italia.'
    },
    url: {
      en: 'https://www.youtube.com/watch?v=abcdefghij',
      ru: 'https://www.youtube.com/watch?v=abcdefghij',
      es: 'https://www.youtube.com/watch?v=abcdefghij'
    },
    thumbnail: 'https://images.unsplash.com/photo-1516483638261-f40af5ba32ea?auto=format&fit=crop&w=400&q=80',
    topic: 'travel',
    difficulty: 'beginner',
    duration: '08:45'
  },
  {
    id: 'ja_phonetics_1',
    targetLang: 'ja',
    title: {
      en: 'Japanese Pronunciation Guide',
      ru: 'Руководство по японскому произношению',
      es: 'Guía de pronunciación japonesa'
    },
    description: {
      en: 'Pitch accent and basic sounds in Japanese.',
      ru: 'Музыкальное ударение и базовые звуки в японском.',
      es: 'Acento tonal y sonidos básicos en japonés.'
    },
    url: {
      en: 'https://www.youtube.com/watch?v=klmnopqrst',
      ru: 'https://www.youtube.com/watch?v=klmnopqrst',
      es: 'https://www.youtube.com/watch?v=klmnopqrst'
    },
    thumbnail: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=400&q=80',
    topic: 'phonetics',
    difficulty: 'beginner',
    duration: '14:20'
  },
  {
    id: 'ru_travel_1',
    targetLang: 'ru',
    title: {
      en: 'Common Russian Travel Phrases',
      ru: 'Частые фразы для путешествий по России',
      es: 'Frases comunes para viajar a Rusia'
    },
    description: {
      en: 'Learn essential Russian phrases for your next trip.',
      ru: 'Выучите основные русские фразы для следующей поездки.',
      es: 'Aprende frases esenciales en ruso para tu próximo viaje.'
    },
    url: {
      en: 'https://www.youtube.com/watch?v=1234567890',
      ru: 'https://www.youtube.com/watch?v=1234567890',
      es: 'https://www.youtube.com/watch?v=1234567890'
    },
    thumbnail: 'https://images.unsplash.com/photo-1513622470522-26c311a071f9?auto=format&fit=crop&w=400&q=80',
    topic: 'travel',
    difficulty: 'beginner',
    duration: '08:00'
  },
  {
    id: 'en_grammar_1',
    targetLang: 'en',
    title: {
      en: 'English Tenses Explained',
      ru: 'Времена английского языка',
      es: 'Tiempos verbales en inglés'
    },
    description: {
      en: 'Master all 12 English tenses easily.',
      ru: 'Легко освойте все 12 времен английского языка.',
      es: 'Domina los 12 tiempos verbales en inglés fácilmente.'
    },
    url: {
      en: 'https://www.youtube.com/watch?v=84WIaK3ZgPI',
      ru: 'https://www.youtube.com/watch?v=84WIaK3ZgPI',
      es: 'https://www.youtube.com/watch?v=84WIaK3ZgPI'
    },
    thumbnail: 'https://images.unsplash.com/photo-1513622470522-26c311a071f9?auto=format&fit=crop&w=400&q=80',
    topic: 'grammar',
    difficulty: 'intermediate',
    duration: '20:00'
  },
  {
    id: 'zh_culture_1',
    targetLang: 'zh',
    title: {
      en: 'Chinese Etiquette & Culture',
      ru: 'Китайский этикет и культура',
      es: 'Etiqueta y cultura china'
    },
    description: {
      en: 'What you need to know before visiting China.',
      ru: 'Что нужно знать перед поездкой в Китай.',
      es: 'Lo que necesitas saber antes de visitar China.'
    },
    url: {
      en: 'https://www.youtube.com/watch?v=84WIaK3ZgPI',
      ru: 'https://www.youtube.com/watch?v=84WIaK3ZgPI',
      es: 'https://www.youtube.com/watch?v=84WIaK3ZgPI'
    },
    thumbnail: 'https://images.unsplash.com/photo-1513622470522-26c311a071f9?auto=format&fit=crop&w=400&q=80',
    topic: 'culture',
    difficulty: 'intermediate',
    duration: '15:30'
  },
  {
    id: 'sr_travel_1',
    targetLang: 'sr',
    title: {
      en: 'Serbian Travel Phrases',
      ru: 'Сербские фразы для путешествий',
      es: 'Frases de viaje en serbio'
    },
    description: {
      en: 'Essential phrases for your trip to Serbia.',
      ru: 'Основные фразы для поездки в Сербию.',
      es: 'Frases esenciales para tu viaje a Serbia.'
    },
    url: {
      en: 'https://www.youtube.com/watch?v=84WIaK3ZgPI',
      ru: 'https://www.youtube.com/watch?v=84WIaK3ZgPI',
      es: 'https://www.youtube.com/watch?v=84WIaK3ZgPI'
    },
    thumbnail: 'https://images.unsplash.com/photo-1513622470522-26c311a071f9?auto=format&fit=crop&w=400&q=80',
    topic: 'travel',
    difficulty: 'beginner',
    duration: '10:00'
  },
  {
    id: 'es_mistakes_1',
    targetLang: 'es',
    title: {
      en: 'Common Spanish Mistakes',
      ru: 'Частые ошибки в испанском',
      es: 'Errores comunes en español'
    },
    description: {
      en: 'Avoid these common pitfalls when learning Spanish.',
      ru: 'Избегайте этих распространенных ошибок при изучении испанского.',
      es: 'Evita estos errores comunes al aprender español.'
    },
    url: {
      en: 'https://www.youtube.com/watch?v=84WIaK3ZgPI',
      ru: 'https://www.youtube.com/watch?v=84WIaK3ZgPI',
      es: 'https://www.youtube.com/watch?v=84WIaK3ZgPI'
    },
    thumbnail: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=400&q=80',
    topic: 'grammar',
    difficulty: 'intermediate',
    duration: '12:15'
  },
  {
    id: 'fr_cuisine_1',
    targetLang: 'fr',
    title: {
      en: 'French Cuisine Vocabulary',
      ru: 'Словарь французской кухни',
      fr: 'Vocabulaire de la cuisine française'
    },
    description: {
      en: 'Learn the names of famous French dishes and ingredients.',
      ru: 'Выучите названия знаменитых французских блюд и ингредиентов.',
      fr: 'Apprenez les noms des plats et ingrédients français célèbres.'
    },
    url: {
      en: 'https://www.youtube.com/watch?v=0M8BqE-9eMw',
      ru: 'https://www.youtube.com/watch?v=0M8BqE-9eMw',
      fr: 'https://www.youtube.com/watch?v=0M8BqE-9eMw'
    },
    thumbnail: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80',
    topic: 'culture',
    difficulty: 'beginner',
    duration: '09:40'
  },
  {
    id: 'de_culture_1',
    targetLang: 'de',
    title: {
      en: 'German Traditions',
      ru: 'Немецкие традиции',
      de: 'Deutsche Traditionen'
    },
    description: {
      en: 'Explore the rich culture and traditions of Germany.',
      ru: 'Исследуйте богатую культуру и традиции Германии.',
      de: 'Entdecke die reiche Kultur und Traditionen Deutschlands.'
    },
    url: {
      en: 'https://www.youtube.com/watch?v=1234567890',
      ru: 'https://www.youtube.com/watch?v=1234567890',
      de: 'https://www.youtube.com/watch?v=1234567890'
    },
    thumbnail: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=400&q=80',
    topic: 'culture',
    difficulty: 'intermediate',
    duration: '14:50'
  },
  {
    id: 'it_gestures_1',
    targetLang: 'it',
    title: {
      en: 'Italian Gestures Explained',
      ru: 'Итальянские жесты: объяснение',
      it: 'Gesti italiani spiegati'
    },
    description: {
      en: 'Learn how to speak with your hands like a true Italian.',
      ru: 'Узнайте, как говорить руками, как настоящий итальянец.',
      it: 'Impara a parlare con le mani come un vero italiano.'
    },
    url: {
      en: 'https://www.youtube.com/watch?v=abcdefghij',
      ru: 'https://www.youtube.com/watch?v=abcdefghij',
      it: 'https://www.youtube.com/watch?v=abcdefghij'
    },
    thumbnail: 'https://images.unsplash.com/photo-1516483638261-f40af5ba32ea?auto=format&fit=crop&w=400&q=80',
    topic: 'culture',
    difficulty: 'intermediate',
    duration: '07:30'
  },
  {
    id: 'ja_writing_1',
    targetLang: 'ja',
    title: {
      en: 'Introduction to Japanese Writing',
      ru: 'Введение в японскую письменность',
      ja: '日本語の書き方の紹介'
    },
    description: {
      en: 'Learn about Hiragana, Katakana, and Kanji.',
      ru: 'Узнайте о хирагане, катакане и кандзи.',
      ja: 'ひらがな、カタカナ、漢字について学びましょう。'
    },
    url: {
      en: 'https://www.youtube.com/watch?v=klmnopqrst',
      ru: 'https://www.youtube.com/watch?v=klmnopqrst',
      ja: 'https://www.youtube.com/watch?v=klmnopqrst'
    },
    thumbnail: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=400&q=80',
    topic: 'grammar',
    difficulty: 'beginner',
    duration: '18:20'
  },
  {
    id: 'zh_newyear_1',
    targetLang: 'zh',
    title: {
      en: 'Chinese New Year Traditions',
      ru: 'Традиции китайского Нового года',
      zh: '春节传统'
    },
    description: {
      en: 'Discover how the most important Chinese holiday is celebrated.',
      ru: 'Узнайте, как празднуется самый важный китайский праздник.',
      zh: '了解最重要的中国节日是如何庆祝的。'
    },
    url: {
      en: 'https://www.youtube.com/watch?v=84WIaK3ZgPI',
      ru: 'https://www.youtube.com/watch?v=84WIaK3ZgPI',
      zh: 'https://www.youtube.com/watch?v=84WIaK3ZgPI'
    },
    thumbnail: 'https://images.unsplash.com/photo-1513622470522-26c311a071f9?auto=format&fit=crop&w=400&q=80',
    topic: 'culture',
    difficulty: 'intermediate',
    duration: '11:45'
  },
  {
    id: 'sr_food_1',
    targetLang: 'sr',
    title: {
      en: 'Serbian Food Guide',
      ru: 'Гид по сербской еде',
      sr: 'Vodič kroz srpsku hranu'
    },
    description: {
      en: 'Try the most delicious Serbian dishes.',
      ru: 'Попробуйте самые вкусные сербские блюда.',
      sr: 'Probajte najukusnija srpska jela.'
    },
    url: {
      en: 'https://www.youtube.com/watch?v=84WIaK3ZgPI',
      ru: 'https://www.youtube.com/watch?v=84WIaK3ZgPI',
      sr: 'https://www.youtube.com/watch?v=84WIaK3ZgPI'
    },
    thumbnail: 'https://images.unsplash.com/photo-1513622470522-26c311a071f9?auto=format&fit=crop&w=400&q=80',
    topic: 'culture',
    difficulty: 'beginner',
    duration: '13:10'
  }
];
