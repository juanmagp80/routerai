import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Crear cliente de Supabase sin tipos estrictos para desarrollo
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: false, // Deshabilitar persistencia de sesión para desarrollo
    },
    db: {
      schema: 'public'
    }
  }
)

// Cliente para el lado del servidor (si tienes service role key)
export const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  : null