// Heartbeat: Neural interface stable.
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Palette, Info, Check, ArrowLeft, Star, Heart, Zap, Shield, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useT } from '../lib/i18n';
import CharacterCustomization from '../components/CharacterCustomization';
import { AVATARS, getAvatarUrl } from '../data/avatars';
import SEO from '../components/SEO';
import Tooltip from '../components/Tooltip';
import { useNavigate } from 'react-router-dom';

import { PERKS } from '../data/perks';

export default function Character() {
  const t = useT();
  const navigate = useNavigate();
  const uiLang = useStore(state => state.uiLang);
  const avatarId = useStore(state => state.avatarId);
  const accessories = useStore(state => state.accessories);
  const displayName = useStore(state => state.displayName);
  const xp = useStore(state => state.xp);
  const credits = useStore(state => state.credits);
  const special = useStore(state => state.special);
  const perks = useStore(state => state.equippedPerks);
  
  const [isEditing, setIsEditing] = useState(false);

  const currentLevel = Math.floor(xp / 100) + 1;
  const avatarUrl = getAvatarUrl(avatarId, accessories);

  return (
    <div className="space-y-8 pb-20 font-sans text-foreground">
      <SEO 
        title={t.character_customization || "Student Profile"} 
        description="Manage your academic credentials and appearance."
      />

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-black text-foreground uppercase tracking-tight flex items-center gap-4">
            <User className="w-10 h-10 text-primary" />
            {t.character_customization || "Student Profile"}
          </h1>
          <p className="text-slate-500 mt-2 text-lg font-bold uppercase tracking-widest">
            {t.choose_appearance || "Manage your academic achievement and student identity."}
          </p>
        </div>
        
        <button
          onClick={() => setIsEditing(true)}
          className="px-8 py-4 bg-primary text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-primary/80 transition-all shadow-lg active:translate-y-0.5 flex items-center gap-3"
        >
          <Palette className="w-5 h-5" />
          {t.edit_character || "Customize profile"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Visual Preview */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 bg-card border border-border rounded-[2.5rem] flex flex-col items-center shadow-xl relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
            
            <div className="w-48 h-48 bg-muted/50 rounded-3xl border border-border flex items-center justify-center mb-6 relative z-10 overflow-hidden shadow-inner">
              <img 
                src={avatarUrl} 
                alt={displayName} 
                className="w-full h-full object-contain hover:scale-110 transition-transform duration-500 relative z-10"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <h2 className="text-3xl font-bold text-foreground uppercase tracking-tight mb-1 relative z-10">
              {displayName}
            </h2>
            <div className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest mb-6 relative z-10 shadow-md shadow-indigo-500/20">
              {t.level} {currentLevel} {t.survivor || 'Student'}
            </div>

            <div className="w-full grid grid-cols-2 gap-4 relative z-10">
              <div className="bg-muted/50 p-4 rounded-2xl border border-border text-center shadow-sm">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t.xp}</div>
                <div className="text-xl font-bold text-foreground">{xp}</div>
              </div>
              <div className="bg-muted/50 p-4 rounded-2xl border border-border text-center shadow-sm">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t.credits || "Credits"}</div>
                <div className="text-xl font-bold text-foreground">{credits}</div>
              </div>
            </div>
          </motion.div>

          <div className="bg-card border border-border p-6 rounded-[2rem] shadow-xl">
            <h3 className="font-bold text-foreground uppercase tracking-widest flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-primary" />
              {t.status_report || "Academic Report"}
            </h3>
            <p className="text-sm text-primary/70 leading-relaxed font-black uppercase tracking-widest">
              "{t.student || 'Student'} {displayName} has successfully reached level {currentLevel}. Academic status: Excellence. Cognitive performance within optimal parameters."
            </p>
          </div>
        </div>

        {/* Right Column: Detailed Stats */}
        <div className="lg:col-span-2 space-y-8">
          {/* SPECIAL Stats */}
          <section>
            <h2 className="text-xl font-black text-primary uppercase tracking-widest mb-6 flex items-center gap-3 drop-shadow-[0_0_5px_var(--primary-glow)]">
              <Star className="w-6 h-6" />
              {t.special_stats || "Academic Performance Attributes"}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-4">
              {Object.entries(special).map(([stat, val]) => (
                <div key={stat} className="bg-muted/40 p-4 rounded-none border border-primary/20 flex flex-col items-center hover:border-primary/50 transition-all shadow-md group relative overflow-hidden">
                  <div className="absolute inset-0 bg-primary/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <span className="text-[10px] font-black text-primary/40 uppercase tracking-[0.2em] mb-2 group-hover:text-primary transition-colors relative z-10">{stat}</span>
                  <span className="text-3xl font-black text-primary leading-none relative z-10 drop-shadow-[0_0_5px_var(--primary-glow)]">{val}</span>
                  <div className="mt-3 w-8 h-1 bg-primary/10 rounded-none overflow-hidden relative z-10">
                    <div className="h-full bg-primary shadow-[0_0_5px_var(--primary-glow)]" style={{ width: `${(val / 10) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Equipped Perks */}
          <section>
            <h2 className="text-xl font-black text-primary uppercase tracking-widest mb-6 flex items-center gap-3 drop-shadow-[0_0_5px_var(--primary-glow)]">
              <Shield className="w-6 h-6" />
              {t.active_perks || "Active Skills"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {perks.length > 0 ? (
                perks.map(perkId => {
                  const perk = PERKS.find(p => p.id === perkId);
                  const perkData = perk?.translations[uiLang] || perk?.translations['en'];
                  return (
                    <div key={perkId} className="bg-muted/40 p-4 rounded-none border border-primary/20 flex items-center gap-4 shadow-sm hover:shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)] transition-all group">
                      <div className="w-12 h-12 bg-primary/10 rounded-none flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform shadow-[0_0_10px_rgba(var(--primary-rgb),0.2)]">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-black text-primary uppercase text-sm tracking-wide">
                          {perkData?.name || perkId.replace(/_/g, ' ')}
                        </div>
                        <div className="text-[10px] text-primary/40 uppercase font-black tracking-widest opacity-60">
                          {perkData?.effect || 'Permanent Bonus'}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full border-2 border-dashed border-primary/10 p-8 rounded-none text-center text-primary/20 uppercase font-black tracking-[0.4em] italic bg-primary/2">
                  No Skills Equipped
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <AnimatePresence>
        {isEditing && (
          <CharacterCustomization 
            isOpen={isEditing} 
            onClose={() => setIsEditing(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
