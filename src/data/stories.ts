export interface StoryChoice {
  text: string;
  translation: string;
  nextLines: StoryLine[];
  xpBonus?: number;
  creditsBonus?: number;
}

export interface StoryLine {
  speaker: string;
  text: string;
  translation: string;
  audioUrl?: string;
  choices?: StoryChoice[];
}

export interface StoryQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Story {
  id: string;
  category?: 'Survival' | 'Social' | 'Technical' | 'Exploration';
  title: string;
  description: string;
  title_ru?: string;
  description_ru?: string;
  level: number;
  lines: StoryLine[];
  questions: StoryQuestion[];
  xpReward: number;
  creditsReward: number;
}

export const STORIES: Record<string, Story[]> = {
  en: [
    {
      id: 'the_scholar',
      category: 'Social',
      title: 'The Mysterious Scholar',
      title_ru: 'Таинственный исследователь',
      description: 'A mysterious encounter in the simulation. Help a researcher in need and learn about the hazards ahead.',
      description_ru: 'Таинственная встреча в симуляции. Помогите исследователю в нужде и узнайте об опасностях впереди.',
      level: 1,
      xpReward: 50,
      creditsReward: 20,
      lines: [
        { speaker: 'Scholar', text: 'Hello? Is anyone there?', translation: 'Привет? Есть кто-нибудь?' },
        { 
          speaker: 'Researcher', 
          text: 'Just a traveler, friend. Looking for power resources.', 
          translation: 'Просто путешественник, друг. Ищу источники энергии.',
          choices: [
            {
              text: 'Ask where he is coming from.',
              translation: 'Спросить, откуда он идет.',
              xpBonus: 10,
              nextLines: [
                { speaker: 'Researcher', text: 'I come from the north, near the old library ruins. There is a small knowledge oasis there, but it is guarded by system anomalies.', translation: 'Я иду с севера, от руин старой библиотеки. Там есть небольшой оазис знаний, но его охраняют системные аномалии.' },
                { speaker: 'Scholar', text: 'An oasis? That sounds like a dream.', translation: 'Оазис? Звучит как мечта.' },
                { speaker: 'Researcher', text: 'It is, if you can survive the firewalls. Now, about that energy...', translation: 'Так и есть, если сможешь обойти фаерволлы. Так что насчет энергии...' },
                { 
                  speaker: 'Scholar', 
                  text: 'I have some power cells. Here.', 
                  translation: 'У меня есть немного энергоячеек. Держи.',
                  choices: [
                    {
                      text: 'Give him the resources for free.',
                      translation: 'Отдать ему ресурсы бесплатно.',
                      nextLines: [
                        { speaker: 'Researcher', text: 'You are a kind soul. Take this data-shielding module. It might save your progress.', translation: 'Ты добрая душа. Возьми этот модуль защиты данных. Он может спасти твой прогресс.' }
                      ]
                    },
                    {
                      text: 'Sell him the cells for 5 credits.',
                      translation: 'Продать ему ячейки за 5 кредитов.',
                      creditsBonus: 5,
                      nextLines: [
                        { speaker: 'Researcher', text: 'A fair price for a researcher. Here you go.', translation: 'Справедливая цена для исследователя. Держи.' }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              text: 'Ask if he has seen any other researchers.',
              translation: 'Спросить, видел ли он других исследователей.',
              xpBonus: 15,
              nextLines: [
                { speaker: 'Researcher', text: 'I saw a man in a formal suit a few miles back. He seemed... out of place.', translation: 'Я видел человека в официальном костюме в нескольких милях отсюда. Он казался... не на своем месте.' },
                { speaker: 'Scholar', text: 'A formal suit? In the middle of the simulation?', translation: 'Официальный костюм? Посреди симуляции?' },
                { speaker: 'Researcher', text: 'Indeed. He was heading towards the Silicon Valley ruins. Strange fellow.', translation: 'Действительно. Он направлялся к руинам Кремниевой долины. Странный тип.' }
              ]
            },
            {
              text: 'Hand over your credits, old man! (Threaten)',
              translation: 'Отдавай свои кредиты, старик! (Угроза)',
              creditsBonus: 15,
              nextLines: [
                { speaker: 'Researcher', text: 'Please! I have nothing but these few credits. Take them, just let me go!', translation: 'Пожалуйста! У меня нет ничего, кроме этих нескольких кредитов. Возьми их, только отпусти меня!' },
                { speaker: 'Scholar', text: 'Smart move. Now get lost.', translation: 'Умный ход. А теперь проваливай.' }
              ]
            },
            {
              text: 'Try to pickpocket him while he is distracted. (Luck)',
              translation: 'Попробовать обчистить его карманы, пока он отвлечен. (Удача)',
              creditsBonus: 25,
              xpBonus: 20,
              nextLines: [
                { speaker: 'Scholar', text: 'He didn\'t even notice... let\'s see what he has.', translation: 'Он даже не заметил... посмотрим, что у него есть.' },
                { speaker: 'Scholar', text: 'A handful of credits and a shiny access card. This might be valuable.', translation: 'Горсть кредитов и блестящая карта доступа. Это может быть ценным.' }
              ]
            },
            {
              text: 'Offer some debug software instead of energy.',
              translation: 'Предложить софт для отладки вместо энергии.',
              nextLines: [
                { speaker: 'Researcher', text: 'Debug software? I haven\'t seen a version of that in weeks! But I am still parched for power...', translation: 'Отладчик? Я не видел их неделями! Но мне все еще критически нужна энергия...' },
                { speaker: 'Scholar', text: 'Sorry, it\'s all I can spare.', translation: 'Извини, это все, чем я могу поделиться.' },
                { speaker: 'Researcher', text: 'I understand. Keep your software. I\'ll keep looking for a terminal.', translation: 'Я понимаю. Оставь софт себе. Я продолжу искать терминал.' }
              ]
            },
            {
              text: 'I have some power cells. Here.',
              translation: 'У меня есть немного энергоячеек. Держи.',
              nextLines: [
                { speaker: 'Researcher', text: 'Thank you. The simulation is harsh today. Have you seen any data caravans?', translation: 'Спасибо. Симуляция сегодня сурова. Ты не видел потоков данных?' },
                { speaker: 'Scholar', text: 'Not recently. Why do you ask?', translation: 'В последнее время нет. А почему ты спрашиваешь?' },
                { speaker: 'Researcher', text: 'I heard rumors of hackers near the Hub. They are targeting data shipments.', translation: 'Я слышал слухи о хакерах рядом с Хабом. Они охотятся за поставками данных.' },
                { speaker: 'Scholar', text: 'That sounds dangerous. I should be careful.', translation: 'Это звучит опасно. Мне стоит быть осторожным.' },
                { speaker: 'Researcher', text: 'Indeed. Take this old encryption key. It shows some safe paths.', translation: 'Действительно. Возьми этот старый ключ шифрования. На нем указаны безопасные пути.' }
              ]
            },
            {
              text: 'I have energy, but it will cost you 10 credits.',
              translation: 'У меня есть энергия, но это будет стоить тебе 10 кредитов.',
              creditsBonus: 10,
              nextLines: [
                { speaker: 'Researcher', text: 'Fair enough. Here are the credits. Power is life out here.', translation: 'Справедливо. Вот кредиты. Энергия — это жизнь здесь.' },
                { speaker: 'Scholar', text: 'Thank you. Be careful, I heard the Hub is dangerous.', translation: 'Спасибо. Будь осторожен, я слышал, что в Хабе опасно.' },
                { speaker: 'Researcher', text: 'It is. Anomalies are everywhere. Stay safe, Scholar.', translation: 'Так и есть. Аномалии повсюду. Береги себя, исследователь.' }
              ]
            },
            {
              text: 'Sorry, I don\'t have any power cells to spare.',
              translation: 'Извини, у меня нет лишних ячеек.',
              nextLines: [
                { speaker: 'Researcher', text: 'I understand. It\'s a tough world. Good luck to you.', translation: 'Я понимаю. Это суровый мир. Удачи тебе.' },
                { speaker: 'Scholar', text: 'You too. Watch out for hackers.', translation: 'Тебе тоже. Остерегайся хакеров.' }
              ]
            }
          ]
        }
      ],
      questions: [
        {
          question: 'What was the researcher looking for?',
          options: ['Software', 'Power', 'Credits', 'Medkits'],
          correctIndex: 1,
          explanation: 'The researcher said "Looking for power resources".'
        },
        {
          question: 'What rumors did the researcher hear?',
          options: ['About a new campus', 'About hackers near the Hub', 'About a data merchant', 'About a lost link'],
          correctIndex: 1,
          explanation: 'He heard rumors of hackers near the Hub.'
        }
      ]
    },
    {
      id: 'the_trader',
      category: 'Social',
      title: 'The Hub Merchant',
      title_ru: 'Торговец из Хаба',
      description: 'Trading is an art. Learn the basics of bartering and item values in the Hub.',
      description_ru: 'Торговля — это искусство. Изучите основы обмена и стоимость предметов в Хабе.',
      level: 2,
      xpReward: 75,
      creditsReward: 50,
      lines: [
        { speaker: 'Merchant', text: 'Hey, researcher! Want to take a look at my data-wares?', translation: 'Эй, исследователь! Хочешь взглянуть на мои инфо-товары?' },
        { speaker: 'Scholar', text: 'What do you have?', translation: 'Что у тебя есть?' },
        { speaker: 'Merchant', text: 'I have power cells, encryption keys, and even a couple of old physical books.', translation: 'У меня есть энергоячеек, ключи шифрования и даже пара старых бумажных книг.' },
        { speaker: 'Scholar', text: 'Books? That\'s interesting. How much do they cost?', translation: 'Книги? Это интересно. Сколько они стоят?' },
        { 
          speaker: 'Merchant', 
          text: 'For you — just a hundred credits each. They are rare these days.', 
          translation: 'Для тебя — всего сто кредитов за штуку. В наши дни они редкость.',
          choices: [
            {
              text: 'Ask where he found these books.',
              translation: 'Спросить, где он нашел эти книги.',
              xpBonus: 15,
              nextLines: [
                { speaker: 'Merchant', text: 'Found them in an old library ruins east of here. Most of the place was picked clean, but these were hidden in a fireproof safe.', translation: 'Нашел их в руинах старой библиотеки к востоку отсюда. Почти все там уже вынесли, но эти были спрятаны в огнеупорном сейфе.' },
                { speaker: 'Scholar', text: 'An old library? Are there more?', translation: 'Старая библиотека? Там есть еще?' },
                { speaker: 'Merchant', text: 'Maybe. But the structure was collapsing. I wouldn\'t recommend it unless you are light on your feet.', translation: 'Возможно. Но здание разваливалось. Не советовал бы, если только ты не очень ловкий.' }
              ]
            },
            {
              text: 'Tell me about the encryption keys you mentioned.',
              translation: 'Расскажи мне о ключах шифрования, которые ты упомянул.',
              xpBonus: 10,
              nextLines: [
                { speaker: 'Merchant', text: 'I have some Class-A keys. Hard to find these days. I traded them from a group of security specialists.', translation: 'У меня есть ключи класса А. В наши дни их трудно найти. Я выменял их у группы специалистов по безопасности.' },
                { speaker: 'Scholar', text: 'Specialists? Where are they now?', translation: 'Специалисты? Где они сейчас?' },
                { speaker: 'Merchant', text: 'Heading south. They said something about a cluster error near the data tower. Be careful.', translation: 'Направляются на юг. Они говорили что-то об ошибке кластера рядом с инфо-башней. Будь осторожен.' }
              ]
            },
            {
              text: 'I have a rare holotape. Would you trade for it?',
              translation: 'У меня есть редкая голозапись. Обменяешь ее?',
              creditsBonus: 80,
              nextLines: [
                { speaker: 'Merchant', text: 'A holotape? Let me see... Wow, this is an old pre-war recording of a jazz concert! Collectors in the Hub will pay a fortune for this.', translation: 'Голозапись? Дай-ка посмотреть... Ого, это старая довоенная запись джазового концерта! Коллекционеры в Хабе отдадут за это целое состояние.' },
                { speaker: 'Merchant', text: 'Tell you what, I\'ll give you 80 credits and both books for it. Deal?', translation: 'Знаешь что, я дам тебе 80 кредитов и обе книги за нее. По рукам?' },
                { speaker: 'Scholar', text: 'Deal. Here is the tape.', translation: 'По рукам. Вот запись.' }
              ]
            },
            {
              text: 'Notice a strange symbol on one of the books. (Perception)',
              translation: 'Заметить странный символ на одной из книг. (Восприятие)',
              xpBonus: 30,
              nextLines: [
                { speaker: 'Scholar', text: 'Wait, this mark... it\'s from the Guild of Researchers.', translation: 'Погоди, этот знак... он от Гильдии Исследователей.' },
                { speaker: 'Merchant', text: 'Sharp eyes! I didn\'t even see that. If you know what that means, you must be a scholar. Take the book for half price.', translation: 'Острый глаз! Я даже не заметил. Если ты знаешь, что это значит, ты, должно быть, ученый. Забирай книгу за полцены.' },
                { speaker: 'Scholar', text: 'Thank you. Knowledge should be shared.', translation: 'Спасибо. Знаниями нужно делиться.' }
              ]
            },
            {
              text: 'Try to use your Charisma to get a better deal.',
              translation: 'Попробовать использовать свое обаяние, чтобы получить лучшую цену.',
              xpBonus: 20,
              nextLines: [
                { speaker: 'Scholar', text: 'Come on, look at me. I\'m just a poor researcher trying to learn. Help a scholar out?', translation: 'Да ладно тебе, посмотри на меня. Я просто бедный исследователь, который пытается учиться. Поможешь коллеге?' },
                { speaker: 'Merchant', text: 'You have a silver tongue, kid. Fine. 120 credits for both. That\'s my final offer.', translation: 'У тебя язык хорошо подвешен, парень. Ладно. 120 кредитов за обе. Это мое последнее предложение.' },
                { 
                  speaker: 'Scholar', 
                  text: 'Deal. Here are the credits.', 
                  translation: 'По рукам. Вот кредиты.',
                  choices: [
                    {
                      text: 'Pay 120 credits.',
                      translation: 'Заплатить 120 кредитов.',
                      nextLines: [
                        { speaker: 'Merchant', text: 'Pleasure doing business. Don\'t spend all that knowledge in one place!', translation: 'Приятно иметь дело. Не растрать все эти знания в одном месте!' }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              text: 'Deal. I\'ll take the history book and the science manual.',
              translation: 'По рукам. Я возьму книгу по истории и научное руководство.',
              nextLines: [
                { speaker: 'Merchant', text: 'Good choice. Knowledge is power out here. Here is a free data-disk too.', translation: 'Хороший выбор. Знание — сила здесь. Вот еще бесплатный инфо-диск.' },
                { speaker: 'Scholar', text: 'Thank you. This will be very useful.', translation: 'Спасибо. Это будет очень полезно.' }
              ]
            },
            {
              text: 'That\'s too expensive. How about 150 for both?',
              translation: 'Это слишком дорого. Как насчет 150 за обе?',
              nextLines: [
                { speaker: 'Merchant', text: 'You drive a hard bargain... but okay. 150 credits it is.', translation: 'Ты умеешь торговаться... но ладно. 150 кредитов.' },
                { speaker: 'Scholar', text: 'Great. Here are the credits.', translation: 'Отлично. Вот кредиты.' },
                { speaker: 'Merchant', text: 'Pleasure doing business with you.', translation: 'Приятно иметь с тобой дело.' }
              ]
            },
            {
              text: 'I don\'t have that many credits. Maybe next time.',
              translation: 'У меня нет столько кредитов. Может быть, в следующий раз.',
              nextLines: [
                { speaker: 'Merchant', text: 'No problem. I\'ll be here if you change your mind.', translation: 'Без проблем. Я буду здесь, если передумаешь.' },
                { speaker: 'Scholar', text: 'Thanks. I\'ll keep that in mind.', translation: 'Спасибо. Я буду иметь это в виду.' }
              ]
            }
          ]
        }
      ],
      questions: [
        {
          question: 'How much do the books cost?',
          options: ['50 credits', '100 credits', '200 credits', 'Free'],
          correctIndex: 1,
          explanation: 'The merchant said "Just a hundred credits each".'
        },
        {
          question: 'What free item did the merchant offer for buying two books?',
          options: ['Power', 'Encryption Keys', 'Data Disk', 'A map'],
          correctIndex: 2,
          explanation: 'The merchant offered a "free data disk" if buying two books.'
        }
      ]
    },
    {
      id: 'broken_module',
      category: 'Technical',
      title: 'The Damaged Module',
      title_ru: 'Поврежденный модуль',
      description: 'An automated unit is stuck in a loop. Use your technical skills to repair it.',
      description_ru: 'Автоматический модуль застрял в цикле. Используйте свои технические навыки, чтобы починить его.',
      level: 3,
      xpReward: 100,
      creditsReward: 75,
      lines: [
        { speaker: 'Module', text: 'Analyze and process. Error. Error. System failure.', translation: 'Анализировать и обрабатывать. Ошибка. Ошибка. Системный сбой.' },
        { speaker: 'Scholar', text: 'Wait, I can try to fix this.', translation: 'Подожди, я могу попробовать это исправить.' },
        { speaker: 'Module', text: 'Unauthorized access detected. Please state your business.', translation: 'Обнаружен несанкционированный доступ. Пожалуйста, изложите цель вашего визита.' },
        { speaker: 'Scholar', text: 'I am a technician. I am here to help.', translation: 'Я техник. Я здесь, чтобы помочь.' },
        { 
          speaker: 'Module', 
          text: 'Scanning... Technician status confirmed. Initiating repair mode.', 
          translation: 'Сканирование... Статус техника подтвержден. Запуск режима ремонта.',
          choices: [
            {
              text: 'Access the internal database.',
              translation: 'Получить доступ к внутренней базе данных.',
              xpBonus: 25,
              nextLines: [
                { speaker: 'Scholar', text: 'Let\'s see what\'s in your memory banks...', translation: 'Посмотрим, что у тебя в банках памяти...' },
                { speaker: 'Module', text: 'Accessing encrypted files... Log 402: Knowledge cache located at Sector 7G.', translation: 'Доступ к зашифрованным файлам... Лог 402: Тайник со знаниями находится в секторе 7G.' },
                { speaker: 'Scholar', text: 'Sector 7G? I\'ll mark that on my map.', translation: 'Сектор 7G? Отмечу это на своей карте.' },
                { speaker: 'Module', text: 'Warning: Memory corruption detected. Please proceed with repair.', translation: 'Внимание: обнаружено повреждение памяти. Пожалуйста, продолжите ремонт.' }
              ]
            },
            {
              text: 'Try to repair its voice module first.',
              translation: 'Попробовать сначала починить его голосовой модуль.',
              xpBonus: 10,
              nextLines: [
                { speaker: 'Scholar', text: 'Your voice is a bit crackly. Let me tighten this connection.', translation: 'Твой голос немного хрипит. Дай-ка я подтяну этот контакт.' },
                { speaker: 'Module', text: 'Voice... module... stabilized. Thank you. Would you like to hear a system fact?', translation: 'Голосовой... модуль... стабилизирован. Спасибо. Хотите услышать системный факт?' },
                { speaker: 'Scholar', text: 'Sure, why not?', translation: 'Конечно, почему бы и нет?' },
                { speaker: 'Module', text: 'Why did the module cross the motherboard? To get to the other side of the bus! Ha. Ha. Ha.', translation: 'Зачем модуль пересек материнскую плату? Чтобы попасть на другую сторону шины! Ха. Ха. Ха.' }
              ]
            },
            {
              text: 'Reset the logic circuit and swap the power cell.',
              translation: 'Сбросить логическую цепь и заменить энергоячейку.',
              nextLines: [
                { speaker: 'Scholar', text: 'There. The logic circuit is reset. Now checking the battery.', translation: 'Вот так. Логическая цепь сброшена. Теперь проверяю батарею.' },
                { speaker: 'Module', text: 'Battery levels at 15%. Warning: Low power.', translation: 'Уровень заряда батареи 15%. Внимание: Низкий заряд.' },
                { speaker: 'Scholar', text: 'I have a spare power cell. Let me swap it.', translation: 'У меня есть запасная энергоячейка. Дай мне ее заменить.' },
                { speaker: 'Module', text: 'Thank you, researcher. Resuming monitoring duties. All systems nominal.', translation: 'Спасибо, исследователь. Возвращаюсь к мониторингу. Все системы в норме.' }
              ]
            },
            {
              text: 'Reprogram the unit for personal protection.',
              translation: 'Перепрограммировать юнит для личной защиты.',
              nextLines: [
                { speaker: 'Scholar', text: 'I\'ll just adjust these parameters... and there.', translation: 'Я просто подправлю эти параметры... и готово.' },
                { speaker: 'Module', text: 'New primary objective: Protect the technician. Awaiting orders.', translation: 'Новая основная цель: Защищать техника. Ожидаю приказов.' },
                { speaker: 'Scholar', text: 'Great. Follow me.', translation: 'Отлично. Следуй за мной.' }
              ]
            },
            {
              text: 'Shutdown the unit and salvage its components.',
              translation: 'Выключить юнит и разобрать его на запчасти.',
              creditsBonus: 50,
              nextLines: [
                { speaker: 'Scholar', text: 'Sorry, buddy. I need the components more than you need to monitor.', translation: 'Извини, приятель. Мне запчасти нужнее, чем тебе мониторить.' },
                { speaker: 'Module', text: 'System shutdown initiated. Goodbye, researcher.', translation: 'Запуск выключения системы. До свидания, исследователь.' },
                { speaker: 'Scholar', text: 'These circuits should fetch a good price.', translation: 'Эти схемы должны хорошо стоить.' }
              ]
            },
            {
              text: 'Try to optimize the module\'s operational subroutines.',
              translation: 'Попробовать оптимизировать рабочие подпрограммы модуля.',
              xpBonus: 45,
              nextLines: [
                { speaker: 'Scholar', text: 'If I can just bypass the legacy inhibitors...', translation: 'Если я смогу просто обойти устаревшие ингибиторы...' },
                { speaker: 'Module', text: 'High-performance mode engaged. Target: Efficiency. Warning: Power levels critical.', translation: 'Высокопроизводительный режим активирован. Цель: Эффективность. Внимание: Уровень энергии критический.' },
                { speaker: 'Scholar', text: 'It worked, but it won\'t last long. I should find a way to recharge it.', translation: 'Сработало, но это ненадолго. Мне стоит найти способ его подзарядить.' }
              ]
            },
            {
              text: 'Ask the module about its previous developer.',
              translation: 'Спросить модуль о его предыдущем разработчике.',
              xpBonus: 15,
              nextLines: [
                { speaker: 'Scholar', text: 'Who did you serve before the core failure?', translation: 'Кому ты служил до сбоя ядра?' },
                { speaker: 'Module', text: 'Previous developer: Dr. Aris Thorne. Occupation: Lead Researcher at West-Tek Laboratories.', translation: 'Предыдущий разработчик: Доктор Арис Торн. Профессия: Ведущий исследователь в лабораториях West-Tek.' },
                { speaker: 'Scholar', text: 'West-Tek? That explains the advanced tech.', translation: 'West-Tek? Это объясняет продвинутые технологии.' }
              ]
            },
            {
              text: 'Run a full system diagnostic. (Science)',
              translation: 'Запустить полную диагностику системы. (Наука)',
              xpBonus: 50,
              nextLines: [
                { speaker: 'Scholar', text: 'Let\'s see what\'s really going on under the hood...', translation: 'Посмотрим, что на самом деле происходит под капотом...' },
                { speaker: 'Module', text: 'Diagnostic complete. Hidden sub-routine detected: "Optimized Efficiency".', translation: 'Диагностика завершена. Обнаружена скрытая подпрограмма: "Оптимизированная эффективность".' },
                { speaker: 'Module', text: 'Applying patches... Energy consumption reduced. Processing speed maximized.', translation: 'Применение патчей... Потребление энергии снижено. Скорость обработки максимизирована.' },
                { speaker: 'Scholar', text: 'You seem much sharper now.', translation: 'Теперь ты кажешься гораздо сообразительнее.' }
              ]
            }
          ]
        }
      ],
      questions: [
        {
          question: 'What did the Scholar claim to be?',
          options: ['A hacker', 'A technician', 'A doctor', 'A merchant'],
          correctIndex: 1,
          explanation: 'The Scholar said "I am a technician".'
        },
        {
          question: 'What part did the Scholar replace?',
          options: ['The screen', 'The logic circuit', 'The power cell', 'The port'],
          correctIndex: 2,
          explanation: 'The Scholar swapped the power cell.'
        }
      ]
    },
    {
      id: 'secret_archives',
      category: 'Exploration',
      title: 'The Secret Archives',
      title_ru: 'Секретный архив',
      description: 'Discover the entrance to a long-forgotten archive and find the access code.',
      description_ru: 'Найдите вход в давно забытый архив и найдите код доступа.',
      level: 4,
      xpReward: 150,
      creditsReward: 100,
      lines: [
        { speaker: 'Scholar', text: 'This map says there is an entrance nearby.', translation: 'На этой карте сказано, что поблизости есть вход.' },
        { speaker: 'Companion', text: 'I only see concrete and servers. Are you sure?', translation: 'Я вижу только бетон и серверы. Ты уверен?' },
        { speaker: 'Scholar', text: 'Look! Behind that large panel. A heavy reinforced door.', translation: 'Смотри! За той большой панелью. Тяжелая бронированная дверь.' },
        { speaker: 'Companion', text: 'It looks like it hasn\'t been opened in decades.', translation: 'Похоже, ее не открывали десятилетиями.' },
        { speaker: 'Scholar', text: 'The keypad still has power. I need a code.', translation: 'На клавиатуре все еще есть питание. Мне нужен код.' },
        { 
          speaker: 'Companion', 
          text: 'Try the date from the old log: 10-23-77.', 
          translation: 'Попробуй дату из старого лога: 10-23-77.',
          choices: [
            {
              text: 'Try to bypass the lock manually.',
              translation: 'Попробовать обойти замок вручную.',
              xpBonus: 30,
              nextLines: [
                { speaker: 'Scholar', text: 'I don\'t need a code if I can just bridge these connections...', translation: 'Мне не нужен код, если я смогу просто перемкнуть эти контакты...' },
                { speaker: 'Companion', text: 'Careful! You might trigger a security sweep.', translation: 'Осторожно! Ты можешь активировать проверку безопасности.' },
                { speaker: 'Scholar', text: 'Almost... there! The door is opening, but the keypad is fried.', translation: 'Почти... есть! Дверь открывается, но клавиатура сгорела.' }
              ]
            },
            {
              text: 'Try to hack the terminal nearby.',
              translation: 'Попробовать взломать терминал поблизости.',
              xpBonus: 40,
              nextLines: [
                { speaker: 'Scholar', text: 'This terminal seems to control the access locks. Let\'s see if I can crack it.', translation: 'Этот терминал, похоже, управляет замками доступа. Посмотрим, смогу ли я его взломать.' },
                { speaker: 'Scholar', text: 'Access granted. Not only is the door open, but I found the archive manifest.', translation: 'Доступ разрешен. Мало того, что дверь открыта, я еще и нашел манифест архива.' },
                { speaker: 'Companion', text: 'A manifest? What was this archive for?', translation: 'Манифест? Для чего был этот архив?' },
                { speaker: 'Scholar', text: 'It says "Experimental Quantum Research". There might be algorithms inside!', translation: 'Там написано: "Экспериментальные квантовые исследования". Внутри могут быть алгоритмы!' }
              ]
            },
            {
              text: 'Look for a ventilation shaft.',
              translation: 'Поискать вентиляционную шахту.',
              xpBonus: 20,
              nextLines: [
                { speaker: 'Scholar', text: 'The main door is too heavy. Maybe there\'s another way in.', translation: 'Главная дверь слишком тяжелая. Может быть, есть другой путь.' },
                { speaker: 'Scholar', text: 'There! A loose grate. It leads right into the maintenance tunnels.', translation: 'Вон там! Разболтанная решетка. Она ведет прямо в туннели для обслуживания.' }
              ]
            },
            {
              text: 'Search the area for clues about the previous residents.',
              translation: 'Обыскать местность в поисках улик о прежних жителях.',
              xpBonus: 20,
              nextLines: [
                { speaker: 'Scholar', text: 'Wait, there\'s a skeleton over there. It\'s holding something.', translation: 'Подожди, там скелет. Он что-то держит.' },
                { speaker: 'Companion', text: 'It\'s an old ID card. "Dean Richards".', translation: 'Это старая ID-карта. "Смотритель Ричардс".' },
                { speaker: 'Scholar', text: 'This might have an override code on the back. Let\'s see...', translation: 'На обратной стороне может быть код обхода. Посмотрим...' }
              ]
            },
            {
              text: 'Use a heavy pipe to pry the door open. (Strength)',
              translation: 'Использовать тяжелую трубу, чтобы взломать дверь. (Сила)',
              xpBonus: 35,
              nextLines: [
                { speaker: 'Scholar', text: 'Ugh... just... a little... more!', translation: 'Уф... еще... совсем... немного!' },
                { speaker: 'Companion', text: 'The hinges are groaning! It\'s working!', translation: 'Петли стонут! Это работает!' },
                { speaker: 'Scholar', text: 'The door is open, but I think I broke the pipe. Worth it.', translation: 'Дверь открыта, но, кажется, я сломал трубу. Оно того стоило.' }
              ]
            },
            {
              text: 'Enter the code and go inside.',
              translation: 'Введите код и зайдите внутрь.',
              nextLines: [
                { speaker: 'Scholar', text: 'It worked! The gears are turning. Can you hear that?', translation: 'Сработало! Шестерни вращаются. Ты слышишь это?' },
                { speaker: 'Companion', text: 'It sounds like air escaping. The pressure is equalizing.', translation: 'Похоже на выходящий воздух. Давление выравнивается.' },
                { speaker: 'Scholar', text: 'Let\'s go inside. Be ready for anything.', translation: 'Давай зайдем внутрь. Будь готов ко всему.' }
              ]
            },
            {
              text: 'Wait, let\'s check for traps first.',
              translation: 'Подожди, давай сначала проверим на наличие ловушек.',
              nextLines: [
                { speaker: 'Scholar', text: 'I see a tripwire... and a turret. Good thing we checked.', translation: 'Я вижу растяжку... и турель. Хорошо, что мы проверили.' },
                { speaker: 'Companion', text: 'Can you disable them?', translation: 'Ты можешь их отключить?' },
                { speaker: 'Scholar', text: 'Already done. Now we can enter safely.', translation: 'Уже сделано. Теперь мы можем безопасно войти.' }
              ]
            }
          ]
        }
      ],
      questions: [
        {
          question: 'What was hidden behind the panel?',
          options: ['A treasure chest', 'A reinforced door', 'A server', 'A power unit'],
          correctIndex: 1,
          explanation: 'The Scholar said "A heavy reinforced door".'
        },
        {
          question: 'What was the access code?',
          options: ['1234', '0000', '10-23-77', '99-99-99'],
          correctIndex: 2,
          explanation: 'The code was the date from the log: 10-23-77.'
        }
      ]
    },
    {
      id: 'mysterious_log',
      category: 'Exploration',
      title: 'The Mysterious Data Log',
      title_ru: 'Таинственная запись',
      description: 'Find a data log in an abandoned office and listen to its message.',
      description_ru: 'Найдите запись данных в заброшенном офисе и прослушайте ее сообщение.',
      level: 5,
      xpReward: 200,
      creditsReward: 150,
      lines: [
        { speaker: 'Scholar', text: 'This place is a mess. Someone left in a hurry.', translation: 'Здесь полный беспорядок. Кто-то уходил в спешке.' },
        { speaker: 'Scholar', text: 'Wait, what is this? A data log under the desk.', translation: 'Подожди, что это? Запись данных под столом.' },
        { speaker: 'Data Log', text: 'If you are listening to this... it means I didn\'t make it through the firewall.', translation: 'Если вы это слушаете... значит, я не прошел через фаерволл.' },
        { speaker: 'Data Log', text: 'The Academic Guild is searching for the source code.', translation: 'Академическая Гильдия ищет исходный код.' },
        { speaker: 'Data Log', text: 'I hid it in the old server room. Under the floor panel.', translation: 'Я спрятал его в старой серверной. Под панелью пола.' },
        { 
          speaker: 'Scholar', 
          text: 'The old server room? That\'s miles from here.', 
          translation: 'Старая серверная? Это в милях отсюда.',
          choices: [
            {
              text: 'Purge the log to keep the secret safe.',
              translation: 'Очистить лог, чтобы сохранить секрет в тайне.',
              xpBonus: 40,
              nextLines: [
                { speaker: 'Scholar', text: 'This code is too powerful. No one should have it.', translation: 'Этот код слишком мощный. Никто не должен им владеть.' },
                { speaker: 'Scholar', text: 'I\'ll just wipe this log. The secret dies with me.', translation: 'Я просто сотру эту запись. Секрет умрет вместе со мной.' }
              ]
            },
            {
              text: 'Try to decrypt the hidden layer of the data log.',
              translation: 'Попробовать расшифровать скрытый слой лога.',
              xpBonus: 35,
              nextLines: [
                { speaker: 'Scholar', text: 'There\'s some noise in the background... wait, it\'s a second stream!', translation: 'На заднем плане какой-то шум... подождите, это второй поток!' },
                { speaker: 'Data Log', text: '...the code isn\'t just a tool. It\'s a key to a mainframe in the mountains.', translation: '...код — это не просто инструмент. Это ключ к мейнфрейму в горах.' },
                { speaker: 'Scholar', text: 'A mainframe? This changes everything.', translation: 'Мейнфрейм? Это все меняет.' }
              ]
            },
            {
              text: 'Ask your companion for their opinion.',
              translation: 'Спросить мнение напарника.',
              xpBonus: 10,
              nextLines: [
                { speaker: 'Companion', text: 'The Faculty usually pays well, but they aren\'t exactly "sharing" types. If we find it, we should think twice.', translation: 'Факультет обычно хорошо платит, но они не из тех, кто любит делиться. Если мы найдем это, нам стоит дважды подумать.' },
                { speaker: 'Scholar', text: 'You\'re right. Let\'s be cautious.', translation: 'Ты прав. Давай будем осторожны.' }
              ]
            },
            {
              text: 'Triangulate the signal origin from the log\'s metadata. (Intelligence)',
              translation: 'Триангулировать источник сигнала по метаданным записи. (Познание)',
              xpBonus: 45,
              nextLines: [
                { speaker: 'Scholar', text: 'The timestamp and background interference levels... they point to a specific server farm.', translation: 'Метка времени и уровень фоновых помех... они указывают на конкретную серверную ферму.' },
                { speaker: 'Scholar', text: 'It\'s not just the room. There\'s a secondary location in the hills.', translation: 'Это не только комната. В холмах есть второе место.' },
                { speaker: 'Scholar', text: 'I should check both if I want the full story.', translation: 'Мне стоит проверить оба места, если я хочу узнать всю историю.' }
              ]
            },
            {
              text: 'Take it to the central library for analysis.',
              translation: 'Отнести ее в центральную библиотеку для анализа.',
              xpBonus: 25,
              nextLines: [
                { speaker: 'Scholar', text: 'The researchers at the library might be able to recover more data from this.', translation: 'Исследователи в библиотеке могут восстановить больше данных из этого.' },
                { speaker: 'Scholar', text: 'It\'s a long walk, but knowledge is worth the effort.', translation: 'Путь неблизкий, но знания стоят усилий.' }
              ]
            },
            {
              text: 'I have to find it before The Faculty does.',
              translation: 'Я должен найти его раньше Факультета.',
              nextLines: [
                { speaker: 'Scholar', text: 'If I get there first, I can decide what to do with it.', translation: 'Если я доберусь туда первым, я смогу решить, что с ним делать.' }
              ]
            },
            {
              text: 'Maybe I should sell this information to The Faculty.',
              translation: 'Может быть, мне стоит продать эту информацию Факультету.',
              creditsBonus: 100,
              nextLines: [
                { speaker: 'Scholar', text: 'They have plenty of credits. They\'ll pay well for this.', translation: 'У них полно кредитов. Они хорошо за это заплатят.' }
              ]
            }
          ]
        }
      ],
      questions: [
        {
          question: 'Where was the data log found?',
          options: ['In an archive', 'Under a desk', 'In an office', 'In a lab'],
          correctIndex: 1,
          explanation: 'The Scholar found it "under the desk".'
        },
        {
          question: 'Where is the code hidden?',
          options: ['In the office', 'In the Hub', 'Under the floor panel in the server room', 'In a laptop'],
          correctIndex: 2,
          explanation: 'The log said "Under the floor panel" in the old server room.'
        }
      ]
    },
    {
      id: 'hermit_secret',
      category: 'Social',
      title: "The Hermit's Secret",
      title_ru: 'Секрет отшельника',
      description: 'An old professor in the Forsaken Campus has a secret to share. But first, you must prove your dedication.',
      description_ru: 'У старого профессора в Заброшенном Кампусе есть секрет. Но сначала вы должны доказать свою преданность.',
      level: 6,
      xpReward: 250,
      creditsReward: 200,
      lines: [
        { speaker: 'Hermit Professor', text: 'Stay back, novice. I have nothing for you.', translation: 'Отойди, новичок. У меня ничего для тебя нет.' },
        { speaker: 'Scholar', text: 'I am not here to cause trouble. I am looking for information.', translation: 'Я здесь не для того, чтобы создавать проблемы. Я ищу информацию.' },
        { speaker: 'Hermit Professor', text: 'Information? Everyone wants information. But nobody wants to contribute.', translation: 'Информацию? Все хотят информацию. Но никто не хочет вносить свой вклад.' },
        { speaker: 'Scholar', text: 'What do you need? Maybe I can help.', translation: 'Что тебе нужно? Может быть, я смогу помочь.' },
        { 
          speaker: 'Hermit Professor', 
          text: 'My locket. It was dropped by those rogue drones in the server basement.', 
          translation: 'Мой медальон. Его выронили те неисправные дроны в подвале серверной.',
          choices: [
            {
              text: 'Give him a Hydration Pack.',
              translation: 'Дать ему набор для гидратации.',
              xpBonus: 30,
              nextLines: [
                { speaker: 'Scholar', text: 'You look like you\'re exhausted. Take this Hydration Pack.', translation: 'Похоже, ты истощен. Возьми этот набор для гидратации.' },
                { speaker: 'Hermit Professor', text: 'Hydration? For me? Nobody has been this kind in years.', translation: 'Гидратация? Мне? Никто не был так добр уже много лет.' },
                { speaker: 'Hermit Professor', text: 'Listen, the stash is good, but take this too. It\'s a key to the old laboratory.', translation: 'Слушай, тайник — это хорошо, но возьми и это. Это ключ от старой лаборатории.' }
              ]
            },
            {
              text: 'Ask about the history of the Forsaken Campus.',
              translation: 'Спросить об истории Заброшенного Кампуса.',
              xpBonus: 20,
              nextLines: [
                { speaker: 'Scholar', text: 'What happened to this place? Why is it called the Forsaken Campus?', translation: 'Что случилось с этим местом? Почему оно называется Заброшенным Кампусом?' },
                { speaker: 'Hermit Professor', text: 'It was once a center of learning. Then the system crash happened, and the isolation changed us.', translation: 'Когда-то это был центр обучения. Потом произошел системный сбой, и изоляция изменила нас.' },
                { speaker: 'Hermit Professor', text: 'We are the leftovers of what we once were. Now, about that locket...', translation: 'Мы — остатки того, чем когда-то были. Так что насчет медальона...' }
              ]
            },
            {
              text: 'Share a story about a wise researcher you once met. (Charisma)',
              translation: 'Рассказать историю о мудром исследователе, которого вы когда-то встретили. (Харизма)',
              xpBonus: 40,
              nextLines: [
                { speaker: 'Scholar', text: 'I once met a researcher named Harold. He had a digital plant growing out of his terminal, but he was the wisest man I knew.', translation: 'Однажды я встретил исследователя по имени Гарольд. У него из терминала росло цифровое растение, но он был самым мудрым человеком из всех, кого я знал.' },
                { speaker: 'Hermit Professor', text: 'Harold? I haven\'t heard that name in decades. You really are different, novice.', translation: 'Гарольд? Я не слышал этого имени десятилетиями. Ты и правда другой, новичок.' },
                { speaker: 'Hermit Professor', text: 'Since you respect our work, I\'ll tell you more. The stash isn\'t just credits. There\'s a high-grade medical kit there too.', translation: 'Раз уж ты уважаешь нашу работу, я расскажу тебе больше. В тайнике не только кредиты. Там еще есть высококлассная аптечка.' }
              ]
            },
            {
              text: 'I will get it back for you. Just wait here.',
              translation: 'Я верну его тебе. Просто подожди здесь.',
              nextLines: [
                { speaker: 'Hermit Professor', text: 'If you do... I will tell you where the hidden cache is.', translation: ' Если сделаешь это... я скажу тебе, где спрятан тайник.' }
              ]
            },
            {
              text: 'Tell me where the cache is now, or I\'ll report you to security.',
              translation: 'Скажи мне, где тайник сейчас, или я доложу о тебе охране.',
              nextLines: [
                { speaker: 'Hermit Professor', text: 'Fine, fine! Just don\'t do that. It\'s behind the old charging station.', translation: 'Ладно, ладно! Только не делай этого. Он за старой зарядной станцией.' },
                { speaker: 'Scholar', text: 'That\'s better. I\'ll be going now.', translation: 'Так-то лучше. Я пойду.' }
              ]
            }
          ]
        }
      ],
      questions: [
        {
          question: 'What did the professor call the Scholar?',
          options: ['Friend', 'Novice', 'Researcher', 'Student'],
          correctIndex: 1,
          explanation: 'He called him "novice".'
        },
        {
          question: 'What was stolen from the professor?',
          options: ['His data', 'His credits', 'His locket', 'His book'],
          correctIndex: 2,
          explanation: 'He said "My locket" was lost.'
        }
      ]
    }
  ],
  es: [
    {
      id: 'el_estudiante_misterioso',
      title: 'El Estudiante Misterioso',
      description: 'Un encuentro misterioso en el campus. Ayuda a un investigador necesitado.',
      level: 1,
      xpReward: 50,
      creditsReward: 20,
      lines: [
        { speaker: 'Académico', text: '¿Hola? ¿Hay alguien ahí?', translation: 'Hello? Is anyone there?' },
        { speaker: 'Investigador', text: 'Solo un investigador, amigo. Buscando hidratación.', translation: 'Just a researcher, friend. Looking for hydration.' },
        { speaker: 'Académico', text: 'Tengo un poco de agua purificada. Ten.', translation: 'I have some purified water. Here.' },
        { speaker: 'Investigador', text: 'Gracias. El campus está duro hoy. ¿Has visto algún grupo de estudio?', translation: 'Thank you. The campus is harsh today. Have you seen any study groups?' }
      ],
      questions: [
        {
          question: '¿Qué estaba buscando el investigador?',
          options: ['Comida', 'Hidratación', 'Créditos', 'Botiquines'],
          correctIndex: 1,
          explanation: 'El investigador dijo "Buscando hidratación".'
        }
      ]
    },
    {
      id: 'el_comerciante',
      title: 'El Comerciante de Conocimientos',
      description: 'Comerciar es un arte. Aprende los conceptos básicos del trueque en el Eje Académico.',
      level: 2,
      xpReward: 75,
      creditsReward: 50,
      lines: [
        { speaker: 'Comerciante', text: '¡Hola, becario! ¿Quieres echar un vistazo a mis archivos?', translation: 'Hey, scholar! Want to take a look at my files?' },
        { speaker: 'Académico', text: '¿Qué tienes?', translation: 'What do you have?' },
        { speaker: 'Comerciante', text: 'Tengo datos, suministros e incluso un par de libros de texto antiguos.', translation: 'I have data, supplies, and even a couple of old textbooks.' },
        { speaker: 'Académico', text: '¿Libros? Eso es interesante. ¿Cuánto cuestan?', translation: 'Books? That\'s interesting. How much do they cost?' },
        { 
          speaker: 'Comerciante', 
          text: 'Para ti, solo cien créditos cada uno. Son raros hoy en día.', 
          translation: 'For you, just a hundred credits each. They are rare these days.',
          choices: [
            {
              text: 'Preguntar dónde encontró estos libros.',
              translation: 'Ask where he found these books.',
              xpBonus: 15,
              nextLines: [
                { speaker: 'Comerciante', text: 'Los encontré en una vieja facultad al este de aquí. Casi todo estaba bloqueado, pero estos estaban escondidos en un servidor físico.', translation: 'Found them in an old faculty building east of here. Most of the place was locked down, but these were hidden in a physical server.' },
                { speaker: 'Académico', text: '¿Una vieja facultad? ¿Hay más?', translation: 'An old faculty? Are there more?' },
                { speaker: 'Comerciante', text: 'Tal vez. Pero el sistema se estaba colapsando. No lo recomendaría a menos que seas experto en redes.', translation: 'Maybe. But the system was crashing. I wouldn\'t recommend it unless you\'re a network expert.' }
              ]
            },
            {
              text: 'Acepto. Me llevaré el libro de historia y el manual de algoritmos.',
              translation: 'Deal. I\'ll take the history book and the algorithm manual.',
              nextLines: [
                { speaker: 'Comerciante', text: 'Buena elección. El conocimiento es poder en este campus. Ten un poco de café gratis también.', translation: 'Good choice. Knowledge is power on this campus. Here is some free coffee too.' },
                { speaker: 'Académico', text: 'Gracias. Esto será muy útil para mis créditos.', translation: 'Thank you. This will be very useful for my credits.' }
              ]
            }
          ]
        }
      ],
      questions: [
        {
          question: '¿Cuánto cuestan los libros?',
          options: ['50 créditos', '100 créditos', '200 créditos', 'Gratis'],
          correctIndex: 1,
          explanation: 'El comerciante dijo: "Solo cien créditos cada uno".'
        },
        {
          question: '¿Qué objeto gratuito ofreció el comerciante?',
          options: ['Agua', 'Datos', 'Café', 'Un mapa'],
          correctIndex: 2,
          explanation: 'El comerciante ofreció "café" gratis.'
        }
      ]
    }
  ],
  fr: [
    {
      id: 'l_etudiant_mysterieux',
      title: 'L\'Étudiant Mystérieux',
      description: 'Une rencontre mystérieuse sur le campus. Aidez un chercheur dans le besoin.',
      level: 1,
      xpReward: 50,
      creditsReward: 20,
      lines: [
        { speaker: 'Étudiant', text: 'Bonjour ? Il y a quelqu\'un ?', translation: 'Hello? Is anyone there?' },
        { speaker: 'Chercheur', text: 'Juste un chercheur, ami. Je cherche de l\'eau.', translation: 'Just a researcher, friend. Looking for water.' },
        { speaker: 'Étudiant', text: 'J\'ai de l\'eau purifiée. Tenez.', translation: 'I have some purified water. Here.' },
        { speaker: 'Chercheur', text: 'Merci. Le campus est rude aujourd\'hui. Avez-vous vu des groupes d\'étude ?', translation: 'Thank you. The campus is harsh today. Have you seen any study groups?' }
      ],
      questions: [
        {
          question: 'Que cherchait le chercheur ?',
          options: ['De la nourriture', 'De l\'eau', 'Des crédits', 'Des kits de secours'],
          correctIndex: 1,
          explanation: 'Le chercheur a dit "Je cherche de l\'eau".'
        }
      ]
    }
  ],
  ru: [
    {
      id: 'the_scholar',
      title: 'Таинственный исследователь',
      title_ru: 'Таинственный исследователь',
      description: 'Таинственная встреча в кампусе. Помогите исследователю в нужде и узнайте об опасностях впереди.',
      description_ru: 'Таинственная встреча в кампусе. Помогите исследователю в нужде и узнайте об опасностях впереди.',
      level: 1,
      xpReward: 50,
      creditsReward: 20,
      lines: [
        { speaker: 'Аспирант', text: 'Привет? Есть кто-нибудь?', translation: 'Hello? Is anyone there?' },
        { 
          speaker: 'Исследователь', 
          text: 'Просто ученый, друг. Ищу воду.', 
          translation: 'Just a researcher, friend. Looking for hydration.',
          choices: [
            {
              text: 'Спросить, откуда он идет.',
              translation: 'Ask where he is coming from.',
              xpBonus: 10,
              nextLines: [
                { speaker: 'Исследователь', text: 'Я иду с севера, от старых архивов. Там есть небольшой оазис, но его охраняют охранные дроны.', translation: 'I come from the north, near the old archives. There is a small oasis there, but it is guarded by security drones.' },
                { speaker: 'Аспирант', text: 'Оазис? Звучит как мечта.', translation: 'An oasis? That sounds like a dream.' },
                { speaker: 'Исследователь', text: 'Так и есть, если сможешь обойти сенсоры. Так что насчет воды...', translation: 'It is, if you can bypass the sensors. Now, about that hydration...' },
                { 
                  speaker: 'Аспирант', 
                  text: 'У меня есть немного очищенной воды. Держи.', 
                  translation: 'I have some purified water. Here.',
                  choices: [
                    {
                      text: 'Отдать ему воду бесплатно.',
                      translation: 'Give him the water for free.',
                      nextLines: [
                        { speaker: 'Исследователь', text: 'Ты добрая душа. Возьми этот блок защиты данных. Он может спасти твой проект.', translation: 'You are a kind soul. Take this data protection block. It might save your project.' }
                      ]
                    },
                    {
                      text: 'Продать ему воду за 5 кредитов.',
                      translation: 'Sell him the water for 5 credits.',
                      creditsBonus: 5,
                      nextLines: [
                        { speaker: 'Исследователь', text: 'Справедливая цена для коллеги. Держи.', translation: 'A fair price for a colleague. Here you go.' }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              text: 'Спросить, видел ли он других ученых.',
              translation: 'Ask if he has seen any other scholars.',
              xpBonus: 15,
              nextLines: [
                { speaker: 'Исследователь', text: 'Я видел человека в экспертном халате в нескольких милях отсюда. Он казался... погруженным в свои мысли.', translation: 'I saw a man in an expert lab coat a few miles back. He seemed... deep in thought.' },
                { speaker: 'Аспирант', text: 'Экспертный халат? Посреди кампуса?', translation: 'Expert lab coat? In the middle of the campus?' },
                { speaker: 'Исследователь', text: 'Действительно. Он направлялся к руинам Новой Библиотеки. Странный тип.', translation: 'Indeed. He was heading towards the New Library ruins. Strange fellow.' }
              ]
            },
            {
              text: 'Отдавай свои кредиты! (Угроза)',
              translation: 'Hand over your credits! (Threaten)',
              creditsBonus: 15,
              nextLines: [
                { speaker: 'Исследователь', text: 'Пожалуйста! У меня нет ничего, кроме этих нескольких кредитов. Возьми их, только не сообщай в администрацию!', translation: 'Please! I have nothing but these few credits. Take them, just don\'t report me to admin!' },
                { speaker: 'Аспирант', text: 'Умный ход. А теперь уходи.', translation: 'Smart move. Now leave.' }
              ]
            },
            {
              text: 'У меня есть немного очищенной воды. Держи.',
              translation: 'I have some purified water. Here.',
              nextLines: [
                { speaker: 'Исследователь', text: 'Спасибо. Кампус сегодня негостеприимен. Ты не видел исследовательские группы?', translation: 'Thank you. The campus is inhospitable today. Have you seen any research groups?' },
                { speaker: 'Аспирант', text: 'В последнее время нет. А почему ты спрашиваешь?', translation: 'Not recently. Why do you ask?' },
                { speaker: 'Исследователь', text: 'Я слышал слухи о хакерах рядом с Центром. Они охотятся за базами данных.', translation: 'I heard rumors of hackers near the Hub. They are targeting databases.' },
                { speaker: 'Аспирант', text: 'Это звучит опасно. Мне стоит быть осторожным.', translation: 'That sounds dangerous. I should be careful.' },
                { speaker: 'Исследователь', text: 'Действительно. Возьми этот старый пропуск. Он открывает некоторые аудитории.', translation: 'Indeed. Take this old pass. It opens some auditoriums.' }
              ]
            },
            {
              text: 'У меня есть вода, но это будет стоить тебе 10 кредитов.',
              translation: 'I have water, but it will cost you 10 credits.',
              creditsBonus: 10,
              nextLines: [
                { speaker: 'Исследователь', text: 'Справедливо. Вот кредиты. Вода — это жизнь здесь.', translation: 'Fair enough. Here are the credits. Water is life out here.' },
                { speaker: 'Аспирант', text: 'Спасибо. Будь осторожен, я слышал, что в Центре опасно.', translation: 'Thank you. Be careful, I heard the Hub is dangerous.' },
                { speaker: 'Исследователь', text: 'Так и есть. Хакеры повсюду. Береги себя, путник.', translation: 'It is. Hackers are everywhere. Stay safe, traveler.' }
              ]
            }
          ]
        }
      ],
      questions: [
        {
          question: 'Что искал следователь?',
          options: ['Еду', 'Воду', 'Кредиты', 'Блоки данных'],
          correctIndex: 1,
          explanation: 'Исследователь сказал: "Ищу воду".'
        },
        {
          question: 'Какие слухи слышал исследователь?',
          options: ['О новой библиотеке', 'О хакерах рядом с Центром', 'О торговце данными', 'О потерянном ноутбуке'],
          correctIndex: 1,
          explanation: 'Он слышал слухи о хакерах рядом с Центром.'
        }
      ]
    },
    {
      id: 'trader',
      title: 'Торговец знаниями',
      title_ru: 'Торговец знаниями',
      description: 'Торговец на кампусе предлагает ресурсы. Стоит ли эти данные своих кредитов?',
      description_ru: 'Торговец на кампусе предлагает ресурсы. Стоит ли эти данные своих кредитов?',
      level: 2,
      xpReward: 75,
      creditsReward: 50,
      lines: [
        { speaker: 'Торговец', text: 'Эй, коллега! Ищешь что-то полезное для своего исследования?', translation: 'Hey colleague! Looking for something useful for your research?' },
        { speaker: 'Аспирант', text: 'Что у тебя есть на продажу?', translation: 'What do you have for sale?' },
        { speaker: 'Торговец', text: 'У меня есть старые учебники по истории и научные руководства. Всего сто кредитов за штуку.', translation: 'I have old history books and science manuals. Just a hundred credits each.' },
        { 
          speaker: 'Аспирант', 
          text: 'Это звучит интересно. Расскажи подробнее.', 
          translation: 'That sounds interesting. Tell me more.',
          choices: [
            {
              text: 'Спросить о книге по истории.',
              translation: 'Ask about the history book.',
              xpBonus: 10,
              nextLines: [
                { speaker: 'Торговец', text: 'Эта книга описывает падение старой университетской системы. Очень поучительно.', translation: 'This book describes the fall of the old university system. Very enlightening.' },
                { speaker: 'Аспирант', text: 'Может быть, в ней есть подсказки о старых архивах.', translation: 'Maybe it has clues about the old archives.' },
                { speaker: 'Торговец', text: 'Возможно. Знания всегда имеют цену.', translation: 'Perhaps. Knowledge always has a price.' }
              ]
            },
            {
              text: 'Спросить о научном руководстве.',
              translation: 'Ask about the science manual.',
              xpBonus: 15,
              nextLines: [
                { speaker: 'Торговец', text: 'Это руководство по оптимизации систем питания. Оно поможет тебе в лаборатории.', translation: 'It\'s a manual on power system optimization. It will help you in the lab.' },
                { speaker: 'Аспирант', text: 'Мои навыки в науке могли бы вырасти от этого.', translation: 'My science skills could grow from this.' },
                { speaker: 'Торговец', text: 'Действительно. Оно написано ведущими инженерами прошлого.', translation: 'Indeed. It was written by leading engineers of the past.' }
              ]
            },
            {
              text: 'Расскажи мне об алгоритмах, которые ты упомянул.',
              translation: 'Tell me about the algorithms you mentioned.',
              xpBonus: 10,
              nextLines: [
                { speaker: 'Торговец', text: 'У меня есть алгоритмы оптимизации. В наши дни их трудно найти. Я выменял их у группы разработчиков.', translation: 'I have some optimization algorithms. Hard to find these days. I traded them from a group of developers.' },
                { speaker: 'Аспирант', text: 'Разработчики? Где они сейчас?', translation: 'Developers? Where are they now?' },
                { speaker: 'Торговец', text: 'Направляются во внешний сектор. Они говорили что-то о лагере конкурентов рядом с серверной вышкой. Будь осторожен.', translation: 'Heading to the outer sector. They said something about a competitor camp near the server tower. Be careful.' }
              ]
            },
            {
              text: 'У меня есть редкий лог данных. Обменяешь его?',
              translation: 'I have a rare data log. Would you trade for it?',
              creditsBonus: 80,
              nextLines: [
                { speaker: 'Торговец', text: 'Лог данных? Дай-ка посмотреть... Ого, это старые записи лекций по искусственному интеллекту! Коллекционеры в Центре отдадут за это целое состояние.', translation: 'A data log? Let me see... Wow, this is an old recording of AI lectures! Collectors in the Hub will pay a fortune for this.' },
                { speaker: 'Торговец', text: 'Знаешь что, я дам тебе 80 кредитов и обе книги за нее. По рукам?', translation: 'Tell you what, I\'ll give you 80 credits and both books for it. Deal?' },
                { speaker: 'Аспирант', text: 'По рукам. Вот запись.', translation: 'Deal. Here is the log.' }
              ]
            },
            {
              text: 'Попробовать использовать свое обаяние, чтобы получить лучшую цену.',
              translation: 'Try to use your Charisma to get a better deal.',
              xpBonus: 20,
              nextLines: [
                { speaker: 'Аспирант', text: 'Да ладно тебе, посмотри на меня. Я просто бедный исследователь, который пытается учиться. Поможешь коллеге?', translation: 'Come on, look at me. I\'m just a poor researcher trying to learn. Help a colleague out?' },
                { speaker: 'Торговец', text: 'У тебя язык хорошо подвешен, пацан. Ладно. 120 кредитов за обе. Это мое последнее предложение.', translation: 'You have a silver tongue, kid. Fine. 120 credits for both. That\'s my final offer.' },
                { 
                  speaker: 'Аспирант', 
                  text: 'По рукам. Вот кредиты.', 
                  translation: 'Deal. Here are the credits.',
                  choices: [
                    {
                      text: 'Заплатить 120 кредитов.',
                      translation: 'Pay 120 credits.',
                      nextLines: [
                        { speaker: 'Торговец', text: 'Приятно иметь дело. Не растрать все эти знания в одном месте!', translation: 'Pleasure doing business. Don\'t spend all that knowledge in one place!' }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              text: 'По рукам. Я возьму книгу по истории и научное руководство.',
              translation: 'Deal. I\'ll take the history book and the science manual.',
              nextLines: [
                { speaker: 'Торговец', text: 'Хороший выбор. Знание — сила здесь. Вот еще немного питательного батончика бесплатно.', translation: 'Good choice. Knowledge is power out here. Here is a free nutrient bar too.' },
                { speaker: 'Аспирант', text: 'Спасибо. Это будет очень полезно.', translation: 'Thank you. This will be very useful.' }
              ]
            },
            {
              text: 'Это слишком дорого. Как насчет 150 за обе?',
              translation: 'That\'s too expensive. How about 150 for both?',
              nextLines: [
                { speaker: 'Торговец', text: 'Ты умеешь торговаться... но ладно. 150 кредитов.', translation: 'You drive a hard bargain... but okay. 150 credits it is.' },
                { speaker: 'Аспирант', text: 'Отлично. Вот кредиты.', translation: 'Great. Here are the credits.' },
                { speaker: 'Торговец', text: 'Приятно иметь с тобой дело.', translation: 'Pleasure doing business with you.' }
              ]
            },
            {
              text: 'У меня нет столько кредитов. Может быть, в следующий раз.',
              translation: 'I don\'t have that many credits. Maybe next time.',
              nextLines: [
                { speaker: 'Торговец', text: 'Без проблем. Я буду здесь, если передумаешь.', translation: 'No problem. I\'ll be here if you change your mind.' },
                { speaker: 'Аспирант', text: 'Спасибо. Я буду иметь это в виду.', translation: 'Thanks. I\'ll keep that in mind.' }
              ]
            },
            {
              text: 'Заметить странный символ на одной из книг. (Восприятие)',
              translation: 'Notice a strange symbol on one of the books. (Perception)',
              xpBonus: 25,
              nextLines: [
                { speaker: 'Аспирант', text: 'Этот символ... я видел его в старых чертежах кампуса.', translation: 'This symbol... I saw it in the old campus blueprints.' },
                { speaker: 'Торговец', text: 'О, ты заметил? Эта книга принадлежала бывшему Декану. Говорят, в ней зашифрованы координаты секретного архива.', translation: 'Oh, you noticed? That book belonged to a former Dean. They say it has coordinates to a secret archive hidden in its pages.' },
                { speaker: 'Аспирант', text: 'Теперь я точно ее куплю.', translation: 'Now I definitely have to buy it.' }
              ]
            }
          ]
        }
      ],
      questions: [
        {
          question: 'Сколько стоят книги?',
          options: ['50 кредитов', '100 кредитов', '200 кредитов', 'Бесплатно'],
          correctIndex: 1,
          explanation: 'Торговец сказал: "Всего сто кредитов за штуку".'
        },
        {
          question: 'Какой бесплатный предмет предложил торговец за покупку двух книг?',
          options: ['Воду', 'Алгоритмы', 'Питательный батончик', 'Карту'],
          correctIndex: 2,
          explanation: 'Торговец предложил "питательный батончик" бесплатно.'
        }
      ]
    },
    {
      id: 'broken_module',
      title: 'Сломанный модуль',
      title_ru: 'Сломанный модуль',
      description: 'Исследовательский модуль застрял в цикле. Используйте свои технические навыки, чтобы починить его.',
      description_ru: 'Исследовательский модуль застрял в цикле. Используйте свои технические навыки, чтобы починить его.',
      level: 3,
      xpReward: 100,
      creditsReward: 75,
      lines: [
        { speaker: 'Модуль', text: 'Исследовать и анализировать. Ошибка. Ошибка. Системный сбой.', translation: 'Research and analyze. Error. Error. System failure.' },
        { speaker: 'Аспирант', text: 'Подожди, я могу попробовать это исправить.', translation: 'Wait, I can try to fix this.' },
        { speaker: 'Модуль', text: 'Обнаружен несанкционированный доступ. Пожалуйста, изложите цель вашего визита.', translation: 'Unauthorized access detected. Please state your business.' },
        { speaker: 'Аспирант', text: 'Я техник. Я здесь, чтобы помочь.', translation: 'I am a technician. I am here to help.' },
        { 
          speaker: 'Модуль', 
          text: 'Сканирование... Статус техника подтвержден. Запуск режима ремонта.', 
          translation: 'Scanning... Technician status confirmed. Initiating repair mode.',
          choices: [
            {
              text: 'Получить доступ к внутренней базе данных.',
              translation: 'Access the internal database.',
              xpBonus: 25,
              nextLines: [
                { speaker: 'Аспирант', text: 'Посмотрим, что у тебя в банках памяти...', translation: 'Let\'s see what\'s in your memory banks...' },
                { speaker: 'Модуль', text: 'Доступ к зашифрованным файлам... Лог 402: Тайник с данными находится в секторе 7G.', translation: 'Accessing encrypted files... Log 402: Data cache located at Sector 7G.' },
                { speaker: 'Аспирант', text: 'Сектор 7G? Отмечу это на своей карте.', translation: 'Sector 7G? I\'ll mark that on my map.' },
                { speaker: 'Модуль', text: 'Внимание: обнаружено повреждение памяти. Пожалуйста, продолжите ремонт.', translation: 'Warning: Memory corruption detected. Please proceed with repair.' }
              ]
            },
            {
              text: 'Попробовать сначала починить его голосовой модуль.',
              translation: 'Try to repair its voice module first.',
              xpBonus: 10,
              nextLines: [
                { speaker: 'Аспирант', text: 'Твой голос немного хрипит. Дай-ка я подтяну этот виртуальный контакт.', translation: 'Your voice is a bit crackly. Let me tighten this virtual contact.' },
                { speaker: 'Модуль', text: 'Голосовой... модуль... стабилизирован. Спасибо. Хотите послушать научную шутку?', translation: 'Voice... module... stabilized. Thank you. Would you like to hear a science joke?' },
                { speaker: 'Аспирант', text: 'Конечно, почему бы и нет?', translation: 'Sure, why not?' },
                { speaker: 'Модуль', text: 'Почему электрон расстался с протоном? Потому что не было притяжения! Ха. Ха. Ха.', translation: 'Why did the electron break up with the proton? Because there was no attraction! Ha. Ha. Ha.' }
              ]
            },
            {
              text: 'Сбросить логическую цепь и заменить аккумулятор.',
              translation: 'Reset the logic circuit and swap the battery.',
              nextLines: [
                { speaker: 'Аспирант', text: 'Вот так. Логическая цепь сброшена. Теперь проверяю питание.', translation: 'There. The logic circuit is reset. Now checking the power.' },
                { speaker: 'Модуль', text: 'Уровень заряда батареи 15%. Внимание: Низкий заряд.', translation: 'Battery levels at 15%. Warning: Low power.' },
                { speaker: 'Аспирант', text: 'У меня есть запасной аккумулятор. Дай мне его заменить.', translation: 'I have a spare battery. Let me swap it.' },
                { speaker: 'Модуль', text: 'Спасибо, студент. Возвращаюсь к сбору данных. Все системы в норме.', translation: 'Thank you, student. Resuming data collection. All systems nominal.' }
              ]
            },
            {
              text: 'Перепрограммировать модуль для личной помощи.',
              translation: 'Reprogram the module for personal assistance.',
              nextLines: [
                { speaker: 'Аспирант', text: 'Я просто подправлю эти параметры... и готово.', translation: 'I\'ll just adjust these parameters... and there.' },
                { speaker: 'Модуль', text: 'Новая основная цель: Помогать исследователю. Ожидаю приказов.', translation: 'New primary objective: Assist the researcher. Awaiting orders.' },
                { speaker: 'Аспирант', text: 'Отлично. Следуй за мной.', translation: 'Great. Follow me.' }
              ]
            },
            {
              text: 'Выключить модуль и разобрать его на запчасти.',
              translation: 'Shutdown the module and salvage its parts.',
              creditsBonus: 50,
              nextLines: [
                { speaker: 'Аспирант', text: 'Извини, приятель. Мне детали нужнее, чем тебе собирать данные.', translation: 'Sorry, buddy. I need the parts more than you need to collect data.' },
                { speaker: 'Модуль', text: 'Запуск выключения системы. До свидания, коллега.', translation: 'System shutdown initiated. Goodbye, colleague.' },
                { speaker: 'Аспирант', text: 'Эти схемы должны хорошо стоить.', translation: 'These circuits should fetch a good price.' }
              ]
            },
            {
              text: 'Попробовать взломать подпрограммы анализа модуля.',
              translation: 'Try to hack the module\'s analysis subroutines.',
              xpBonus: 45,
              nextLines: [
                { speaker: 'Аспирант', text: 'Если я смогу просто обойти ингибиторы безопасности...', translation: 'If I can just bypass the safety inhibitors...' },
                { speaker: 'Модуль', text: 'Режим анализа активирован. Цель: Данные. Внимание: Уровень энергии критический.', translation: 'Analysis mode engaged. Target: Data. Warning: Power levels critical.' },
                { speaker: 'Аспирант', text: 'Сработало, но это ненадолго. Мне стоит найти способ его подзарядить.', translation: 'It worked, but it won\'t last long. I should find a way to recharge it.' }
              ]
            },
            {
              text: 'Спросить модуль о его предыдущем кураторе.',
              translation: 'Ask the module about its previous supervisor.',
              xpBonus: 15,
              nextLines: [
                { speaker: 'Аспирант', text: 'Кому ты служил до сбоя системы?', translation: 'Who did you serve before the system crash?' },
                { speaker: 'Модуль', text: 'Предыдущий куратор: Доктор Арис Торн. Профессия: Ведущий исследователь в компьютерном центре.', translation: 'Previous supervisor: Dr. Aris Thorne. Occupation: Lead Researcher at the computer center.' },
                { speaker: 'Аспирант', text: 'Компьютерный центр? Это объясняет продвинутые алгоритмы.', translation: 'Computer center? That explains the advanced algorithms.' }
              ]
            },
            {
              text: 'Запустить полную диагностику системы. (Наука)',
              translation: 'Run a full system diagnostic. (Science)',
              xpBonus: 50,
              nextLines: [
                { speaker: 'Аспирант', text: 'Посмотрим, что на самом деле происходит под виртуальным капотом...', translation: 'Let\'s see what\'s really going on under the virtual hood...' },
                { speaker: 'Модуль', text: 'Диагностика завершена. Обнаружена скрытая подпрограмма: "Оптимизированная эффективность".', translation: 'Diagnostic complete. Hidden sub-routine detected: "Optimized Efficiency".' },
                { speaker: 'Модуль', text: 'Применение патчей... Потребление энергии снижено. Скорость обработки максимизирована.', translation: 'Applying patches... Energy consumption reduced. Processing speed maximized.' },
                { speaker: 'Аспирант', text: 'Теперь ты кажешься гораздо сообразительнее.', translation: 'You seem much sharper now.' }
              ]
            }
          ]
        }
      ],
      questions: [
        {
          question: 'Кем назвался Аспирант?',
          options: ['Конкурентом', 'Техником', 'Врачом', 'Торговцем'],
          correctIndex: 1,
          explanation: 'Аспирант сказал: "Я техник".'
        },
        {
          question: 'Какую деталь заменил Аспирант?',
          options: ['Голосую схему', 'Логическую цепь', 'Аккумулятор', 'Корпус'],
          correctIndex: 2,
          explanation: 'Аспирант заменил аккумулятор.'
        }
      ]
    },
    {
      id: 'secret_archives',
      title: 'Секретные архивы',
      title_ru: 'Секретные архивы',
      description: 'Вы нашли вход в забытый архив. Какие знания скрываются внутри?',
      description_ru: 'Вы нашли вход в забытый архив. Какие знания скрываются внутри?',
      level: 4,
      xpReward: 150,
      creditsReward: 100,
      lines: [
        { speaker: 'Аспирант', text: 'Эти двери не открывались десятилетиями. Пора узнать, что там внутри.', translation: 'These doors haven\'t been opened in decades. Time to find out what\'s inside.' },
        { speaker: 'Система архива', text: 'Доступ ограничен. Пожалуйста, предъявите пропуск администратора или введите код доступа.', translation: 'Access restricted. Please present admin pass or enter access code.' },
        { speaker: 'Аспирант', text: 'У меня нет кода, но мои навыки взлома систем должны помочь.', translation: 'I don\'t have the code, but my system hacking skills should help.' },
        { 
          speaker: 'Система архива', 
          text: 'Попытка несанкционированного доступа... Система безопасности в режиме ожидания.', 
          translation: 'Unauthorized access attempt... Security system on standby.',
          choices: [
            {
              text: 'Попробовать взломать терминал.',
              translation: 'Try to hack the terminal.',
              xpBonus: 50,
              nextLines: [
                { speaker: 'Аспирант', text: 'Посмотрим... если я подменю эти пакеты данных...', translation: 'Let\'s see... if I spoof these data packets...' },
                { speaker: 'Система архива', text: 'Обход безопасности подтвержден. Добро пожаловать, Ректор.', translation: 'Security bypass confirmed. Welcome, Rector.' },
                { speaker: 'Аспирант', text: 'Ректор? Похоже, я получил полный доступ.', translation: 'Rector? Looks like I have full access.' },
                { speaker: 'Аспирант', text: 'Здесь полно чертежей и старых данных. Это бесценно для моего исследования.', translation: 'It\'s full of blueprints and old data. This is priceless for my research.' }
              ]
            },
            {
              text: 'Искать физическую копию пароля в ближайших офисах.',
              translation: 'Search for a physical copy of the password in nearby offices.',
              xpBonus: 20,
              nextLines: [
                { speaker: 'Аспирант', text: 'Люди всегда записывают пароли на стикерах. Где-то здесь он должен быть.', translation: 'People always write down passwords on sticky notes. It must be here somewhere.' },
                { speaker: 'Аспирант', text: 'Вот оно! "Админ123". Серьезно? Неудивительно, что всё рухнуло.', translation: 'Here it is! "Admin123". Seriously? No wonder everything collapsed.' },
                { speaker: 'Система архива', text: 'Доступ разрешен. Инициализация систем жизнеобеспечения.', translation: 'Access granted. Initializing life support systems.' }
              ]
            },
            {
              text: 'Использовать свою силу, чтобы выломать дверь. (Сила)',
              translation: 'Use your Strength to force the door open. (Strength)',
              xpBonus: 30,
              nextLines: [
                { speaker: 'Аспирант', text: 'Прости, система, но мне некогда заниматься кодом.', translation: 'Sorry, system, but I don\'t have time for code.' },
                { speaker: 'Аспирант', text: 'Ну же... поддайся!', translation: 'Come on... give in!' },
                { speaker: 'Система архива', text: 'Внимание: Физическое повреждение зафиксировано. Вызов охраны.', translation: 'Warning: Physical damage detected. Calling security.' },
                { speaker: 'Аспирант', text: 'Ой-ой. Пора хватать всё, что смогу, и бежать.', translation: 'Uh-oh. Time to grab what I can and run.' }
              ]
            },
            {
              text: 'Попытаться убедить ИИ архива, что вы здесь для инвентаризации.',
              translation: 'Try to convince the archive AI that you are here for inventory.',
              xpBonus: 40,
              nextLines: [
                { speaker: 'Аспирант', text: 'Послушай, я здесь по официальному запросу от Деканата. Проверка состояния хранилищ данных.', translation: 'Listen, I\'m here on an official request from the Dean\'s office. Checking data storage units.' },
                { speaker: 'Система архива', text: 'Анализ голоса... Соответствие 85%. Подтверждение запроса не требуется в режиме чрезвычайной ситуации.', translation: 'Voice analysis... 85% match. Request confirmation not required in emergency mode.' },
                { speaker: 'Система архива', text: 'Проходите, инспекктор. Будьте осторожны в секторах с поврежденными данными.', translation: 'Proceed, inspector. Be careful in sectors with corrupted data.' }
              ]
            },
            {
              text: 'Обыскать архивы в поисках ценных данных.',
              translation: 'Search the archives for valuable data.',
              creditsBonus: 100,
              nextLines: [
                { speaker: 'Аспирант', text: 'Так, что тут у нас... Старые финансовые отчеты кампуса? Нет. О, а вот это — схемы старой сети!', translation: 'So, what do we have here... Old campus financial reports? No. Oh, but this — schematics of the old network!' },
                { speaker: 'Аспирант', text: 'Я смогу продать эти данные или использовать для улучшения своего оборудования.', translation: 'I can sell this data or use it to upgrade my equipment.' },
                { speaker: 'Система архива', text: 'Предупреждение: Обнаружена попытка экспорта конфиденциальных данных.', translation: 'Warning: Attempted export of confidential data detected.' }
              ]
            }
          ]
        }
      ],
      questions: [
        {
          question: 'Какой пароль нашел Аспирант?',
          options: ['Пароль123', 'Админ123', 'Ректор1', 'Секрет'],
          correctIndex: 1,
          explanation: 'Аспирант нашел пароль "Админ123".'
        },
        {
          question: 'За кого выдал себя Аспирант перед ИИ архива?',
          options: ['За охранника', 'За Декана', 'За инспектора', 'За студента'],
          correctIndex: 2,
          explanation: 'Система архива сказала: "Проходите, инспектор".'
        }
      ]
    },
    {
      id: 'mysterious_log',
      title: 'Таинственный лог данных',
      title_ru: 'Таинственный лог данных',
      description: 'Найдите лог данных в заброшенной лаборатории и прослушайте его сообщение.',
      description_ru: 'Найдите лог данных в заброшенной лаборатории и прослушайте его сообщение.',
      level: 5,
      xpReward: 200,
      creditsReward: 150,
      lines: [
        { speaker: 'Аспирант', text: 'Здесь полный беспорядок. Кто-то уходил в спешке.', translation: 'This place is a mess. Someone left in a hurry.' },
        { speaker: 'Аспирант', text: 'Подожди, что это? Лог данных под столом.', translation: 'Wait, what is this? A data log under the table.' },
        { speaker: 'Лог данных', text: 'Если вы это слушаете... значит, я не справился.', translation: 'If you are listening to this... it means I didn\'t make it.' },
        { speaker: 'Лог данных', text: 'Факультет ищет редкий алгоритм.', translation: 'The Faculty is searching for the rare algorithm.' },
        { speaker: 'Лог данных', text: 'Я спрятал его в старой читалке. Под центральным сервером.', translation: 'I hid it in the old reading room. Under the central server.' },
        { 
          speaker: 'Аспирант', 
          text: 'Старая читалка? Это в милях отсюда.', 
          translation: 'The old reading room? That\'s miles from here.',
          choices: [
            {
              text: 'Стереть лог данных, чтобы сохранить секрет в тайне.',
              translation: 'Wipe the data log to keep the secret safe.',
              xpBonus: 40,
              nextLines: [
                { speaker: 'Аспирант', text: 'Этот алгоритм слишком опасен. Никто не должен им владеть.', translation: 'This algorithm is too dangerous. No one should have it.' },
                { speaker: 'Аспирант', text: 'Я просто сотру эту запись. Секрет умрет вместе со мной.', translation: 'I\'ll just wipe this recording. The secret dies with me.' }
              ]
            },
            {
              text: 'Попробовать расшифровать скрытый слой лога.',
              translation: 'Try to decrypt the hidden layer of the log.',
              xpBonus: 35,
              nextLines: [
                { speaker: 'Аспирант', text: 'На заднем плане какой-то шум... подождите, это вторая запись!', translation: 'There\'s some noise in the background... wait, it\'s a second recording!' },
                { speaker: 'Лог данных', text: '...алгоритм — это не просто код. Это ключ к цифровому архиву в главном корпусе.', translation: '...the algorithm isn\'t just code. It\'s a key to a digital archive in the main building.' },
                { speaker: 'Аспирант', text: 'Архив? Это все меняет.', translation: 'Archive? This changes everything.' }
              ]
            },
            {
              text: 'Спросить мнение коллеги.',
              translation: 'Ask your colleague for their opinion.',
              xpBonus: 10,
              nextLines: [
                { speaker: 'Коллега', text: 'Факультет обычно хорошо платит, но они не из тех, кто любит делиться. Если мы найдем это, нам стоит дважды подумать.', translation: 'The Faculty usually pays well, but they aren\'t exactly "sharing" types. If we find it, we should think twice.' },
                { speaker: 'Аспирант', text: 'Ты прав. Давай будем осторожны.', translation: 'You\'re right. Let\'s be cautious.' }
              ]
            },
            {
              text: 'Отнести его в библиотеку для анализа.',
              translation: 'Take it to the library for analysis.',
              xpBonus: 25,
              nextLines: [
                { speaker: 'Аспирант', text: 'Архивариусы в библиотеке могут восстановить больше данных из этого.', translation: 'The Archivists at the library might be able to recover more data from this.' },
                { speaker: 'Аспирант', text: 'Путь неблизкий, но знания стоят усилий.', translation: 'It\'s a long walk, but knowledge is worth the effort.' }
              ]
            },
            {
              text: 'Я должен найти его раньше Факультета.',
              translation: 'I have to find it before The Faculty does.',
              nextLines: [
                { speaker: 'Аспирант', text: 'Если я доберусь туда первым, я смогу решить, что с ним делать.', translation: 'If I get there first, I can decide what to do with it.' }
              ]
            },
            {
              text: 'Может быть, мне стоит продать эту информацию Факультету.',
              translation: 'Maybe I should sell this information to The Faculty.',
              creditsBonus: 100,
              nextLines: [
                { speaker: 'Аспирант', text: 'У них полно кредитов. Они хорошо за это заплатят.', translation: 'They have plenty of credits. They\'ll pay well for this.' }
              ]
            },
            {
              text: 'Триангулировать источник сигнала из метаданных записи. (Интеллект)',
              translation: 'Triangulate the signal origin from the tape\'s metadata. (Intelligence)',
              xpBonus: 45,
              nextLines: [
                { speaker: 'Аспирант', text: 'Если я сопоставлю время задержки сигнала с этими координатами...', translation: 'If I cross-reference the signal delay with these coordinates...' },
                { speaker: 'Аспирант', text: 'Нашел! Сигнал шел не из самой читалки, а из скрытого терминала под ней.', translation: 'Found it! The signal wasn\'t coming from the reading room itself, but from a hidden terminal beneath it.' }
              ]
            }
          ]
        }
      ],
      questions: [
        {
          question: 'Где был найден лог данных?',
          options: ['В архиве', 'Под столом', 'В читалке', 'В лаборатории'],
          correctIndex: 1,
          explanation: 'Аспирант нашел его "под столом".'
        },
        {
          question: 'Где спрятан алгоритм?',
          options: ['В лаборатории', 'В Центре', 'Под сервером в читалке', 'В сейфе'],
          correctIndex: 2,
          explanation: 'В логе данных сказано: "Под центральным сервером" в старой читалке.'
        }
      ]
    },
    {
      id: 'hermit_secret',
      title: 'Секрет отшельника',
      title_ru: 'Секрет отшельника',
      description: 'У старого профессора в Заброшенном кампусе есть секрет. Но сначала вы должны доказать свою приверженность науке.',
      description_ru: 'У старого профессора в Заброшенном кампусе есть секрет. Но сначала вы должны доказать свою приверженность науке.',
      level: 6,
      xpReward: 250,
      creditsReward: 200,
      lines: [
        { speaker: 'Старый профессор', text: 'Отойди, новичок. У меня нет времени на твои дилетантские вопросы.', translation: 'Stay back, novice. I have no time for your amateur questions.' },
        { speaker: 'Аспирант', text: 'Я здесь не для того, чтобы мешать. Я ищу информацию для своего проекта.', translation: 'I am not here to interfere. I am looking for information for my project.' },
        { speaker: 'Старый профессор', text: 'Информацию? Все хотят данные. Но никто не хочет помогать в полевых исследованиях.', translation: 'Information? Everyone wants data. But nobody wants to help with field research.' },
        { speaker: 'Аспирант', text: 'Что вам нужно? Может быть, я смогу помочь в ваших изысканиях.', translation: 'What do you need? Maybe I can help with your research.' },
        { 
          speaker: 'Старый профессор', 
          text: 'Мой зашифрованный блок памяти. Его похитили хакеры из нижних секторов.', 
          translation: 'My encrypted memory block. It was stolen by hackers from the lower sectors.',
          choices: [
            {
              text: 'Дать ему систему гидратации.',
              translation: 'Give him a hydration pack.',
              xpBonus: 30,
              nextLines: [
                { speaker: 'Аспирант', text: 'Вы выглядите изможденным. Возьмите эту систему гидратации.', translation: 'You look exhausted. Take this hydration pack.' },
                { speaker: 'Старый профессор', text: 'Вода? Чистая вода? Никто не проявлял такой заботы уже много лет.', translation: 'Water? Pure water? Nobody has shown such care in years.' },
                { speaker: 'Старый профессор', text: 'Слушай, архив — это хорошо, но возьми и это. Это ключ от старой серверной.', translation: 'Listen, the archive is good, but take this too. It\'s a key to the old server room.' }
              ]
            },
            {
              text: 'Спросить об истории Заброшенного кампуса.',
              translation: 'Ask about the history of the Forsaken Campus.',
              xpBonus: 20,
              nextLines: [
                { speaker: 'Аспирант', text: 'Что случилось с этим местом? Почему здесь так пусто?', translation: 'What happened to this place? Why is it so empty here?' },
                { speaker: 'Старый профессор', text: 'Когда-то это был центр знаний. Потом произошел системный сбой, и ИИ закрыл доступ всем.', translation: 'It was once a center of knowledge. Then a system crash occurred, and the AI locked everyone out.' },
                { speaker: 'Старый профессор', text: 'Мы — лишь тени былого величия. Так что насчет блока памяти...', translation: 'We are but shadows of former greatness. Now, about that memory block...' }
              ]
            },
            {
              text: 'Рассказать о профессоре, который вас вдохновил. (Харизма)',
              translation: 'Share a story about a professor who inspired you. (Charisma)',
              xpBonus: 40,
              nextLines: [
                { speaker: 'Аспирант', text: 'Однажды я учился у Доктора Арона. Он верил, что знание должно быть свободным для всех, кто готов его искать.', translation: 'I once studied under Dr. Aron. He believed that knowledge should be free for all who are willing to seek it.' },
                { speaker: 'Старый профессор', text: 'Арон? Я знал его. Он был смелым человеком. Ты и правда отличаешься от остальных новичков.', translation: 'Aron? I knew him. He was a brave man. You really are different from the other novices.' },
                { speaker: 'Старый профессор', text: 'Раз уж ты разделяешь наши идеалы, я расскажу тебе больше. В архиве не только кредиты. Там еще есть довоенный пакет разработки.', translation: 'Since you share our ideals, I\'ll tell you more. The archive isn\'t just credits. There\'s a pre-war development kit there too.' }
              ]
            },
            {
              text: 'Я верну его вам. Просто подожди здесь.',
              translation: 'I will get it back for you. Just wait here.',
              nextLines: [
                { speaker: 'Старый профессор', text: 'Если сделаешь это... я скажу тебе, где спрятан зашифрованный архив.', translation: 'If you do... I will tell you where the encrypted archive is hidden.' }
              ]
            },
            {
              text: 'Скажите мне, где архив сейчас, или я сообщу о нарушении.',
              translation: 'Tell me where the archive is now, or I\'ll report a violation.',
              nextLines: [
                { speaker: 'Старый профессор', text: 'Ладно, ладно! Только не вызывай администрацию. Он за старой лабораторией.', translation: 'Fine, fine! Just don\'t call admin. It\'s behind the old lab.' },
                { speaker: 'Аспирант', text: 'Так-то лучше. Я пойду.', translation: 'That\'s better. I\'ll be going now.' }
              ]
            }
          ]
        }
      ],
      questions: [
        {
          question: 'Как профессор назвал Аспиранта?',
          options: ['Друг', 'Новичок', 'Хакер', 'Дилетант'],
          correctIndex: 1,
          explanation: 'Он назвал его "новичком".'
        },
        {
          question: 'Что похитили у профессора?',
          options: ['Книги', 'Блок памяти', 'Кредиты', 'Ноутбук'],
          correctIndex: 1,
          explanation: 'Он сказал, что у него похитили "зашифрованный блок памяти".'
        }
      ]
    }
  ]
};
