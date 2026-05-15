import { 
  Library, 
  Dumbbell, 
  Radio, 
  Stethoscope, 
  ChefHat, 
  ShieldCheck, 
  Zap,
  Home
} from 'lucide-react';

export interface VaultRoom {
  id: string;
  nameKey: string;
  descriptionKey: string;
  cost: number;
  icon: any;
  requiredLevel: number;
  perk?: string;
  production?: {
    type: 'xp' | 'credits' | 'kits' | 'food' | 'water';
    amount: number;
    interval: number; // in seconds
  };
}

export const CAMPUS_ROOMS: VaultRoom[] = [
  {
    id: 'student_dormitories',
    nameKey: 'room_living_quarters',
    descriptionKey: 'room_living_quarters_desc',
    cost: 0,
    icon: Home,
    requiredLevel: 1,
    production: {
      type: 'credits',
      amount: 10,
      interval: 300 // 5 minutes
    }
  },
  {
    id: 'library',
    nameKey: 'room_library',
    descriptionKey: 'room_library_desc',
    cost: 500,
    icon: Library,
    requiredLevel: 5,
    perk: 'intellect_boost',
    production: {
      type: 'xp',
      amount: 25,
      interval: 600 // 10 minutes
    }
  },
  {
    id: 'gym',
    nameKey: 'room_training_room',
    descriptionKey: 'room_training_room_desc',
    cost: 750,
    icon: Dumbbell,
    requiredLevel: 8,
    perk: 'discipline_boost',
    production: {
      type: 'xp',
      amount: 30,
      interval: 900 // 15 minutes
    }
  },
  {
    id: 'media_lab',
    nameKey: 'room_radio_station',
    descriptionKey: 'room_radio_station_desc',
    cost: 1000,
    icon: Radio,
    requiredLevel: 10,
    perk: 'charisma_boost',
    production: {
      type: 'credits',
      amount: 100,
      interval: 1800 // 30 minutes
    }
  },
  {
    id: 'health_center',
    nameKey: 'room_medbay',
    descriptionKey: 'room_medbay_desc',
    cost: 1200,
    icon: Stethoscope,
    requiredLevel: 12,
    perk: 'hardiness_boost',
    production: {
      type: 'kits',
      amount: 1,
      interval: 1200 // 20 minutes
    }
  },
  {
    id: 'dining_hall',
    nameKey: 'room_cafeteria',
    descriptionKey: 'room_cafeteria_desc',
    cost: 1500,
    icon: ChefHat,
    requiredLevel: 15,
    perk: 'focus_boost',
    production: {
      type: 'food',
      amount: 20,
      interval: 600 // 10 minutes
    }
  },
  {
    id: 'security_office',
    nameKey: 'room_armory',
    descriptionKey: 'room_armory_desc',
    cost: 2000,
    icon: ShieldCheck,
    requiredLevel: 20,
    perk: 'insight_boost',
    production: {
      type: 'credits',
      amount: 250,
      interval: 3600 // 1 hour
    }
  },
  {
    id: 'data_center',
    nameKey: 'room_reactor',
    descriptionKey: 'room_reactor_desc',
    cost: 3000,
    icon: Zap,
    requiredLevel: 25,
    perk: 'serendipity_boost',
    production: {
      type: 'water',
      amount: 20,
      interval: 600 // 10 minutes
    }
  }
];
