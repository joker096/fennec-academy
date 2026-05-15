import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { MapPin, Lock, CheckCircle2, Zap, Star, Shield, BookOpen, MessageSquare, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';
import Tooltip from './Tooltip';
import { useStore } from '../store/useStore';
import { UI_TRANSLATIONS } from '../data/translations';

interface MapNode {
  id: string;
  x: number;
  y: number;
  label: string;
  path: string;
  icon: React.ReactNode;
  isUnlocked: boolean;
  isCompleted: boolean;
  isCurrent: boolean;
}

interface LearningPathMapProps {
  nodes: MapNode[];
  onNodeClick?: (nodeId: string) => void;
  className?: string;
}

export default function LearningPathMap({ nodes, onNodeClick, className = '' }: LearningPathMapProps) {
  const uiLang = useStore(state => state.uiLang);
  const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS['en'] || {};

  // Calculate dynamic map height based on nodes
  const maxY = useMemo(() => Math.max(...nodes.map(n => n.y), 100), [nodes]);
  const viewBoxHeight = maxY + 15; // padding at bottom

  // Generate modern grid with coordinate labels
  const gridLines = useMemo(() => {
    const lines = [];
    const labels = [];
    const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    
    // Grid rows based on viewBoxHeight
    const step = 20;
    const numRows = Math.ceil(viewBoxHeight / step);
    
    for (let i = 0; i <= numRows; i++) {
      const pos = i * step;
      lines.push(
        <line 
          key={`h-${i}`} 
          x1="0" y1={pos} 
          x2="100" y2={pos} 
          className="stroke-slate-200 dark:stroke-slate-800"
          strokeWidth="0.5" 
          strokeOpacity="0.2"
        />
      );
    }
    
    for (let i = 0; i <= 10; i++) {
      const pos = i * 10;
      lines.push(
        <line 
          key={`v-${i}`} 
          x1={pos} y1="0" 
          x2={pos} y2={viewBoxHeight} 
          className="stroke-slate-200 dark:stroke-slate-800"
          strokeWidth="0.5" 
          strokeOpacity="0.2"
        />
      );
    }
    return { lines, labels };
  }, [viewBoxHeight]);

  // Generate curved path for connections
  const connectorPath = useMemo(() => {
    if (nodes.length < 2) return '';
    let d = `M ${nodes[0].x} ${nodes[0].y}`;
    for (let i = 0; i < nodes.length - 1; i++) {
      const curr = nodes[i];
      const next = nodes[i + 1];
      // Use smoother bezier values
      const cp1x = curr.x;
      const cp1y = (curr.y + next.y) / 2;
      const cp2x = next.x;
      const cp2y = (curr.y + next.y) / 2;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
    }
    return d;
  }, [nodes]);

  return (
    <div className={`relative bg-slate-50 dark:bg-slate-950 rounded-[3rem] border-2 border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl transition-all ${className}`}>
      
      {/* Scrollable Container */}
      <div className="absolute inset-0 overflow-y-auto custom-scrollbar overflow-x-hidden">
        <div 
          className="relative w-full"
          style={{ height: `${(viewBoxHeight / 100) * 100}%`, minHeight: '100%' }}
        >
          {/* Background Decor */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--color-primary) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
          
          <svg 
            className="absolute inset-0 w-full" 
            style={{ height: '100%' }}
            viewBox={`0 0 100 ${viewBoxHeight}`} 
            preserveAspectRatio="xMidYMin slice"
          >
            {gridLines.lines}
            
            {/* Connection Shadows/Glows */}
            <path 
              d={connectorPath}
              fill="none"
              className="stroke-slate-200 dark:stroke-slate-800/50"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.3"
            />
            
            {/* Draw connectors with a smooth cubic bezier path */}
            <path 
              d={connectorPath}
              fill="none"
              className="stroke-slate-200 dark:stroke-slate-800"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Progress path highlight */}
            <motion.path 
              d={connectorPath}
              fill="none"
              className="stroke-primary"
              strokeWidth="1.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2.5, ease: "easeInOut" }}
              style={{ filter: 'drop-shadow(0 0 12px var(--primary-glow))' }}
            />
            
            {/* Animated pulse along the line */}
            <motion.path 
              d={connectorPath}
              fill="none"
              className="stroke-white dark:stroke-primary opacity-40"
              strokeWidth="2.5"
              strokeDasharray="0.5 15"
              strokeLinecap="round"
              animate={{ strokeDashoffset: [30, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          </svg>

          {/* Nodes Layer - using coordinates in the same space as viewBox */}
          <div className="absolute inset-0">
            {nodes.map((node) => (
              <motion.div
                key={node.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 20, stiffness: 120 }}
                style={{ 
                  left: `${node.x}%`, 
                  top: `${(node.y / viewBoxHeight) * 100}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                className="absolute z-20"
              >
            <div className="relative">
              <Tooltip content={node.label}>
                <Link 
                  to={node.path}
                  onClick={() => onNodeClick?.(node.id)}
                  className={`
                    relative flex items-center justify-center w-10 h-10 md:w-14 md:h-14 rounded-2xl border-2 transition-all cursor-pointer group hover:scale-110 active:scale-95
                    ${node.isCompleted 
                      ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/20' 
                      : node.isCurrent 
                        ? 'bg-primary border-primary/50 text-white shadow-xl shadow-primary/30 ring-4 ring-primary/10' 
                        : node.isUnlocked 
                          ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-primary/50 hover:shadow-lg' 
                          : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-300 cursor-not-allowed opacity-30 shadow-inner'}
                  `}
                >
                  {!node.isUnlocked && <Lock className="absolute -top-1 -right-1 w-3.5 h-3.5 text-slate-400 bg-white dark:bg-slate-800 rounded-lg p-0.5 shadow-sm border border-slate-100 dark:border-slate-700" />}
                  {node.isCompleted && <CheckCircle2 className="absolute -top-1 -right-1 w-4.5 h-4.5 text-white bg-emerald-500 rounded-full p-0.5 border-2 border-white dark:border-slate-900 shadow-sm" />}
                  
                  <div className="relative z-10 group-hover:rotate-6 transition-transform duration-300">
                    {React.isValidElement(node.icon) ? React.cloneElement(node.icon as React.ReactElement<any>, { 
                      className: `${(node.icon.props as any).className || ''} w-5 h-5 md:w-6 md:h-6`
                    }) : node.icon}
                  </div>

                  {/* Outer Glow for current */}
                  {node.isCurrent && (
                    <motion.div 
                      animate={{ scale: [1, 1.4], opacity: [0.4, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 rounded-[1.5rem] bg-primary pointer-events-none"
                    />
                  )}
                  
                  {/* Modern Indicator Dot */}
                  {node.isUnlocked && !node.isCompleted && !node.isCurrent && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-white dark:border-slate-800 shadow-sm" />
                  )}
                </Link>
              </Tooltip>
              
              {/* Topic Label below the node */}
              <div className={`
                absolute top-full left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border transition-all pointer-events-none
                ${node.isCurrent 
                  ? 'bg-primary/10 text-primary border-primary/20 opacity-100 scale-110 shadow-sm' 
                  : node.isUnlocked 
                    ? 'bg-white/80 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 opacity-80' 
                    : 'opacity-0'}
              `}>
                {node.label}
              </div>
            </div>
          </motion.div>
        ))}
          </div>

          {/* Modern Status HUD - Move outside sizer to stay fixed if needed, or keep inside if part of map */}
        </div>
      </div>

      {/* Floating HUD at the bottom of the map container */}
      <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end pointer-events-none z-30">
        <div className="flex flex-col gap-2">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50 flex items-center gap-2 shadow-xl">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[9px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest leading-none">
               {t.nav_map_active || 'Roadmap Active'}
            </span>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10 text-[9px] font-mono text-white/60 font-bold uppercase tracking-tighter hidden md:block">
           {nodes.length}_MODULES
        </div>
      </div>
    </div>
  );
}
