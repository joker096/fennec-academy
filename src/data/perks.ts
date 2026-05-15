import { Perk } from '../types/perk';

export interface SynergyTier {
  threshold: number;
  name: Record<string, string>;
  description: Record<string, string>;
}

export interface PerkSynergy {
  tiers: SynergyTier[];
}

export const PERK_SYNERGIES: Record<string, PerkSynergy> = {
  Strength: {
    tiers: [
      {
        threshold: 2,
        name: { en: 'Titan Grip', ru: 'Хватка титана' },
        description: { 
          en: 'Equip 2 Strength perks to reduce energy cost of all lessons by 15%', 
          ru: 'Экипируйте 2 перка Силы, чтобы снизить расход энергии на все уроки на 15%' 
        }
      },
      {
        threshold: 3,
        name: { en: 'Colossus', ru: 'Колосс' },
        description: { 
          en: 'Equip 3 Strength perks to reduce energy cost by 30% and gain +10% max HP', 
          ru: 'Экипируйте 3 перка Силы, чтобы снизить расход энергии на 30% и получить +10% к макс. ОЗ' 
        }
      }
    ]
  },
  Perception: {
    tiers: [
      {
        threshold: 2,
        name: { en: 'Eagle Eye', ru: 'Орлиный глаз' },
        description: { 
          en: 'Equip 2 Perception perks to increase Critical Hit chance in encounters by 10%', 
          ru: 'Экипируйте 2 перка Восприятия, чтобы увеличить шанс критического удара в столкновениях на 10%' 
        }
      },
      {
        threshold: 3,
        name: { en: 'V.A.T.S. Master', ru: 'Мастер V.A.T.S.' },
        description: { 
          en: 'Equip 3 Perception perks to increase Critical Hit chance by 25% and XP from Vocabulary by 15%', 
          ru: 'Экипируйте 3 перка Восприятия, чтобы увеличить шанс крита на 25% и опыт за Словарь на 15%' 
        }
      }
    ]
  },
  Endurance: {
    tiers: [
      {
        threshold: 2,
        name: { en: 'Wasteland Legend', ru: 'Легенда пустоши' },
        description: { 
          en: 'Equip 2 Endurance perks to reduce fatigue accumulation by 20%', 
          ru: 'Экипируйте 2 перка Выносливости, чтобы замедлить накопление усталости на 20%' 
        }
      },
      {
        threshold: 3,
        name: { en: 'Solar Powered', ru: 'Солнечная батарея' },
        description: { 
          en: 'Equip 3 Endurance perks for 40% fatigue reduction and slow Health regeneration', 
          ru: 'Экипируйте 3 перка Выносливости для 40% снижения усталости и медленной регенерации ОЗ' 
        }
      }
    ]
  },
  Charisma: {
    tiers: [
      {
        threshold: 2,
        name: { en: 'Smooth Operator', ru: 'Мастер переговоров' },
        description: { 
          en: 'Equip 2 Charisma perks to gain +15% more Credits from all sources', 
          ru: 'Экипируйте 2 перка Харизмы, чтобы получать на 15% больше Крышек из всех источников' 
        }
      },
      {
        threshold: 3,
        name: { en: 'Local Leader', ru: 'Местный лидер' },
        description: { 
          en: 'Equip 3 Charisma perks for +30% Credits and 10% discount in the Shop', 
          ru: 'Экипируйте 3 перка Харизмы для +30% к Крышкам и 10% скидки в Магазине' 
        }
      }
    ]
  },
  Intelligence: {
    tiers: [
      {
        threshold: 2,
        name: { en: 'Polymath', ru: 'Эрудит' },
        description: { 
          en: 'Equip 2 Intelligence perks to gain +15% bonus XP from explanations and articles', 
          ru: 'Экипируйте 2 перка Интеллекта, чтобы получать +15% бонусного опыта за объяснения и статьи' 
        }
      },
      {
        threshold: 3,
        name: { en: 'Nerd Rage!', ru: 'Бешенство ботаника!' },
        description: { 
          en: 'Equip 3 Intelligence perks for +30% bonus XP and +20% Damage Resistance when at low HP', 
          ru: 'Экипируйте 3 перка Интеллекта для +30% бонусного опыта и +20% к сопротивлению урону при низком ОЗ' 
        }
      }
    ]
  },
  Agility: {
    tiers: [
      {
        threshold: 2,
        name: { en: 'Ghost in the Shell', ru: 'Призрак в доспехах' },
        description: { 
          en: 'Equip 2 Agility perks to regenerate Energy 25% faster', 
          ru: 'Экипируйте 2 перка Ловкости, чтобы восстанавливать энергию на 25% быстрее' 
        }
      },
      {
        threshold: 3,
        name: { en: 'Adrenaline Junkie', ru: 'Адреналинщик' },
        description: { 
          en: 'Equip 3 Agility perks for 50% faster Energy regeneration and +10% typing speed', 
          ru: 'Экипируйте 3 перка Ловкости для 50% ускорения регенерации энергии и +10% к скорости письма' 
        }
      }
    ]
  },
  Luck: {
    tiers: [
      {
        threshold: 2,
        name: { en: 'Miraculous Survival', ru: 'Чудесное спасение' },
        description: { 
          en: 'Equip 2 Luck perks for a 5% chance to ignore lethal damage completely', 
          ru: 'Экипируйте 2 перка Удачи для 5% шанса полностью игнорировать смертельный урон' 
        }
      },
      {
        threshold: 3,
        name: { en: "Grim Reaper's Sprint", ru: 'Спринт Жнеца' },
        description: { 
          en: 'Equip 3 Luck perks for 15% chance to ignore lethal damage and 10% chance to restore full Energy on correct answer', 
          ru: 'Экипируйте 3 перка Удачи для 15% шанса избежать смерти и 10% шанса восстановить всю Энергию за правильный ответ' 
        }
      }
    ]
  }
};

