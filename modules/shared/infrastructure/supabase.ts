import { createClient } from '@supabase/supabase-js';

// NOTA PARA EL USUARIO:
// Las credenciales ahora se cargan desde las variables de entorno (Vite).
// Asegúrate de tener un archivo .env con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Se usa una URL placeholder si no hay configuración para evitar errores al importar,
// pero isSupabaseConfigured() devolverá false.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

export const isSupabaseConfigured = () => {
  // Verifica si las variables tienen valor real y no son los placeholders
  return !!supabaseUrl && !!supabaseAnonKey &&
         supabaseUrl !== 'undefined' && supabaseAnonKey !== 'undefined';
};