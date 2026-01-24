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
    ? "steampunk-wood-bg steampunk-steam text-amber-100 relative overflow-hidden" 
    : "bg-slate-900 text-slate-100";

  const titleClass = isSteampunk
    ? "steampunk-title text-4xl md:text-6xl mb-4"
    : "text-white font-bold tracking-tight text-3xl md:text-5xl";

  const subtitleClass = isSteampunk 
    ? "steampunk-subtitle text-lg md:text-xl mb-8 md:mb-10" 
    : "text-slate-400 mb-8 md:mb-10";

  const cardBaseClass = "group relative flex flex-col items-center justify-center p-6 md:p-8 transition-all duration-300 hover:-translate-y-1";
  
  const cardWSDC = isSteampunk
    ? `${cardBaseClass} steampunk-card`
    : `${cardBaseClass} bg-slate-800 border border-slate-700 rounded-2xl hover:border-sky-500 hover:bg-slate-750 hover:shadow-sky-500/20 shadow-lg`;

  const cardBP = isSteampunk
    ? `${cardBaseClass} steampunk-card`
    : `${cardBaseClass} bg-slate-800 border border-slate-700 rounded-2xl hover:border-violet-500 hover:bg-slate-750 hover:shadow-violet-500/20 shadow-lg`;

  const cardCustom = isSteampunk
    ? `${cardBaseClass} steampunk-card`
    : `${cardBaseClass} bg-slate-800 border border-slate-700 rounded-2xl hover:border-emerald-500 hover:bg-slate-750 hover:shadow-emerald-500/20 shadow-lg`;

  const cardGen = isSteampunk
    ? `${cardBaseClass} steampunk-card`
    : `${cardBaseClass} bg-slate-800 border border-slate-700 rounded-2xl hover:border-pink-500 hover:bg-slate-750 hover:shadow-pink-500/20 shadow-lg`;

  const iconContainerWSDC = isSteampunk 
    ? "steampunk-vacuum-tube p-4 rounded-full mb-4 w-16 h-16 flex items-center justify-center border-2 border-amber-700"
    : "bg-sky-500/10 p-4 rounded-full mb-4 group-hover:bg-sky-500/20 transition-colors";
  
  const iconContainerBP = isSteampunk
    ? "steampunk-vacuum-tube p-4 rounded-full mb-4 w-16 h-16 flex items-center justify-center border-2 border-amber-700"
    : "bg-violet-500/10 p-4 rounded-full mb-4 group-hover:bg-violet-500/20 transition-colors";
  
  const iconContainerCustom = isSteampunk
    ? "steampunk-vacuum-tube p-4 rounded-full mb-4 w-16 h-16 flex items-center justify-center border-2 border-amber-700"
    : "bg-emerald-500/10 p-4 rounded-full mb-4 group-hover:bg-emerald-500/20 transition-colors";

  const iconContainerGen = isSteampunk
    ? "steampunk-vacuum-tube p-4 rounded-full mb-4 w-16 h-16 flex items-center justify-center border-2 border-amber-700"
    : "bg-pink-500/10 p-4 rounded-full mb-4 group-hover:bg-pink-500/20 transition-colors";

  const textHeaderClass = isSteampunk 
    ? "steampunk-title text-xl md:text-2xl mb-2" 
    : "text-xl font-semibold text-white mb-2";
  const textDescClass = isSteampunk 
    ? "steampunk-subtitle text-sm md:text-base text-center" 
    : "text-sm text-slate-400 text-center";

  const optionsBtnClass = isSteampunk
    ? "steampunk-button mt-8 md:mt-12 mb-4 flex items-center gap-2 px-6 py-3 rounded-lg"
    : "mt-8 md:mt-12 mb-4 flex items-center gap-2 px-6 py-3 text-slate-400 hover:text-white transition-colors hover:bg-slate-800 rounded-full";

  return (
    <div className={`h-full w-full overflow-y-auto ${containerClass}`}>
      <div className="min-h-full flex flex-col items-center justify-center p-6 animate-fade-in">
        <h1 className={`text-center mt-4 md:mt-0 ${titleClass}`}>
          {isSteampunk ? "Debate Timer" : "Debate Timer"}
        </h1>
        <p className={`text-center ${subtitleClass}`}>
          {isSteampunk ? "Select a debate format to begin" : "Select a debate format to begin"}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full max-w-sm md:max-w-6xl">
          <button onClick={() => onSelectFormat('WSDC')} className={cardWSDC}>
            <div className={iconContainerWSDC}>
              <Users className={`w-8 h-8 ${isSteampunk ? 'text-amber-200' : 'text-sky-400'}`} />
            </div>
            <h2 className={textHeaderClass}>WSDC</h2>
            <p className={textDescClass}>{isSteampunk ? "World Schools Debating Championship" : "World Schools Debating Championship"}</p>
          </button>

          <button onClick={() => onSelectFormat('BP')} className={cardBP}>
            <div className={iconContainerBP}>
              <Mic2 className={`w-8 h-8 ${isSteampunk ? 'text-amber-200' : 'text-violet-400'}`} />
            </div>
            <h2 className={textHeaderClass}>BP</h2>
            <p className={textDescClass}>{isSteampunk ? "British Parliamentary" : "British Parliamentary"}</p>
          </button>

          <button onClick={() => onSelectFormat('Custom')} className={cardCustom}>
            <div className={iconContainerCustom}>
              <Edit3 className={`w-8 h-8 ${isSteampunk ? 'text-amber-200' : 'text-emerald-400'}`} />
            </div>
            <h2 className={textHeaderClass}>{isSteampunk ? "Personalizado" : "Personalizado"}</h2>
            <p className={textDescClass}>{isSteampunk ? "Configura tus tiempos y discursos" : "Configura tus tiempos"}</p>
          </button>

          {/* New AI Generator Button */}
          <button onClick={onOpenGenerator} className={cardGen}>
            <div className={iconContainerGen}>
              <BrainCircuit className={`w-8 h-8 ${isSteampunk ? 'text-amber-200' : 'text-pink-400'}`} />
            </div>
            <h2 className={textHeaderClass}>{isSteampunk ? "Generador" : "Generador"}</h2>
            <p className={textDescClass}>{isSteampunk ? "Crea mociones con IA" : "Crea mociones con IA"}</p>
          </button>
        </div>

        <button onClick={onOpenOptions} className={optionsBtnClass}>
          <Settings className={`w-5 h-5 ${isSteampunk ? 'steampunk-gear' : ''}`} />
          <span>{isSteampunk ? "Opciones" : "Opciones"}</span>
        </button>
      </div>
    </div>
  );
};