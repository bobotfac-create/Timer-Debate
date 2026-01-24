import { supabase, isSupabaseConfigured } from '../../shared/infrastructure/supabase';
import { Tournament, UPCOMING_TOURNAMENTS } from './tournaments';

export const TournamentsRepository = {
  
  // Obtener torneos desde Supabase
  getAll: async (): Promise<Tournament[]> => {
    if (!isSupabaseConfigured()) {
      console.warn("Supabase no configurado. Usando datos mock.");
      return UPCOMING_TOURNAMENTS;
    }

    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('start_date', { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) return [];

      // Mapear de snake_case (DB) a camelCase (App)
      return data.map((row: any) => ({
        id: row.id.toString(),
        name: row.name,
        startDate: row.start_date,
        endDate: row.end_date,
        format: row.format,
        location: row.location,
        isOnline: row.is_online,
        organizer: row.organizer,
        contact: row.contact
      }));
    } catch (err) {
      console.error("Error fetching tournaments:", err);
      // Fallback a datos locales si falla la DB
      return UPCOMING_TOURNAMENTS;
    }
  },

  // Guardar nuevo torneo en Supabase
  create: async (tournament: Tournament): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      console.warn("Supabase no configurado. Simulación de guardado.");
      return true;
    }

    try {
      // Mapear de camelCase (App) a snake_case (DB)
      const { error } = await supabase
        .from('tournaments')
        .insert([{
            name: tournament.name,
            start_date: tournament.startDate,
            end_date: tournament.endDate,
            format: tournament.format,
            location: tournament.location,
            is_online: tournament.isOnline,
            organizer: tournament.organizer,
            contact: tournament.contact
        }]);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Error creating tournament:", err);
      return false;
    }
  }
};