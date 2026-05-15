import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { db } from '../firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { useStore } from '../store/useStore';
import { UI_TRANSLATIONS } from '../data/translations';
import { Trophy, Medal, Award, User, Crown, TrendingUp, Search, Flame, Shield, Train, Users as UsersIcon, Cpu, Flag, ShieldAlert } from 'lucide-react';
import SEO from '../components/SEO';
import { getAvatarUrl } from '../data/avatars';

import AvatarWithFrame from '../components/AvatarWithFrame';
import { FACTIONS } from '../data/factions';

interface LeaderboardUser {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  avatarId?: string;
  accessories?: { hat: string; glasses: string };
  xp: number;
  daysSurvived: number;
  special: { S: number, P: number, E: number, C: number, I: number, A: number, L: number };
  factionId?: string;
  equippedFrame?: string;
}

export default function Leaderboard() {
  const { uiLang, uid: currentUserId } = useStore();
  const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS['en'];
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const q = query(collection(db, 'leaderboard'), orderBy('xp', 'desc'), limit(50));
        const querySnapshot = await getDocs(q);
        const leaderboardData: LeaderboardUser[] = [];
        querySnapshot.forEach((doc) => {
          leaderboardData.push({ uid: doc.id, ...doc.data() } as LeaderboardUser);
        });
        setUsers(leaderboardData);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLeaderboard();
  }, []);

  const filteredUsers = users.filter(user => 
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFactionIcon = (iconName?: string) => {
    const className = "w-4 h-4";
    switch (iconName) {
      case 'Cpu': return <Cpu className={className} />;
      case 'Users': return <UsersIcon className={className} />;
      case 'Shield': return <Shield className={className} strokeWidth={2.5} />;
      case 'Flag': return <Flag className={className} />;
      case 'Train': return <Train className={className} />;
      default: return <ShieldAlert className={className} />;
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Crown className="w-6 h-6 text-amber-400" />;
      case 1: return <Medal className="w-6 h-6 text-slate-400" />;
      case 2: return <Medal className="w-6 h-6 text-amber-700" />;
      default: return <span className="text-sm font-bold text-slate-400">#{index + 1}</span>;
    }
  };

  return (
    <div className="space-y-12 pb-20 font-sans text-foreground relative min-h-screen">
      <SEO 
        title={t.view_leaderboard || 'Global Rankings'} 
        description={t.leaderboard_desc || 'Central hub for academic achievement tracking.'}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
        <div className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-sm">
               <Trophy className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground uppercase tracking-tight">
                {t.view_leaderboard || 'Academy Rankings'}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                 <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-sm" />
                 <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-relaxed">
                   {t.top_survivors || 'TOP RANKED SCHOLARS OF THE ACADEMY'}
                 </span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder={t.search_survivors || 'SEARCH STUDENTS...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-card border border-border rounded-[1.5rem] py-5 pl-16 pr-8 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold uppercase tracking-widest text-xs shadow-sm shadow-black/5"
          />
        </div>
      </div>

      {/* Top 3 Podium */}
      {!isLoading && filteredUsers.length >= 3 && searchTerm === '' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-end pt-20 relative z-10">
          {/* 2nd Place */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-[2.5rem] p-10 border border-border shadow-xl text-center relative order-2 md:order-1 group hover:shadow-2xl transition-all hover:-translate-y-1"
          >
            <div className="absolute -top-16 left-1/2 -translate-x-1/2">
              <div className="w-32 h-32 relative shadow-xl hover-lift">
                <AvatarWithFrame
                  avatarId={filteredUsers[1].avatarId}
                  photoURL={filteredUsers[1].photoURL}
                  uid={filteredUsers[1].uid}
                  frameId={filteredUsers[1].equippedFrame}
                  size="lg"
                  accessories={filteredUsers[1].accessories}
                />
              </div>
              <div className="absolute -bottom-2 right-0 bg-muted border-4 border-card text-muted-foreground w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-lg">02</div>
            </div>
            <div className="mt-16 space-y-3">
              <h3 className="font-bold text-foreground text-xl uppercase tracking-tight truncate">{filteredUsers[1].displayName || (t.explorer || 'Scholar')}</h3>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted border border-border text-foreground font-bold text-lg">{filteredUsers[1].xp} <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">XP</span></div>
            </div>
          </motion.div>

          {/* 1st Place */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-[3rem] p-12 shadow-[0_30px_60px_-15px_rgba(30,58,138,0.15)] text-center relative z-20 order-1 md:order-2 border-2 border-primary/20 scale-105"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute -top-24 left-1/2 -translate-x-1/2">
              <div className="relative">
                 <Crown className="w-14 h-14 text-amber-400 absolute -top-14 left-1/2 -translate-x-1/2 drop-shadow-lg animate-bounce" />
                 <div className="w-40 h-40 relative shadow-2xl hover-lift">
                   <AvatarWithFrame
                     avatarId={filteredUsers[0].avatarId}
                     photoURL={filteredUsers[0].photoURL}
                     uid={filteredUsers[0].uid}
                     frameId={filteredUsers[0].equippedFrame}
                     size="xl"
                     accessories={filteredUsers[0].accessories}
                   />
                 </div>
              </div>
              <div className="absolute -bottom-3 right-0 bg-primary text-white w-14 h-14 rounded-2xl flex items-center justify-center font-bold shadow-2xl border-4 border-card text-xl">01</div>
            </div>
            <div className="mt-16 space-y-4">
              <h3 className="font-bold text-foreground text-3xl uppercase tracking-tighter truncate">{filteredUsers[0].displayName || (t.overseer || 'Dean')}</h3>
              <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-3xl tracking-tighter shadow-sm">{filteredUsers[0].xp} <span className="text-xs uppercase font-bold tracking-widest mt-1 opacity-60">XP</span></div>
              <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest pt-6 border-t border-border flex items-center justify-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                {filteredUsers[0].daysSurvived} {t.streak} RECORD
              </div>
            </div>
          </motion.div>

          {/* 3rd Place */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-[2.5rem] p-10 border border-border shadow-xl text-center relative order-3 group hover:shadow-2xl transition-all hover:translate-y-1"
          >
            <div className="absolute -top-16 left-1/2 -translate-x-1/2">
              <div className="w-32 h-32 relative shadow-xl hover-lift">
                <AvatarWithFrame
                  avatarId={filteredUsers[2].avatarId}
                  photoURL={filteredUsers[2].photoURL}
                  uid={filteredUsers[2].uid}
                  frameId={filteredUsers[2].equippedFrame}
                  size="lg"
                  accessories={filteredUsers[2].accessories}
                />
              </div>
              <div className="absolute -bottom-2 right-0 bg-orange-50 dark:bg-orange-900/20 border-4 border-card text-orange-600 w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-lg">03</div>
            </div>
            <div className="mt-16 space-y-3">
              <h3 className="font-bold text-foreground text-xl uppercase tracking-tight truncate">{filteredUsers[2].displayName || (t.scavenger || 'Assistant')}</h3>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20 text-orange-600 font-bold text-lg">{filteredUsers[2].xp} <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">XP</span></div>
            </div>
          </motion.div>
        </div>
      )}

      {/* List */}
      <div className="bg-card rounded-[2.5rem] border border-border shadow-2xl overflow-hidden relative z-10">
        <div className="p-10 border-b border-border flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-4">
             <div className="bg-primary/20 p-2 rounded-xl">
                <Award className="w-5 h-5 text-primary" />
             </div>
             <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t.ranking || 'Academic Achievement Protocol'}</div>
          </div>
          <div className="flex gap-16 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mr-12 ml-4">
            <span className="hidden sm:inline">{t.streak || 'STREAK'}</span>
            <span>XP DATA</span>
          </div>
        </div>

        <div className="divide-y divide-border">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="p-8 flex items-center gap-8 animate-pulse">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
                <div className="flex-1 space-y-4">
                  <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded-lg w-1/3" />
                  <div className="h-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg w-1/4" />
                </div>
                <div className="w-24 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl" />
              </div>
            ))
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((user, index) => (
              <motion.div 
                key={user.uid}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ backgroundColor: 'hsl(var(--muted)/0.5)' }}
                className={`p-8 flex items-center gap-10 group transition-all ${user.uid === currentUserId ? 'bg-primary/5 border-l-[6px] border-primary' : 'border-l-[6px] border-transparent'}`}
              >
                <div className="w-12 flex justify-center transform group-hover:scale-110 transition-transform">
                  {getRankIcon(index)}
                </div>
                <div className="w-16 h-16 relative flex-shrink-0 group-hover:scale-105 transition-transform">
                  <AvatarWithFrame
                    avatarId={user.avatarId}
                    photoURL={user.photoURL}
                    uid={user.uid}
                    frameId={user.equippedFrame}
                    size="md"
                    accessories={user.accessories}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-4">
                    <h4 className="font-bold text-xl text-foreground uppercase tracking-tight truncate group-hover:text-primary transition-colors">{user.displayName || (t.survivor || 'Scholar')}</h4>
                    {user.factionId && (
                      <div className="flex items-center gap-2 bg-muted p-2 rounded-xl border border-border shadow-sm group/faction hover:border-primary transition-all">
                        {getFactionIcon(FACTIONS.find(f => f.id === user.factionId)?.icon)}
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                          {FACTIONS.find(f => f.id === user.factionId)?.name.split(' ').map(w => w[0]).join('')}
                        </span>
                      </div>
                    )}
                    {user.equippedFrame && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-xl border border-primary/10">
                        <Trophy className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[9px] font-black text-primary uppercase tracking-widest">{user.equippedFrame.split('_').pop()?.toUpperCase()}</span>
                      </div>
                    )}
                    {user.uid === currentUserId && (
                      <span className="bg-primary text-white text-[9px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-primary/20 animate-pulse">{t.you_label || 'ME'}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-6 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-3">
                    <span className="flex items-center gap-2 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors"><Award className="w-4 h-4 text-indigo-400" /> Lvl {Math.floor(user.xp / 100) + 1}</span>
                    <span className="flex items-center gap-2 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors"><TrendingUp className="w-4 h-4 text-emerald-400" /> {user.special?.I || 0} INTELLECT</span>
                  </div>
                </div>
                <div className="flex gap-16 items-center mr-12">
                  <div className="hidden sm:flex items-center gap-2 text-slate-400 dark:text-slate-600 font-bold text-xs uppercase tracking-widest group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
                    {user.daysSurvived} DAYS
                  </div>
                  <div className="text-3xl font-bold text-foreground min-w-[100px] text-right tracking-tighter">
                    {user.xp}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="p-32 text-center relative overflow-hidden bg-muted/20">
              <div className="w-32 h-32 bg-card border border-border rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl">
                <Search className="w-16 h-16 text-slate-200 dark:text-slate-700" />
              </div>
              <h3 className="text-3xl font-bold text-foreground uppercase tracking-tight mb-4">{t.no_survivors || 'DATABASE EMPTY'}</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{t.try_different_search || 'SUBJECT NOT FOUND IN WASTELAND REGISTRY'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
