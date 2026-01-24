import React from 'react';
import { FormatType } from '../../shared/domain/types';
import { Settings, Users, Mic2, Edit3, Library, BookOpen, Trophy, Lock, LogOut } from 'lucide-react';

interface Props {
  onSelectFormat: (format: FormatType) => void;
  onOpenOptions: () => void;
  onOpenGenerator: () => void;
  onOpenEncyclopedia: () => void;
  onOpenTournaments: () => void;
  isPro: boolean;
  onLogout: () => void;
}

export const FormatSelectionScreen: React.FC<Props> = ({ 
    onSelectFormat, 
    onOpenOptions, 
    onOpenGenerator, 
    onOpenEncyclopedia, 
    onOpenTournaments, 
    isPro,
    onLogout
}) => {

  const containerClass = "bg-slate-900 text-slate-100";
  const titleClass = "text-white font-bold tracking-tight";
  
  // Card styles
  const cardBaseClass = "group relative flex flex-col items-center justify-center p-6 md:p-8 rounded-2xl transition-all duration-300 hover:-translate-y-1 shadow-lg overflow-hidden";
  
  const getCardStyle = (hoverColor: string, locked: boolean) => {
    let style = `${cardBaseClass} `;
    if (locked) {
        style += "bg-slate-800/50 border border-slate-700/50 opacity-75 grayscale cursor-not-allowed";
        return style;
    }
    return `${cardBaseClass} bg-slate-800 border border-slate-700 hover:border-${hoverColor} hover:bg-slate-750 hover:shadow-${hoverColor}/20`;
  };

  const cardWSDC = getCardStyle('sky-500', false);
  const cardBP = getCardStyle('violet-500', false);
  
  // Restricted Cards
  const cardCustom = getCardStyle('emerald-500', !isPro);
  const cardGen = getCardStyle('pink-500', !isPro);
  const cardEnc = getCardStyle('amber-500', !isPro);
  const cardTour = getCardStyle('purple-500', !isPro);

  // Icon Containers
  const getIconContainer = (colorClass: string) => {
    return `bg-${colorClass}/10 p-4 rounded-full mb-4 group-hover:bg-${colorClass}/20 transition-colors`;
  };

  const iconContainerWSDC = getIconContainer('sky-500');
  const iconContainerBP = getIconContainer('violet-500');
  const iconContainerCustom = getIconContainer('emerald-500');
  const iconContainerGen = getIconContainer('pink-500');
  const iconContainerEnc = getIconContainer('amber-500');
  const iconContainerTour = getIconContainer('purple-500');

  const textHeaderClass = "text-xl font-semibold text-white mb-2";
  const optionsBtnClass = "flex items-center gap-2 px-6 py-3 text-slate-400 hover:text-white transition-colors hover:bg-slate-800 rounded-full";

  const renderLock = () => (
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] flex flex-col items-center justify-center z-20">
          <div className="bg-slate-900 p-3 rounded-full border border-slate-700 shadow-xl">
             <Lock className="w-6 h-6 text-slate-400" />
          </div>
          <span className="mt-2 text-xs font-bold uppercase tracking-wider text-white bg-slate-900 px-2 py-1 rounded">Pro Only</span>
      </div>
  );

  return (
    <div className={`h-full w-full overflow-y-auto ${containerClass}`}>
      <div className="min-h-full flex flex-col items-center justify-center p-6 animate-fade-in relative">
        
        {/* User Status Badge */}
        <div className="absolute top-6 right-6 flex items-center gap-3">
             <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${isPro ? 'bg-sky-500/20 border-sky-500 text-sky-400' : 'bg-slate-700/50 border-slate-600 text-slate-400'}`}>
                 {isPro ? 'Pro Member' : 'Invitado'}
             </div>
        </div>

        <h1 className={`text-3xl md:text-5xl mb-2 text-center mt-8 md:mt-0 ${titleClass}`}>
          Debate Timer
        </h1>
        <p className="mb-8 md:mb-10 text-center text-slate-400">
          Selecciona una herramienta para comenzar
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 w-full max-w-sm md:max-w-5xl justify-items-center">
          
          <button onClick={() => onSelectFormat('WSDC')} className={`${cardWSDC} w-full`}>
            <div className={iconContainerWSDC}>
              <Users className="w-8 h-8 text-sky-400" />
            </div>
            <h2 className={textHeaderClass}>WSDC</h2>
            <p className="text-sm text-slate-400 text-center">World Schools Debating Championship</p>
          </button>

          <button onClick={() => onSelectFormat('BP')} className={`${cardBP} w-full`}>
            <div className={iconContainerBP}>
              <Mic2 className="w-8 h-8 text-violet-400" />
            </div>
            <h2 className={textHeaderClass}>BP</h2>
            <p className="text-sm text-slate-400 text-center">British Parliamentary</p>
          </button>

          <button onClick={() => isPro && onSelectFormat('Custom')} className={`${cardCustom} w-full`} disabled={!isPro}>
            {!isPro && renderLock()}
            <div className={iconContainerCustom}>
              <Edit3 className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className={textHeaderClass}>Personalizado</h2>
            <p className="text-sm text-slate-400 text-center">Configura tus tiempos</p>
          </button>

          {/* Row 2 */}
          <button onClick={() => isPro && onOpenGenerator()} className={`${cardGen} w-full`} disabled={!isPro}>
            {!isPro && renderLock()}
            <div className={iconContainerGen}>
              <Library className="w-8 h-8 text-pink-400" />
            </div>
            <h2 className={textHeaderClass}>Mociones</h2>
            <p className="text-sm text-slate-400 text-center">Banco de temas y filtros</p>
          </button>

          <button onClick={() => isPro && onOpenEncyclopedia()} className={`${cardEnc} w-full`} disabled={!isPro}>
            {!isPro && renderLock()}
            <div className={iconContainerEnc}>
              <BookOpen className="w-8 h-8 text-amber-400" />
            </div>
            <h2 className={textHeaderClass}>Enciclopedia</h2>
            <p className="text-sm text-slate-400 text-center">Aprende conceptos de debate</p>
          </button>

          <button onClick={() => isPro && onOpenTournaments()} className={`${cardTour} w-full`} disabled={!isPro}>
            {!isPro && renderLock()}
            <div className={iconContainerTour}>
              <Trophy className="w-8 h-8 text-purple-400" />
            </div>
            <h2 className={textHeaderClass}>Torneos</h2>
            <p className="text-sm text-slate-400 text-center">Calendario de competencias</p>
          </button>
        </div>

        <div className="mt-12 flex gap-4">
            <button onClick={onOpenOptions} className={optionsBtnClass}>
            <Settings className="w-5 h-5" />
            <span>Opciones</span>
            </button>

            <button onClick={onLogout} className="flex items-center gap-2 px-6 py-3 text-slate-400 hover:text-red-400 transition-colors hover:bg-red-900/10 rounded-full border border-transparent hover:border-red-900/30">
                <LogOut className="w-5 h-5" />
                <span>Salir</span>
            </button>
        </div>
      </div>
    </div>
  );
};