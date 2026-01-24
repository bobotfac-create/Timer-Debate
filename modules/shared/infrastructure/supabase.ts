import { createClient } from '@supabase/supabase-js';

// NOTA PARA EL USUARIO:
// Debes configurar estas variables en tu entorno o reemplazarlas aquí.
// Si no están configuradas, la app usará un modo "mock" (simulado).

const supabaseUrl = process.env.SUPABASE_URL || 'https://cpxhmxtvugnvljknwuqg.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNweGhteHR2dWdudmxqa253dXFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1NTY2OTQsImV4cCI6MjA4MzEzMjY5NH0.lk6HlPsLsQFP_dWaH_Hsn8OUylqEky0EcZ75kkpqnlI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = () => {
  // Verifica si las variables tienen valor, ya sea por env o por fallback
  return !!supabaseUrl && !!supabaseAnonKey && supabaseUrl !== 'undefined' && supabaseAnonKey !== 'undefined';
};