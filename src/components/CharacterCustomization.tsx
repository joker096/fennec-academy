import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Lock, User, Shield, Zap, Heart, Sparkles, Glasses, UserCircle, Brain, Target, Star, Dumbbell, Coffee, MessageSquare, FastForward, Plus, Minus, Backpack, Coins } from 'lucide-react';
import { useStore } from '../store/useStore';
import { AVATARS, ACCESSORIES, getAvatarUrl, Avatar } from '../data/avatars';
import { FACTIONS } from '../data/factions';
import { PERKS } from '../data/perks';
import { UI_TRANSLATIONS } from '../data/translations';

interface CharacterCustomizationProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CharacterCustomization({ isOpen, onClose }: CharacterCustomizationProps) {
  const displayName = useStore(state => state.displayName);
  const avatarId = useStore(state => state.avatarId);
  const accessories = useStore(state => state.accessories);
  const bio = useStore(state => state.bio);
  const location = useStore(state => state.location);
  const special = useStore(state => state.special);
  const email = useStore(state => state.email);
  const setDisplayName = useStore(state => state.setDisplayName);
  const setBio = useStore(state => state.setBio);
  const setLocation = useStore(state => state.setLocation);
  const setEmail = useStore(state => state.setEmail);
  const setAvatarId = useStore(state => state.setAvatarId);
  const setAccessories = useStore(state => state.setAccessories);
  const setSpecial = useStore(state => state.setSpecial);
  const setEquippedPerks = useStore(state => state.setEquippedPerks);
  const uiLang = useStore(state => state.uiLang);
  const saveProgress = useStore(state => state.saveProgress);
  const uid = useStore(state => state.uid);
  const xp = useStore(state => state.xp);
  const factionId = useStore(state => state.factionId);
  const equippedPerks = useStore(state => state.equippedPerks);
  const unlockedPerks = useStore(state => state.unlockedPerks);

  const [tempName, setTempName] = useState(displayName || '');
  const [tempBio, setTempBio] = useState(bio || '');
  const [tempLocation, setTempLocation] = useState(location || '');
  const [tempEmail, setTempEmail] = useState(email || '');
  const [errors, setErrors] = useState<{ name?: string, email?: string }>({});
  const [selectedAvatar, setSelectedAvatar] = useState(avatarId);
  const [selectedHat, setSelectedHat] = useState(accessories.hat);
  const [selectedGlasses, setSelectedGlasses] = useState(accessories.glasses);
  const [tempSpecial, setTempSpecial] = useState(special);
  const [tempEquippedPerks, setTempEquippedPerks] = useState(equippedPerks);
  const [activeTab, setActiveTab] = useState<'model' | 'accessories' | 'special' | 'perks'>('model');

  const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS['en'];
  const level = Math.floor(xp / 100) + 1;

  // Calculate allocated and available points
  const totalPointsPool = Object.values(special).reduce((a, b) => a + b, 0);
  const currentAllocated = Object.values(tempSpecial).reduce((a, b) => a + b, 0);
  const availablePoints = totalPointsPool - currentAllocated;

