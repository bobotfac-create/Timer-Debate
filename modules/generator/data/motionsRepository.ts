import { supabase, isSupabaseConfigured } from '../../shared/infrastructure/supabase';
import { Motion, MOTIONS_REPOSITORY } from './motions';

export const MotionsRepository = {
  getAll: async (): Promise<Motion[]> => {
    if (!isSupabaseConfigured()) {
      return MOTIONS_REPOSITORY;
    }

    try {
      const { data, error } = await supabase
        .from('motions')
        .select('*');

      if (error) throw error;

      if (!data || data.length === 0) return MOTIONS_REPOSITORY;

      // Mapear snake_case (DB) a la estructura de la App
      return data.map((row: any) => ({
        id: row.id.toString(),
        text: row.text,
        topic: row.topic,
        type: row.type,
        difficulty: row.difficulty
      }));
    } catch (err) {
      console.error("Error fetching motions:", err);
      return MOTIONS_REPOSITORY;
    }
  },

  // Función opcional por si quieres añadir un botón para guardar mociones generadas por IA
  create: async (motion: Omit<Motion, 'id'>): Promise<boolean> => {
     if (!isSupabaseConfigured()) return false;
     
     const { error } = await supabase.from('motions').insert([{
         text: motion.text,
         topic: motion.topic,
         type: motion.type,
         difficulty: motion.difficulty
     }]);
     
     return !error;
  }
};