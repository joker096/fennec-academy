export interface PerkTranslation {
  name: string;
  description: string;
  effect: string;
}

export interface Perk {
  id: string;
  stat: 'Strength' | 'Perception' | 'Endurance' | 'Charisma' | 'Intelligence' | 'Agility' | 'Luck';
  cost: number;
  unlockLevel: number;
  imageUrl: string;
  translations: Record<string, PerkTranslation>;
}
