import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, BookOpen, Search, ChevronRight, Bookmark, Loader2 } from 'lucide-react';
import { DebateTopic, ENCYCLOPEDIA_TOPICS } from '../data/topics'; // Fallback type
import { EncyclopediaRepository } from '../data/encyclopediaRepository';

interface Props {
  onBack: () => void;
}

export const EncyclopediaScreen: React.FC<Props> = ({ onBack }) => {
  const [topics, setTopics] = useState<DebateTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<DebateTopic | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Load Data
  useEffect(() => {
     const loadTopics = async () => {
         setIsLoading(true);
         const data = await EncyclopediaRepository.getAll();
         setTopics(data);
         setIsLoading(false);
     };
     loadTopics();
  }, []);

  const filteredTopics = topics.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = useMemo(() => Array.from(new Set(topics.map(t => t.category))), [topics]);

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-10">
        <button onClick={onBack} className="p-2 rounded-full transition-colors hover:bg-slate-800 text-slate-400 hover:text-white">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-sky-400" />
          Enciclopedia
        </h1>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
             <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin text-sky-500 mb-2" />
                <p>Cargando conocimientos...</p>
            </div>
        ) : (
            <>
                {selectedTopic ? (
                // Topic Detail View
                <div className="max-w-3xl mx-auto p-6 animate-in slide-in-from-right-4 duration-300">
                    <button 
                    onClick={() => setSelectedTopic(null)}
                    className="mb-6 text-sm text-sky-400 hover:text-sky-300 flex items-center gap-1"
                    >
                    <ArrowLeft className="w-4 h-4" /> Volver a la lista
                    </button>
                    
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 mb-4">
                    {selectedTopic.category}
                    </span>
                    
                    <h2 className="text-3xl font-bold text-white mb-2">{selectedTopic.title}</h2>
                    <p className="text-lg text-slate-400 mb-8 border-l-4 border-sky-500 pl-4 italic">
                    {selectedTopic.description}
                    </p>
                    
                    <div className="space-y-4 text-slate-300 leading-relaxed">
                    {selectedTopic.content.map((paragraph, idx) => (
                        <p key={idx} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                        {paragraph}
                        </p>
                    ))}
                    </div>
                </div>
                ) : (
                // Topic List View
                <div className="max-w-3xl mx-auto p-6 space-y-6">
                    
                    {/* Search Bar */}
                    <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input 
                        type="text" 
                        placeholder="Buscar conceptos (ej. ARE, Fiat, Refutación)..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-sky-500 outline-none transition-all placeholder:text-slate-500"
                    />
                    </div>

                    {/* List */}
                    <div className="space-y-8">
                    {categories.map(category => {
                        const categoryTopics = filteredTopics.filter(t => t.category === category);
                        if (categoryTopics.length === 0) return null;

                        return (
                        <div key={category} className="space-y-3">
                            <h3 className="text-sm uppercase tracking-wider font-semibold text-slate-500 ml-1">
                            {category}
                            </h3>
                            <div className="grid gap-3">
                            {categoryTopics.map(topic => (
                                <button
                                key={topic.id}
                                onClick={() => setSelectedTopic(topic)}
                                className="group flex items-center justify-between p-4 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700/80 hover:border-sky-500/50 transition-all text-left shadow-sm"
                                >
                                <div className="flex items-start gap-4">
                                    <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                                    <Bookmark className="w-5 h-5" />
                                    </div>
                                    <div>
                                    <h4 className="font-semibold text-slate-100 group-hover:text-white transition-colors">
                                        {topic.title}
                                    </h4>
                                    <p className="text-sm text-slate-400 line-clamp-1 mt-1">
                                        {topic.description}
                                    </p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-sky-400 transition-colors" />
                                </button>
                            ))}
                            </div>
                        </div>
                        );
                    })}
                    
                    {filteredTopics.length === 0 && (
                        <div className="text-center py-12 text-slate-500">
                        <p>No se encontraron resultados para "{searchTerm}"</p>
                        </div>
                    )}
                    </div>
                </div>
                )}
            </>
        )}
      </div>
    </div>
  );
};