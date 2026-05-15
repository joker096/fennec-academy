export interface Cosmetic {
  id: string;
  name: string;
  description: Record<string, string>;
  type: 'frame' | 'badge' | 'title';
  imageUrl: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const COSMETICS: Cosmetic[] = [
  {
    id: 'default_frame',
    name: 'Academic Merit Frame',
    description: {
      en: 'A standard issue frame for university scholars.',
      ru: 'Стандартная рамка для студентов университета.'
    },
    type: 'frame',
    imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=default&backgroundColor=b6e3f4',
    rarity: 'common'
  },
  {
    id: 'bos_knight_frame',
    name: 'Research Fellow Frame',
    description: {
      en: 'Earned by reaching Silver League with your faculty.',
      ru: 'Дается за достижение Серебряной лиги на факультете.'
    },
    type: 'frame',
    imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=bos&backgroundColor=3b82f6',
    rarity: 'rare'
  },
  {
    id: 'institute_director_frame',
    name: 'Academic Dean Frame',
    description: {
      en: 'Earned by reaching Gold League with your faculty.',
      ru: 'Дается за достижение Золотой лиги на факультете.'
    },
    type: 'frame',
    imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=institute&backgroundColor=8b5cf6',
    rarity: 'epic'
  },
  {
    id: 'enclave_officer_frame',
    name: 'University Chancellor Frame',
    description: {
      en: 'Mastering knowledge with prestige.',
      ru: 'Освоение знаний с престижем.'
    },
    type: 'frame',
    imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=enclave&backgroundColor=f59e0b',
    rarity: 'epic'
  },
  {
    id: 'league_win_badge',
    name: 'Weekly Champion Badge',
    description: {
      en: 'Awarded to the top contributor of a faction league.',
      ru: 'Награда лучшему участнику лиги фракций.'
    },
    type: 'badge',
    imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=trophy&backgroundColor=ffd700',
    rarity: 'legendary'
  },
  {
    id: 't45_power_armor_frame',
    name: 'T-45 Power Armor Skin',
    description: {
      en: 'A heavy defensive skin themed after the classic T-45 Power Armor.',
      ru: 'Тяжелый защитный скин, оформленный в стиле классической силовой брони Т-45.'
    },
    type: 'frame',
    imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=t45&backgroundColor=64748b',
    rarity: 'epic'
  },
  {
    id: 't51_power_armor_frame',
    name: 'T-51 Power Armor Skin',
    description: {
      en: 'The pinnacle of pre-war defensive technology.',
      ru: 'Вершина довоенных защитных технологий.'
    },
    type: 'frame',
    imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=t51&backgroundColor=475569',
    rarity: 'legendary'
  },
  {
    id: 'x01_power_armor_frame',
    name: 'X-01 Power Armor Skin',
    description: {
      en: 'Advanced power armor developed by the remnants of the military.',
      ru: 'Усовершенствованная силовая броня, разработанная остатками вооруженных сил.'
    },
    type: 'frame',
    imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=x01&backgroundColor=1e293b',
    rarity: 'legendary'
  }
];
