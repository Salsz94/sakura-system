import { createClient } from '@supabase/supabase-js';

// Único cliente de Supabase de toda la app.
// Credenciales en variables de entorno (.env, prefijo VITE_).
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  // Falla ruidosa en dev: evita arrancar con credenciales vacías.
  throw new Error(
    'Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. Copia .env.example a .env y rellena las credenciales.'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
