import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, Info, ShieldAlert } from 'lucide-react';
import { useStore } from '../store/useStore';

interface AdBannerProps {
  position?: 'top' | 'bottom' | 'inline';
}

const ADS = [
  {
    id: 1,
    title: 'Nuka-Cola Quantum',
    description: 'Twice the calories, twice the caffeine, twice the taste! Now with more isotopes.',
    image: 'https://picsum.photos/seed/nuka/400/200',
    cta: 'Find in Wasteland',
    color: 'bg-blue-600'
  },
  {
    id: 2,
    title: 'Vault-Tec: A Better Future',
    description: 'Secure your place in a state-of-the-art underground facility today!',
    image: 'https://picsum.photos/seed/vault/400/200',
    cta: 'Reserve Now',
    color: 'bg-yellow-600'
  },
  {
    id: 3,
    title: 'Abraxo Cleaner',
    description: 'The only cleaner you will ever need for those pesky radiation stains.',
    image: 'https://picsum.photos/seed/abraxo/400/200',
    cta: 'Buy Bulk',
    color: 'bg-red-600'
  }
];

export const AdBanner: React.FC<AdBannerProps> = ({ position = 'inline' }) => {
  const { isPremium, buyPremium, globalSettings } = useStore();
  const [isVisible, setIsVisible] = useState(true);
  const [currentAd, setCurrentAd] = useState(ADS[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAd(ADS[Math.floor(Math.random() * ADS.length)]);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  if (isPremium || !isVisible || globalSettings?.hideAds) return null;

  // If custom ad code exists for this position, render it
  if (position === 'inline' && globalSettings?.adCodeSidebar) {
    return (
      <div 
        className="my-6 w-full flex justify-center overflow-hidden"
        dangerouslySetInnerHTML={{ __html: globalSettings.adCodeSidebar }}
      />
    );
  }

  const containerClasses = {
    top: 'fixed top-0 left-0 right-0 z-[100] p-2',
    bottom: 'fixed bottom-0 left-0 right-0 z-[100] p-2',
    inline: 'my-6 w-full'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: position === 'bottom' ? 20 : -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={containerClasses[position]}
      id="ad-banner-container"
    >
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden relative">
        <div className="flex flex-col sm:flex-row">
          {/* Ad Image */}
          <div className="sm:w-1/3 h-32 sm:h-auto relative overflow-hidden">
            <img 
              src={currentAd.image} 
              alt={currentAd.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-2 left-2 bg-black/50 text-[10px] text-white px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">
              Ad
            </div>
          </div>

          {/* Ad Content */}
          <div className="flex-1 p-4 flex flex-col justify-center">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {currentAd.title}
                  <ExternalLink className="w-3 h-3 opacity-50" />
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {currentAd.description}
                </p>
              </div>
              <button 
                onClick={() => setIsVisible(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                title="Close Ad"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between gap-4">
              <button className={`px-4 py-1.5 rounded-lg text-white text-sm font-medium transition-transform active:scale-95 ${currentAd.color}`}>
                {currentAd.cta}
              </button>
              
              <button 
                onClick={buyPremium}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <ShieldAlert className="w-3 h-3" />
                Remove Ads with Premium
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
