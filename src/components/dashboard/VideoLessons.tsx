import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

interface VideoLessonsProps {
  availableVideos: any[];
  uiLang: string;
  t: Record<string, string>;
  watchVideo: () => void;
  addXp: (amount: number) => void;
  addNotification: (message: string, type: string) => void;
}

export const VideoLessons: React.FC<VideoLessonsProps> = ({
  availableVideos,
  uiLang,
  t,
  watchVideo,
  addXp,
  addNotification,
}) => {
  if (availableVideos.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="p-8 relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-xl"
    >
      <div className="flex items-center gap-6 mb-8">
        <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-sm">
          <span className="text-xl">📺</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight uppercase">
            {t.video_lessons || 'Training Modules'}
          </h2>
          <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mt-0.5">
            {t.video_lessons_desc || 'Observe and learn'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {availableVideos.map((video: any) => {
          const title = video.title[uiLang] || video.title.en;
          const description = video.description[uiLang] || video.description.en;
          const url = video.url[uiLang] || video.url.en;

          return (
            <Link
              key={video.id}
              to={url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                watchVideo();
                addXp(10);
                addNotification(t.great_video || 'Video lesson completed! +10 XP', 'success');
              }}
              className="group/video cursor-pointer flex flex-col h-full bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden border border-slate-100 dark:border-slate-800 hover:border-primary/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 shadow-lg"
            >
              <div className="relative aspect-video w-full overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt={title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover/video:scale-110 opacity-70 group-hover/video:opacity-100"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 group-hover/video:bg-black/0 transition-colors flex items-center justify-center">
                  <span className="text-4xl group-hover/video:scale-110 transition-transform">▶</span>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-black text-base text-primary uppercase tracking-tight mb-3 group-hover/video:drop-shadow-[0_0_3px_var(--primary-glow)] transition-colors line-clamp-2 leading-snug">
                  {title}
                </h3>
                <p className="text-[11px] text-primary/60 font-medium flex-1 line-clamp-2 leading-relaxed">
                  {description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
};