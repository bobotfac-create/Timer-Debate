import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, MapPin, User, Mail, Globe, Trophy, List, Grid3X3, ExternalLink, Plus, X, Save, CalendarPlus, Loader2, Clock } from 'lucide-react';
import { Tournament } from '../data/tournaments';
import { TournamentsRepository } from '../data/tournamentsRepository';
import { createGoogleCalendarUrl } from '../utils/calendarUrl';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../auth/context/AuthContext';

interface Props {
  onBack: () => void;
}

export const TournamentsScreen: React.FC<Props> = ({ onBack }) => {
  const { user, isPro } = useAuth(); // Check permissions if needed
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, reset } = useForm<Tournament>();

  // URL del Calendario de Google (Iframe)
  const calendarSrc = "https://calendar.google.com/calendar/embed?src=f806d43330fe48597518b21cc55009e09d5e439de28e4dffde2a8472ebdf4a25%40group.calendar.google.com&ctz=America%2FSantiago";

  // Cargar datos al montar
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const data = await TournamentsRepository.getAll();
    setTournaments(data);
    setIsLoading(false);
  };

  const onSubmit = async (data: Tournament) => {
    setIsSaving(true);
    const newTournament: Tournament = {
      ...data,
      id: Date.now().toString(), // Temp ID until refresh
      isOnline: Boolean(data.isOnline)
    };
    
    // 1. Guardar en Base de Datos
    const success = await TournamentsRepository.create(newTournament);
    
    if (success) {
        // 2. Actualizar UI Localmente
        await loadData(); // Recargar para obtener el ID real o asegurar sincronización
        setIsModalOpen(false);
        reset();
        
        // 3. Ofrecer agendar en Google Calendar
        if (confirm("¡Torneo publicado! ¿Quieres abrir Google Calendar para guardarlo en tu agenda personal?")) {
            window.open(createGoogleCalendarUrl(newTournament), '_blank');
        }
    } else {
        alert("Hubo un error al guardar el torneo. Inténtalo de nuevo.");
    }
    setIsSaving(false);
  };

  const openCalendarLink = (t: Tournament) => {
      window.open(createGoogleCalendarUrl(t), '_blank');
  }

  // Helper para formatear fechas visualmente
  const getDateParts = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
        day: date.getDate(),
        month: date.toLocaleString('es-ES', { month: 'short' }).toUpperCase(),
        full: date.toLocaleDateString()
    };
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 overflow-hidden relative">
      {/* Header */}
      <div className="flex flex-col border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center justify-between p-6">
            <button onClick={onBack} className="p-2 rounded-full transition-colors hover:bg-slate-800 text-slate-400 hover:text-white">
            <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-purple-400" />
            Torneos
            </h1>
            <div className="w-10"></div>
        </div>
        
        {/* Actions & Tabs */}
        <div className="px-6 pb-4 space-y-4">
             <div className="flex gap-4">
                <button 
                    onClick={() => setView('list')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${view === 'list' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'}`}
                >
                    <List className="w-4 h-4" /> Lista
                </button>
                <button 
                    onClick={() => setView('calendar')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${view === 'calendar' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'}`}
                >
                    <Grid3X3 className="w-4 h-4" /> Calendario
                </button>
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 relative scroll-smooth">
        
        {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                <p>Cargando torneos...</p>
            </div>
        ) : (
            <>
                {view === 'list' && (
                    <div className="max-w-3xl mx-auto space-y-5 animate-in fade-in slide-in-from-bottom-4 pb-24">
                        {tournaments.map(tournament => {
                            const { day, month } = getDateParts(tournament.startDate);
                            
                            return (
                                <div key={tournament.id} className="group relative bg-slate-800 rounded-2xl border border-slate-700 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-900/20 overflow-hidden">
                                    {/* Decorative Gradient Background (Subtle) */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none transition-opacity group-hover:bg-purple-500/10" />

                                    <div className="p-5 flex flex-col sm:flex-row gap-5">
                                        
                                        {/* Date Box */}
                                        <div className="shrink-0 flex sm:flex-col items-center justify-center w-full sm:w-20 h-14 sm:h-20 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl border border-slate-600 shadow-inner gap-2 sm:gap-0">
                                            <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">{month}</span>
                                            <span className="text-2xl sm:text-3xl font-black text-white leading-none">{day}</span>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            {/* Tags Row */}
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider border ${
                                                    tournament.format === 'BP' 
                                                        ? 'bg-violet-500/10 text-violet-300 border-violet-500/20' 
                                                        : 'bg-sky-500/10 text-sky-300 border-sky-500/20'
                                                }`}>
                                                    {tournament.format}
                                                </span>
                                                {tournament.isOnline ? (
                                                    <span className="px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                                                        <Globe className="w-3 h-3" /> Online
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider bg-slate-700/50 text-slate-400 border border-slate-600 flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" /> Presencial
                                                    </span>
                                                )}
                                            </div>

                                            <h2 className="text-xl font-bold text-white mb-3 truncate pr-4 group-hover:text-purple-400 transition-colors">
                                                {tournament.name}
                                            </h2>

                                            {/* Meta Grid */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm text-slate-400">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                                                    <span className="truncate">{tournament.location}</span>
                                                </div>
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <User className="w-4 h-4 text-slate-500 shrink-0" />
                                                    <span className="truncate">{tournament.organizer}</span>
                                                </div>
                                                <div className="flex items-center gap-2 min-w-0 sm:col-span-2">
                                                    <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                                                    <span className="truncate hover:text-purple-400 transition-colors cursor-pointer">{tournament.contact}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Footer Action */}
                                    <div className="bg-slate-900/30 border-t border-slate-700/50 px-5 py-3 flex justify-between items-center">
                                        <div className="text-xs text-slate-500 font-medium">
                                            Hasta: {getDateParts(tournament.endDate).full}
                                        </div>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); openCalendarLink(tournament); }}
                                            className="text-xs font-bold flex items-center gap-1.5 bg-slate-700 hover:bg-purple-600 hover:text-white text-slate-200 px-3 py-1.5 rounded-lg transition-all shadow-sm"
                                        >
                                            <CalendarPlus className="w-3.5 h-3.5" />
                                            Agendar
                                        </button>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Empty State */}
                        {tournaments.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-16 text-slate-500 border-2 border-dashed border-slate-700 rounded-2xl bg-slate-800/30">
                                <div className="bg-slate-800 p-4 rounded-full mb-4">
                                    <Trophy className="w-8 h-8 text-slate-600" />
                                </div>
                                <p className="font-medium">No hay torneos registrados.</p>
                                <p className="text-sm">Sé el primero en publicar uno.</p>
                            </div>
                        )}
                    </div>
                )}

                {view === 'calendar' && (
                    <div className="max-w-5xl mx-auto h-full flex flex-col animate-in fade-in zoom-in-95 pb-6">
                        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl flex-1 min-h-[500px] relative">
                            <iframe 
                                src={calendarSrc}
                                style={{border: 0}} 
                                className="w-full h-full absolute inset-0 bg-slate-800"
                                frameBorder="0" 
                                scrolling="no"
                                title="Calendario de Torneos"
                            ></iframe>
                        </div>
                        <div className="mt-4 flex justify-between items-center px-2">
                            <p className="text-xs text-slate-500">
                                * Los eventos aquí se actualizan externamente.
                            </p>
                            <a 
                                href="https://calendar.google.com" 
                                target="_blank" 
                                rel="noreferrer"
                                className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 transition-colors"
                            >
                                Abrir en Google <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    </div>
                )}
            </>
        )}

        {/* Floating Action Button */}
        <button 
            onClick={() => setIsModalOpen(true)}
            className="absolute bottom-6 right-6 p-4 bg-purple-600 hover:bg-purple-500 text-white rounded-full shadow-lg shadow-purple-900/40 transition-all hover:scale-110 z-30"
            title="Nuevo Torneo"
        >
            <Plus className="w-6 h-6" />
        </button>

      </div>

      {/* Add Tournament Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
              <div className="bg-slate-800 border border-slate-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative animate-in zoom-in-95">
                  <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                      <X className="w-6 h-6" />
                  </button>
                  
                  <h2 className="text-xl font-bold text-white mb-6">Agregar Nuevo Torneo</h2>
                  
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                      <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">Nombre del Torneo</label>
                          <input 
                            {...register('name', { required: true })} 
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-purple-500 outline-none" 
                            placeholder="Ej: Open de Invierno"
                          />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Inicio</label>
                            <input 
                                type="date"
                                {...register('startDate', { required: true })} 
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-purple-500 outline-none" 
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Fin</label>
                            <input 
                                type="date"
                                {...register('endDate', { required: true })} 
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-purple-500 outline-none" 
                            />
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-medium text-slate-400 mb-1">Formato</label>
                              <select {...register('format')} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-purple-500 outline-none">
                                  <option value="BP">BP</option>
                                  <option value="WSDC">WSDC</option>
                                  <option value="Académico">Académico</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-xs font-medium text-slate-400 mb-1">Ubicación</label>
                              <input 
                                {...register('location')} 
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                placeholder="Ciudad o URL"
                              />
                          </div>
                      </div>

                      <div className="flex items-center gap-2 py-2">
                           <input type="checkbox" {...register('isOnline')} id="isOnline" className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-purple-600 focus:ring-purple-500" />
                           <label htmlFor="isOnline" className="text-sm text-slate-300">Es un torneo Online</label>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-xs font-medium text-slate-400 mb-1">Organizador</label>
                              <input {...register('organizer')} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-purple-500 outline-none" />
                           </div>
                           <div>
                              <label className="block text-xs font-medium text-slate-400 mb-1">Contacto</label>
                              <input {...register('contact')} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-purple-500 outline-none" />
                           </div>
                      </div>

                      <button type="submit" disabled={isSaving} className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mt-4">
                          {isSaving ? <Loader2 className="w-5 h-5 animate-spin"/> : <Save className="w-5 h-5" />}
                          {isSaving ? 'Guardando...' : 'Publicar y Sincronizar'}
                      </button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};