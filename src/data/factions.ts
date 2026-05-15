export interface Faction {
  id: string;
  name: string;
  description: Record<string, string>;
  icon: string;
  color: string;
  motto: Record<string, string>;
  bonusLabel: string;
  bonusEffect: string;
}

export const FACTIONS: Faction[] = [
  {
    id: 'bos',
    name: 'Brotherhood of Steel',
    description: {
      en: 'A quasi-religious technological military order. Dedicated to the preservation of technology and the protection of humanity, often from itself.',
      ru: 'Квазирелигиозный технологический военный орден. Посвящен сохранению технологий и защите человечества, часто от самого себя.',
      es: 'Una orden militar tecnológica cuasireligiosa. Dedicada a la preservación de la tecnología y la protección de la humanidad, a menudo de sí misma.'
    },
    icon: 'Shield',
    color: '#3b82f6',
    motto: {
      en: 'Ad Victoriam.',
      ru: 'К победе.',
      es: 'Ad Victoriam.'
    },
    bonusLabel: 'Tactical Precision',
    bonusEffect: '+10% Intellect XP Bonus'
  },
  {
    id: 'railroad',
    name: 'The Railroad',
    description: {
      en: 'An underground movement focused on liberating synths and protecting the marginalized. Masters of stealth and encryption.',
      ru: 'Подпольное движение, сосредоточенное на освобождении синтов и защите обездоленных. Мастера скрытности и шифрования.',
      es: 'Un movimiento clandestino centrado en liberar a los sínodos y proteger a los marginados. Maestros del sigilo y el cifrado.'
    },
    icon: 'Train',
    color: '#ef4444',
    motto: {
      en: 'Follow the lantern.',
      ru: 'Следуй за фонарем.',
      es: 'Sigue la linterna.'
    },
    bonusLabel: 'Encryption Experts',
    bonusEffect: '+15% Charisma Credits'
  },
  {
    id: 'minutemen',
    name: 'The Minutemen',
    description: {
      en: 'A volunteer militia protecting settlements. Dedicated to peace, community, and the common good of the wasteland.',
      ru: 'Добровольческое ополчение, защищающее поселения. Посвящено миру, сообществу и общему благу пустоши.',
      es: 'Una milicia de voluntarios que protege los asentamientos. Dedicada a la paz, la comunidad y el bien común del yermo.'
    },
    icon: 'Users',
    color: '#10b981',
    motto: {
      en: 'At a minutes notice.',
      ru: 'По первому зову.',
      es: 'En cualquier momento.'
    },
    bonusLabel: 'Community Shield',
    bonusEffect: '-20% Cognitive Load'
  },
  {
    id: 'institute',
    name: 'The Institute',
    description: {
      en: 'A secret organization producing advanced technologies. They believe they are the only hope for humanity, despite their questionable methods.',
      ru: 'Секретная организация, производящая передовые технологии. Они верят, что являются единственной надеждой человечества, несмотря на их сомнительные методы.',
      es: 'Una organización secreta que produce tecnologías avanzadas. Creen que son la única esperanza para la humanidad, a pesar de sus métodos cuestionables.'
    },
    icon: 'Cpu',
    color: '#8b5cf6',
    motto: {
      en: 'Mankind Redefined.',
      ru: 'Человечество переопределено.',
      es: 'La humanidad redefinida.'
    },
    bonusLabel: 'Synthetic Efficiency',
    bonusEffect: '+10% Focus XP Bonus'
  },
  {
    id: 'enclave',
    name: 'The Enclave',
    description: {
      en: 'The remnants of the pre-war United States government. They aim to restore order and pre-war values, often through pure force.',
      ru: 'Остатки довоенного правительства США. Они стремятся восстановить порядок и довоенные ценности, часто с помощью чистой силы.',
      es: 'Los restos del gobierno de los Estados Unidos de antes de la guerra. Su objetivo es restaurar el orden y los valores de antes de la guerra, a menudo mediante la fuerza pura.'
    },
    icon: 'Flag',
    color: '#f59e0b',
    motto: {
      en: 'For the Republic.',
      ru: 'За Республику.',
      es: 'Por la República.'
    },
    bonusLabel: 'Executive Command',
    bonusEffect: '+20% HP from Medkits'
  }
];
