import React from 'react';
import { FormatType } from '../types';
import { Settings, Users, Mic2, Edit3 } from 'lucide-react';

interface Props {
  onSelectFormat: (format: FormatType) => void;
  onOpenOptions: () => void;
}

export const FormatSelectionScreen: React.FC<Props> = ({ onSelectFormat, onOpenOptions }) => {
  return (
    <div className="h-full w-full overflow-y-auto bg-slate-900">
      <div className="min-h-full flex flex-col items-center justify-center p-6 animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight text-white text-center mt-4 md:mt-0">Debate Timer</h1>
        <p className="text-slate-400 mb-8 md:mb-10 text-center">Select a debate format to begin</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full max-w-sm md:max-w-4xl">
          <button
            onClick={() => onSelectFormat('WSDC')}
            className="group relative flex flex-col items-center justify-center p-6 md:p-8 bg-slate-800 rounded-2xl border border-slate-700 hover:border-sky-500 hover:bg-slate-750 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-sky-500/20"
          >
            <div className="bg-sky-500/10 p-4 rounded-full mb-4 group-hover:bg-sky-500/20 transition-colors">
              <Users className="w-8 h-8 text-sky-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">WSDC</h2>
            <p className="text-sm text-slate-400 text-center">World Schools Debating Championship</p>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-sky-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <button
            onClick={() => onSelectFormat('BP')}
            className="group relative flex flex-col items-center justify-center p-6 md:p-8 bg-slate-800 rounded-2xl border border-slate-700 hover:border-violet-500 hover:bg-slate-750 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-violet-500/20"
          >
            <div className="bg-violet-500/10 p-4 rounded-full mb-4 group-hover:bg-violet-500/20 transition-colors">
              <Mic2 className="w-8 h-8 text-violet-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">BP</h2>
            <p className="text-sm text-slate-400 text-center">British Parliamentary</p>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <button
            onClick={() => onSelectFormat('Custom')}
            className="group relative flex flex-col items-center justify-center p-6 md:p-8 bg-slate-800 rounded-2xl border border-slate-700 hover:border-emerald-500 hover:bg-slate-750 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-emerald-500/20"
          >
            <div className="bg-emerald-500/10 p-4 rounded-full mb-4 group-hover:bg-emerald-500/20 transition-colors">
              <Edit3 className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Personalizado</h2>
            <p className="text-sm text-slate-400 text-center">Configura tus tiempos y discursos</p>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>

        <button
          onClick={onOpenOptions}
          className="mt-8 md:mt-12 mb-4 flex items-center gap-2 px-6 py-3 text-slate-400 hover:text-white transition-colors hover:bg-slate-800 rounded-full"
        >
          <Settings className="w-5 h-5" />
          <span>Opciones</span>
        </button>
      </div>
    </div>
  );
};