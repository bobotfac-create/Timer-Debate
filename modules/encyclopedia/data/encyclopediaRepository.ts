import { supabase, isSupabaseConfigured } from '../../shared/infrastructure/supabase';
import { DebateTopic, ENCYCLOPEDIA_TOPICS } from './topics';

export const EncyclopediaRepository = {
  getAll: async (): Promise<DebateTopic[]> => {
    if (!isSupabaseConfigured()) {
      return ENCYCLOPEDIA_TOPICS;
    }

    try {
      const { data, error } = await supabase
        .from('encyclopedia')
        .select('*');

      if (error) throw error;

      if (!data || data.length === 0) return ENCYCLOPEDIA_TOPICS;

      return data.map((row: any) => ({
        id: row.id.toString(),
        title: row.title,
        category: row.category,
        description: row.description,
        content: row.content // Assumes DB stores this as text[] (Postgres Array)
      }));
    } catch (err) {
      console.error("Error fetching encyclopedia:", err);
      return ENCYCLOPEDIA_TOPICS;
    }
  }
};