import React, { useEffect, useMemo, useState } from 'react';
import { Speech, TimerState } from '../types';
import { Play, Pause, Square, SkipForward, ArrowLeft } from 'lucide-react';

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
  onExit: () => void;
  isLastSpeech: boolean;
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
  onExit,
  isLastSpeech
}) => {

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getColorClass = () => {
    // Logic from prompt:
    // 0 -> Protected Start: Blue
    // Protected Start -> Halftime: Green
    // Halftime -> Protected End: Yellow
    // Protected End -> Finish: Red
    
    // Note: currentTime counts DOWN from totalDuration to 0? Or UP? 
    // Usually debate timers count UP or DOWN. Let's assume COUNT DOWN based on "currentTime" usually implies remaining in many apps, 
    // BUT the prompt describes "progress bar".
    // Let's infer from the colors:
    // "Initial protected" (Blue) -> usually the first minute.
    // "Final protected" (Red) -> usually the last minute.
    
    // If we count DOWN:
    // Total (8:00) -> 7:00 (Blue)
    // 7:00 -> 4:00 (Green)
    // 4:00 -> 1:00 (Yellow)
    // 1:00 -> 0:00 (Red)

    const elapsed = totalDuration - currentTime;
    
    if (elapsed < protectedSeconds) return 'text-sky-400'; // First minute
    if (elapsed < totalDuration / 2) return 'text-green-400'; // Before halftime
    if (currentTime > protectedSeconds) return 'text-yellow-400'; // After halftime, before last minute
    return 'text-red-500'; // Last minute
  };

  const getProgressColor = () => {
    const elapsed = totalDuration - currentTime;
    if (elapsed < protectedSeconds) return 'bg-sky-500';
    if (elapsed < totalDuration / 2) return 'bg-green-500';
    if (currentTime > protectedSeconds) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const progressPercentage = ((totalDuration - currentTime) / totalDuration) * 100;
  const colorClass = getColorClass();

  return (
    <div className="relative flex flex-col h-full bg-slate-900 overflow-hidden">
      
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
      <div className="flex items-center justify-between p-6 z-10">
        <button onClick={onExit} className="p-2 text-slate-500 hover:text-white transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-slate-400 font-medium tracking-wide uppercase text-sm">
          En curso: <span className="text-white font-bold ml-1">{speech.title}</span>
        </h2>
        <div className="w-10"></div>
      </div>

      {/* Main Timer Display */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        {/* Progress Background */}
        <div className="absolute inset-x-8 h-2 bg-slate-800 rounded-full overflow-hidden top-1/2 -translate-y-[150px]">
           <div 
             className={`h-full transition-all duration-1000 ease-linear ${getProgressColor()}`}
             style={{ width: `${progressPercentage}%` }}
           />
        </div>

        <div className={`font-mono text-[12rem] md:text-[16rem] leading-none font-bold tracking-tighter tabular-nums transition-colors duration-500 ${colorClass} drop-shadow-2xl`}>
          {formatTime(currentTime)}
        </div>
        
        <div className="flex gap-8 mt-12">
            <div className="text-center">
                <span className="block text-slate-500 text-xs uppercase tracking-wider mb-1">Total</span>
                <span className="text-xl font-semibold">{Math.floor(totalDuration / 60)} min</span>
            </div>
            <div className="text-center">
                <span className="block text-slate-500 text-xs uppercase tracking-wider mb-1">Protegido</span>
                <span className="text-xl font-semibold text-sky-400">{protectedSeconds / 60} min</span>
            </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-8 pb-12 z-10">
        <div className="flex items-center justify-center gap-6 max-w-2xl mx-auto">
          <button 
            onClick={onStopTimer}
            className="flex flex-col items-center gap-2 group"
          >
             <div className="p-4 rounded-full bg-slate-800 text-slate-300 group-hover:bg-red-500/10 group-hover:text-red-500 transition-all border border-slate-700 group-hover:border-red-500/50">
               <Square className="w-6 h-6 fill-current" />
             </div>
             <span className="text-xs text-slate-500 group-hover:text-red-400">Detener</span>
          </button>

          <button 
            onClick={onToggleTimer}
            className={`p-8 rounded-full transition-all active:scale-95 shadow-xl ${
               timerState === 'running' 
               ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20' 
               : 'bg-sky-500 hover:bg-sky-600 text-white shadow-sky-500/20'
            }`}
          >
            {timerState === 'running' ? (
               <Pause className="w-10 h-10 fill-current" />
            ) : (
               <Play className="w-10 h-10 fill-current ml-1" />
            )}
          </button>

          <button 
            onClick={onNextSpeech}
            disabled={isLastSpeech}
            className="flex flex-col items-center gap-2 group disabled:opacity-30 disabled:cursor-not-allowed"
          >
             <div className="p-4 rounded-full bg-slate-800 text-slate-300 group-hover:bg-white group-hover:text-black transition-all border border-slate-700">
               <SkipForward className="w-6 h-6 fill-current" />
             </div>
             <span className="text-xs text-slate-500 group-hover:text-white">Siguiente</span>
          </button>
        </div>
      </div>
    </div>
  );
};