  const validate = () => {
    const newErrors: { name?: string, email?: string } = {};
    
    if (!tempName.trim()) {
      newErrors.name = uiLang === 'ru' ? 'Имя не должно быть пустым' : 'Name is required';
    } else if (tempName.length > 50) {
      newErrors.name = uiLang === 'ru' ? 'Имя слишком длинное (макс. 50)' : 'Name too long (max 50)';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!tempEmail.trim()) {
      newErrors.email = uiLang === 'ru' ? 'Email не должен быть пустым' : 'Email is required';
    } else if (!emailRegex.test(tempEmail)) {
      newErrors.email = uiLang === 'ru' ? 'Некорректный формат email' : 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    
    setDisplayName(tempName);
    setBio(tempBio);
    setLocation(tempLocation);
    setEmail(tempEmail);
    setAvatarId(selectedAvatar);
    setAccessories({ hat: selectedHat, glasses: selectedGlasses });
    setSpecial(tempSpecial);
    setEquippedPerks(tempEquippedPerks);
    if (uid) {
      await saveProgress(uid);
    }
    onClose();
  };

  const toggleTempPerk = (perkId: string) => {
    if (tempEquippedPerks.includes(perkId)) {
      setTempEquippedPerks(tempEquippedPerks.filter(id => id !== perkId));
      return;
    }
    if (tempEquippedPerks.length >= 3) {
      // Replace oldest
      setTempEquippedPerks([...tempEquippedPerks.slice(1), perkId]);
    } else {
      setTempEquippedPerks([...tempEquippedPerks, perkId]);
    }
  };

  const statThemes: Record<string, {
    primary: string;
    bg: string;
    border: string;
    text: string;
    lightText: string;
    header: string;
    subtle: string;
    accent: string;
  }> = {
    strength: {
      primary: 'bg-rose-500',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500',
      text: 'text-rose-500',
      lightText: 'text-rose-400',
      header: 'bg-rose-500',
      subtle: 'bg-rose-500/5',
      accent: 'border-rose-500/30'
    },
    perception: {
      primary: 'bg-orange-500',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500',
      text: 'text-orange-500',
      lightText: 'text-orange-400',
      header: 'bg-orange-500',
      subtle: 'bg-orange-500/5',
      accent: 'border-orange-500/30'
    },
    endurance: {
      primary: 'bg-green-500',
      bg: 'bg-green-500/10',
      border: 'border-green-500',
      text: 'text-green-500',
      lightText: 'text-green-400',
      header: 'bg-green-500',
      subtle: 'bg-green-500/5',
      accent: 'border-green-500/30'
    },
    charisma: {
      primary: 'bg-pink-500',
      bg: 'bg-pink-500/10',
      border: 'border-pink-500',
      text: 'text-pink-500',
      lightText: 'text-pink-400',
      header: 'bg-pink-500',
      subtle: 'bg-pink-500/5',
      accent: 'border-pink-500/30'
    },
    intelligence: {
      primary: 'bg-blue-500',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500',
      text: 'text-blue-500',
      lightText: 'text-blue-400',
      header: 'bg-blue-500',
      subtle: 'bg-blue-500/5',
      accent: 'border-blue-500/30'
    },
    agility: {
      primary: 'bg-emerald-500',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500',
      text: 'text-emerald-500',
      lightText: 'text-emerald-400',
      header: 'bg-emerald-500',
      subtle: 'bg-emerald-500/5',
      accent: 'border-emerald-500/30'
    },
    luck: {
      primary: 'bg-amber-500',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500',
      text: 'text-amber-500',
      lightText: 'text-amber-400',
      header: 'bg-amber-500',
      subtle: 'bg-amber-500/5',
      accent: 'border-amber-500/30'
    },
    default: {
      primary: 'bg-indigo-500',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500',
      text: 'text-indigo-500',
      lightText: 'text-indigo-400',
      header: 'bg-indigo-500',
      subtle: 'bg-indigo-500/5',
      accent: 'border-indigo-500/30'
    }
  };

  const getStatTheme = (stat: string) => {
    return statThemes[stat?.toLowerCase()] || statThemes.default;
  };

  const updateTempSpecial = (stat: keyof typeof special, amount: number) => {
    const newVal = tempSpecial[stat] + amount;
    if (newVal < 1 || newVal > 10) return;
    if (amount > 0 && currentAllocated >= totalPointsPool) return;
    
    setTempSpecial({
      ...tempSpecial,
      [stat]: newVal
    });
  };

  if (!isOpen) return null;

  const previewUrl = getAvatarUrl(selectedAvatar, { hat: selectedHat, glasses: selectedGlasses });

  const categories = [
    { id: 'vault', name: t.category_vault || 'Vault-Tec' },
    { id: 'wasteland', name: t.category_wasteland || 'Wasteland' },
    { id: 'faction', name: t.category_faction || 'Factions' },
    { id: 'special', name: t.category_special || 'Special' }
  ];

  const isAvatarUnlocked = (avatar: Avatar) => {
    if (avatar.unlockLevel && level < avatar.unlockLevel) return false;
    if (avatar.factionReq && factionId !== avatar.factionReq) return false;
    if (avatar.perkReq && !equippedPerks.includes(avatar.perkReq)) return false;
    return true;
  };

  const getAvatarRequirement = (avatar: Avatar) => {
    if (avatar.unlockLevel && level < avatar.unlockLevel) return `Level ${avatar.unlockLevel}`;
    if (avatar.factionReq && factionId !== avatar.factionReq) {
      const faction = FACTIONS.find(f => f.id === avatar.factionReq);
      return faction?.name || 'Required Faction';
    }
    if (avatar.perkReq && !equippedPerks.includes(avatar.perkReq)) {
      const perk = PERKS.find(p => p.id === avatar.perkReq);
      return perk?.translations[uiLang]?.name || perk?.translations['en']?.name || 'Required Skill';
    }
    return null;
  };

  const specialStats = [
    { key: 'S', name: t.strength, icon: Dumbbell, color: 'text-red-500', bgColor: 'bg-red-50 dark:bg-red-900/20', desc: t.strength_desc },
    { key: 'P', name: t.perception, icon: Target, color: 'text-emerald-500', bgColor: 'bg-emerald-50 dark:bg-emerald-900/20', desc: t.perception_desc },
    { key: 'E', name: t.endurance, icon: Heart, color: 'text-rose-500', bgColor: 'bg-rose-50 dark:bg-rose-900/20', desc: t.endurance_desc },
    { key: 'C', name: t.charisma, icon: MessageSquare, color: 'text-indigo-500', bgColor: 'bg-indigo-50 dark:bg-indigo-900/20', desc: t.charisma_desc },
    { key: 'I', name: t.intelligence, icon: Brain, color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-900/20', desc: t.intelligence_desc },
    { key: 'A', name: t.agility, icon: FastForward, color: 'text-amber-500', bgColor: 'bg-amber-50 dark:bg-amber-900/20', desc: t.agility_desc },
    { key: 'L', name: t.luck, icon: Star, color: 'text-yellow-500', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20', desc: t.luck_desc }
  ] as const;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-card rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col border border-border"
        >
          {/* Header */}
          <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
            <div>
              <h2 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                {t.character_customization || 'Character Customization'}
              </h2>
              <p className="text-sm text-muted-foreground font-medium italic">
                {t.choose_appearance || 'Choose your appearance in the wasteland'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-muted-foreground" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Name and Preview */}
              <div className="lg:col-span-4 space-y-8">
                <section>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-3 pl-1">
                    {t.character_name || 'Character Name'}
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => {
                        setTempName(e.target.value);
                        if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                      }}
                      placeholder={t.enter_name || 'Enter name...'}
                      className={`w-full pl-12 pr-4 py-4 bg-muted border-2 rounded-2xl text-foreground font-bold transition-all outline-none ${
                        errors.name ? 'border-rose-500 bg-rose-500/5' : 'border-border focus:border-primary/40 focus:bg-card focus:shadow-lg'
                      }`}
                    />
                  </div>
                  {errors.name && (
                    <motion.p 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-rose-500 text-[9px] font-black uppercase mt-2 ml-1 flex items-center gap-1.5"
                    >
                      <Lock className="w-3 h-3" />
                      {errors.name}
                    </motion.p>
                  )}
                </section>

                <section>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-3 pl-1">
                    {t.profile_bio || 'Bio'}
                  </label>
                  <div className="relative group">
                    <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <textarea
                      value={tempBio}
                      onChange={(e) => setTempBio(e.target.value)}
                      placeholder={t.enter_bio || 'Tell us about yourself...'}
                      rows={3}
                      className="w-full pl-12 pr-4 py-4 bg-muted border-2 border-border rounded-2xl text-foreground font-bold transition-all outline-none focus:border-primary/40 focus:bg-card focus:shadow-lg resize-none"
                    />
                  </div>
                </section>

                <section>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-3 pl-1">
                    {t.profile_location || 'Location'}
                  </label>
                  <div className="relative group">
                    <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <input
                      type="text"
                      value={tempLocation}
                      onChange={(e) => setTempLocation(e.target.value)}
                      placeholder={t.enter_location || 'Your location...'}
                      className="w-full pl-12 pr-4 py-4 bg-muted border-2 border-border rounded-2xl text-foreground font-bold transition-all outline-none focus:border-primary/40 focus:bg-card focus:shadow-lg"
                    />
                  </div>
                </section>

                <section>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-3 pl-1">
                    Email Address
                  </label>
                  <div className="relative group">
                    <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <input
                      type="email"
                      value={tempEmail}
                      onChange={(e) => {
                        setTempEmail(e.target.value);
                        if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                      }}
                      placeholder="Enter email..."
                      className={`w-full pl-12 pr-4 py-4 bg-muted border-2 rounded-2xl text-foreground font-bold transition-all outline-none ${
                        errors.email ? 'border-rose-500 bg-rose-500/5' : 'border-border focus:border-primary/40 focus:bg-card focus:shadow-lg'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <motion.p 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-rose-500 text-[9px] font-black uppercase mt-2 ml-1 flex items-center gap-1.5"
                    >
                      <Lock className="w-3 h-3" />
                      {errors.email}
                    </motion.p>
                  )}
                </section>

                <section className="bg-secondary/50 rounded-3xl p-6 border border-border">
                  <div className="text-center">
                    <div className="relative inline-block mb-4">
                      <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-primary shadow-xl mx-auto bg-muted">
                        <img
                          referrerPolicy="no-referrer"
                          src={previewUrl}
                          alt="Preview"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-primary text-black p-2.5 rounded-full shadow-lg">
                        <Shield className="w-6 h-6" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-1">
                      {tempName || (t.wanderer || 'Wanderer')}
                    </h3>
                    <p className="text-primary font-bold text-sm uppercase tracking-widest">
                      Level {level} Survivor
                    </p>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-2">
                    <div className="bg-card p-3 rounded-xl text-center border border-border">
                      <Zap className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                      <div className="text-[10px] font-bold text-muted-foreground uppercase">{t.energy || 'Energy'}</div>
                      <div className="text-sm font-bold text-foreground">100%</div>
                    </div>
                    <div className="bg-card p-3 rounded-xl text-center border border-border">
                      <Heart className="w-4 h-4 text-rose-500 mx-auto mb-1" />
                      <div className="text-[10px] font-bold text-muted-foreground uppercase">{t.health || 'Health'}</div>
                      <div className="text-sm font-bold text-foreground">100%</div>
                    </div>
                    <div className="bg-card p-3 rounded-xl text-center border border-border">
                      <Shield className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                      <div className="text-[10px] font-bold text-muted-foreground uppercase">{t.armor || 'Armor'}</div>
                      <div className="text-sm font-bold text-foreground">0</div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Column: Customization Tabs */}
              <div className="lg:col-span-8 space-y-6">
                {/* Tabs */}
                <div className="flex gap-2 p-1 bg-secondary rounded-2xl w-fit">
                  <button
                    onClick={() => setActiveTab('model')}
                    className={`px-6 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                      activeTab === 'model'
                        ? 'bg-card text-primary shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <UserCircle className="w-4 h-4" />
                    {t.select_character_model || 'Model'}
                  </button>
                  <button
                    onClick={() => setActiveTab('accessories')}
                    className={`px-6 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                      activeTab === 'accessories'
                        ? 'bg-card text-primary shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Glasses className="w-4 h-4" />
                    {t.accessories || 'Accessories'}
                  </button>
                  <button
                    onClick={() => setActiveTab('special')}
                    className={`px-6 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                      activeTab === 'special'
                        ? 'bg-card text-primary shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Star className="w-4 h-4" />
                    S.P.E.C.I.A.L.
                  </button>
                  <button
                    onClick={() => setActiveTab('perks')}
                    className={`px-6 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                      activeTab === 'perks'
                        ? 'bg-card text-primary shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Backpack className="w-4 h-4" />
                    Loadout
                  </button>
                </div>

                {activeTab === 'model' ? (
                  <div className="space-y-8">
                    {categories.map(category => (
                      <div key={category.id} className="space-y-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <span className="w-8 h-px bg-border"></span>
                          {category.name}
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {AVATARS.filter(a => a.category === category.id).map((avatar) => {
                            const isUnlocked = isAvatarUnlocked(avatar);
                            const requirement = getAvatarRequirement(avatar);

                            return (
                              <motion.button
                                key={avatar.id}
                                whileHover={{ scale: isUnlocked ? 1.02 : 1 }}
                                whileTap={{ scale: isUnlocked ? 0.98 : 1 }}
                                onClick={() => isUnlocked && setSelectedAvatar(avatar.id)}
                                className={`relative group p-2 rounded-2xl border-2 transition-all ${
                                  selectedAvatar === avatar.id
                                    ? 'border-primary bg-primary/10'
                                    : isUnlocked 
                                      ? 'border-border bg-card hover:border-primary/50'
                                      : 'border-border bg-secondary/50 opacity-60 cursor-not-allowed'
                                }`}
                              >
                                <div className="aspect-square rounded-xl overflow-hidden mb-2 bg-secondary flex items-center justify-center relative">
                                  <img
                                    referrerPolicy="no-referrer"
                                    src={avatar.image}
                                    alt={avatar.name}
                                    className={`w-full h-full object-contain transition-all duration-500 ${
                                      selectedAvatar === avatar.id ? 'scale-110' : 'group-hover:scale-105'
                                    } ${!isUnlocked ? 'grayscale blur-[2px]' : ''}`}
                                  />
                                  {!isUnlocked && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                      <Lock className="w-8 h-8 text-white drop-shadow-lg" />
                                    </div>
                                  )}
                                </div>
                                <div className="text-xs font-bold text-foreground truncate">
                                  {avatar.name}
                                </div>
                                {!isUnlocked && requirement && (
                                  <div className="text-[10px] text-rose-500 font-black uppercase mt-0.5 truncate">
                                    {requirement}
                                  </div>
                                )}
                                {selectedAvatar === avatar.id && (
                                  <div className="absolute top-4 right-4 bg-primary text-black p-1 rounded-full shadow-lg">
                                    <Check className="w-3 h-3" />
                                  </div>
                                )}
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : activeTab === 'accessories' ? (
                  <div className="space-y-8">
                    {/* Hats */}
                    <section className="space-y-4">
                      <label className="block text-sm font-bold text-muted-foreground uppercase tracking-wider">
                        {t.hats || 'Hats'}
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {ACCESSORIES.filter(a => a.type === 'hat').map((acc) => (
                          <button
                            key={acc.id}
                            onClick={() => setSelectedHat(acc.id)}
                            className={`p-3 rounded-xl border-2 text-sm font-bold transition-all ${
                              selectedHat === acc.id
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border hover:border-primary/50 text-muted-foreground'
                            }`}
                          >
                            {acc.name === 'No Hat' ? t.none : acc.name}
                          </button>
                        ))}
                      </div>
                    </section>

                    {/* Glasses */}
                    <section className="space-y-4">
                      <label className="block text-sm font-bold text-muted-foreground uppercase tracking-wider">
                        {t.glasses || 'Glasses'}
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {ACCESSORIES.filter(a => a.type === 'glasses').map((acc) => (
                          <button
                            key={acc.id}
                            onClick={() => setSelectedGlasses(acc.id)}
                            className={`p-3 rounded-xl border-2 text-sm font-bold transition-all ${
                              selectedGlasses === acc.id
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border hover:border-primary/50 text-muted-foreground'
                            }`}
                          >
                            {acc.name === 'No Glasses' ? t.none : acc.name}
                          </button>
                        ))}
                      </div>
                    </section>
                  </div>
                ) : activeTab === 'special' ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between bg-primary/10 p-4 rounded-2xl border border-primary/20 mb-6">
                      <div>
                        <h4 className="font-bold text-primary">{t.stat_allocation || 'Stat Allocation'}</h4>
                        <p className="text-xs text-primary/70">{t.allocate_desc || 'Redistribute your total S.P.E.C.I.A.L. points'}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-primary">{availablePoints}</div>
                        <div className="text-[10px] font-bold text-primary/60 uppercase tracking-tighter">{t.points_available || 'Points Available'}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {specialStats.map((stat) => (
                        <div 
                          key={stat.key}
                          className="bg-card border border-border p-4 rounded-2xl flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className={`p-2.5 rounded-xl ${stat.bgColor}`}>
                              <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                            <div className="truncate">
                              <h5 className="font-bold text-foreground text-sm">{stat.name}</h5>
                              <p className="text-[10px] text-muted-foreground truncate pr-2" title={stat.desc}>{stat.desc}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 bg-secondary p-1 rounded-xl border border-border">
                            <button
                              onClick={() => updateTempSpecial(stat.key, -1)}
                              disabled={tempSpecial[stat.key] <= 1}
                              className="p-1 hover:bg-card rounded-lg text-muted-foreground hover:text-rose-500 disabled:opacity-30 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-4 text-center font-black text-foreground">{tempSpecial[stat.key]}</span>
                            <button
                              onClick={() => updateTempSpecial(stat.key, 1)}
                              disabled={tempSpecial[stat.key] >= 10 || availablePoints <= 0}
                              className="p-1 hover:bg-card rounded-lg text-muted-foreground hover:text-emerald-500 disabled:opacity-30 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between bg-primary/10 p-4 rounded-2xl border border-primary/20 mb-6">
                      <div>
                        <h4 className="font-bold text-primary">{t.active_perks || 'Active Perks'}</h4>
                        <p className="text-xs text-primary/70">{t.perks_limit_desc || 'Equip up to 3 unlocked skills'}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1.5">
                          {[...Array(3)].map((_, i) => (
                            <div 
                              key={i} 
                              className={`w-3 h-3 rounded-full border border-primary/30 ${
                                i < tempEquippedPerks.length ? 'bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]' : 'bg-primary/5'
                              }`} 
                            />
                          ))}
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-black text-primary">{tempEquippedPerks.length}/3</div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {PERKS.filter(p => unlockedPerks.includes(p.id)).map((perk) => {
                        const theme = getStatTheme(perk.stat);
                        const isEquipped = tempEquippedPerks.includes(perk.id);
                        const translation = perk.translations[uiLang] || perk.translations['en'];

                        return (
                          <motion.button
                            key={perk.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toggleTempPerk(perk.id)}
                            className={`flex flex-col text-left rounded-2xl border-2 transition-all relative overflow-hidden h-full ${
                              isEquipped 
                                ? `${theme.border} ${theme.bg} ring-2 ring-primary/20` 
                                : `border-border bg-card hover:${theme.accent}`
                            }`}
                          >
                            <div className={`h-8 ${isEquipped ? theme.header : 'bg-muted'} flex items-center px-3 justify-between`}>
                              <span className="text-[10px] font-black text-white uppercase tracking-wider">
                                {perk.stat}
                              </span>
                              {isEquipped ? (
                                <Check className="w-3 h-3 text-white" />
                              ) : (
                                <Zap className="w-3 h-3 text-muted-foreground" />
                              )}
                            </div>
                            
                            <div className="p-3 flex gap-3">
                              <div className="relative shrink-0">
                                <img 
                                  referrerPolicy="no-referrer"
                                  src={perk.imageUrl} 
                                  alt={translation.name}
                                  className={`w-14 h-14 rounded-lg object-cover transition-all ${
                                    isEquipped ? 'grayscale-0 opacity-100' : 'grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100'
                                  }`}
                                />
                                <div className="absolute -bottom-1 -right-1 bg-amber-500 text-black text-[8px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-sm border border-black/10">
                                  <Coins className="w-2.5 h-2.5" />
                                  {perk.cost}
                                </div>
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <h5 className={`font-bold text-sm truncate ${isEquipped ? theme.text : 'text-foreground'}`}>
                                  {translation.name}
                                </h5>
                                <p className="text-[10px] text-muted-foreground line-clamp-2 mt-1 italic">
                                  {translation.description}
                                </p>
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                      
                      {PERKS.filter(p => unlockedPerks.includes(p.id)).length === 0 && (
                        <div className="col-span-full py-12 text-center bg-muted/30 rounded-3xl border-2 border-dashed border-border">
                          <Lock className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                          <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                            No Skills Unlocked
                          </h4>
                          <p className="text-xs text-muted-foreground/60 mt-1">
                            Visit the Skills menu to acquire new perks.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="bg-primary/10 rounded-2xl p-4 border border-primary/20">
                  <h4 className="font-bold text-primary text-sm mb-1">
                    {AVATARS.find(a => a.id === selectedAvatar)?.name}
                  </h4>
                  <p className="text-xs text-primary/80 leading-relaxed">
                    {AVATARS.find(a => a.id === selectedAvatar)?.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border bg-muted/30 flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-8 py-3 rounded-2xl font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-all active:scale-95 text-[11px] uppercase tracking-widest border border-transparent hover:border-border"
            >
              {t.cancel || 'Cancel'}
            </button>
            <button
              onClick={handleSave}
              className="px-10 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all flex items-center gap-2 text-[11px] uppercase tracking-[0.2em]"
            >
              <Check className="w-5 h-5" strokeWidth={3} />
              {t.save_changes || 'Commit Profile'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
