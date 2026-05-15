import { useEffect, useRef, useMemo, useState } from 'react';
import * as d3 from 'd3';
import { useStore } from '../store/useStore';
import { WORDS_BY_LANG, COURSES_BY_LANG } from '../data/gameData';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Maximize2, 
  Minimize2, 
  Info, 
  Target, 
  BookOpen, 
  Zap, 
  Lock, 
  History, 
  AlertTriangle, 
  Lightbulb, 
  Volume2,
  Newspaper,
  Star,
  Book,
  MessageCircle
} from 'lucide-react';
import { fetchDeepDive, DeepDiveResponse } from '../services/geminiService';
import { UI_TRANSLATIONS, COURSE_TRANSLATIONS } from '../data/translations';
import { playPronunciation } from '../utils/audio';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: 'language' | 'theme' | 'word';
  mastery?: number;
  color?: string;
  wordId?: number;
  translation?: string;
  isMatch?: boolean;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
  value: number;
}

export default function KnowledgeGraph({ searchQuery = '' }: { searchQuery?: string }) {
  const { targetLang, flashcardProgress, uiLang, isPremium } = useStore();
  const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS['en'];
  const ct = COURSE_TRANSLATIONS[uiLang] || COURSE_TRANSLATIONS['en'];
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [deepDive, setDeepDive] = useState<DeepDiveResponse | null>(null);
  const [isFetchingDeepDive, setIsFetchingDeepDive] = useState(false);
  const [examples, setExamples] = useState<any[]>([]);
  const [isFetchingExamples, setIsFetchingExamples] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const addNotification = useStore(state => state.addNotification);
  const saveExample = useStore(state => state.saveExample);
  const savedExamples = useStore(state => state.savedExamples);

  const graphData = useMemo(() => {
    const words = WORDS_BY_LANG[targetLang] || WORDS_BY_LANG['sr'];
    const courses = COURSES_BY_LANG[targetLang] || COURSES_BY_LANG['sr'];
    
    const nodes: Node[] = [];
    const links: Link[] = [];

    // Root node
    nodes.push({ id: 'root', name: targetLang.toUpperCase(), type: 'language', color: '#6366f1' });

    courses.forEach((course: any) => {
      const themeId = `theme-${course.id}`;
      const courseTranslation = ct[course.id] || { title: course.title.split('(')[0].trim() };
      nodes.push({ 
        id: themeId, 
        name: courseTranslation.title, 
        type: 'theme', 
        color: course.color?.replace('bg-[', '').replace(']', '') || '#94a3b8'
      });
      links.push({ source: 'root', target: themeId, value: 2 });

      // Determine words for this theme
      let startIndex = 0;
      let endIndex = 8;
      if (course.id === 1) {
        startIndex = 0;
        endIndex = 8;
      } else {
        startIndex = 8 + (course.id - 2) * 4;
        endIndex = startIndex + 4;
      }

      const themeWords = words.slice(startIndex, endIndex);
      themeWords.forEach((word: any) => {
        const wordId = `word-${word.id}`;
        const key = `${targetLang}_${word.id}`;
        const progress = flashcardProgress[key];
        const mastery = progress?.mastered ? 100 : Math.min(90, (progress?.correctStreak || 0) * 15);
        
        nodes.push({ 
          id: wordId, 
          name: word.word, 
          type: 'word', 
          mastery,
          wordId: word.id,
          translation: word.translations[uiLang] || word.translation,
          isMatch: searchQuery && (
            word.word.toLowerCase().includes(searchQuery.toLowerCase()) || 
            (word.translations[uiLang] || word.translation).toLowerCase().includes(searchQuery.toLowerCase())
          )
        });
        links.push({ source: themeId, target: wordId, value: 1 });
      });
    });

    return { nodes, links };
  }, [targetLang, flashcardProgress, searchQuery, uiLang, ct]);

  const handleDeepDive = async (e: React.MouseEvent, word: string) => {
    e.stopPropagation();
    if (!isPremium) return;
    
    setShowExamples(false);
    setIsFetchingDeepDive(true);
    const res = await fetchDeepDive(word, targetLang, uiLang);
    setDeepDive(res);
    setIsFetchingDeepDive(false);
  };

  const handleShowExamples = async (e: React.MouseEvent, word: string) => {
    e.stopPropagation();
    if (!isPremium) {
      addNotification(t.ai_examples_premium || 'Real-life examples are a Premium feature', 'info');
      return;
    }

    setDeepDive(null);
    setShowExamples(true);
    setIsFetchingExamples(true);
    // We need to import fetchContextualExamples
    const { fetchContextualExamples } = await import('../services/geminiService');
    const res = await fetchContextualExamples(word, targetLang, uiLang);
    setExamples(res);
    setIsFetchingExamples(false);
  };

  useEffect(() => {
    setDeepDive(null);
    setExamples([]);
    setShowExamples(false);
  }, [selectedNode]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = isFullscreen ? window.innerHeight - 100 : 500;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    svg.selectAll('*').remove();

    const g = svg.append('g');

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    const simulation = d3.forceSimulation<Node>(graphData.nodes)
      .force('link', d3.forceLink<Node, Link>(graphData.links).id(d => d.id).distance(d => {
        const target = d.target as Node;
        return target.type === 'theme' ? 100 : 50;
      }))
      .force('charge', d3.forceManyBody().strength(-150))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30));

    const link = g.append('g')
      .attr('stroke', '#94a3b8')
      .attr('stroke-opacity', 0.4)
      .selectAll('line')
      .data(graphData.links)
      .join('line')
      .attr('stroke-width', d => Math.sqrt(d.value) * 2);

    const node = g.append('g')
      .selectAll('g')
      .data(graphData.nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .on('click', (event, d) => {
        setSelectedNode(d);
        event.stopPropagation();
      })
      .call(d3.drag<SVGGElement, Node>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any);

    node.append('circle')
      .attr('r', d => {
        if (d.type === 'language') return 25;
        if (d.type === 'theme') return 18;
        let r = 10 + (d.mastery || 0) / 10;
        if (d.isMatch) r += 5;
        return r;
      })
      .attr('fill', d => {
        if (d.isMatch) return '#f43f5e'; // Highlight color (Rose)
        if (d.type === 'language') return d.color || '#6366f1';
        if (d.type === 'theme') return d.color || '#94a3b8';
        // Color based on mastery
        const mastery = d.mastery || 0;
        if (mastery >= 80) return '#10b981'; // Green
        if (mastery >= 50) return '#f59e0b'; // Amber
        if (mastery > 0) return '#6366f1'; // Indigo
        return '#cbd5e1'; // Gray (unlearned)
      })
      .attr('stroke', d => d.isMatch ? '#fff' : '#fff')
      .attr('stroke-width', d => d.isMatch ? 4 : 2)
      .attr('class', 'transition-all duration-300 hover:stroke-indigo-400');

    node.append('text')
      .attr('dy', d => d.type === 'word' ? 20 : 35)
      .attr('text-anchor', 'middle')
      .attr('font-size', d => {
        if (d.isMatch) return '14px';
        return d.type === 'language' ? '14px' : '10px';
      })
      .attr('font-weight', d => d.isMatch || d.type === 'language' ? 'bold' : 'normal')
      .attr('fill', d => d.isMatch ? '#f43f5e' : 'currentColor')
      .attr('class', 'text-slate-700 dark:text-slate-300 pointer-events-none select-none')
      .text(d => d.name);

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    // Initial zoom to fit
    const initialScale = 0.8;
    svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2 * (1 - initialScale), height / 2 * (1 - initialScale)).scale(initialScale));

    return () => {
      simulation.stop();
    };
  }, [graphData, isFullscreen]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div 
      ref={containerRef} 
      className={`relative bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden transition-all duration-500 ${
        isFullscreen ? 'fixed inset-4 z-50' : 'h-[500px]'
      }`}
      onClick={() => setSelectedNode(null)}
    >
      <div className="absolute top-4 left-6 z-10 flex items-center gap-3">
        <div className="bg-indigo-500 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-display font-bold text-slate-900 dark:text-white">{t.knowledge_graph}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t.visualizing_mastery}</p>
        </div>
      </div>

      <div className="absolute top-4 right-6 z-10 flex gap-2">
        <button 
          onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
          className="p-2 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm"
          title={isFullscreen ? t.minimize : t.maximize}
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>
      </div>

      <svg ref={svgRef} className="w-full h-full" />

      {/* Legend */}
      <div className="absolute bottom-4 left-6 z-10 flex flex-wrap gap-4 bg-white/80 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#10b981]" />
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{t.mastered_80}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{t.learning_50}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#6366f1]" />
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{t.started}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#cbd5e1]" />
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{t.locked}</span>
        </div>
      </div>

      {/* Node Info Overlay */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-20 right-6 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-4 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg ${
                selectedNode.type === 'language' ? 'bg-indigo-100 text-indigo-600' :
                selectedNode.type === 'theme' ? 'bg-slate-100 text-slate-600' :
                'bg-emerald-100 text-emerald-600'
              }`}>
                {selectedNode.type === 'language' ? <Target className="w-5 h-5" /> :
                 selectedNode.type === 'theme' ? <BookOpen className="w-5 h-5" /> :
                 <Info className="w-5 h-5" />}
              </div>
              <button 
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <h4 className="font-bold text-slate-900 dark:text-white mb-1">{selectedNode.name}</h4>
            {selectedNode.translation && (
              <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-1">
                {selectedNode.translation}
              </p>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize mb-3">{selectedNode.type}</p>
            
            {selectedNode.type === 'word' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">{t.mastery_label || 'Mastery'}</span>
                  <span className="font-bold text-indigo-500">{selectedNode.mastery}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 transition-all duration-500"
                    style={{ width: `${selectedNode.mastery}%` }}
                  />
                </div>
                
                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      playPronunciation(selectedNode.name, targetLang);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-xs font-bold"
                  >
                    <Volume2 className="w-4 h-4" />
                    {t.listen}
                  </button>
                  <button 
                    onClick={(e) => handleDeepDive(e, selectedNode.name)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors text-xs font-bold shadow-lg shadow-amber-500/20"
                  >
                    <Zap className="w-4 h-4" />
                    {t.deep_dive}
                  </button>
                </div>

                <button 
                  onClick={(e) => handleShowExamples(e, selectedNode.name)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors text-xs font-bold border border-indigo-100 dark:border-indigo-800/50"
                >
                  <BookOpen className="w-4 h-4" />
                  {t.show_examples || 'Show Real-Life Examples'}
                </button>

                {isFetchingExamples && (
                  <div className="animate-pulse space-y-2 pt-2">
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                  </div>
                )}

                {showExamples && examples.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-4 border-t border-slate-100 dark:border-slate-700 space-y-3"
                  >
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <Newspaper className="w-3 h-3" />
                      {t.real_life_context || 'Real-Life Context'}
                    </div>
                    {examples.map((ex, i) => (
                      <div key={i} className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
                        <p className="text-[11px] font-medium text-slate-900 dark:text-white leading-relaxed mb-1">
                          {ex.sentence}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 italic mb-1">
                          {ex.translation}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-tighter opacity-70">
                            {ex.sourceName}
                          </span>
                          <button 
                            onClick={() => saveExample(selectedNode.name, ex, targetLang)}
                            className={`p-1 rounded transition-colors ${
                              savedExamples.some(s => s.sentence === ex.sentence)
                                ? 'text-amber-500'
                                : 'text-slate-300 hover:text-amber-500'
                            }`}
                          >
                            <Star className={`w-3 h-3 ${savedExamples.some(s => s.sentence === ex.sentence) ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {isFetchingDeepDive && (
                  <div className="animate-pulse space-y-2 pt-2">
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                  </div>
                )}

                {deepDive && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-4 border-t border-slate-100 dark:border-slate-700 space-y-4"
                  >
                    {deepDive.etymology && (
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                          <History className="w-3 h-3" />
                          {t.etymology}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 italic">"{deepDive.etymology}"</p>
                      </div>
                    )}
                    
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
                      <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <Lightbulb className="w-3 h-3" />
                        {t.mnemonic}
                      </div>
                      <p className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">{deepDive.mnemonics}</p>
                    </div>

                    <div>
                      <div className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {t.common_mistakes}
                      </div>
                      <ul className="space-y-1">
                        {deepDive.commonMistakes.slice(0, 2).map((mistake, i) => (
                          <li key={i} className="text-[10px] text-rose-600 dark:text-rose-400">• {mistake}</li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}

                {!deepDive && !isFetchingDeepDive && (
                  <p className="text-xs text-slate-500 italic">
                    {selectedNode.mastery === 0 ? t.not_encountered : 
                     selectedNode.mastery < 50 ? t.keep_practicing :
                     selectedNode.mastery < 80 ? t.getting_good :
                     t.mastered_well}
                  </p>
                )}
              </div>
            )}

            {selectedNode.type === 'theme' && (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t.theme_info}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
