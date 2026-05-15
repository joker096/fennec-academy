import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, MonitorPlay, Search, PlayCircle, Volume2, FastForward, Play, Pause, RotateCcw } from 'lucide-react';
import ReactPlayer from 'react-player';
const Player = ReactPlayer as any;
import { useStore } from '../store/useStore';
import { UI_TRANSLATIONS } from '../data/translations';
import SEO from '../components/SEO';
import { LANGUAGES } from '../data/gameData';
import { VIDEO_LESSONS, VideoLesson } from '../data/videoLessons';
import { motion, AnimatePresence } from 'motion/react';

export default function VideoLessons() {
  const navigate = useNavigate();
  const { uiLang, targetLang, watchVideo, addXp, addNotification } = useStore();
  const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS['en'];
  const currentLang = LANGUAGES.find(l => l.id === targetLang);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<'all' | 'phonetics' | 'grammar' | 'travel' | 'culture'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [activeVideo, setActiveVideo] = useState<VideoLesson | null>(null);
  const [playing, setPlaying] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [muted, setMuted] = useState(false);

  const availableVideos = useMemo(() => {
    return VIDEO_LESSONS.filter(v => v.targetLang === targetLang || v.targetLang === 'all');
  }, [targetLang]);

  const filteredVideos = useMemo(() => {
    return availableVideos.filter(v => {
      const matchesTopic = selectedTopic === 'all' || v.topic === selectedTopic;
      const matchesDifficulty = selectedDifficulty === 'all' || v.difficulty === selectedDifficulty;
      return matchesTopic && matchesDifficulty;
    });
  }, [availableVideos, selectedTopic, selectedDifficulty]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    watchVideo();
    const query = encodeURIComponent(`learn ${currentLang?.name.en} ${searchQuery}`);
    window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
  };

  const curatedTopics = [
    { id: 'phonetics', title: t.topic_phonetics || 'Phonetics', query: 'pronunciation alphabet', color: 'text-emerald-500', icon: MonitorPlay },
    { id: 'grammar', title: t.topic_grammar || 'Grammar', query: 'grammar basics', color: 'text-blue-500', icon: PlayCircle },
    { id: 'routine', title: t.dailyRoutine || 'Routine', query: 'daily routine vocabulary', color: 'text-rose-500', icon: Play },
    { id: 'travel', title: t.topic_travel || 'Expedition', query: 'travel phrases', color: 'text-orange-500', icon: Search },
    { id: 'culture', title: t.topic_culture || 'History', query: 'culture and traditions', color: 'text-amber-500', icon: MonitorPlay },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col font-sans text-slate-900 dark:text-white">
      <SEO 
        title={t.videoLessons} 
        description={t.video_lessons_desc_seo || "Watch educational video lessons to improve your language skills."}
      />
      {/* Header */}
      <header className="h-16 flex items-center px-4 max-w-4xl mx-auto w-full gap-4 border-b border-slate-200 dark:border-slate-800 z-10 relative bg-white dark:bg-slate-800 shadow-sm">
        <button onClick={() => navigate('/')} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
          <X className="w-6 h-6" />
        </button>
        <div className="flex-1 flex items-center gap-4">
          <span className="font-bold text-lg hidden sm:inline uppercase">
            {t.videoLessons}
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8">
        <div className="bg-card p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-border text-center mb-8 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10">
            <h1 className="text-4xl font-display font-black mb-4 text-foreground flex items-center justify-center gap-4 uppercase tracking-tighter">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-3xl flex items-center justify-center shadow-lg border border-primary/20">
                <MonitorPlay className="w-8 h-8" />
              </div>
              {t.videoLessons}
            </h1>
            <p className="text-muted-foreground font-bold text-sm uppercase tracking-widest max-w-2xl mx-auto">
              {t.searchYoutube} {currentLang?.name[uiLang as keyof typeof currentLang.name] || currentLang?.name.en} | ARCHIVE SECTOR 7
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="mb-12 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-secondary border-2 border-border p-4 pl-14 rounded-2xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-all font-bold text-lg shadow-inner"
            />
          </div>
          <button 
            type="submit"
            className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black text-lg shadow-lg hover:bg-primary/90 hover:shadow-primary/20 transition-all flex items-center justify-center gap-2 hover:-translate-y-1 uppercase tracking-tighter"
          >
            <Search className="w-5 h-5" />
            <span className="hidden sm:inline">{t.search}</span>
          </button>
        </form>

        <h2 className="text-xl font-display font-black mb-6 text-foreground uppercase tracking-widest flex items-center gap-2">
          <div className="w-2 h-6 bg-primary rounded-full" />
          {t.curatedTopics}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {curatedTopics.map(topic => (
            <button
              key={topic.id}
              onClick={() => {
                watchVideo();
                const query = encodeURIComponent(`learn ${currentLang?.name.en} ${topic.query}`);
                window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
              }}
              className="bg-card border-2 border-border p-5 rounded-3xl text-left hover:border-primary/50 hover:shadow-xl transition-all group flex justify-between items-center hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-2 opacity-5">
                 <topic.icon className="w-12 h-12" />
              </div>
              <div className="relative z-10">
                <h3 className={`font-black text-lg mb-1 uppercase tracking-tighter ${topic.color}`}>{topic.title}</h3>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{t.youtube_search_label || 'Frequency Search'}</p>
              </div>
              <div className="relative z-10 w-10 h-10 rounded-2xl bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors shadow-sm group-hover:scale-110 border border-border">
                <topic.icon className={`w-5 h-5 group-hover:text-primary transition-colors`} />
              </div>
            </button>
          ))}
        </div>

        {availableVideos.length > 0 && (
          <>
            <div className="flex flex-col gap-6 mb-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-display font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                  <div className="w-2 h-6 bg-amber-500 rounded-full" />
                  {t.handpicked_for_you}
                </h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mr-2">{t.topic_all || 'Department'}:</span>
                  {(['all', 'phonetics', 'grammar', 'travel', 'culture'] as const).map((topicId) => (
                    <button
                      key={topicId}
                      onClick={() => setSelectedTopic(topicId)}
                      className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-all border ${
                        selectedTopic === topicId
                          ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105'
                          : 'bg-card text-muted-foreground border-border hover:border-primary/50'
                      }`}
                    >
                      {topicId === 'all' ? t.all : t[`topic_${topicId}` as keyof typeof t]}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mr-2">{t.difficulty}:</span>
                  {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-all border ${
                        selectedDifficulty === diff
                          ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20 scale-105'
                          : 'bg-card text-muted-foreground border-border hover:border-amber-500/50'
                      }`}
                    >
                      {diff === 'all' ? t.all : t[diff as keyof typeof t]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {filteredVideos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVideos.map(video => {
                  const title = video.title[uiLang as keyof typeof video.title] || video.title.en;
                  const description = video.description[uiLang as keyof typeof video.description] || video.description.en;
                  
                  const difficultyColors = {
                    beginner: 'bg-emerald-500 text-white',
                    intermediate: 'bg-amber-500 text-white',
                    advanced: 'bg-rose-500 text-white'
                  };

                  const topicColors = {
                    phonetics: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
                    grammar: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
                    travel: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
                    culture: 'bg-purple-500/10 text-purple-500 border-purple-500/20'
                  };

                  return (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      key={video.id}
                      onClick={() => {
                        setActiveVideo(video);
                        watchVideo();
                        addXp(10);
                        addNotification(t.greatVideo, 'success');
                      }}
                      className="group cursor-pointer flex flex-col h-full bg-card rounded-[2rem] overflow-hidden border border-border hover:border-primary/50 hover:shadow-2xl hover:-translate-y-1 transition-all"
                    >
                      <div className="relative h-44 w-full overflow-hidden">
                        <img src={video.thumbnail} alt={title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-background/20 group-hover:bg-background/40 transition-colors flex items-center justify-center">
                          <div className="w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-300">
                             <Play className="w-6 h-6 fill-current ml-1" />
                          </div>
                        </div>
                        <div className="absolute bottom-3 right-3 bg-background/80 text-foreground text-[10px] font-black px-2 py-1 rounded-lg backdrop-blur-md border border-border">
                          {video.duration}
                        </div>
                        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                          <div className={`text-[8px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full shadow-lg ${difficultyColors[video.difficulty]}`}>
                            {t[video.difficulty] || video.difficulty}
                          </div>
                          <div className={`text-[8px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full border backdrop-blur-md ${topicColors[video.topic]}`}>
                            {t[`topic_${video.topic}`] || video.topic}
                          </div>
                        </div>
                      </div>
                      <div className="p-6 flex flex-col flex-1">
                        <h3 className="font-black text-lg text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2 uppercase tracking-tighter leading-tight">
                          {title}
                        </h3>
                        <p className="text-xs text-muted-foreground flex-1 line-clamp-3 font-medium leading-relaxed">
                          {description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-secondary p-16 rounded-[3rem] border-2 border-dashed border-border text-center">
                <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-4 border border-border">
                   <MonitorPlay className="w-10 h-10 text-muted-foreground/30" />
                </div>
                <p className="text-muted-foreground font-black uppercase tracking-widest text-sm">
                  {t.no_videos_found || 'No frequencies detected for this filtering criteria.'}
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Video Player Modal */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-800 w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-white dark:bg-slate-800">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center shrink-0">
                    <MonitorPlay className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white truncate">
                    {activeVideo.title[uiLang as keyof typeof activeVideo.title] || activeVideo.title.en}
                  </h3>
                </div>
                <button 
                  onClick={() => setActiveVideo(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Player Container */}
              <div className="relative aspect-video bg-black flex-1">
                <Player
                  url={activeVideo.url[uiLang as keyof typeof activeVideo.url] || activeVideo.url.en}
                  width="100%"
                  height="100%"
                  playing={playing}
                  volume={volume}
                  playbackRate={playbackRate}
                  muted={muted}
                  controls={true}
                  onPlay={() => setPlaying(true)}
                  onPause={() => setPlaying(false)}
                  className="absolute top-0 left-0"
                />
              </div>

              {/* Custom Controls Bar */}
              <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setPlaying(!playing)}
                      className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
                    >
                      {playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                    </button>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setMuted(!muted)}
                        className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-500 transition-colors"
                      >
                        {muted || volume === 0 ? <RotateCcw className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </button>
                      <input 
                        type="range" 
                        min={0} 
                        max={1} 
                        step={0.01} 
                        value={volume} 
                        onChange={(e) => {
                          setVolume(parseFloat(e.target.value));
                          setMuted(false);
                        }}
                        className="w-24 accent-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                      <span className="text-xs font-bold text-slate-400 px-2 uppercase tracking-widest flex items-center gap-1">
                        <FastForward className="w-3 h-3" />
                        {t.speed || 'Speed'}
                      </span>
                      {[0.5, 1, 1.5, 2].map((rate) => (
                        <button
                          key={rate}
                          onClick={() => setPlaybackRate(rate)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            playbackRate === rate 
                              ? 'bg-indigo-500 text-white shadow-sm' 
                              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {activeVideo.description[uiLang as keyof typeof activeVideo.description] || activeVideo.description.en}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
