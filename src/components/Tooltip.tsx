import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export default function Tooltip({ content, children, position = 'top', delay = 300 }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
  };

  useLayoutEffect(() => {
    if (isVisible) {
      updateCoords();
      window.addEventListener('scroll', updateCoords);
      window.addEventListener('resize', updateCoords);
    }
    return () => {
      window.removeEventListener('scroll', updateCoords);
      window.removeEventListener('resize', updateCoords);
    };
  }, [isVisible]);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  const toggleTooltip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(!isVisible);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const getTooltipStyles = () => {
    if (!triggerRef.current) return {};
    const rect = triggerRef.current.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    switch (position) {
      case 'top':
        return {
          top: rect.top + scrollY - 8,
          left: rect.left + scrollX + rect.width / 2,
          transform: 'translate(-50%, -100%)',
        };
      case 'bottom':
        return {
          top: rect.bottom + scrollY + 8,
          left: rect.left + scrollX + rect.width / 2,
          transform: 'translate(-50%, 0)',
        };
      case 'left':
        return {
          top: rect.top + scrollY + rect.height / 2,
          left: rect.left + scrollX - 8,
          transform: 'translate(-100%, -50%)',
        };
      case 'right':
        return {
          top: rect.top + scrollY + rect.height / 2,
          left: rect.right + scrollX + 8,
          transform: 'translate(0, -50%)',
        };
      default:
        return {};
    }
  };

  return (
    <>
      <div 
        ref={triggerRef}
        className="inline-flex items-center justify-center cursor-help"
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onClick={toggleTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        tabIndex={0}
      >
        {children}
      </div>
      {createPortal(
        <AnimatePresence>
          {isVisible && content && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.1 }}
              style={{
                position: 'absolute',
                zIndex: 99999,
                ...getTooltipStyles(),
              }}
              className="pointer-events-none"
            >
              <div className="bg-slate-900/95 text-slate-100 text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-2xl border border-slate-700/50 w-max max-w-[200px] text-center leading-tight uppercase tracking-widest ring-1 ring-white/10 backdrop-blur-sm">
                {content}
              </div>
              {/* Arrow */}
              <div className={`absolute w-2 h-2 bg-slate-900/95 transform rotate-45 ${
                position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2 border-b border-r border-slate-700/50' :
                position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2 border-t border-l border-slate-700/50' :
                position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2 border-t border-r border-slate-700/50' :
                'left-[-4px] top-1/2 -translate-y-1/2 border-b border-l border-slate-700/50'
              }`} />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
