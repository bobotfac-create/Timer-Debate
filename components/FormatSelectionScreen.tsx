import React from 'react';
import { FormatType, Theme } from '../types';
import { Settings, Users, Mic2, Edit3, Sparkles, BrainCircuit } from 'lucide-react';

interface Props {
  onSelectFormat: (format: FormatType) => void;
  onOpenOptions: () => void;
  onOpenGenerator: () => void;
  theme: Theme;
}

export const FormatSelectionScreen: React.FC<Props> = ({ onSelectFormat, onOpenOptions, onOpenGenerator, theme }) => {
  const isSteampunk = theme === 'steampunk';

  // Dynamic styles based on theme
  const containerClass = isSteampunk 
    ? "bg-[url('https://img.freepik.com/free-photo/grunge-paint-background_1409-1337.jpg?w=1380&t=st=1709840000~exp=1709840600~hmac=d4e5f6g7')] bg-cover bg-center text-amber-100" 
    : "bg-slate-900 text-slate-100";

  const titleClass = isSteampunk
    ? "font-['Rye'] text-amber-500 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]"
    : "text-white font-bold tracking-tight";

  const subtitleClass = isSteampunk ? "text-amber-200/80 font-serif italic" : "text-slate-400";

  const cardBaseClass = "group relative flex flex-col items-center justify-center p-6 md:p-8 rounded-2xl transition-all duration-300 hover:-translate-y-1 shadow-lg";
  
  const cardWSDC = isSteampunk
    ? `${cardBaseClass} bg-slate-900/80 border-2 border-amber-700/50 hover:border-amber-500 hover:shadow-amber-500/20 hover:bg-slate-900/90`
    : `${cardBaseClass} bg-slate-800 border border-slate-700 hover:border-sky-500 hover:bg-slate-750 hover:shadow-sky-500/20`;

  const cardBP = isSteampunk
    ? `${cardBaseClass} bg-slate-900/80 border-2 border-amber-700/50 hover:border-amber-500 hover:shadow-amber-500/20 hover:bg-slate-900/90`
    : `${cardBaseClass} bg-slate-800 border border-slate-700 hover:border-violet-500 hover:bg-slate-750 hover:shadow-violet-500/20`;

  const cardCustom = isSteampunk
    ? `${cardBaseClass} bg-slate-900/80 border-2 border-amber-700/50 hover:border-amber-500 hover:shadow-amber-500/20 hover:bg-slate-900/90`
    : `${cardBaseClass} bg-slate-800 border border-slate-700 hover:border-emerald-500 hover:bg-slate-750 hover:shadow-emerald-500/20`;

  const cardGen = isSteampunk
    ? `${cardBaseClass} bg-slate-900/80 border-2 border-amber-700/50 hover:border-amber-500 hover:shadow-amber-500/20 hover:bg-slate-900/90`
    : `${cardBaseClass} bg-slate-800 border border-slate-700 hover:border-pink-500 hover:bg-slate-750 hover:shadow-pink-500/20`;

  const iconContainerWSDC = isSteampunk 
    ? "bg-amber-900/30 p-4 rounded-full mb-4 group-hover:bg-amber-500/20 border border-amber-700/30"
    : "bg-sky-500/10 p-4 rounded-full mb-4 group-hover:bg-sky-500/20 transition-colors";
  
  const iconContainerBP = isSteampunk
    ? "bg-amber-900/30 p-4 rounded-full mb-4 group-hover:bg-amber-500/20 border border-amber-700/30"
    : "bg-violet-500/10 p-4 rounded-full mb-4 group-hover:bg-violet-500/20 transition-colors";
  
  const iconContainerCustom = isSteampunk
    ? "bg-amber-900/30 p-4 rounded-full mb-4 group-hover:bg-amber-500/20 border border-amber-700/30"
    : "bg-emerald-500/10 p-4 rounded-full mb-4 group-hover:bg-emerald-500/20 transition-colors";

  const iconContainerGen = isSteampunk
    ? "bg-amber-900/30 p-4 rounded-full mb-4 group-hover:bg-amber-500/20 border border-amber-700/30"
    : "bg-pink-500/10 p-4 rounded-full mb-4 group-hover:bg-pink-500/20 transition-colors";

  const textHeaderClass = isSteampunk ? "text-xl font-['Rye'] text-amber-100 mb-2 tracking-wide" : "text-xl font-semibold text-white mb-2";
  const textDescClass = isSteampunk ? "text-sm text-amber-200/60 text-center font-serif" : "text-sm text-slate-400 text-center";

  const optionsBtnClass = isSteampunk
    ? "mt-8 md:mt-12 mb-4 flex items-center gap-2 px-6 py-3 text-amber-400 hover:text-amber-100 transition-colors hover:bg-amber-900/40 rounded-full border border-amber-800/50 font-['Rye'] tracking-widest"
    : "mt-8 md:mt-12 mb-4 flex items-center gap-2 px-6 py-3 text-slate-400 hover:text-white transition-colors hover:bg-slate-800 rounded-full";

  return (
    <div className={`h-full w-full overflow-y-auto ${containerClass}`}>
      <div className="min-h-full flex flex-col items-center justify-center p-6 animate-fade-in">
        <h1 className={`text-3xl md:text-5xl mb-2 text-center mt-4 md:mt-0 ${titleClass}`}>
          {isSteampunk ? "Debate Chronometer" : "Debate Timer"}
        </h1>
        <p className={`mb-8 md:mb-10 text-center ${subtitleClass}`}>
          {isSteampunk ? "Select your modality" : "Select a debate format to begin"}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full max-w-sm md:max-w-6xl">
          <button onClick={() => onSelectFormat('WSDC')} className={cardWSDC}>
            <div className={iconContainerWSDC}>
              <Users className={`w-8 h-8 ${isSteampunk ? 'text-amber-500' : 'text-sky-400'}`} />
            </div>
            <h2 className={textHeaderClass}>WSDC</h2>
            <p className={textDescClass}>World Schools Debating Championship</p>
          </button>

          <button onClick={() => onSelectFormat('BP')} className={cardBP}>
            <div className={iconContainerBP}>
              <Mic2 className={`w-8 h-8 ${isSteampunk ? 'text-amber-500' : 'text-violet-400'}`} />
            </div>
            <h2 className={textHeaderClass}>BP</h2>
            <p className={textDescClass}>British Parliamentary</p>
          </button>

          <button onClick={() => onSelectFormat('Custom')} className={cardCustom}>
            <div className={iconContainerCustom}>
              <Edit3 className={`w-8 h-8 ${isSteampunk ? 'text-amber-500' : 'text-emerald-400'}`} />
            </div>
            <h2 className={textHeaderClass}>{isSteampunk ? "Custom" : "Personalizado"}</h2>
            <p className={textDescClass}>{isSteampunk ? "Configure gears & cogs" : "Configura tus tiempos"}</p>
          </button>

          {/* New AI Generator Button */}
          <button onClick={onOpenGenerator} className={cardGen}>
            <div className={iconContainerGen}>
              <BrainCircuit className={`w-8 h-8 ${isSteampunk ? 'text-amber-500' : 'text-pink-400'}`} />
            </div>
            <h2 className={textHeaderClass}>{isSteampunk ? "Automaton" : "Generador"}</h2>
            <p className={textDescClass}>{isSteampunk ? "Steam-powered Motion Generation" : "Crea mociones con IA"}</p>
          </button>
        </div>

        <button onClick={onOpenOptions} className={optionsBtnClass}>
          <Settings className={`w-5 h-5 ${isSteampunk ? 'animate-[spin_10s_linear_infinite]' : ''}`} />
          <span>{isSteampunk ? "Settings" : "Opciones"}</span>
        </button>
      </div>
    </div>
  );
};