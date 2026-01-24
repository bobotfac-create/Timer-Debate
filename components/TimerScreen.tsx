import React, { useEffect, useMemo, useState } from 'react';
import { Speech, TimerState, Theme } from '../types';
import { Play, Pause, Square, SkipForward, ArrowLeft, SkipBack } from 'lucide-react';

interface Props {
  speech: Speech;
  timerState: TimerState;
  currentTime: number;
  totalDuration: number;
  protectedSeconds: number;
  bellRungCount: number;
  onToggleTimer: () => void;
  onStopTimer: () => void;
  onNextSpeech: () => void;
  onPrevSpeech: () => void;
  onExit: () => void;
  isLastSpeech: boolean;
  isFirstSpeech: boolean;
  theme: Theme;
}

export const TimerScreen: React.FC<Props> = ({
  speech,
  timerState,
  currentTime,
  totalDuration,
  protectedSeconds,
  bellRungCount,
  onToggleTimer,
  onStopTimer,
  onNextSpeech,
  onPrevSpeech,
  onExit,
  isLastSpeech,
  isFirstSpeech,
  theme
}) => {
  const isSteampunk = theme === 'steampunk';

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getColorClass = () => {
    if (speech.isPrep) return 'text-sky-400';

    const elapsed = totalDuration - currentTime;
    
    // Only highlight start protected time if the bell isn't skipped
    if (!speech.skipInitialBell && elapsed < protectedSeconds) return 'text-sky-400';
    
    if (elapsed < totalDuration / 2) return 'text-green-400'; // Before halftime
    if (currentTime > protectedSeconds) return 'text-yellow-400'; // After halftime, before last minute
    return 'text-red-500'; // Last minute
  };

  const getProgressColor = () => {
    if (speech.isPrep) return 'bg-sky-500';

    const elapsed = totalDuration - currentTime;
    // Only highlight start protected time if the bell isn't skipped
    if (!speech.skipInitialBell && elapsed < protectedSeconds) return 'bg-sky-500';

    if (elapsed < totalDuration / 2) return 'bg-green-500';
    if (currentTime > protectedSeconds) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const progressPercentage = ((totalDuration - currentTime) / totalDuration) * 100;
  const colorClass = getColorClass();

  const containerClass = isSteampunk 
    ? "relative flex flex-col h-full steampunk-wood-bg steampunk-steam overflow-hidden"
    : "relative flex flex-col h-full bg-slate-900 overflow-hidden";

  const headerClass = isSteampunk
    ? "flex items-center justify-between p-3 sm:p-6 z-10 shrink-0 steampunk-panel"
    : "flex items-center justify-between p-3 sm:p-6 z-10 shrink-0 bg-slate-900/50";

  const timerDisplayClass = isSteampunk
    ? `steampunk-display font-mono text-[22vmin] leading-none font-bold tracking-tighter tabular-nums transition-colors duration-500 ${colorClass}`
    : `font-mono text-[22vmin] leading-none font-bold tracking-tighter tabular-nums transition-colors duration-500 ${colorClass} drop-shadow-2xl select-none`;

  const progressBarClass = isSteampunk
    ? "w-full max-w-[85%] md:max-w-2xl h-2 md:h-3 steampunk-pipe rounded-full overflow-hidden mb-4 md:mb-12 shadow-inner shrink-0"
    : "w-full max-w-[85%] md:max-w-2xl h-1.5 md:h-2 bg-slate-800 rounded-full overflow-hidden mb-4 md:mb-12 shadow-inner shrink-0";

  const mainButtonClass = isSteampunk
    ? `steampunk-button p-4 md:p-8 rounded-full transition-all active:scale-95 mx-1 sm:mx-4 ${
        timerState === 'running' 
        ? 'ring-2 sm:ring-4 ring-amber-500/20' 
        : 'ring-2 sm:ring-4 ring-sky-500/20'
      }`
    : `p-4 md:p-8 rounded-full transition-all active:scale-95 shadow-xl shadow-black/20 mx-1 sm:mx-4 ${
        timerState === 'running' 
        ? 'bg-amber-500 hover:bg-amber-600 text-white ring-2 sm:ring-4 ring-amber-500/20' 
        : 'bg-sky-500 hover:bg-sky-600 text-white ring-2 sm:ring-4 ring-sky-500/20'
      }`;

  const controlsContainerClass = isSteampunk
    ? "w-full steampunk-panel py-2 pb-6 md:p-8 z-20 shrink-0 transition-all"
    : "w-full bg-slate-800/80 backdrop-blur-md border-t border-slate-700/50 py-2 pb-6 md:p-8 z-20 shrink-0 transition-all";

  return (
    <div className={containerClass}>
      
      {/* Bell Overlay */}
      {bellRungCount > 0 && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 pointer-events-none">
          <div className="bg-slate-800 border-2 border-sky-500 text-white px-12 py-8 rounded-3xl shadow-2xl animate-pulse transform scale-110">
            <h1 className="text-6xl font-black tracking-wider">
              CAMPANA {bellRungCount > 1 ? `x${bellRungCount}` : ''}
            </h1>
          </div>
        </div>
      )}

      {/* Header */}
      <div className={headerClass}>
        <button onClick={onExit} className={`p-2 transition-colors ${isSteampunk ? 'text-amber-200 hover:text-amber-100' : 'text-slate-500 hover:text-white'}`}>
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className={`font-medium tracking-wide uppercase text-xs sm:text-sm text-center px-2 truncate max-w-[60%] ${isSteampunk ? 'steampunk-subtitle' : 'text-slate-400'}`}>
          {isSteampunk ? 'Temporizador de Debate' : 'En curso:'} {!isSteampunk && <span className="text-white font-bold ml-1">{speech.title}</span>}
        </h2>
        {isSteampunk && (
          <div className="flex items-center gap-2">
            <div className="steampunk-vacuum-tube w-8 h-8 rounded-full"></div>
            <div className="steampunk-vacuum-tube w-8 h-8 rounded-full"></div>
          </div>
        )}
        {!isSteampunk && <div className="w-10"></div>}
      </div>

      {/* Main Timer Display */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-5xl mx-auto px-4 overflow-hidden">
        
        {/* Progress Bar moved into flow to avoid layout issues on small screens */}
        <div className={progressBarClass}>
           <div 
             className={`h-full transition-all duration-1000 ease-linear ${getProgressColor()}`}
             style={{ width: `${progressPercentage}%` }}
           />
        </div>

        {/* Timer Circle with Steampunk Style */}
        {isSteampunk && (
          <div className="relative mb-4">
            <div className="steampunk-panel rounded-full p-8 md:p-12">
              <div className={timerDisplayClass}>
                {formatTime(currentTime)}
              </div>
            </div>
            <div className="absolute -top-4 -right-4 steampunk-gear">
              <div className="steampunk-gauge w-16 h-16"></div>
            </div>
          </div>
        )}

        {/* Responsive Text Size using vmin to fit both portrait and landscape */}
        {!isSteampunk && (
          <div className={timerDisplayClass}>
            {formatTime(currentTime)}
          </div>
        )}

        {/* Round and Speech Info */}
        {isSteampunk && (
          <div className="steampunk-panel mt-4 px-6 py-3 text-center">
            <div className="steampunk-subtitle text-sm md:text-base mb-2">
              ROUND 1: {speech.title.toUpperCase()}
            </div>
            <div className="text-amber-200 font-mono text-xs md:text-sm">
              {formatTime(totalDuration - currentTime)} / {formatTime(totalDuration)}
            </div>
          </div>
        )}
        
        {!isSteampunk && (
          <div className="flex gap-8 mt-4 md:mt-12 shrink-0">
              <div className="text-center">
                  <span className="block text-slate-500 text-[10px] sm:text-xs uppercase tracking-wider mb-1">Total</span>
                  <span className="text-lg sm:text-xl font-semibold">{formatTime(totalDuration)}</span>
              </div>
              {!speech.isPrep && (
                <div className="text-center">
                    <span className="block text-slate-500 text-[10px] sm:text-xs uppercase tracking-wider mb-1">Protegido</span>
                    <span className="text-lg sm:text-xl font-semibold text-sky-400">{formatTime(protectedSeconds)}</span>
                </div>
              )}
          </div>
        )}

        {isSteampunk && (
          <div className="flex gap-4 mt-6 shrink-0">
            <div className="steampunk-pipe px-4 py-2 text-center">
              <div className="steampunk-subtitle text-[10px] uppercase tracking-wider mb-1">SPEAKER: TEAM A</div>
            </div>
            <div className="steampunk-pipe px-4 py-2 text-center">
              <div className="steampunk-subtitle text-[10px] uppercase tracking-wider mb-1">OPPONENT: TEAM B</div>
            </div>
          </div>
        )}
      </div>

      {/* Controls Container with Backdrop for Mobile Visibility */}
      {/* Reduced padding for better landscape view */}
      <div className={controlsContainerClass}>
        <div className="max-w-2xl mx-auto flex items-center justify-between sm:justify-center gap-2 sm:gap-8 px-4">
          
          {/* Previous Button */}
          <button 
            onClick={onPrevSpeech}
            disabled={isFirstSpeech}
            className={`flex flex-col items-center gap-1 group disabled:opacity-30 disabled:cursor-not-allowed w-14 sm:w-auto ${isSteampunk ? 'steampunk-button' : ''}`}
          >
             <div className={`p-2 md:p-4 rounded-full transition-all shadow-lg ${isSteampunk ? 'steampunk-panel' : 'bg-slate-700 text-slate-300 group-hover:bg-white group-hover:text-black border border-slate-600'}`}>
               <SkipBack className={`w-5 h-5 md:w-6 md:h-6 ${isSteampunk ? 'text-amber-200' : 'fill-current'}`} />
             </div>
             <span className={`text-[9px] sm:text-xs font-medium uppercase tracking-wide ${isSteampunk ? 'steampunk-subtitle' : 'text-slate-400 group-hover:text-white'}`}>Ant</span>
          </button>

          {/* Stop Button */}
          <button 
            onClick={onStopTimer}
            className={`flex flex-col items-center gap-1 group w-14 sm:w-auto ${isSteampunk ? 'steampunk-button' : ''}`}
          >
             <div className={`p-2 md:p-4 rounded-full transition-all shadow-lg ${isSteampunk ? 'steampunk-panel' : 'bg-slate-700 text-slate-300 group-hover:bg-red-500/10 group-hover:text-red-500 border border-slate-600 group-hover:border-red-500/50'}`}>
               <Square className={`w-5 h-5 md:w-6 md:h-6 ${isSteampunk ? 'text-amber-200' : 'fill-current'}`} />
             </div>
             <span className={`text-[9px] sm:text-xs font-medium uppercase tracking-wide ${isSteampunk ? 'steampunk-subtitle' : 'text-slate-400 group-hover:text-red-400'}`}>RESET</span>
          </button>

          {/* Play/Pause Button - Main Action - Reduced Size */}
          <button 
            onClick={onToggleTimer}
            className={mainButtonClass}
          >
            {timerState === 'running' ? (
               <Pause className="w-6 h-6 md:w-10 md:h-10 fill-current" />
            ) : (
               <Play className="w-6 h-6 md:w-10 md:h-10 fill-current ml-1" />
            )}
          </button>

          {/* Next Button */}
          <button 
            onClick={onNextSpeech}
            disabled={isLastSpeech}
            className={`flex flex-col items-center gap-1 group disabled:opacity-30 disabled:cursor-not-allowed w-14 sm:w-auto ${isSteampunk ? 'steampunk-button' : ''}`}
          >
             <div className={`p-2 md:p-4 rounded-full transition-all shadow-lg ${isSteampunk ? 'steampunk-panel' : 'bg-slate-700 text-slate-300 group-hover:bg-white group-hover:text-black border border-slate-600'}`}>
               <SkipForward className={`w-5 h-5 md:w-6 md:h-6 ${isSteampunk ? 'text-amber-200' : 'fill-current'}`} />
             </div>
             <span className={`text-[9px] sm:text-xs font-medium uppercase tracking-wide ${isSteampunk ? 'steampunk-subtitle' : 'text-slate-400 group-hover:text-white'}`}>Sig</span>
          </button>
        </div>

        {/* Steampunk Pressure Gauge */}
        {isSteampunk && (
          <div className="mt-4 flex justify-center">
            <div className="steampunk-pipe px-6 py-2 text-center">
              <div className="steampunk-subtitle text-xs">DEBATE PRESSURE: OPTIMAL</div>
              <div className="steampunk-gauge mx-auto mt-2"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};