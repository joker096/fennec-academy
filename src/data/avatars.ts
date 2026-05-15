export interface Avatar {
  id: string;
  name: string;
  image: string;
  description: string;
  category?: 'vault' | 'wasteland' | 'faction' | 'special';
  factionReq?: string;
  perkReq?: string;
  unlockLevel?: number;
}

export interface Accessory {
  id: string;
  name: string;
  type: 'glasses' | 'hat';
  value: string; // DiceBear value
}

export const AVATARS: Avatar[] = [
  {
    id: 'vault_boy',
    name: 'Vault Boy',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4&top=shortHairShortFlat&mouth=smile',
    description: 'The iconic mascot of Vault-Tec. Always positive, even in the apocalypse.',
    category: 'vault'
  },
  {
    id: 'vault_girl',
    name: 'Vault Girl',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aria&backgroundColor=b6e3f4&top=longHairStraight&mouth=smile',
    description: 'The female counterpart to Vault Boy. Ready for any wasteland challenge.',
    category: 'vault'
  },
  {
    id: 'ghoul',
    name: 'Wasteland Ghoul',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zombie&backgroundColor=334155&skinColor=614335&top=bald&mouth=serious',
    description: 'A survivor who has seen too much radiation. Tough and resilient.',
    category: 'wasteland'
  },
  {
    id: 'raider',
    name: 'Raider Scum',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Raider&backgroundColor=450a0a&top=shortHairDreads01&facialHair=beardMedium&mouth=serious',
    description: 'Life is cheap in the wasteland. You take what you want.',
    category: 'wasteland'
  },
  {
    id: 'bos_knight',
    name: 'Brotherhood Knight',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Knight&backgroundColor=1e293b&top=shortHairTheCaesarSidePart&accessories=prescription02&mouth=default',
    description: 'Dedicated to the preservation of technology and order.',
    category: 'faction',
    factionReq: 'bos'
  },
  {
    id: 'minuteman_general',
    name: 'Minutemen General',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=General&backgroundColor=0d9488&top=shortHairTheCaesarSidePart&facialHair=beardLight&mouth=smile',
    description: 'Leader of the people. Protecting settlements at a minutes notice.',
    category: 'faction',
    factionReq: 'minutemen'
  },
  {
    id: 'railroad_agent',
    name: 'Railroad Agent',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Agent&backgroundColor=b91c1c&top=shortHairSides&accessories=wayfarers&mouth=serious',
    description: 'Operating in the shadows to liberate those in need.',
    category: 'faction',
    factionReq: 'railroad'
  },
  {
    id: 'institute_scientist',
    name: 'Institute Scientist',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Science&backgroundColor=4338ca&top=shortHairShortCurly&accessories=round&mouth=default',
    description: 'Knowledge is the key to rebuilding civilization.',
    category: 'faction',
    factionReq: 'institute'
  },
  {
    id: 'enclave_officer',
    name: 'Enclave Officer',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Officer&backgroundColor=b45309&top=shortHairTheCaesar&facialHair=mowstache&mouth=serious',
    description: 'Restoring America to its former glory, by any means necessary.',
    category: 'faction',
    factionReq: 'enclave'
  },
  {
    id: 'ranger',
    name: 'NCR Ranger',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ranger&backgroundColor=064e3b&top=shortHairShortWaved&facialHair=beardLight&mouth=serious',
    description: 'A protector of the New California Republic. Law in a lawless land.',
    category: 'wasteland',
    unlockLevel: 10
  },
  {
    id: 'overseer',
    name: 'Vault Overseer',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Overseer&backgroundColor=1e1b4b&top=shortHairTheCaesar&mouth=default&accessories=prescription01',
    description: 'The leader of a vault. Responsibility is a heavy burden.',
    category: 'vault',
    unlockLevel: 15
  },
  {
    id: 'linguist_master',
    name: 'Grand Linguist',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Linguist&backgroundColor=a855f7&top=longHairCurly&accessories=round&mouth=smile',
    description: 'A master of all tongues. Communication is your greatest weapon.',
    category: 'special',
    perkReq: 'linguist'
  },
  {
    id: 'hacker_legend',
    name: 'Grid Runner',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hacker&backgroundColor=06b6d4&top=shortHairShortFlat&accessories=eyepatch&mouth=serious',
    description: 'You see the code behind the wasteland. Unstoppable efficiency.',
    category: 'special',
    perkReq: 'hacker'
  },
  {
    id: 'mercenary',
    name: 'Talon Merc',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Merc&backgroundColor=1e293b&top=shaggyMullet&facialHair=beardLight&mouth=serious',
    description: 'A hired gun from the Talon Company. Professional and cold.',
    category: 'faction',
    factionReq: 'talon'
  },
  {
    id: 'caravan_guard',
    name: 'Caravan Guard',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guard&backgroundColor=78350f&top=shortHairSides&facialHair=mowstache&mouth=smile',
    description: 'Protecting the lifeblood of the wasteland commerce. Friendly but cautious.',
    category: 'wasteland',
    unlockLevel: 5
  },
  {
    id: 'vault_scientist',
    name: 'Vault Scientist',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ScienceVault&backgroundColor=b6e3f4&top=longHairCurly&accessories=round&mouth=default',
    description: 'The brightest minds of the underground. Rebuilding the future one experiment at a time.',
    category: 'vault',
    unlockLevel: 12
  },
  {
    id: 'power_armor_knight',
    name: 'Steel Knight',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SteelKnight&backgroundColor=334155&top=shortHairTheCaesar&facialHair=beardLight&mouth=serious',
    description: 'Suit up for a brighter future.',
    category: 'faction',
    factionReq: 'bos'
  }
];