export const PERKS: Perk[] = [
  {
    id: 'dedicated_learner',
    stat: 'Intelligence',
    cost: 1,
    unlockLevel: 1,
    imageUrl: '/perks/curator.jpg',
    translations: {
      en: {
        name: 'Dedicated Learner',
        description: 'You are focused on gaining as much knowledge as possible.',
        effect: '+10% XP gain from all activities.'
      },
      ru: {
        name: 'Целеустремленность',
        description: 'Вы сосредоточены на получении как можно большего количества знаний.',
        effect: '+10% к получаемому опыту во всех активностях.'
      }
    }
  },
  {
    id: 'lore_specialist',
    stat: 'Intelligence',
    cost: 3,
    unlockLevel: 25,
    imageUrl: '/perks/curator.jpg',
    translations: {
      en: {
        name: 'Lore Specialist',
        description: 'Deep archive research feeds your hunger for knowledge.',
        effect: '+25% XP from Grammar and Vocabulary explanations.'
      },
      ru: {
        name: 'Специалист по лору',
        description: 'Глубокие архивные исследования питают вашу жажду знаний.',
        effect: '+25% опыта за грамматические и словарные объяснения.'
      }
    }
  },
  {
    id: 'scavengers_tongue',
    stat: 'Luck',
    cost: 2,
    unlockLevel: 30,
    imageUrl: '/perks/butchers_bounty.jpg',
    translations: {
      en: {
        name: "Scavenger's Tongue",
        description: 'You find linguistic gems in the most unlikely places.',
        effect: '20% chance to find extra Caps after a Deep Dive.'
      },
      ru: {
        name: 'Язык падальщика',
        description: 'Вы находите лингвистические жемчужины в самых неожиданных местах.',
        effect: 'Шанс 20% найти дополнительные Крышки после Глубокого погружения.'
      }
    }
  },
  {
    id: 'wasteland_charmer',
    stat: 'Charisma',
    cost: 2,
    unlockLevel: 28,
    imageUrl: '/perks/anti_epidemic.jpg',
    translations: {
      en: {
        name: 'Wasteland Charmer',
        description: 'Your silver tongue makes every conversation smoother.',
        effect: 'Reduces energy cost of AI conversations by 15%.'
      },
      ru: {
        name: 'Обаяние пустоши',
        description: 'Ваш подвешенный язык делает любой разговор более гладким.',
        effect: 'Снижает расход энергии в общении с ИИ на 15%.'
      }
    }
  },
  { 
    id: 'arms_keeper', 
    stat: 'Strength', 
    cost: 2, 
    unlockLevel: 7, 
    imageUrl: '/perks/arms_keeper.jpg',
    translations: {
      en: { name: 'Arms Keeper', description: 'You carry your weapons with ease.', effect: 'Your weapons weigh 75% less' },
      ru: { name: 'Оружейник', description: 'Вы с легкостью несете свое оружие.', effect: 'Ваше оружие весит на 75% меньше' }
    }
  },
  { 
    id: 'number_cruncher', 
    stat: 'Perception', 
    cost: 3, 
    unlockLevel: 10, 
    imageUrl: '/perks/number_cruncher.jpg',
    translations: {
      en: { name: 'Number Cruncher', description: 'Advanced calculations improve your aim.', effect: 'Your rifles now do +20% damage' },
      ru: { name: 'Счетовод', description: 'Продвинутые расчеты улучшают вашу точность.', effect: 'Ваши винтовки наносят на 20% больше урона' }
    }
  },
  { 
    id: 'easy_target', 
    stat: 'Strength', 
    cost: 3, 
    unlockLevel: 15, 
    imageUrl: '/perks/easy_target.jpg',
    translations: {
      en: { name: 'Easy Target', description: 'You know exactly where to hit.', effect: '+75% ranged damage to crippled targets' },
      ru: { name: 'Легкая цель', description: 'Вы точно знаете, куда бить.', effect: '+75% урона в дальнем бою по поврежденным конечностям' }
    }
  },
  { 
    id: 'ordnance_express', 
    stat: 'Strength', 
    cost: 2, 
    unlockLevel: 10, 
    imageUrl: '/perks/ordnance_express.jpg',
    translations: {
      en: { name: 'Ordnance Express', description: 'Master of heavy delivery.', effect: 'Explosives weigh 90% less' },
      ru: { name: 'Экспресс-боеприпасы', description: 'Мастер доставки тяжелых грузов.', effect: 'Взрывчатка весит на 90% меньше' }
    }
  },
  { 
    id: 'bullet_storm', 
    stat: 'Strength', 
    cost: 3, 
    unlockLevel: 20, 
    imageUrl: '/perks/bullet_storm.jpg',
    translations: {
      en: { name: 'Bullet Storm', description: 'Unleash a hail of lead.', effect: 'Gain 9% damage per 30 ammo spent (max 10 stacks)' },
      ru: { name: 'Шквал пуль', description: 'Обрушьте град свинца на врага.', effect: '+9% урона за каждые 30 потраченных патронов (до 10 раз)' }
    }
  },
  { 
    id: 'tightly_wound', 
    stat: 'Strength', 
    cost: 2, 
    unlockLevel: 14, 
    imageUrl: '/perks/tightly_wound.jpg',
    translations: {
      en: { name: 'Tightly Wound', description: 'Spring-loaded and ready.', effect: 'Weapons spin up 60% faster' },
      ru: { name: 'Туго затянуто', description: 'На пружинах и готово.', effect: 'Оружие раскручивается на 60% быстрее' }
    }
  },
  { 
    id: 'bandolier', 
    stat: 'Strength', 
    cost: 1, 
    unlockLevel: 22, 
    imageUrl: '/perks/bandolier.jpg',
    translations: {
      en: { name: 'Bandolier', description: 'Always have enough ammo.', effect: 'Ballistic weapon ammo weighs 45% less' },
      ru: { name: 'Бандольера', description: 'Патронов всегда в достатке.', effect: 'Баллистические боеприпасы весят на 45% меньше' }
    }
  },
  { 
    id: 'tormentor', 
    stat: 'Perception', 
    cost: 2, 
    unlockLevel: 16, 
    imageUrl: '/perks/tormentor.jpg',
    translations: {
      en: { name: 'Tormentor', description: 'Break them down.', effect: 'You deal 20% more damage per crippled limb your target has' },
      ru: { name: 'Мучитель', description: 'Ломайте их полностью.', effect: '+20% урона за каждую поврежденную конечность цели' }
    }
  },
  {
    id: 'all_night_long',
    stat: 'Endurance',
    cost: 1,
    unlockLevel: 41,
    imageUrl: '/perks/all_night_long-1.jpg',
    translations: {
      en: { 
        name: 'All Night Long', 
        description: 'You suffer 20% less from hunger and thirst.', 
        effect: 'Hunger & Thirst depletion -20%' 
      },
      ru: { 
        name: 'Всю ночь напролет', 
        description: 'Вы на 20% меньше страдаете от голода и жажды.', 
        effect: 'Расход голода и жажды -20%' 
      }
    }
  },
  {
    id: 'ammosmith',
    stat: 'Agility',
    cost: 1,
    unlockLevel: 34,
    imageUrl: '/perks/ammosmith-1.jpg',
    translations: {
      en: { 
        name: 'Ammosmith', 
        description: 'Produce 40% more rounds when crafting ammunition.', 
        effect: '+40% Bonus Rewards (Caps)' 
      },
      ru: { 
        name: 'Оружейник (патроны)', 
        description: 'Изготавливайте на 40% больше боеприпасов.', 
        effect: '+40% Бонус к наградам (Крышки)' 
      }
    }
  },
  {
    id: 'anti_epidemic',
    stat: 'Charisma',
    cost: 1,
    unlockLevel: 34,
    imageUrl: '/perks/anti_epidemic.jpg',
    translations: {
      en: { 
        name: 'Anti-Epidemic', 
        description: 'Your disease cures have a 50% chance to cure a disease on nearby teammates.', 
        effect: 'Social studies give 50% chance to restore Energy to a friend' 
      },
      ru: { 
        name: 'Анти-эпидемия', 
        description: 'Ваши лекарства имеют 50% шанс вылечить болезнь у ближайших товарищей по команде.', 
        effect: 'Совместное обучение дает 50% шанс восстановить энергию другу' 
      }
    }
  },
  {
    id: 'archer',
    stat: 'Perception',
    cost: 1,
    unlockLevel: 15,
    imageUrl: '/perks/archer.jpg',
    translations: {
      en: { 
        name: 'Archer', 
        description: 'Your bows and crossbows now do +10% damage.', 
        effect: '+10% Accuracy in typing tests' 
      },
      ru: { 
        name: 'Лучник', 
        description: 'Ваши луки и арбалеты теперь наносят на 10% больше урона.', 
        effect: '+10% к точности в тестах на печатание' 
      }
    }
  },
  {
    id: 'batteries_included',
    stat: 'Intelligence',
    cost: 1,
    unlockLevel: 28,
    imageUrl: '/perks/batteries_included.jpg',
    translations: {
      en: { 
        name: 'Batteries Included', 
        description: 'Energy weapon ammo weighs 30% less.', 
        effect: 'Electronic study materials consume 30% less Energy' 
      },
      ru: { 
        name: 'Батарейки в комплекте', 
        description: 'Боеприпасы для энергетического оружия весят на 30% меньше.', 
        effect: 'Цифровые учебные материалы потребляют на 30% меньше энергии' 
      }
    }
  },
  {
    id: 'bear_arms',
    stat: 'Strength',
    cost: 1,
    unlockLevel: 35,
    imageUrl: '/perks/bear_arms.jpg',
    translations: {
      en: { 
        name: 'Bear Arms', 
        description: 'Heavy Guns weigh 30% less.', 
        effect: 'Complex stories consume 30% less Energy' 
      },
      ru: { 
        name: 'Медвежья лапа', 
        description: 'Тяжелое оружие весит на 30% меньше.', 
        effect: 'Сложные истории потребляют на 30% меньше энергии' 
      }
    }
  },
  {
    id: 'bloodsucker',
    stat: 'Endurance',
    cost: 2,
    unlockLevel: 30,
    imageUrl: '/perks/bloodsucker.jpg',
    translations: {
      en: { 
        name: 'Bloodsucker', 
        description: 'Vampiric tendencies help you recover.', 
        effect: 'Correct answers have a 15% chance to restore 5 HP' 
      },
      ru: { 
        name: 'Кровопийца', 
        description: 'Вампирские наклонности помогают восстановиться.', 
        effect: 'Правильные ответы с шансом 15% восстанавливают 5 ОЗ' 
      }
    }
  },
  {
    id: 'bow_before_me',
    stat: 'Perception',
    cost: 3,
    unlockLevel: 45,
    imageUrl: '/perks/bow_before_me.jpg',
    translations: {
      en: { 
        name: 'Bow Before Me', 
        description: 'Your focus is absolute, piercing through any doubt.', 
        effect: '+20% Critical Hit chance during AI combat' 
      },
      ru: { 
        name: 'Склонись предо мной', 
        description: 'Ваша концентрация абсолютна, пронзая любые сомнения.', 
        effect: '+20% шанс критического удара в битвах с ИИ' 
      }
    }
  },
  {
    id: 'butchers_bounty',
    stat: 'Luck',
    cost: 1,
    unlockLevel: 20,
    imageUrl: '/perks/butchers_bounty.jpg',
    translations: {
      en: { 
        name: "Butcher's Bounty", 
        description: 'You find extra resources where others see only waste.', 
        effect: '20% chance to find extra Caps after finishing a module' 
      },
      ru: { 
        name: 'Мясник', 
        description: 'Вы находите ресурсы там, где другие видят лишь отходы.', 
        effect: 'Шанс 20% найти дополнительные Крышки после завершения модуля' 
      }
    }
  },
  {
    id: 'can_do',
    stat: 'Luck',
    cost: 1,
    unlockLevel: 18,
    imageUrl: '/perks/can_do.jpg',
    translations: {
      en: { 
        name: 'Can Do!', 
        description: "You've mastered the art of scavenging canned goods.", 
        effect: 'Gain extra food from completed modules' 
      },
      ru: { 
        name: 'Консервный нож', 
        description: 'Вы овладели искусством поиска консервированных продуктов.', 
        effect: 'Получайте дополнительную еду за завершенные модули' 
      }
    }
  },
  {
    id: 'chem_fiend',
    stat: 'Endurance',
    cost: 2,
    unlockLevel: 20,
    imageUrl: '/perks/chem_fiend.jpg',
    translations: {
      en: { 
        name: 'Chem Fiend', 
        description: 'You get a lot more out of your Stimpaks.', 
        effect: 'Stimpaks restore 50% more HP' 
      },
      ru: { 
        name: 'Химик-фанат', 
        description: 'Вы получаете гораздо больше пользы от стимуляторов.', 
        effect: 'Стимуляторы восстанавливают на 50% больше ОЗ' 
      }
    }
  },
  {
    id: 'class_freak',
    stat: 'Luck',
    cost: 3,
    unlockLevel: 46,
    imageUrl: '/perks/class_freak.jpg',
    translations: {
      en: { 
        name: 'Class Freak', 
        description: 'Maximum efficiency with minimum drawbacks.', 
        effect: 'Reduces penalties from negative effects by 75%' 
      },
      ru: { 
        name: 'Генетический урод', 
        description: 'Максимальная эффективность при минимальных недостатках.', 
        effect: 'Снижает штрафы от отрицательных эффектов на 75%' 
      }
    }
  },
  {
    id: 'cola_nut',
    stat: 'Endurance',
    cost: 1,
    unlockLevel: 14,
    imageUrl: '/perks/cola_nut.jpg',
    translations: {
      en: { 
        name: 'Cola Nut', 
        description: 'You double the effects of all Nuka-Cola products.', 
        effect: 'Energy drinks restore 2x more Energy' 
      },
      ru: { 
        name: 'Любитель колы', 
        description: 'Эффект от употребления любой ядер-колы удваивается.', 
        effect: 'Напитки восстанавливают в 2 раза больше энергии' 
      }
    }
  },
  {
    id: 'contractor',
    stat: 'Intelligence',
    cost: 2,
    unlockLevel: 18,
    imageUrl: '/perks/contractor.jpg',
    translations: {
      en: { 
        name: 'Contractor', 
        description: 'Crafting workshop items now costs 25% fewer resources.', 
        effect: 'Learning materials and shop items cost 25% less Caps' 
      },
      ru: { 
        name: 'Подрядчик', 
        description: 'На создание предметов в мастерских теперь требуется на 25% меньше ресурсов.', 
        effect: 'Учебные материалы и предметы в магазине стоят на 25% меньше крышек' 
      }
    }
  },
  {
    id: 'covert_operative',
    stat: 'Agility',
    cost: 2,
    unlockLevel: 24,
    imageUrl: '/perks/covert_operative.jpg',
    translations: {
      en: { 
        name: 'Covert Operative', 
        description: 'Your sneak attacks deal 2.15x normal damage.', 
        effect: '+15% XP bonus when studying in Night Mode' 
      },
      ru: { 
        name: 'Тайный агент', 
        description: 'Ваши скрытые атаки наносят в 2,15 раза больше обычного урона.', 
        effect: '+15% к опыту при обучении в ночном режиме' 
      }
    }
  },
  {
    id: 'critical_savvy',
    stat: 'Luck',
    cost: 3,
    unlockLevel: 44,
    imageUrl: '/perks/critical_savvy.jpg',
    translations: {
      en: { 
        name: 'Critical Savvy', 
        description: 'Critical hits now only consume 85% of your critical meter.', 
        effect: 'Critical hit meter fills 25% faster in AI battles' 
      },
      ru: { 
        name: 'Критическая точность', 
        description: 'Критические удары теперь тратят лишь 85% шкалы критической атаки.', 
        effect: 'Шкала критической атаки заполняется на 25% быстрее в битвах с ИИ' 
      }
    }
  },
  {
    id: 'curator',
    stat: 'Intelligence',
    cost: 2,
    unlockLevel: 12,
    imageUrl: '/perks/curator.jpg',
    translations: {
      en: { 
        name: 'Curator', 
        description: 'You have a deep appreciation for pre-war artifacts.', 
        effect: '+25% XP from Library articles' 
      },
      ru: { 
        name: 'Куратор', 
        description: 'Вы глубоко цените довоенные артефакты.', 
        effect: '+25% опыта за чтение статей в Библиотеке' 
      }
    }
  },
  {
    id: 'dogly',
    stat: 'Charisma',
    cost: 1,
    unlockLevel: 5,
    imageUrl: '/perks/dogly.jpg',
    translations: {
      en: { 
        name: 'Dogly', 
        description: 'Your canine companion is excellent at finding useful scrap.', 
        effect: '+10% Caps earned after lessons' 
      },
      ru: { 
        name: 'Собачник', 
        description: 'Ваш верный пес отлично находит полезный хлам.', 
        effect: '+10% крышек за пройденные уроки' 
      }
    }
  },
  {
    id: 'dead_man_sprinting',
    stat: 'Agility',
    cost: 3,
    unlockLevel: 18,
    imageUrl: '/perks/dead_man_sprinting.jpg',
    translations: {
      en: { 
        name: 'Dead Man Sprinting', 
        description: 'Adrenaline kicks in when your health is critical.', 
        effect: '+50% XP speed bonus when HP is below 25%' 
      },
      ru: { 
        name: 'Бег мертвеца', 
        description: 'Адреналин зашкаливает, когда ваше здоровье на критическом уровне.', 
        effect: '+50% бонуса скорости к опыту при ОЗ ниже 25%' 
      }
    }
  },
  {
    id: 'dromedary',
    stat: 'Endurance',
    cost: 1,
    unlockLevel: 5,
    imageUrl: '/perks/dromedary.jpg',
    translations: {
      en: { 
        name: 'Dromedary', 
        description: 'You are naturally efficient with hydration.', 
        effect: 'Drinks restore 50% more Thirst and Thirst depletion -20%' 
      },
      ru: { 
        name: 'Дромадер', 
        description: 'Вы по природе экономно расходуете запасы воды.', 
        effect: 'Напитки восстанавливают на 50% больше жажды, а жажда копится на 20% медленнее' 
      }
    }
  },
  {
    id: 'dry_nurse',
    stat: 'Charisma',
    cost: 1,
    unlockLevel: 20,
    imageUrl: '/perks/dry_nurse.jpg',
    translations: {
      en: { 
        name: 'Dry Nurse', 
        description: 'Your medical skills help satisfy basic needs too.', 
        effect: '50% chance to satisfy hunger and thirst when using a Stimpak' 
      },
      ru: { 
        name: 'Медсестра', 
        description: 'Ваши медицинские навыки помогают удовлетворить даже базовые потребности.', 
        effect: '50% шанс утолить голод и жажду при использовании стимулятора' 
      }
    }
  },
  {
    id: 'e_m_t',
    stat: 'Intelligence',
    cost: 2,
    unlockLevel: 24,
    imageUrl: '/perks/e_m_t.jpg',
    translations: {
      en: { 
        name: 'EMT', 
        description: 'Advanced emergency medical training saves lives.', 
        effect: 'Stimpaks restore 20% more HP and apply its effect 40% faster' 
      },
      ru: { 
        name: 'Парамедик', 
        description: 'Продвинутая подготовка по оказанию экстренной помощи спасает жизни.', 
        effect: 'Стимуляторы восстанавливают на 20% больше ОЗ и действуют на 40% быстрее' 
      }
    }
  },
  {
    id: 'evasive',
    stat: 'Agility',
    cost: 2,
    unlockLevel: 20,
    imageUrl: '/perks/evasive.jpg',
    translations: {
      en: { 
        name: 'Evasive', 
        description: 'You are harder to hit when on the move.', 
        effect: '+15% faster response time in flashcard reviews' 
      },
      ru: { 
        name: 'Уклонение', 
        description: 'В движении по вам сложнее попасть.', 
        effect: '+15% к скорости ответа при повторении карточек' 
      }
    }
  },
  {
    id: 'escape_artist',
    stat: 'Agility',
    cost: 1,
    unlockLevel: 35,
    imageUrl: '/perks/escape_artist.jpg',
    translations: {
      en: { 
        name: 'Escape Artist', 
        description: 'You can slip away from any difficult situation.', 
        effect: '50% chance to skip a difficult word without penalty' 
      },
      ru: { 
        name: 'Мастер побега', 
        description: 'Вы можете ускользнуть из любой сложной ситуации.', 
        effect: '50% шанс пропустить сложное слово без штрафа' 
      }
    }
  },
  {
    id: 'enforcer',
    stat: 'Agility',
    cost: 3,
    unlockLevel: 30,
    imageUrl: '/perks/enforcer.jpg',
    translations: {
      en: { 
        name: 'Enforcer', 
        description: 'You deal with problems quickly and decisively.', 
        effect: 'Finishing a high-difficulty lesson grants double Caps' 
      },
      ru: { 
        name: 'Принудитель', 
        description: 'Вы решаете проблемы быстро и решительно.', 
        effect: 'Завершение урока высокой сложности дает в два раза больше крышек' 
      }
    }
  },
  {
    id: 'expert_gladiator',
    stat: 'Strength',
    cost: 3,
    unlockLevel: 30,
    imageUrl: '/perks/expert_gladiator.jpg',
    translations: {
      en: {
        name: 'Expert Gladiator',
        description: 'Your one-handed melee weapons now do +15% damage.',
        effect: '+15% Melee damage'
      },
      ru: {
        name: 'Эксперт-гладиатор',
        description: 'Ваше одноручное холодное оружие теперь наносит на 15% больше урона.',
        effect: '+15% к урону холодным оружием'
      }
    }
  },
  {
    id: 'expert_guerilla',
    stat: 'Agility',
    cost: 3,
    unlockLevel: 30,
    imageUrl: '/perks/expert_guerilla.jpg',
    translations: {
      en: {
        name: 'Expert Guerrilla',
        description: 'Your automatic pistols now do +15% damage.',
        effect: '+15% Automatic pistol damage'
      },
      ru: {
        name: 'Эксперт-партизан',
        description: 'Ваши автоматические пистолеты теперь наносят на 15% больше урона.',
        effect: '+15% к урону автоматических пистолетов'
      }
    }
  },
  {
    id: 'expert_gunslinger',
    stat: 'Agility',
    cost: 3,
    unlockLevel: 30,
    imageUrl: '/perks/expert_gunslinger.jpg',
    translations: {
      en: {
        name: 'Expert Gunslinger',
        description: 'Your non-automatic pistols now do +15% damage.',
        effect: '+15% Pistol damage'
      },
      ru: {
        name: 'Эксперт-дуэлянт',
        description: 'Ваши неавтоматические пистолеты теперь наносят на 15% больше урона.',
        effect: '+15% к урону пистолетов'
      }
    }
  },
  {
    id: 'expert_hacker',
    stat: 'Intelligence',
    cost: 3,
    unlockLevel: 30,
    imageUrl: '/perks/expert_hacker.jpg',
    translations: {
      en: {
        name: 'Expert Hacker',
        description: 'Computer terminals fear your name.',
        effect: '+1 Attempt in hacking terminal games'
      },
      ru: {
        name: 'Эксперт-хакер',
        description: 'Компьютерные терминалы боятся вашего имени.',
        effect: '+1 попытка в играх по взлому терминалов'
      }
    }
  },
  {
    id: 'expert_rifleman',
    stat: 'Perception',
    cost: 3,
    unlockLevel: 30,
    imageUrl: '/perks/expert_rifleman.jpg',
    translations: {
      en: {
        name: 'Expert Rifleman',
        description: 'Your non-automatic rifles now do +15% damage.',
        effect: '+15% Rifle damage'
      },
      ru: {
        name: 'Эксперт-карабинер',
        description: 'Ваши неавтоматические винтовки теперь наносят на 15% больше урона.',
        effect: '+15% к урону винтовок'
      }
    }
  },
  {
    id: 'expert_shotgunner',
    stat: 'Strength',
    cost: 3,
    unlockLevel: 30,
    imageUrl: '/perks/expert_shotgunner.jpg',
    translations: {
      en: {
        name: 'Expert Shotgunner',
        description: 'Your shotguns now do +15% damage.',
        effect: '+15% Shotgun damage'
      },
      ru: {
        name: 'Эксперт-дробовик',
        description: 'Ваши дробовики теперь наносят на 15% больше урона.',
        effect: '+15% к урону дробовиков'
      }
    }
  },
  {
    id: 'expert_slugger',
    stat: 'Strength',
    cost: 3,
    unlockLevel: 32,
    imageUrl: '/perks/expert_slugger.jpg',
    translations: {
      en: {
        name: 'Expert Slugger',
        description: 'Your two-handed melee weapons now do +15% damage.',
        effect: '+15% Two-handed Melee damage'
      },
      ru: {
        name: 'Эксперт-бейсболист',
        description: 'Ваше двуручное холодное оружие теперь наносит на 15% больше урона.',
        effect: '+15% к урону двуручным холодным оружием'
      }
    }
  },
  {
    id: 'field_surgeon',
    stat: 'Intelligence',
    cost: 2,
    unlockLevel: 25,
    imageUrl: '/perks/field_surgeon.jpg',
    translations: {
      en: {
        name: 'Field Surgeon',
        description: 'Stimpaks and RadAway now work much more quickly.',
        effect: 'Healing items work 50% faster'
      },
      ru: {
        name: 'Полевой хирург',
        description: 'Стимуляторы и антирадин теперь действуют гораздо быстрее.',
        effect: 'Предметы лечения действуют на 50% быстрее'
      }
    }
  },
  {
    id: 'fire_in_the_hole',
    stat: 'Perception',
    cost: 1,
    unlockLevel: 12,
    imageUrl: '/perks/fire_in_the_hole.jpg',
    translations: {
      en: {
        name: 'Fire in the Hole',
        description: 'See a throwing arc when tossing explosives.',
        effect: 'Explosive range and accuracy +20%'
      },
      ru: {
        name: 'С чекой в зубах',
        description: 'Видьте траекторию при броске взрывчатки.',
        effect: 'Дальность и точность взрывчатки +20%'
      }
    }
  },
  {
    id: 'fireproof',
    stat: 'Endurance',
    cost: 2,
    unlockLevel: 15,
    imageUrl: '/perks/fireproof.jpg',
    translations: {
      en: {
        name: 'Fireproof',
        description: 'You are resilient to the most intense pressures.',
        effect: 'Fatigue accumulation reduced by 25%'
      },
      ru: {
         name: 'Огнеупорность',
         description: 'Вы устойчивы к самым интенсивным нагрузкам.',
         effect: 'Накопление усталости снижено на 25%'
      }
    }
  },
  {
    id: 'fix_it_good',
    stat: 'Intelligence',
    cost: 3,
    unlockLevel: 25,
    imageUrl: '/perks/fix_it_good.jpg',
    translations: {
      en: {
        name: 'Fix It Good',
        description: 'Your understanding of systems allows for perfect maintenance.',
        effect: 'Learning tools and gear cost 20% less to maintain'
      },
      ru: {
        name: 'Оружейник (ремонт)',
        description: 'Ваше понимание систем позволяет проводить идеальное обслуживание.',
        effect: 'Обслуживание учебных пособий и снаряжения стоит на 20% меньше'
      }
    }
  },
  {
    id: 'action_boy',
    stat: 'Agility',
    cost: 1,
    unlockLevel: 12,
    imageUrl: '/perks/action_boy_action_girl_cr.jpg',
    translations: {
      en: {
        name: 'Action Boy',
        description: 'You are a bundle of pure energy.',
        effect: 'Energy regeneration speed +20%'
      },
      ru: {
        name: 'Живчик (парень)',
        description: 'Вы — сгусток чистой энергии.',
        effect: 'Скорость регенерации энергии +20%'
      }
    }
  },
  {
    id: 'action_girl',
    stat: 'Agility',
    cost: 1,
    unlockLevel: 14,
    imageUrl: '/perks/action_girl_cr.jpg',
    translations: {
      en: {
        name: 'Action Girl',
        description: 'Your focus is relentless and your energy boundless.',
        effect: 'Energy regeneration speed +20%'
      },
      ru: {
        name: 'Живчик (девушка)',
        description: 'Ваша концентрация неумолима, а энергия безгранична.',
        effect: 'Скорость регенерации энергии +20%'
      }
    }
  },
  {
    id: 'aquaboy',
    stat: 'Endurance',
    cost: 1,
    unlockLevel: 10,
    imageUrl: '/perks/aquaboy.jpg',
    translations: {
      en: {
        name: 'Aquaboy',
        description: 'You are at home in the water.',
        effect: 'Water-related modules consume 30% less Energy and restore 15% Thirst.'
      },
      ru: {
        name: 'Аква-мальчик',
        description: 'Вы чувствуете себя в воде как дома.',
        effect: 'Водные модули потребляют на 30% меньше энергии и утоляют жажду на 15% эффективнее.'
      }
    }
  },
  {
    id: 'armorer',
    stat: 'Strength',
    cost: 2,
    unlockLevel: 15,
    imageUrl: '/perks/armorer.jpg',
    translations: {
      en: {
        name: 'Armorer',
        description: 'You know exactly how to maintain and wear your gear.',
        effect: 'Gear weighs 50% less and provides +15% damage resistance.'
      },
      ru: {
        name: 'Оружейник (броня)',
        description: 'Вы точно знаете, как ухаживать за снаряжением и носить его.',
        effect: 'Снаряжение весит на 50% меньше и дает +15% сопротивления урону.'
      }
    }
  },
  {
    id: 'awareness',
    stat: 'Perception',
    cost: 1,
    unlockLevel: 5,
    imageUrl: '/perks/awareness.jpg',
    translations: {
      en: {
        name: 'Awareness',
        description: 'You can sense details and weaknesses others miss.',
        effect: '+15% accuracy during vocabulary modules.'
      },
      ru: {
        name: 'Осведомленность',
        description: 'Вы чувствуете детали и слабости, которые другие упускают.',
        effect: '+15% к точности в словарных модулях.'
      }
    }
  },
  {
    id: 'lead_belly',
    stat: 'Endurance',
    cost: 1,
    unlockLevel: 5,
    imageUrl: '/perks/cola_nut.jpg', // Placeholder JPG
    translations: {
      en: {
        name: 'Lead Belly',
        description: 'Your digestive system is hardened against the wastes.',
        effect: '30% chance to prevent health damage from inactivity.'
      },
      ru: {
        name: 'Свинцовое брюхо',
        description: 'Ваша пищеварительная система закалена против отходов.',
        effect: '30% шанс предотвратить урон здоровью от бездействия.'
      }
    }
  },
  {
    id: 'resilient_learner',
    stat: 'Endurance',
    cost: 2,
    unlockLevel: 15,
    imageUrl: '/perks/all_night_long-1.jpg', // Placeholder JPG
    translations: {
      en: {
        name: 'Resilient Learner',
        description: 'You can study through pain and exhaustion.',
        effect: '30% chance to prevent damage from low focus or hydration.'
      },
      ru: {
        name: 'Стойкий ученик',
        description: 'Вы можете учиться сквозь боль и истощение.',
        effect: '30% шанс предотвратить урон от низкой концентрации или жажды.'
      }
    }
  },
  {
    id: 'starched_genes',
    stat: 'Luck',
    cost: 3,
    unlockLevel: 40,
    imageUrl: '/perks/class_freak.jpg', // Placeholder JPG
    translations: {
      en: {
        name: 'Starched Genes',
        description: 'Your progress is encoded deep in your DNA.',
        effect: 'Prevents losing your daily survival streak upon death.'
      },
      ru: {
        name: 'Крахмальные гены',
        description: 'Ваш прогресс закодирован глубоко в вашей ДНК.',
        effect: 'Предотвращает потерю серии выживания при смерти.'
      }
    }
  },
  {
    id: 'inspirational',
    stat: 'Charisma',
    cost: 2,
    unlockLevel: 20,
    imageUrl: '/perks/dogly.jpg', // Placeholder JPG
    translations: {
      en: {
        name: 'Inspirational',
        description: 'Your presence encourages everyone around you.',
        effect: 'Doubles the XP reward for daily login (100 XP).'
      },
      ru: {
        name: 'Вдохновение',
        description: 'Ваше присутствие воодушевляет всех окружающих.',
        effect: 'Удваивает награду XP за ежедневный вход (100 XP).'
      }
    }
  }
];
