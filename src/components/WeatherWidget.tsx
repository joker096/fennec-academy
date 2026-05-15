import React from 'react';
import { motion } from 'motion/react';
import { CloudRain, Wind, Sun, Cloud, Zap, AlertTriangle, Thermometer, RefreshCw } from 'lucide-react';
import { useStore } from '../store/useStore';
import { UI_TRANSLATIONS } from '../data/translations';

export default function WeatherWidget() {
  const weather = useStore(state => state.weather);
  const updateWeather = useStore(state => state.updateWeather);
  const uiLang = useStore(state => state.uiLang);
  const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS['en'];

  const weatherConfig = {
    clear: {
      icon: <Sun className="w-5 h-5 text-amber-500" />,
      label: t.weather_clear || 'Clear Skies',
      color: 'text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-900/10',
      border: 'border-amber-100 dark:border-amber-800/50',
      description: t.weather_clear_desc || 'Perfect visibility for scavenging.'
    },
    rain: {
      icon: <CloudRain className="w-5 h-5 text-blue-500" />,
      label: t.weather_rain || 'Rainy',
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-900/10',
      border: 'border-blue-100 dark:border-blue-800/50',
      description: t.weather_rain_desc || 'Damp conditions. Watch your step.'
    },
    dust_storm: {
      icon: <Wind className="w-5 h-5 text-orange-500" />,
      label: t.weather_dust_storm || 'Dust Storm',
      color: 'text-orange-500',
      bg: 'bg-orange-50 dark:bg-orange-900/10',
      border: 'border-orange-100 dark:border-orange-800/50',
      description: t.weather_dust_storm_desc || 'Low visibility. Stay indoors if possible.'
    },
    acid_rain: {
      icon: <Zap className="w-5 h-5 text-emerald-500" />,
      label: t.weather_acid_rain || 'Acid Rain',
      color: 'text-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-900/10',
      border: 'border-emerald-100 dark:border-emerald-800/50',
      description: t.weather_acid_rain_desc || 'Hazardous precipitation! Seek shelter immediately.'
    },
    fog: {
      icon: <Cloud className="w-5 h-5 text-slate-400" />,
      label: t.weather_fog || 'Dense Fog',
      color: 'text-slate-400',
      bg: 'bg-slate-50 dark:bg-slate-900/10',
      border: 'border-slate-100 dark:border-slate-800/50',
      description: t.weather_fog_desc || 'The wasteland is shrouded in mystery.'
    }
  };

  const config = weatherConfig[weather] || weatherConfig.clear;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center gap-4 p-4 rounded-2xl border ${config.bg} ${config.border} transition-all duration-500 relative group shadow-sm`}
    >
      <div className={`p-3 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-inherit relative z-10`}>
        {config.icon}
      </div>
      <div className="flex-1 relative z-10">
        <div className="flex items-center justify-between mb-1">
          <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${config.color}`}>
            {config.label}
          </span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              <Thermometer className="w-3 h-3" />
              24°C
            </div>
            <button 
              onClick={() => updateWeather()}
              className="p-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 hover:text-indigo-500 transition-colors border border-slate-100 dark:border-slate-700 hover:border-indigo-200"
              title="Update Forecast"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 leading-tight uppercase tracking-wider">
          {config.description}
        </p>
      </div>
    </motion.div>
  );
}
