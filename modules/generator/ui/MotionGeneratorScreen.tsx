import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Search, Filter, Shuffle, Tag, Layers, Bookmark, Loader2, Lock } from 'lucide-react';
import { Motion, MOTIONS_REPOSITORY } from '../data/motions'; // Fallback type
import { MotionsRepository } from '../data/motionsRepository';
import { useAuth } from '../../auth/context/AuthContext';

interface Props {
  onBack: () => void;
}

export const MotionGeneratorScreen: React.FC<Props> = ({ onBack }) => {
  const { isPro } = useAuth();
  const [motions, setMotions] = useState<Motion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('Todos');
  const [selectedType, setSelectedType] = useState<string>('Todos');
  const [randomMotion, setRandomMotion] = useState<Motion | null>(null);

  // Styling Constants
  const containerClass = "bg-slate-900 text-slate-100";
  const headerBgClass = "bg-slate-900/90 border-slate-800";
  const titleClass = "font-bold text-white";
  const inputBgClass = "bg-slate-800 border-slate-700 focus:ring-pink-500 text-white placeholder-slate-500";
  const cardClass = "bg-slate-800 border-slate-700 hover:border-pink-500/30 text-slate-200";
  const accentText = "text-pink-400";
  const btnPrimary = "bg-pink-600 hover:bg-pink-500 text-white shadow-pink-900/20";
  const tagClass = "bg-slate-700 text-slate-300 border-slate-600";
  const modalClass = "bg-gradient-to-br from-pink-900/40 to-slate-800 border-pink-500/50";

  // Load Data
  useEffect(() => {
      if (!isPro) return;
      const loadMotions = async () => {
          setIsLoading(true);
          const data = await MotionsRepository.getAll();
          setMotions(data);
          setIsLoading(false);
      };
      loadMotions();
  }, [isPro]);

  if (!isPro) {
      return (
        <div className={`flex flex-col h-full ${containerClass} overflow-hidden`}>
            <div className={`flex flex-col border-b sticky top-0 z-20 backdrop-blur-md ${headerBgClass}`}>
                <div className="flex items-center justify-between p-6">
                <button onClick={onBack} className="p-2 rounded-full transition-colors hover:bg-slate-800 text-slate-400 hover:text-white">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className={`text-xl flex items-center gap-2 ${titleClass}`}>
                    <Layers className="w-5 h-5 text-pink-400" />
                    Banco de Mociones
                </h1>
                <div className="w-10"></div>
                </div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95">
                 <div className="bg-slate-800 p-6 rounded-full mb-6 relative group">
                    <Layers className="w-12 h-12 text-slate-600 group-hover:text-pink-500 transition-colors" />
                    <div className="absolute -top-2 -right-2 bg-pink-500 rounded-full p-2 border-4 border-slate-900">
                        <Lock className="w-4 h-4 text-white" />
                    </div>
                 </div>
                 <h2 className="text-2xl font-bold text-white mb-2">Acceso Restringido</h2>
                 <p className="text-slate-400 max-w-md mb-8">
                    El generador y banco de mociones es una herramienta exclusiva para usuarios Pro.
                 </p>
                 <div className="px-4 py-2 bg-slate-800 rounded-lg text-sm text-slate-500 border border-slate-700">
                    Plan Pro requerido
                 </div>
            </div>
        </div>
      );
  }

  // Extract unique categories for filters based on LOADED data
  const topics = useMemo(() => ['Todos', ...Array.from(new Set(motions.map(m => m.topic)))], [motions]);
  const types = useMemo(() => ['Todos', ...Array.from(new Set(motions.map(m => m.type)))], [motions]);

  // Filtering Logic
  const filteredMotions = useMemo(() => {
    return motions.filter(motion => {
      const matchesSearch = motion.text.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTopic = selectedTopic === 'Todos' || motion.topic === selectedTopic;
      const matchesType = selectedType === 'Todos' || motion.type === selectedType;
      return matchesSearch && matchesTopic && matchesType;
    });
  }, [searchTerm, selectedTopic, selectedType, motions]);

  const handleRandomMotion = () => {
    if (filteredMotions.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredMotions.length);
      setRandomMotion(filteredMotions[randomIndex]);
    }
  };

  return (
    <div className={`flex flex-col h-full ${containerClass} overflow-hidden`}>
      {/* Header */}
      <div className={`flex flex-col border-b sticky top-0 z-20 backdrop-blur-md ${headerBgClass}`}>
        <div className="flex items-center justify-between p-6">
          <button onClick={onBack} className="p-2 rounded-full transition-colors hover:bg-slate-800 text-slate-400 hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className={`text-xl flex items-center gap-2 ${titleClass}`}>
            <Layers className="w-5 h-5 text-pink-400" />
            Banco de Mociones
          </h1>
          <div className="w-10"></div>
        </div>

        {/* Filters & Search */}
        <div className="px-6 pb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Buscar por palabras clave..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full border rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 ${inputBgClass}`}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {/* Topic Filter */}
            <div className="relative flex-1 min-w-[140px]">
               <select 
                 value={selectedTopic}
                 onChange={(e) => setSelectedTopic(e.target.value)}
                 className={`w-full appearance-none border text-xs rounded-lg px-3 py-2 pr-8 outline-none cursor-pointer focus:ring-2 ${inputBgClass}`}
                 disabled={isLoading}
               >
                 {topics.map(t => <option key={t} value={t}>{t}</option>)}
               </select>
               <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none text-slate-500" />
            </div>

            {/* Type Filter */}
            <div className="relative flex-1 min-w-[140px]">
               <select 
                 value={selectedType}
                 onChange={(e) => setSelectedType(e.target.value)}
                 className={`w-full appearance-none border text-xs rounded-lg px-3 py-2 pr-8 outline-none cursor-pointer focus:ring-2 ${inputBgClass}`}
                 disabled={isLoading}
               >
                 {types.map(t => <option key={t} value={t}>{t}</option>)}
               </select>
               <Tag className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none text-slate-500" />
            </div>

            <button 
              onClick={handleRandomMotion}
              disabled={isLoading || filteredMotions.length === 0}
              className={`flex items-center justify-center gap-1 px-4 py-2 rounded-lg text-xs font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${btnPrimary}`}
            >
              <Shuffle className="w-3 h-3" />
              Aleatoria
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
        
        {/* Random Motion Modal/Overlay */}
        {randomMotion && (
          <div className={`mb-8 p-6 rounded-2xl shadow-xl relative animate-in zoom-in-95 duration-300 ${modalClass}`}>
             <button 
               onClick={() => setRandomMotion(null)}
               className="absolute top-3 right-3 text-xs text-pink-300 hover:text-white"
             >
               Cerrar
             </button>
             <div className="flex items-center gap-2 mb-3">
               <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-pink-500 text-white">
                 Moción Aleatoria
               </span>
             </div>
             <p className="text-xl md:text-2xl font-bold mb-4 leading-relaxed text-white">
               {randomMotion.text}
             </p>
             <div className="flex flex-wrap gap-2 text-xs text-pink-200/70">
                <span className="flex items-center gap-1 px-2 py-1 rounded bg-slate-900/50">
                  <Tag className="w-3 h-3" /> {randomMotion.topic}
                </span>
                <span className="flex items-center gap-1 px-2 py-1 rounded bg-slate-900/50">
                  <Layers className="w-3 h-3" /> {randomMotion.type}
                </span>
             </div>
          </div>
        )}

        {/* List */}
        {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin text-pink-500 mb-2" />
                <p>Cargando mociones...</p>
            </div>
        ) : (
            <div className="space-y-4 max-w-4xl mx-auto">
            <div className="flex items-center justify-between text-xs px-1 text-slate-500">
                <span>{filteredMotions.length} resultados encontrados</span>
                {(selectedTopic !== 'Todos' || selectedType !== 'Todos' || searchTerm !== '') && (
                <button 
                    onClick={() => {setSearchTerm(''); setSelectedTopic('Todos'); setSelectedType('Todos'); setRandomMotion(null);}} 
                    className={`hover:underline ${accentText}`}
                >
                    Limpiar filtros
                </button>
                )}
            </div>

            {filteredMotions.map(motion => (
                <div key={motion.id} className={`border rounded-xl p-5 transition-all shadow-sm hover:shadow-md group ${cardClass}`}>
                <div className="flex items-start justify-between gap-4">
                    <p className="text-lg font-medium transition-colors leading-relaxed text-slate-200 group-hover:text-white">
                        {motion.text}
                    </p>
                    <Bookmark className="w-5 h-5 cursor-pointer shrink-0 transition-colors text-slate-600 hover:text-pink-500" />
                </div>
                
                <div className="flex flex-wrap items-center gap-2 mt-4">
                    <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider border ${tagClass}`}>
                        {motion.difficulty}
                    </span>
                    <div className="w-px h-3 bg-slate-700"></div>
                    <span className="text-xs flex items-center gap-1 text-slate-400">
                        <Tag className="w-3 h-3" /> {motion.topic}
                    </span>
                    <span className="text-xs flex items-center gap-1 text-slate-400">
                        <Layers className="w-3 h-3" /> {motion.type}
                    </span>
                </div>
                </div>
            ))}

            {filteredMotions.length === 0 && (
                <div className="text-center py-20">
                <div className="inline-block p-4 rounded-full mb-4 bg-slate-800">
                    <Search className="w-8 h-8 text-slate-500" />
                </div>
                <p className="text-slate-400">No se encontraron mociones con estos criterios.</p>
                <button 
                    onClick={() => {setSearchTerm(''); setSelectedTopic('Todos'); setSelectedType('Todos');}}
                    className={`mt-4 text-sm font-medium ${accentText}`}
                >
                    Ver todas las mociones
                </button>
                </div>
            )}
            </div>
        )}

      </div>
    </div>
  );
};