export const ACCESSORIES: Accessory[] = [
  // Glasses
  { id: 'none_glasses', name: 'No Glasses', type: 'glasses', value: 'none' },
  { id: 'eyepatch', name: 'Eyepatch', type: 'glasses', value: 'eyepatch' },
  { id: 'kurt', name: 'Reflective Kurt', type: 'glasses', value: 'kurt' },
  { id: 'prescription_01', name: 'Prescription 01', type: 'glasses', value: 'prescription01' },
  { id: 'prescription_02', name: 'Prescription 02', type: 'glasses', value: 'prescription02' },
  { id: 'round', name: 'Round Glasses', type: 'glasses', value: 'round' },
  { id: 'sunglasses', name: 'Sunglasses', type: 'glasses', value: 'sunglasses' },
  { id: 'wayfarers', name: 'Wayfarers', type: 'glasses', value: 'wayfarers' },
  
  // Hats (DiceBear "top" property)
  { id: 'none_hat', name: 'No Hat', type: 'hat', value: 'none' },
  { id: 'hat_01', name: 'Wasteland Hat', type: 'hat', value: 'hat' },
  { id: 'flowers', name: 'Flower Crown', type: 'hat', value: 'longHairFrida' },
  { id: 'hijab', name: 'Hijab', type: 'hat', value: 'hijab' },
  { id: 'turban', name: 'Turban', type: 'hat', value: 'turban' },
  { id: 'winter_hat_01', name: 'Winter Cap', type: 'hat', value: 'winterHat01' },
  { id: 'winter_hat_02', name: 'Beanie', type: 'hat', value: 'winterHat02' },
  { id: 'winter_hat_03', name: 'Ear Flap Hat', type: 'hat', value: 'winterHat03' },
  { id: 'winter_hat_04', name: 'Skull Cap', type: 'hat', value: 'winterHat04' }
];

export const getAvatarUrl = (avatarId: string, accessories?: { hat?: string; glasses?: string }) => {
  const avatar = AVATARS.find(a => a.id === avatarId) || AVATARS[0];
  let baseUrl = avatar.image;
  
  // Parse the base URL to manage parameters
  try {
    const url = new URL(baseUrl);
    
    if (accessories) {
      const glasses = ACCESSORIES.find(acc => acc.id === accessories.glasses);
      const hat = ACCESSORIES.find(acc => acc.id === accessories.hat);
      
      if (glasses && glasses.value !== 'none') {
        url.searchParams.set('accessories', glasses.value);
        url.searchParams.set('accessoriesProbability', '100');
      }
      
      if (hat && hat.value !== 'none') {
        // In DiceBear Avataaars, hats are part of the "top" property.
        url.searchParams.set('top', hat.value);
      }
    }
    
    return url.toString();
  } catch (e) {
    // Fallback to manual string manipulation if URL parsing fails
    let url = baseUrl;
    if (accessories) {
      const glasses = ACCESSORIES.find(acc => acc.id === accessories.glasses);
      const hat = ACCESSORIES.find(acc => acc.id === accessories.hat);
      
      if (glasses && glasses.value !== 'none') {
        if (url.includes('accessories=')) {
          url = url.replace(/accessories=[^&]+/, `accessories=${glasses.value}`);
        } else {
          url += `&accessories=${glasses.value}&accessoriesProbability=100`;
        }
      }
      if (hat && hat.value !== 'none') {
        if (url.includes('top=')) {
          url = url.replace(/top=[^&]+/, `top=${hat.value}`);
        } else {
          url += `&top=${hat.value}`;
        }
      }
    }
    return url;
  }
};
