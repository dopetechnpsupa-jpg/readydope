import { createClient } from '@supabase/supabase-js'

// Use environment variables for security with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://flrcwmmdveylmcbjuwfc.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZscmN3bW1kdmV5bG1jYmp1d2ZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NTk2MjIsImV4cCI6MjA3MTQzNTYyMn0.NitC7tHaImTORdaKgCFXkKRLNMOxJCuBbTDAyr8AVa0'

// Singleton pattern to prevent multiple instances
let supabaseInstance: ReturnType<typeof createClient> | null = null

// Client-side Supabase client with singleton pattern
export const supabase = (() => {
  if (typeof window !== 'undefined' && supabaseInstance) {
    return supabaseInstance
  }
  
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false, // Disable session persistence to avoid multiple instances warning
      autoRefreshToken: false, // Disable auto refresh to prevent multiple instances
      detectSessionInUrl: false // Disable session detection to prevent multiple instances
    },
    global: {
      headers: {
        'X-Client-Info': 'dopetech-web'
      }
    }
  })
  
  return supabaseInstance
})()

// Server-side client for API routes
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZscmN3bW1kdmV5bG1jYmp1d2ZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTg1OTYyMiwiZXhwIjoyMDcxNDM1NjIyfQ.2pm7uDjc3B73xlaqxwaS7qjwCYaOOjA7WQY6wV4WAeA'

let supabaseAdminInstance: ReturnType<typeof createClient> | null = null

export const supabaseAdmin = (() => {
  if (supabaseAdminInstance) {
    return supabaseAdminInstance
  }
  
  supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  })
  
  return supabaseAdminInstance
})()

// Debug function to check environment variables
export function debugSupabaseConfig() {
  if (typeof window !== 'undefined') {
    console.log('🔧 Supabase Config Debug:')
    console.log('URL:', supabaseUrl)
    console.log('Anon Key Set:', !!supabaseAnonKey)
    console.log('Service Key Set:', !!supabaseServiceKey)
    console.log('Client Instance:', !!supabaseInstance)
    console.log('Admin Instance:', !!supabaseAdminInstance)
  }
}
