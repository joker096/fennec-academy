import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { Check, Zap, Shield, Bot, Star, Heart, MessageSquare, Sparkles, ArrowRight, Crown, RotateCw, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { UI_TRANSLATIONS } from '../data/translations';
import SEO from '../components/SEO';
import { useNavigate } from 'react-router-dom';

const FeatureCard = ({ icon: Icon, title, desc, delay }: { icon: any, title: string, desc: string, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="bg-white dark:bg-slate-800 p-8 rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-xl hover:shadow-2xl transition-all group"
  >
    <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all">
      <Icon className="w-7 h-7" />
    </div>
    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{title}</h3>
    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</p>
  </motion.div>
);

export default function Premium() {
  const { uiLang, buyPremium, isPremium } = useStore();
  const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS['en'];
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -500]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 45]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  const springY1 = useSpring(y1, { stiffness: 100, damping: 30 });
  const springY2 = useSpring(y2, { stiffness: 100, damping: 30 });
  const springY3 = useTransform(scrollYProgress, [0, 1], [0, -800]);

  const handleUpgrade = () => {
    buyPremium();
    navigate('/dashboard');
  };

  return (
    <div ref={containerRef} className="relative min-h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <SEO 
        title={t.premium_landing_title || 'University Premium'} 
        description={t.premium_landing_subtitle || 'The Ultimate Language Mastery Package'}
      />

      {/* Hero Section with Parallax */}
      <section className="relative h-screen flex items-center justify-center text-center px-4 overflow-hidden">
        {/* Parallax Background Elements */}
        <motion.div 
          style={{ y: springY3, rotate: 15 }}
          className="absolute top-20 left-1/4 w-32 h-32 bg-yellow-400/10 border-4 border-yellow-400/20 rounded-3xl hidden md:block"
        />
        <motion.div 
          style={{ y: springY2, rotate: -10 }}
          className="absolute top-1/3 right-1/4 w-48 h-48 bg-indigo-500/10 border-4 border-indigo-500/20 rounded-full hidden md:block"
        />
        <motion.div 
          style={{ y: springY1, rotate: 5 }}
          className="absolute bottom-1/4 left-1/3 w-40 h-40 bg-purple-500/10 border-4 border-purple-500/20 rounded-[40px] hidden md:block"
        />

        <motion.div 
          style={{ y: springY1, scale, opacity }}
          className="relative z-10 max-w-4xl"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-yellow-400 text-slate-900 font-black text-sm mb-8 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase tracking-widest"
          >
            <Crown className="w-4 h-4" />
            {t.premium_compare_plus || 'University Premium'}
          </motion.div>
          
          <h1 className="font-display text-7xl md:text-9xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter leading-none drop-shadow-2xl">
            {t.premium_landing_title || 'University Premium'}
          </h1>
          
          <p className="text-xl md:text-3xl text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto font-bold leading-tight uppercase italic tracking-tight">
            {t.premium_landing_subtitle || 'The Ultimate Language Mastery Package'}
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button
              onClick={handleUpgrade}
              disabled={isPremium}
              className="px-12 py-6 bg-yellow-400 hover:bg-yellow-500 text-slate-900 rounded-2xl font-black text-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-3 group disabled:opacity-50 uppercase"
            >
              {isPremium ? t.premium_active : (t.premium_cta_free || 'Start 7-Day Free Trial')}
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </button>
            <div className="text-left">
              <p className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                {t.premium_price_monthly || '$9.99 / month'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500 font-bold uppercase">
                Cancel anytime in your Learning Hub
              </p>
            </div>
          </div>
        </motion.div>

        {/* Floating Parallax Elements */}
        <motion.div 
          style={{ y: springY2, rotate }}
          className="absolute top-1/4 -left-20 w-64 h-64 bg-indigo-500/10 rounded-[60px]"
        />
        <motion.div 
          style={{ y: springY1, rotate: -rotate }}
          className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-500/10 rounded-full"
        />
        
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 right-10 md:right-20 hidden md:block"
        >
          <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700">
            <Bot className="w-10 h-10 text-indigo-500" />
          </div>
        </motion.div>

        <motion.div
          animate={{ 
            y: [0, 20, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/3 left-10 md:left-20 hidden md:block"
        >
          <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700">
            <Heart className="w-10 h-10 text-rose-500" />
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 max-w-7xl mx-auto relative z-20">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
            Everything you need for mastery.
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Unlock the full potential of your academic learning module.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard 
            icon={Shield}
            title={t.premium_feature_ads || 'No Ads'}
            desc={t.premium_feature_ads_desc || 'Learn without interruptions from the campus noise.'}
            delay={0.1}
          />
          <FeatureCard 
            icon={Heart}
            title={t.premium_feature_hearts || 'Unlimited Medkits'}
            desc={t.premium_feature_hearts_desc || 'Never run out of energy during your lessons.'}
            delay={0.2}
          />
          <FeatureCard 
            icon={Bot}
            title={t.premium_feature_ai || 'Advanced AI Tutor'}
            desc={t.premium_feature_ai_desc || 'Get personalized feedback and deep-dive analysis.'}
            delay={0.3}
          />
          <FeatureCard 
            icon={MessageSquare}
            title={t.premium_feature_mistakes || 'Mistakes Review'}
            desc={t.premium_feature_mistakes_desc || 'Targeted practice for your most difficult words.'}
            delay={0.4}
          />
          <FeatureCard 
            icon={Zap}
            title={t.premium_feature_streak || 'Monthly Streak Repair'}
            desc={t.premium_feature_streak_desc || 'One free save per month if you miss a day.'}
            delay={0.5}
          />
          <FeatureCard 
            icon={Sparkles}
            title="Elite Challenges"
            desc="Access legendary difficulty levels and earn double XP without spending credits."
            delay={0.6}
          />
        </div>
      </section>

      {/* Mistakes Review Section */}
      <section className="py-24 px-4 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(#4ade80_1px,transparent_1px)] [background-size:20px_20px]" />
        </div>
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-black mb-8 uppercase tracking-tighter leading-none italic text-yellow-400">
              {t.premium_feature_mistakes || 'Mistakes Review'}
            </h2>
            <p className="text-xl md:text-2xl font-bold mb-8 text-slate-300 uppercase tracking-tight">
              {t.premium_feature_mistakes_desc || 'Targeted practice for your most difficult words.'}
            </p>
            <ul className="space-y-4 mb-12">
              {[
                'Smart algorithm identifies weak spots',
                'Personalized review sessions',
                'Master difficult grammar patterns',
                'Turn errors into experience points'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-lg font-bold uppercase tracking-tighter">
                  <Check className="w-6 h-6 text-yellow-400" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-slate-800 border-8 border-slate-700 rounded-[40px] p-8 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden aspect-video flex flex-col justify-center items-center text-center">
              <div className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none" />
              <div className="absolute top-0 left-0 w-full h-full animate-pulse opacity-20 bg-green-500/10 pointer-events-none" />
              
              <RotateCw className="w-20 h-20 text-yellow-400 mb-6 animate-spin-slow" />
              <h3 className="text-3xl font-black text-yellow-400 uppercase tracking-widest mb-2">Mistakes Found</h3>
              <div className="text-5xl font-black text-white mb-4 tabular-nums">12</div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Targeted Practice Ready</p>
              
              <div className="mt-8 w-full max-w-xs h-2 bg-slate-700 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: '65%' }}
                  transition={{ duration: 2, delay: 0.5 }}
                  className="h-full bg-yellow-400"
                />
              </div>
            </div>
            
            {/* Floating UI Elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-10 -right-10 bg-yellow-400 text-slate-900 p-6 rounded-2xl font-black shadow-xl border-4 border-slate-900 uppercase tracking-tighter rotate-12"
            >
              +50% XP
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Streak Repair Section */}
      <section className="py-24 px-4 bg-white dark:bg-slate-950 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="lg:order-2"
          >
            <h2 className="text-4xl md:text-6xl font-black mb-8 uppercase tracking-tighter leading-none italic text-indigo-600 dark:text-indigo-400">
              {t.premium_feature_streak || 'Monthly Streak Repair'}
            </h2>
            <p className="text-xl md:text-2xl font-bold mb-8 text-slate-600 dark:text-slate-400 uppercase tracking-tight">
              {t.premium_feature_streak_desc || 'One free save per month if you miss a day.'}
            </p>
            <ul className="space-y-4 mb-12">
              {[
                'Never lose your hard-earned progress',
                'Automatic activation on missed days',
                'Peace of mind for busy scholars',
                'Keep your learning streak alive'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-lg font-bold uppercase tracking-tighter text-slate-800 dark:text-slate-200">
                  <Check className="w-6 h-6 text-indigo-600" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="lg:order-1 relative"
          >
            <div className="bg-slate-100 dark:bg-slate-800 border-8 border-slate-200 dark:border-slate-700 rounded-[40px] p-12 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center text-center">
              <div className="relative">
                <Zap className="w-32 h-32 text-indigo-600 mb-6 animate-pulse" />
              </div>
              <h3 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-widest mb-2">Streak Protected</h3>
              <div className="text-6xl font-black text-indigo-600 dark:text-indigo-400 mb-4 tabular-nums">365 DAYS</div>
              <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-sm">University Premium Insurance Active</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* No Ads Section */}
      <section className="py-24 px-4 bg-yellow-400 text-slate-900 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-black mb-8 uppercase tracking-tighter leading-none italic">
              {t.premium_feature_ads || 'No Ads'}
            </h2>
            <p className="text-xl md:text-2xl font-bold mb-8 uppercase tracking-tight">
              {t.premium_feature_ads_desc || 'Learn without interruptions from the wasteland.'}
            </p>
            <div className="bg-slate-900 text-white p-8 rounded-[32px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] border-4 border-slate-900 relative">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center">
                  <X className="w-8 h-8 text-white stroke-[4px]" />
                </div>
                <div className="h-4 w-32 bg-slate-700 rounded-full" />
              </div>
              <div className="space-y-3">
                <div className="h-4 w-full bg-slate-800 rounded-full" />
                <div className="h-4 w-5/6 bg-slate-800 rounded-full" />
                <div className="h-4 w-4/6 bg-slate-800 rounded-full" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 rounded-[28px]">
                <Shield className="w-20 h-20 text-yellow-400 animate-bounce" />
                <span className="absolute bottom-6 font-black uppercase tracking-widest text-yellow-400">Ad Blocked by University</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="hidden lg:block"
          >
            <div className="relative">
              <img 
                src="https://picsum.photos/seed/vault/800/600" 
                alt="Clean Interface" 
                className="rounded-[40px] border-8 border-slate-900 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border-4 border-slate-900 font-black uppercase tracking-tighter rotate-[-6deg]">
                100% FOCUS
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Unlimited Stimpaks Section */}
      <section className="py-24 px-4 bg-slate-50 dark:bg-slate-900 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-black mb-8 uppercase tracking-tighter leading-none italic text-rose-600 dark:text-rose-400">
              {t.premium_feature_hearts || 'Unlimited Medkits'}
            </h2>
            <p className="text-xl md:text-2xl font-bold mb-8 text-slate-600 dark:text-slate-400 uppercase tracking-tight">
              {t.premium_feature_hearts_desc || 'Never run out of energy during your lessons.'}
            </p>
            <div className="flex flex-wrap gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
                  className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center border-2 border-rose-200 dark:border-rose-800"
                >
                  <Heart className="w-8 h-8 text-rose-500 fill-current" />
                </motion.div>
              ))}
              <div className="w-16 h-16 bg-rose-500 rounded-2xl flex items-center justify-center border-2 border-rose-600 shadow-lg">
                <span className="text-white font-black text-2xl">∞</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-white dark:bg-slate-800 p-8 rounded-[40px] shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] border-4 border-slate-900">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 bg-rose-500 rounded-3xl flex items-center justify-center shadow-lg">
                  <Heart className="w-12 h-12 text-white fill-current" />
                </div>
                <div>
                  <h4 className="text-2xl font-black uppercase tracking-tighter">Academic Life Support</h4>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Continuous Energy Regeneration</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between font-black uppercase tracking-tighter">
                  <span>Energy Status</span>
                  <span className="text-rose-500">MAXIMUM</span>
                </div>
                <div className="h-4 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: '30%' }}
                    whileInView={{ width: '100%' }}
                    transition={{ duration: 1.5 }}
                    className="h-full bg-rose-500"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* AI Tutor Section */}
      <section className="py-24 px-4 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="lg:order-2"
          >
            <h2 className="text-4xl md:text-6xl font-black mb-8 uppercase tracking-tighter leading-none italic text-yellow-400">
              {t.premium_feature_ai || 'Advanced AI Tutor'}
            </h2>
            <p className="text-xl md:text-2xl font-bold mb-8 text-slate-300 uppercase tracking-tight">
              {t.premium_feature_ai_desc || 'Get personalized feedback and deep-dive analysis.'}
            </p>
            <ul className="space-y-4 mb-12">
              {[
                'Real-time conversation practice',
                'Deep grammar explanations',
                'Contextual examples for every word',
                'AI-powered error analysis'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-lg font-bold uppercase tracking-tighter">
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="lg:order-1 relative"
          >
            <div className="bg-slate-800 border-8 border-slate-700 rounded-[40px] p-8 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
              <div className="flex items-center gap-4 mb-6 border-b border-slate-700 pb-4">
                <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-slate-900" />
                </div>
                <span className="font-black uppercase tracking-widest text-yellow-400">AI ASSISTANT</span>
              </div>
              <div className="space-y-4">
                <div className="bg-slate-700/50 p-4 rounded-2xl border border-slate-600 self-start max-w-[80%]">
                  <p className="text-sm font-bold uppercase tracking-tight">Why is "the" used here?</p>
                </div>
                <div className="bg-yellow-400 text-slate-900 p-4 rounded-2xl self-end ml-auto max-w-[90%] font-bold">
                  <p className="text-sm uppercase tracking-tighter">In this context, "the" refers to a specific University manual mentioned earlier. This is the definite article usage for previously introduced nouns.</p>
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                <div className="h-2 w-12 bg-yellow-400 rounded-full animate-pulse" />
                <div className="h-2 w-8 bg-yellow-400/50 rounded-full animate-pulse delay-75" />
                <div className="h-2 w-16 bg-yellow-400/30 rounded-full animate-pulse delay-150" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24 px-4 bg-slate-100 dark:bg-slate-900/50 relative z-20">
        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[40px] shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] border-4 border-slate-900">
          <h2 className="text-4xl md:text-6xl font-black text-center mb-16 text-slate-900 dark:text-white uppercase tracking-tighter italic">
            {t.premium_compare_plans || 'Compare Plans'}
          </h2>
          
          <div className="grid grid-cols-3 gap-4 md:gap-8 items-center border-b-4 border-slate-900 pb-8 mb-8">
            <div className="text-slate-500 font-black uppercase tracking-widest text-xs">Features</div>
            <div className="text-center font-black text-slate-900 dark:text-white uppercase tracking-tighter text-xl">{t.premium_compare_free || 'Free'}</div>
            <div className="text-center font-black text-yellow-500 uppercase tracking-tighter text-xl">{t.premium_compare_plus || 'University Premium'}</div>
          </div>

          {[
            { name: t.premium_feature_ads, free: false, plus: true },
            { name: t.premium_feature_hearts, free: false, plus: true },
            { name: t.premium_feature_ai, free: false, plus: true },
            { name: t.premium_feature_mistakes, free: false, plus: true },
            { name: t.premium_feature_streak, free: false, plus: true },
            { name: 'Personalized Goals', free: true, plus: true },
            { name: 'Offline Mode', free: false, plus: true },
            { name: 'Elite Challenges', free: false, plus: true },
          ].map((item, i) => (
            <div key={i} className="grid grid-cols-3 gap-4 md:gap-8 py-6 border-b-2 border-slate-100 dark:border-slate-800 items-center group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors rounded-xl px-4 -mx-4">
              <div className="text-slate-900 dark:text-slate-100 font-bold uppercase tracking-tight text-sm md:text-base">{item.name}</div>
              <div className="flex justify-center">
                {item.free ? <Check className="w-6 h-6 text-emerald-500 stroke-[4px]" /> : <X className="w-6 h-6 text-rose-500/30 stroke-[4px]" />}
              </div>
              <div className="flex justify-center">
                {item.plus ? <Check className="w-8 h-8 text-yellow-500 stroke-[4px]" /> : <X className="w-6 h-6 text-rose-500/30 stroke-[4px]" />}
              </div>
            </div>
          ))}

          <div className="mt-16 text-center">
            <button
              onClick={handleUpgrade}
              disabled={isPremium}
              className="px-16 py-6 bg-yellow-400 hover:bg-yellow-500 text-slate-900 rounded-2xl font-black text-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 uppercase tracking-tighter"
            >
              {isPremium ? t.premium_active : (t.premium_cta_buy || 'Upgrade Now')}
            </button>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-32 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-600 dark:bg-indigo-900 opacity-5" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <Star className="w-16 h-16 text-yellow-400 mx-auto mb-8 animate-pulse" />
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-8 leading-tight">
            Ready to become a Dean?
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-12">
            Join thousands of scholars mastering languages on campus.
          </p>
          <div className="inline-flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-full font-bold text-sm">
              <Zap className="w-4 h-4" />
              {t.premium_save_percent || 'Save 33% with yearly billing'}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
