import React from 'react';
import { Speech, TimerState } from '../../shared/domain/types';
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
}) => {

  const containerClass = "bg-slate-900 text-slate-100";
  const headerClass = "bg-slate-900/50";
  const controlsClass = "bg-slate-800/80 border-t border-slate-700/50 backdrop-blur-md";
  const btnControlClass = "bg-slate-700 text-slate-300 hover:bg-white hover:text-black border-slate-600 hover:border-white shadow-lg";
  const btnStopClass = "bg-slate-700 text-slate-300 hover:bg-red-500/10 hover:text-red-500 border-slate-600 hover:border-red-500/50 shadow-lg";

  // Main Play Button Styles
  const mainBtnClass = timerState === 'running' 
       ? "bg-amber-500 hover:bg-amber-600 text-white ring-4 ring-amber-500/20" 
       : "bg-sky-500 hover:bg-sky-600 text-white ring-4 ring-sky-500/20";
  
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getColorClass = () => {
    if (speech.isPrep) return 'text-sky-400';

    const elapsed = totalDuration - currentTime;
    
    // Protected start
    if (!speech.skipInitialBell && elapsed < protectedSeconds) {
       return 'text-sky-400';
    }
    
    // Normal middle
    if (elapsed < totalDuration / 2) return 'text-green-400'; 
    
    // Late middle
    if (currentTime > protectedSeconds) return 'text-yellow-400';
    
    // End protected
    return 'text-red-500';
  };

  const getProgressColor = () => {
    if (speech.isPrep) return 'bg-sky-500';

    const elapsed = totalDuration - currentTime;
    if (!speech.skipInitialBell && elapsed < protectedSeconds) return 'bg-sky-500';

    if (elapsed < totalDuration / 2) return 'bg-green-500';
    if (currentTime > protectedSeconds) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const progressPercentage = ((totalDuration - currentTime) / totalDuration) * 100;
  const colorClass = getColorClass();

  return (
    <div className={`relative flex flex-col h-full overflow-hidden ${containerClass}`}>
      
      {/* Bell Overlay */}
      {bellRungCount > 0 && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 pointer-events-none">
          <div className="px-12 py-8 rounded-3xl shadow-2xl animate-pulse transform scale-110 bg-slate-800 border-2 border-sky-500 text-white">
            <h1 className="text-6xl font-black tracking-wider">
              CAMPANA {bellRungCount > 1 ? `x${bellRungCount}` : ''}
            </h1>
          </div>
        </div>
      )}

      {/* Header */}
      <div className={`flex items-center justify-between p-3 sm:p-6 z-10 shrink-0 ${headerClass}`}>
        <button onClick={onExit} className="p-2 transition-colors text-slate-500 hover:text-white">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="font-medium tracking-wide uppercase text-xs sm:text-sm text-center px-2 truncate max-w-[60%] text-slate-400">
          En curso: <span className="text-white font-bold ml-1">{speech.title}</span>
        </h2>
        <div className="w-10"></div>
      </div>

      {/* Main Timer Display */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-5xl mx-auto px-4 overflow-hidden">
        
        {/* Progress Bar */}
        <div className="w-full max-w-[85%] md:max-w-2xl h-1.5 md:h-2 rounded-full overflow-hidden mb-4 md:mb-12 shadow-inner shrink-0 bg-slate-800">
           <div 
             className={`h-full transition-all duration-1000 ease-linear ${getProgressColor()}`}
             style={{ width: `${progressPercentage}%` }}
           />
        </div>

        {/* Timer Text */}
        <div className={`text-[22vmin] leading-none font-bold tracking-tighter tabular-nums transition-colors duration-500 ${colorClass} drop-shadow-2xl select-none font-mono`}>
          {formatTime(currentTime)}
        </div>
        
        <div className="flex gap-8 mt-4 md:mt-12 shrink-0">
            <div className="text-center">
                <span className="block text-[10px] sm:text-xs uppercase tracking-wider mb-1 text-slate-500">Total</span>
                <span className="text-lg sm:text-xl font-semibold">{formatTime(totalDuration)}</span>
            </div>
            {!speech.isPrep && (
              <div className="text-center">
                  <span className="block text-[10px] sm:text-xs uppercase tracking-wider mb-1 text-slate-500">Protegido</span>
                  <span className="text-lg sm:text-xl font-semibold text-sky-400">{formatTime(protectedSeconds)}</span>
              </div>
            )}
        </div>
      </div>

      {/* Controls Container */}
      <div className={`w-full py-2 pb-6 md:p-8 z-20 shrink-0 transition-all ${controlsClass}`}>
        <div className="max-w-2xl mx-auto flex items-center justify-between sm:justify-center gap-2 sm:gap-8 px-4">
          
          {/* Previous Button */}
          <button 
            onClick={onPrevSpeech}
            disabled={isFirstSpeech}
            className="flex flex-col items-center gap-1 group disabled:opacity-30 disabled:cursor-not-allowed w-14 sm:w-auto"
          >
             <div className={`p-2 md:p-4 rounded-full transition-all border ${btnControlClass}`}>
               <SkipBack className="w-5 h-5 md:w-6 md:h-6 fill-current" />
             </div>
             <span className="text-[9px] sm:text-xs font-medium uppercase tracking-wide text-slate-400 group-hover:text-white">Ant</span>
          </button>

          {/* Stop Button */}
          <button 
            onClick={onStopTimer}
            className="flex flex-col items-center gap-1 group w-14 sm:w-auto"
          >
             <div className={`p-2 md:p-4 rounded-full transition-all border ${btnStopClass}`}>
               <Square className="w-5 h-5 md:w-6 md:h-6 fill-current" />
             </div>
             <span className="text-[9px] sm:text-xs font-medium uppercase tracking-wide text-slate-400 group-hover:text-red-400">Stop</span>
          </button>

          {/* Play/Pause Button */}
          <button 
            onClick={onToggleTimer}
            className={`p-4 md:p-8 rounded-full transition-all active:scale-95 shadow-xl mx-1 sm:mx-4 ${mainBtnClass}`}
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
            className="flex flex-col items-center gap-1 group disabled:opacity-30 disabled:cursor-not-allowed w-14 sm:w-auto"
          >
             <div className={`p-2 md:p-4 rounded-full transition-all border ${btnControlClass}`}>
               <SkipForward className="w-5 h-5 md:w-6 md:h-6 fill-current" />
             </div>
             <span className="text-[9px] sm:text-xs font-medium uppercase tracking-wide text-slate-400 group-hover:text-white">Sig</span>
          </button>
        </div>
      </div>
    </div>
  );
};