export type Difficulty = 'easy' | 'medium' | 'hard';

export interface MiniLesson {
  id: string;
  targetLang: string; // 'es', 'fr', 'sr', 'de', 'it', 'ja', 'zh', 'en', or 'all'
  title: Record<string, string>;
  description: Record<string, string>;
  content: Record<string, string>; // Markdown or text
  question: Record<string, string>;
  options: Record<string, string>[]; // Options to choose from, localized
  correctAnswerIndex: number;
  xpReward: number;
  difficulty?: Difficulty;
}

export const MINI_LESSONS: MiniLesson[] = [
  {
    id: 'es_ser_estar',
    targetLang: 'es',
    difficulty: 'medium',
    title: {
      en: 'Ser vs Estar',
      ru: 'Ser против Estar',
      es: 'Ser vs Estar',
      fr: 'Ser vs Estar',
      de: 'Ser vs Estar',
      it: 'Ser vs Estar',
      ja: 'Ser vs Estar',
      zh: 'Ser vs Estar'
    },
    description: {
      en: 'Learn when to use the two Spanish verbs for "to be".',
      ru: 'Узнайте, когда использовать два испанских глагола "быть".',
      es: 'Aprende cuándo usar los dos verbos españoles para "ser/estar".',
      fr: 'Apprenez quand utiliser les deux verbes espagnols pour "être".',
      de: 'Lerne, wann man die beiden spanischen Verben für "sein" verwendet.',
      it: 'Impara quando usare i due verbi spagnoli per "essere".',
      ja: '「〜である」を表す2つのスペイン語の動詞の使い分けを学びましょう。',
      zh: '学习何时使用两个表示“是”的西班牙语动词。'
    },
    content: {
      en: '**Ser** is used for permanent or lasting attributes (identity, origin, time).\n\n**Estar** is used for temporary states, locations, and emotions.',
      ru: '**Ser** используется для постоянных признаков (идентичность, происхождение, время).\n\n**Estar** используется для временных состояний, местоположения и эмоций.',
      es: '**Ser** se usa para atributos permanentes o duraderos (identidad, origen, tiempo).\n\n**Estar** se usa para estados temporales, ubicaciones y emociones.',
      fr: '**Ser** est utilisé pour les attributs permanents ou durables (identité, origine, temps).\n\n**Estar** est utilisé pour les états temporaires, les emplacements et les émotions.',
      de: '**Ser** wird für permanente oder dauerhafte Eigenschaften (Identität, Herkunft, Zeit) verwendet.\n\n**Estar** wird für vorübergehende Zustände, Orte und Emotionen verwendet.',
      it: '**Ser** è usato per attributi permanenti o duraturi (identità, origine, tempo).\n\n**Estar** è usato per stati temporanei, luoghi ed emozioni.',
      ja: '**Ser**は永続的または持続的な属性（アイデンティティ、出身、時間）に使用されます。\n\n**Estar**は一時的な状態、場所、感情に使用されます。',
      zh: '**Ser** 用于永久或持久的属性（身份、起源、时间）。\n\n**Estar** 用于临时状态、位置和情感。'
    },
    question: {
      en: 'Which verb would you use to say "I am tired"?',
      ru: 'Какой глагол вы бы использовали, чтобы сказать "Я устал"?',
      es: '¿Qué verbo usarías para decir "Estoy cansado"?',
      fr: 'Quel verbe utiliseriez-vous pour dire "Je suis fatigué" ?',
      de: 'Welches Verb würdest du verwenden, um "Ich bin müde" zu sagen?',
      it: 'Quale verbo useresti per dire "Sono stanco"?',
      ja: '「私は疲れている」と言うにはどの動詞を使いますか？',
      zh: '你会用哪个动词来说“我累了”？'
    },
    options: [
      { en: 'Ser', ru: 'Ser', es: 'Ser', fr: 'Ser', de: 'Ser', it: 'Ser', ja: 'Ser', zh: 'Ser' },
      { en: 'Estar', ru: 'Estar', es: 'Estar', fr: 'Estar', de: 'Estar', it: 'Estar', ja: 'Estar', zh: 'Estar' }
    ],
    correctAnswerIndex: 1,
    xpReward: 20
  },
  {
    id: 'fr_tu_vous',
    targetLang: 'fr',
    difficulty: 'easy',
    title: {
      en: 'Tu vs Vous',
      ru: 'Tu против Vous',
      es: 'Tu vs Vous',
      fr: 'Tu vs Vous',
      de: 'Tu vs Vous',
      it: 'Tu vs Vous',
      ja: 'Tu vs Vous',
      zh: 'Tu vs Vous'
    },
    description: {
      en: 'Master the French pronouns for "you".',
      ru: 'Освойте французские местоимения для "ты/вы".',
      es: 'Domina los pronombres franceses para "tú/usted".',
      fr: 'Maîtrisez les pronoms français pour "tu/vous".',
      de: 'Meistere die französischen Pronomen für "du/Sie".',
      it: 'Padroneggia i pronomi francesi per "tu/voi".',
      ja: 'フランス語の「あなた」の代名詞をマスターしましょう。',
      zh: '掌握法语中表示“你/您”的代词。'
    },
    content: {
      en: '**Tu** is informal and singular. Use it with friends, family, and children.\n\n**Vous** is formal or plural. Use it with strangers, superiors, or multiple people.',
      ru: '**Tu** - неформальное и единственное число. Используйте с друзьями, семьей и детьми.\n\n**Vous** - формальное или множественное число. Используйте с незнакомцами, начальством или несколькими людьми.',
      es: '**Tu** es informal y singular. Úsalo con amigos, familiares y niños.\n\n**Vous** es formal o plural. Úsalo con extraños, superiores o varias personas.',
      fr: '**Tu** est informel et singulier. Utilisez-le avec vos amis, votre famille et les enfants.\n\n**Vous** est formel ou pluriel. Utilisez-le avec des étrangers, des supérieurs ou plusieurs personnes.',
      de: '**Tu** ist informell und im Singular. Verwende es bei Freunden, Familie und Kindern.\n\n**Vous** ist formell oder im Plural. Verwende es bei Fremden, Vorgesetzten oder mehreren Personen.',
      it: '**Tu** è informale e singolare. Usalo con amici, familiari e bambini.\n\n**Vous** è formale o plurale. Usalo con estranei, superiori o più persone.',
      ja: '**Tu**はカジュアルで単数です。友人、家族、子供に使います。\n\n**Vous**はフォーマルまたは複数です。見知らぬ人、目上の人、または複数の人に使います。',
      zh: '**Tu** 是非正式的单数。与朋友、家人和孩子一起使用。\n\n**Vous** 是正式的或复数。与陌生人、上级或多人一起使用。'
    },
    question: {
      en: 'Which pronoun would you use when speaking to a shop assistant?',
      ru: 'Какое местоимение вы бы использовали при разговоре с продавцом?',
      es: '¿Qué pronombre usarías al hablar con un dependiente?',
      fr: 'Quel pronom utiliseriez-vous en parlant à un vendeur ?',
      de: 'Welches Pronomen würdest du verwenden, wenn du mit einem Verkäufer sprichst?',
      it: 'Quale pronome useresti parlando con un commesso?',
      ja: '店員と話すときはどの代名詞を使いますか？',
      zh: '与店员交谈时你会使用哪个代词？'
    },
    options: [
      { en: 'Tu', ru: 'Tu', es: 'Tu', fr: 'Tu', de: 'Tu', it: 'Tu', ja: 'Tu', zh: 'Tu' },
      { en: 'Vous', ru: 'Vous', es: 'Vous', fr: 'Vous', de: 'Vous', it: 'Vous', ja: 'Vous', zh: 'Vous' }
    ],
    correctAnswerIndex: 1,
    xpReward: 20
  },
  {
    id: 'all_greetings',
    targetLang: 'all',
    difficulty: 'easy',
    title: {
      en: 'The Power of Greetings',
      ru: 'Сила приветствий',
      es: 'El poder de los saludos',
      fr: 'Le pouvoir des salutations',
      de: 'Die Macht der Begrüßungen',
      it: 'Il potere dei saluti',
      ja: '挨拶の力',
      zh: '问候的力量'
    },
    description: {
      en: 'Why learning to say hello is your most important tool.',
      ru: 'Почему умение здороваться — ваш самый важный инструмент.',
      es: 'Por qué aprender a decir hola es tu herramienta más importante.',
      fr: 'Pourquoi apprendre à dire bonjour est votre outil le plus important.',
      de: 'Warum es dein wichtigstes Werkzeug ist, Hallo sagen zu lernen.',
      it: 'Perché imparare a dire ciao è il tuo strumento più importante.',
      ja: '挨拶を学ぶことが最も重要なツールである理由。',
      zh: '为什么学会打招呼是你最重要的工具。'
    },
    content: {
      en: 'Greetings are the gateway to any conversation. Even if you only know how to say "Hello" and "Thank you" in a language, locals will appreciate your effort and be much more willing to help you.',
      ru: 'Приветствия — это ворота в любой разговор. Даже если вы знаете только "Здравствуйте" и "Спасибо", местные жители оценят ваши усилия и будут гораздо охотнее вам помогать.',
      es: 'Los saludos son la puerta de entrada a cualquier conversación. Incluso si solo sabes decir "Hola" y "Gracias", los lugareños apreciarán tu esfuerzo y estarán mucho más dispuestos a ayudarte.',
      fr: 'Les salutations sont la porte d\'entrée de toute conversation. Même si vous ne savez dire que "Bonjour" et "Merci", les habitants apprécieront vos efforts et seront beaucoup plus disposés à vous aider.',
      de: 'Begrüßungen sind das Tor zu jedem Gespräch. Selbst wenn du nur "Hallo" und "Danke" sagen kannst, werden die Einheimischen deine Bemühungen schätzen und viel eher bereit sein, dir zu helfen.',
      it: 'I saluti sono la porta d\'accesso a qualsiasi conversazione. Anche se sai dire solo "Ciao" e "Grazie", la gente del posto apprezzerà il tuo sforzo e sarà molto più disposta ad aiutarti.',
      ja: '挨拶はあらゆる会話の入り口です。「こんにちは」と「ありがとう」しか知らなくても、地元の人々はあなたの努力を評価し、喜んで助けてくれるでしょう。',
      zh: '问候是任何对话的门户。即使你只知道如何说“你好”和“谢谢”，当地人也会欣赏你的努力，并更愿意帮助你。'
    },
    question: {
      en: 'What is the main benefit of learning basic greetings?',
      ru: 'В чем главное преимущество изучения базовых приветствий?',
      es: '¿Cuál es el principal beneficio de aprender saludos básicos?',
      fr: 'Quel est le principal avantage d\'apprendre les salutations de base ?',
      de: 'Was ist der Hauptvorteil beim Erlernen grundlegender Begrüßungen?',
      it: 'Qual è il vantaggio principale di imparare i saluti di base?',
      ja: '基本的な挨拶を学ぶ主な利点は何ですか？',
      zh: '学习基本问候的主要好处是什么？'
    },
    options: [
      { en: 'It makes you fluent instantly', ru: 'Это мгновенно делает вас свободно говорящим', es: 'Te hace fluido al instante', fr: 'Cela vous rend bilingue instantanément', de: 'Es macht dich sofort fließend', it: 'Ti rende fluente all\'istante', ja: 'すぐに流暢になります', zh: '它让你立刻流利' },
      { en: 'It shows respect and opens doors', ru: 'Это проявляет уважение и открывает двери', es: 'Muestra respeto y abre puertas', fr: 'Cela montre du respect et ouvre des portes', de: 'Es zeigt Respekt und öffnet Türen', it: 'Mostra rispetto e apre le porte', ja: '敬意を示し、扉を開きます', zh: '它表示尊重并打开大门' },
      { en: 'It helps you pass exams', ru: 'Это помогает сдавать экзамены', es: 'Te ayuda a aprobar exámenes', fr: 'Cela vous aide à réussir vos examens', de: 'Es hilft dir, Prüfungen zu bestehen', it: 'Ti aiuta a superare gli esami', ja: '試験に合格するのに役立ちます', zh: '它帮助你通过考试' }
    ],
    correctAnswerIndex: 1,
    xpReward: 15
  },
  {
    id: 'en_articles',
    targetLang: 'en',
    difficulty: 'easy',
    title: {
      en: 'A vs An',
      ru: 'A против An',
      es: 'A vs An',
      fr: 'A vs An',
      de: 'A vs An',
      it: 'A vs An',
      ja: 'A vs An',
      zh: 'A vs An'
    },
    description: {
      en: 'Learn when to use "a" and "an" in English.',
      ru: 'Узнайте, когда использовать "a" и "an" в английском языке.',
      es: 'Aprende cuándo usar "a" y "an" en inglés.',
      fr: 'Apprenez quand utiliser "a" et "an" en anglais.',
      de: 'Lerne, wann man "a" und "an" im Englischen verwendet.',
      it: 'Impara quando usare "a" e "an" in inglese.',
      ja: '英語の「a」と「an」の使い分けを学びましょう。',
      zh: '学习在英语中何时使用“a”和“an”。'
    },
    content: {
      en: '**A** is used before words that start with a consonant sound (e.g., a car, a university).\n\n**An** is used before words that start with a vowel sound (e.g., an apple, an hour).',
      ru: '**A** используется перед словами, начинающимися с согласного звука (например, a car, a university).\n\n**An** используется перед словами, начинающимися с гласного звука (например, an apple, an hour).',
      es: '**A** se usa antes de palabras que comienzan con un sonido consonante (por ejemplo, a car, a university).\n\n**An** se usa antes de palabras que comienzan con un sonido vocal (por ejemplo, an apple, an hour).',
      fr: '**A** est utilisé avant les mots commençant par un son de consonne (par exemple, a car, a university).\n\n**An** est utilisé avant les mots commençant par un son de voyelle (par exemple, an apple, an hour).',
      de: '**A** wird vor Wörtern verwendet, die mit einem Konsonantenklang beginnen (z. B. a car, a university).\n\n**An** wird vor Wörtern verwendet, die mit einem Vokalton beginnen (z. B. an apple, an hour).',
      it: '**A** è usato prima delle parole che iniziano con un suono consonantico (es. a car, a university).\n\n**An** è usato prima delle parole che iniziano con un suono vocalico (es. an apple, an hour).',
      ja: '**A**は子音で始まる単語の前に使われます（例：a car, a university）。\n\n**An**は母音で始まる単語の前に使われます（例：an apple, an hour）。',
      zh: '**A** 用于以辅音音素开头的单词前（例如，a car, a university）。\n\n**An** 用于以元音音素开头的单词前（例如，an apple, an hour）。'
    },
    question: {
      en: 'Which article would you use before the word "umbrella"?',
      ru: 'Какой артикль вы бы использовали перед словом "umbrella"?',
      es: '¿Qué artículo usarías antes de la palabra "umbrella"?',
      fr: 'Quel article utiliseriez-vous avant le mot "umbrella" ?',
      de: 'Welchen Artikel würdest du vor dem Wort "umbrella" verwenden?',
      it: 'Quale articolo useresti prima della parola "umbrella"?',
      ja: '「umbrella」という単語の前にどの冠詞を使いますか？',
      zh: '你会用哪个冠词在“umbrella”这个词前面？'
    },
    options: [
      { en: 'A', ru: 'A', es: 'A', fr: 'A', de: 'A', it: 'A', ja: 'A', zh: 'A' },
      { en: 'An', ru: 'An', es: 'An', fr: 'An', de: 'An', it: 'An', ja: 'An', zh: 'An' }
    ],
    correctAnswerIndex: 1,
    xpReward: 20
  },
  {
    id: 'sr_cyrillic',
    targetLang: 'sr',
    difficulty: 'medium',
    title: {
      en: 'Serbian Cyrillic',
      ru: 'Сербская кириллица',
      es: 'Cirílico serbio',
      fr: 'Cyrillique serbe',
      de: 'Serbisches Kyrillisch',
      it: 'Cirillico serbo',
      ja: 'セルビア語のキリル文字',
      zh: '塞尔维亚西里尔文'
    },
    description: {
      en: 'Learn the basics of the Serbian Cyrillic alphabet.',
      ru: 'Изучите основы сербского кириллического алфавита.',
      es: 'Aprende los conceptos básicos del alfabeto cirílico serbio.',
      fr: 'Apprenez les bases de l\'alphabet cyrillique serbe.',
      de: 'Lerne die Grundlagen des serbischen kyrillischen Alphabets.',
      it: 'Impara le basi dell\'alfabeto cirillico serbo.',
      ja: 'セルビア語のキリル文字の基礎を学びましょう。',
      zh: '学习塞尔维亚西里尔字母的基础知识。'
    },
    content: {
      en: 'Serbian uses two alphabets: Cyrillic and Latin. The Cyrillic alphabet has 30 letters, and each letter represents one sound. It is very phonetic!',
      ru: 'В сербском языке используются два алфавита: кириллица и латиница. В кириллическом алфавите 30 букв, и каждая буква обозначает один звук. Он очень фонетичный!',
      es: 'El serbio usa dos alfabetos: cirílico y latino. El alfabeto cirílico tiene 30 letras, y cada letra representa un sonido. ¡Es muy fonético!',
      fr: 'Le serbe utilise deux alphabets : cyrillique et latin. L\'alphabet cyrillique compte 30 lettres, et chaque lettre représente un son. C\'est très phonétique !',
      de: 'Serbisch verwendet zwei Alphabete: Kyrillisch und Lateinisch. Das kyrillische Alphabet hat 30 Buchstaben, und jeder Buchstabe steht für einen Laut. Es ist sehr phonetisch!',
      it: 'Il serbo usa due alfabeti: cirillico e latino. L\'alfabeto cirillico ha 30 lettere, e ogni lettera rappresenta un suono. È molto fonetico!',
      ja: 'セルビア語はキリル文字とラテン文字の2つのアルファベットを使用します。キリル文字には30の文字があり、各文字は1つの音を表します。非常に表音的です！',
      zh: '塞尔维亚语使用两种字母：西里尔字母和拉丁字母。西里尔字母有30个字母，每个字母代表一个发音。它非常注重语音！'
    },
    question: {
      en: 'How many letters are in the Serbian Cyrillic alphabet?',
      ru: 'Сколько букв в сербском кириллическом алфавите?',
      es: '¿Cuántas letras hay en el alfabeto cirílico serbio?',
      fr: 'Combien de lettres y a-t-il dans l\'alphabet cyrillique serbe ?',
      de: 'Wie viele Buchstaben hat das serbische kyrillische Alphabet?',
      it: 'Quante lettere ci sono nell\'alfabeto cirillico serbo?',
      ja: 'セルビア語のキリル文字にはいくつの文字がありますか？',
      zh: '塞尔维亚西里尔字母有多少个字母？'
    },
    options: [
      { en: '26', ru: '26', es: '26', fr: '26', de: '26', it: '26', ja: '26', zh: '26' },
      { en: '30', ru: '30', es: '30', fr: '30', de: '30', it: '30', ja: '30', zh: '30' },
      { en: '33', ru: '33', es: '33', fr: '33', de: '33', it: '33', ja: '33', zh: '33' }
    ],
    correctAnswerIndex: 1,
    xpReward: 25
  },
  {
    id: 'es_por_para',
    targetLang: 'es',
    difficulty: 'hard',
    title: {
      en: 'Por vs Para',
      ru: 'Por против Para',
      es: 'Por vs Para'
    },
    description: {
      en: 'Learn the difference between these two tricky prepositions.',
      ru: 'Узнайте разницу между этими двумя сложными предлогами.',
      es: 'Aprende la diferencia entre estas dos preposiciones.'
    },
    content: {
      en: '**Por** is used for cause, duration, exchange, and movement through.\n\n**Para** is used for purpose, destination, deadline, and recipient.',
      ru: '**Por** используется для причины, длительности, обмена и движения сквозь.\n\n**Para** используется для цели, места назначения, крайнего срока и получателя.',
      es: '**Por** se usa para causa, duración, intercambio y movimiento a través de.\n\n**Para** se usa para propósito, destino, fecha límite y destinatario.'
    },
    question: {
      en: 'Which preposition would you use to say "This is for you"?',
      ru: 'Какой предлог вы бы использовали, чтобы сказать "Это для тебя"?',
      es: '¿Qué preposición usarías para decir "Esto es para ti"?'
    },
    options: [
      { en: 'Por', ru: 'Por', es: 'Por' },
      { en: 'Para', ru: 'Para', es: 'Para' }
    ],
    correctAnswerIndex: 1,
    xpReward: 20
  },
  {
    id: 'fr_passe_compose',
    targetLang: 'fr',
    difficulty: 'hard',
    title: {
      en: 'Passé Composé',
      ru: 'Passé Composé',
      fr: 'Passé Composé'
    },
    description: {
      en: 'Learn how to talk about completed actions in the past.',
      ru: 'Узнайте, как говорить о завершенных действиях в прошлом.',
      fr: 'Apprenez à parler des actions terminées dans le passé.'
    },
    content: {
      en: 'The **Passé Composé** is formed using an auxiliary verb (avoir or être) and a past participle. It describes specific, completed events.',
      ru: '**Passé Composé** образуется с помощью вспомогательного глагола (avoir или être) и причастия прошедшего времени. Оно описывает конкретные, завершенные события.',
      fr: 'Le **Passé Composé** se forme avec un auxiliaire (avoir ou être) et un participe passé. Il décrit des événements précis et terminés.'
    },
    question: {
      en: 'Which auxiliary verb is used for most French verbs in Passé Composé?',
      ru: 'Какой вспомогательный глагол используется для большинства французских глаголов в Passé Composé?',
      fr: 'Quel auxiliaire est utilisé pour la plupart des verbes français au Passé Composé ?'
    },
    options: [
      { en: 'Être', ru: 'Être', fr: 'Être' },
      { en: 'Avoir', ru: 'Avoir', fr: 'Avoir' }
    ],
    correctAnswerIndex: 1,
    xpReward: 25
  },
  {
    id: 'de_articles',
    targetLang: 'de',
    difficulty: 'medium',
    title: {
      en: 'German Genders',
      ru: 'Рода в немецком языке',
      de: 'Deutsche Genera'
    },
    description: {
      en: 'Introduction to Der, Die, and Das.',
      ru: 'Введение в Der, Die и Das.',
      de: 'Einführung in Der, Die und Das.'
    },
    content: {
      en: 'Every German noun has a gender: Masculine (**Der**), Feminine (**Die**), or Neuter (**Das**). There are few rules, so it\'s best to learn the article with the noun!',
      ru: 'У каждого немецкого существительного есть род: мужской (**Der**), женский (**Die**) или средний (**Das**). Правил мало, поэтому лучше учить артикль вместе с существительным!',
      de: 'Jedes deutsche Nomen hat ein Genus: Maskulin (**Der**), Feminin (**Die**) oder Neutrum (**Das**).'
    },
    question: {
      en: 'What is the article for "Apple" (Apfel)?',
      ru: 'Какой артикль у слова "Яблоко" (Apfel)?',
      de: 'Was ist der Artikel für "Apfel"?'
    },
    options: [
      { en: 'Der', ru: 'Der', de: 'Der' },
      { en: 'Die', ru: 'Die', de: 'Die' },
      { en: 'Das', ru: 'Das', de: 'Das' }
    ],
    correctAnswerIndex: 0,
    xpReward: 20
  },
  {
    id: 'it_ce_cisono',
    targetLang: 'it',
    difficulty: 'easy',
    title: {
      en: "C'è vs Ci sono",
      ru: "C'è против Ci sono",
      it: "C'è vs Ci sono"
    },
    description: {
      en: 'Learn how to say "There is" and "There are" in Italian.',
      ru: 'Узнайте, как сказать "Есть/Имеется" в единственном и множественном числе на итальянском.',
      it: 'Impara a dire "C\'è" e "Ci sono" in italiano.'
    },
    content: {
      en: "**C'è** is used for singular subjects (There is).\n\n**Ci sono** is used for plural subjects (There are).",
      ru: "**C'è** используется для единственного числа (Есть/Имеется).\n\n**Ci sono** используется для множественного числа (Есть/Имеются).",
      it: "**C'è** si usa per soggetti singolari.\n\n**Ci sono** si usa per soggetti plurali."
    },
    question: {
      en: 'Which one would you use for "two books"?',
      ru: 'Что бы вы использовали для "двух книг"?',
      it: 'Quale useresti per "due libri"?'
    },
    options: [
      { en: "C'è", ru: "C'è", it: "C'è" },
      { en: 'Ci sono', ru: 'Ci sono', it: 'Ci sono' }
    ],
    correctAnswerIndex: 1,
    xpReward: 15
  },
  {
    id: 'ja_particles_wa_ga',
    targetLang: 'ja',
    difficulty: 'hard',
    title: {
      en: 'Particles Wa vs Ga',
      ru: 'Частицы Wa против Ga',
      ja: '助詞「は」と「が」'
    },
    description: {
      en: 'The fundamental difference between topic and subject particles.',
      ru: 'Фундаментальная разница между частицами темы и подлежащего.',
      ja: 'トピックと主語の助詞の根本的な違い。'
    },
    content: {
      en: '**Wa (は)** marks the topic of the sentence (what we are talking about).\n\n**Ga (が)** marks the specific subject (who or what performs the action).',
      ru: '**Wa (は)** обозначает тему предложения (то, о чем мы говорим).\n\n**Ga (が)** обозначает конкретное подлежащее (кто или что совершает действие).',
      ja: '**は**は文のトピック（何について話しているか）を表します。\n\n**が**は特定の主語（誰が、または何がアクションを行うか）を表します。'
    },
    question: {
      en: 'Which particle is usually called the "topic marker"?',
      ru: 'Какую частицу обычно называют "маркером темы"?',
      ja: '通常「トピックマーカー」と呼ばれるのはどちらの助詞ですか？'
    },
    options: [
      { en: 'Wa (は)', ru: 'Wa (は)', ja: 'は' },
      { en: 'Ga (が)', ru: 'Ga (が)', ja: 'が' }
    ],
    correctAnswerIndex: 0,
    xpReward: 30
  },
  {
    id: 'zh_tones',
    targetLang: 'zh',
    difficulty: 'medium',
    title: {
      en: 'The Four Tones',
      ru: 'Четыре тона',
      zh: '四个声调'
    },
    description: {
      en: 'Master the essential tones of Mandarin Chinese.',
      ru: 'Освойте основные тона китайского языка (мандарин).',
      zh: '掌握普通话的基本声调。'
    },
    content: {
      en: 'Mandarin has four main tones: Flat, Rising, Dipping, and Falling. A change in tone can completely change the meaning of a word!',
      ru: 'В китайском языке четыре основных тона: ровный, восходящий, нисходяще-восходящий и нисходящий. Изменение тона может полностью изменить значение слова!',
      zh: '普通话有四个主要声调：一声、二声、三声和四声。声调的变化可以完全改变词义！'
    },
    question: {
      en: 'How many main tones are there in Mandarin Chinese?',
      ru: 'Сколько основных тонов в китайском языке (мандарин)?',
      zh: '普通话有多少个主要声调？'
    },
    options: [
      { en: '2', ru: '2', zh: '2' },
      { en: '4', ru: '4', zh: '4' },
      { en: '5', ru: '5', zh: '5' }
    ],
    correctAnswerIndex: 1,
    xpReward: 25
  },
  {
    id: 'ar_script',
    targetLang: 'ar',
    difficulty: 'medium',
    title: {
      en: 'Arabic Script',
      ru: 'Арабское письмо',
      ar: 'الكتابة العربية'
    },
    description: {
      en: 'Learn the fundamentals of writing in Arabic.',
      ru: 'Изучите основы арабского письма.',
      ar: 'تعلم أساسيات الكتابة بالعربية.'
    },
    content: {
      en: 'Arabic is written from **Right to Left**. It is a cursive script, meaning letters are mostly connected. There are no capital letters!',
      ru: 'Арабский язык пишется **справа налево**. Это курсивное письмо, то есть буквы в основном соединяются между собой. Заглавных букв нет!',
      ar: 'تُكتب اللغة العربية من **اليمين إلى اليسار**. هي كتابة متصلة، مما يعني أن الحروف متصلة ببعضها غالباً. لا توجد حروف كبيرة!'
    },
    question: {
      en: 'In which direction is Arabic written?',
      ru: 'В каком направлении пишется арабский язык?',
      ar: 'في أي اتجاه تُكتب العربية؟'
    },
    options: [
      { en: 'Left to Right', ru: 'Слева направо', ar: 'من اليسار إلى اليمين' },
      { en: 'Right to Left', ru: 'Справа налево', ar: 'من اليمين إلى اليسار' }
    ],
    correctAnswerIndex: 1,
    xpReward: 25
  },
  {
    id: 'pt_accents',
    targetLang: 'pt',
    difficulty: 'easy',
    title: {
      en: 'Portuguese Accents',
      ru: 'Португальские акценты',
      pt: 'Acentos do Português'
    },
    description: {
      en: 'Understand the common marks used in Portuguese writing.',
      ru: 'Разберитесь в общих знаках, используемых в португальском письме.',
      pt: 'Entenda os sinais comuns usados na escrita portuguesa.'
    },
    content: {
      en: 'Portuguese uses several accents: **Acute** (á), **Circumflex** (â), and the **Tilde** (ã). The tilde indicates a nasal sound, very characteristic of Portuguese!',
      ru: 'В португальском языке используется несколько акцентов: **акут** (á), **циркумфлекс** (â) и **тильда** (ã). Тильда указывает на носовой звук, очень характерный для португальского!',
      pt: 'O português usa vários acentos: **Agudo** (á), **Circunflexo** (â) e o **Til** (ã). O til indica um som nasal, muito característico do português!'
    },
    question: {
      en: 'What does the Tilde (ã) usually indicate in Portuguese?',
      ru: 'Что обычно обозначает тильда (ã) в португальском языке?',
      pt: 'O que o Til (ã) geralmente indica em português?'
    },
    options: [
      { en: 'A silent letter', ru: 'Немую букву', pt: 'Uma letra muda' },
      { en: 'A nasal sound', ru: 'Носовой звук', pt: 'Um som nasal' },
      { en: 'A long vowel', ru: 'Долгий гласный', pt: 'Uma vogal longa' }
    ],
    correctAnswerIndex: 1,
    xpReward: 20
  },
  {
    id: 'ko_hangul',
    targetLang: 'ko',
    difficulty: 'medium',
    title: {
      en: 'Hangul: The Logical Alphabet',
      ru: 'Хангыль: Логичный алфавит',
      ko: '한글: 논리적인 알파벳'
    },
    description: {
      en: 'Discover the unique writing system of Korea.',
      ru: 'Откройте для себя уникальную систему письма Кореи.',
      ko: '한국의 독특한 문자 시스템을 발견하세요.'
    },
    content: {
      en: 'Hangul was invented by King Sejong the Great in 1443. It is designed to be easy to learn, with shapes that mimic the position of the mouth and tongue!',
      ru: 'Хангыль был изобретен королем Седжоном Великим в 1443 году. Он разработан так, чтобы его было легко выучить, а формы букв имитируют положение рта и языка!',
      ko: '한글은 1443년 세종대왕에 의해 발명되었습니다. 배우기 쉽게 디자인되었으며, 글자 모양은 입과 혀의 위치를 모방합니다!'
    },
    question: {
      en: 'Who invented the Korean alphabet, Hangul?',
      ru: 'Кто изобрел корейский алфавит Хангыль?',
      ko: '한글을 누가 발명했나요?'
    },
    options: [
      { en: 'King Sejong the Great', ru: 'Король Седжон Великий', ko: '세종대왕' },
      { en: 'Confucius', ru: 'Конфуций', ko: '공자' },
      { en: 'General Yi Sun-sin', ru: 'Генерал Ли Сунсин', ko: '이순신 장군' }
    ],
    correctAnswerIndex: 0,
    xpReward: 30
  },
  {
    id: 'es_gender_nouns',
    targetLang: 'es',
    difficulty: 'easy',
    title: {
      en: 'Spanish Gender: El vs La',
      ru: 'Род в испанском: El против La',
      es: 'Género en español: El vs La'
    },
    description: {
      en: 'Learn how to identify masculine and feminine nouns.',
      ru: 'Узнайте, как определять мужской и женский род существительных.',
      es: 'Aprende a identificar sustantivos masculinos y femeninos.'
    },
    content: {
      en: 'In Spanish, nouns are either **Masculine** or **Feminine**.\n\n- Usually, words ending in **-o** are masculine (**el** libro).\n- Words ending in **-a** are feminine (**la** mesa).\n\n*Exceptions exist, like "el mapa" or "la mano"!*',
      ru: 'В испанском языке существительные бывают либо **мужского**, либо **женского** рода.\n\n- Обычно слова, оканчивающиеся на **-о**, мужского рода (**el** libro).\n- Слова, оканчивающиеся на **-а**, женского рода (**la** mesa).\n\n*Существуют исключения, такие как "el mapa" или "la mano"!*',
      es: 'En español, los sustantivos son **Masculinos** o **Femeninos**.\n\n- Generalmente, las palabras que terminan en **-o** son masculinas (**el** libro).\n- Las palabras que terminan en **-a** son femeninas (**la** mesa).\n\n*¡Existen excepciones, como "el mapa" o "la mano"!*'
    },
    question: {
      en: 'What is the correct article for "mesa" (table)?',
      ru: 'Какой артикль правильный для слова "mesa" (стол)?',
      es: '¿Cuál es el artículo correcto para "mesa"?'
    },
    options: [
      { en: 'El', ru: 'El', es: 'El' },
      { en: 'La', ru: 'La', es: 'La' }
    ],
    correctAnswerIndex: 1,
    xpReward: 15
  },
  {
    id: 'es_pronunciation_rr',
    targetLang: 'es',
    difficulty: 'hard',
    title: {
      en: 'The Rolled R (RR)',
      ru: 'Раскатистая R (RR)',
      es: 'La R vibrante (RR)'
    },
    description: {
      en: 'Master the most famous sound in Spanish.',
      ru: 'Освойте самый знаменитый звук в испанском языке.',
      es: 'Domina el sonido más famoso del español.'
    },
    content: {
      en: 'The double **rr** (or a single **r** at the beginning of a word) is "rolled" or "trilled".\n\nTo make this sound, place the tip of your tongue against the roof of your mouth, just behind your front teeth, and let it vibrate with the air.',
      ru: 'Двойная **rr** (или одиночная **r** в начале слова) произносится "раскатисто" или с трелью.\n\nЧтобы издать этот звук, прижмите кончик языка к небу сразу за передними зубами и дайте ему вибрировать под потоком воздуха.',
      es: 'La doble **rr** (o una sola **r** al principio de una palabra) se "vibrante" o "trina".\n\nPara hacer este sonido, coloca la punta de la lengua contra el paladar, justo detrás de los dientes frontales, y deja que vibre con el aire.'
    },
    question: {
      en: 'How is the "r" pronounced in the word "Perro" (dog)?',
      ru: 'Как произносится "r" в слове "Perro" (собака)?',
      es: '¿Cómo se pronuncia la "r" en la palabra "Perro"?'
    },
    options: [
      { en: 'Soft, like in English', ru: 'Мягко, как в английском', es: 'Suave, como en inglés' },
      { en: 'Rolled/Trilled', ru: 'Раскатисто/с трелью', es: 'Vibrante/Trina' },
      { en: 'Silent', ru: 'Не произносится', es: 'Muda' }
    ],
    correctAnswerIndex: 1,
    xpReward: 25
  },
  {
    id: 'es_vocabulary_wasteland',
    targetLang: 'es',
    difficulty: 'medium',
    title: {
      en: 'Wasteland Vocabulary',
      ru: 'Словарь пустоши',
      es: 'Vocabulario del Yermo'
    },
    description: {
      en: 'Essential words for surviving the Spanish wasteland.',
      ru: 'Необходимые слова для выживания в испанской пустоши.',
      es: 'Palabras esenciales para sobrevivir en el yermo español.'
    },
    content: {
      en: 'Survival requires knowing your surroundings even in another language!\n\n- **El Yermo** (The Wasteland)\n- **La Radiación** (Radiation)\n- **El Refugio** (The Vault/Shelter)\n- **Las Chapas** (Caps - currency)',
      ru: 'Выживание требует знания окружения даже на другом языке!\n\n- **El Yermo** (Пустошь)\n- **La Radiación** (Радиация)\n- **El Refugio** (Убежище)\n- **Las Chapas** (Крышки — валюта)',
      es: '¡La supervivencia requiere conocer tu entorno incluso en otro idioma!\n\n- **El Yermo** (The Wasteland)\n- **La Radiación** (Radiation)\n- **El Refugio** (The Vault/Shelter)\n- **Las Chapas** (Caps - moneda)'
    },
    question: {
      en: 'How do you say "The Vault" in Spanish?',
      ru: 'Как сказать "Убежище" по-испански?',
      es: '¿Cómo se dice "The Vault" en español?'
    },
    options: [
      { en: 'El Yermo', ru: 'El Yermo', es: 'El Yermo' },
      { en: 'El Refugio', ru: 'El Refugio', es: 'El Refugio' },
      { en: 'La Chapa', ru: 'La Chapa', es: 'La Chapa' }
    ],
    correctAnswerIndex: 1,
    xpReward: 20
  },
  {
    id: 'es_interrogatives',
    targetLang: 'es',
    difficulty: 'medium',
    title: {
      en: 'Question Words',
      ru: 'Вопросительные слова',
      es: 'Palabras interrogativas'
    },
    description: {
      en: 'Learn who, what, where, and why in Spanish.',
      ru: 'Узнайте кто, что, где и почему на испанском.',
      es: 'Aprende quién, qué, dónde y por qué en español.'
    },
    content: {
      en: 'Common question words in Spanish always have an accent mark:\n\n- **¿Quién?** (Who?)\n- **¿Qué?** (What?)\n- **¿Dónde?** (Where?)\n- **¿Cuándo?** (When?)\n- **¿Por qué?** (Why?)',
      ru: 'Общие вопросительные слова в испанском всегда имеют знак ударения:\n\n- **¿Quién?** (Кто?)\n- **¿Qué?** (Что?)\n- **¿Dónde?** (Где?)\n- **¿Cuándo?** (Когда?)\n- **¿Por qué?** (Почему?)',
      es: 'Las palabras interrogativas comunes en español siempre llevan tilde:\n\n- **¿Quién?** (Who?)\n- **¿Qué?** (What?)\n- **¿Dónde?** (Where?)\n- **¿Cuándo?** (When?)\n- **¿Por qué?** (Why?)'
    },
    question: {
      en: 'How do you ask "Where is the vault?"',
      ru: 'Как спросить "Где убежище?"',
      es: '¿Cómo preguntas "¿Dónde está el refugio?"'
    },
    options: [
      { en: '¿Qué está el refugio?', ru: '¿Qué está el refugio?', es: '¿Qué está el refugio?' },
      { en: '¿Dónde está el refugio?', ru: '¿Dónde está el refugio?', es: '¿Dónde está el refugio?' },
      { en: '¿Quién está el refugio?', ru: '¿Quién está el refugio?', es: '¿Quién está el refugio?' }
    ],
    correctAnswerIndex: 1,
    xpReward: 20
  }
];
