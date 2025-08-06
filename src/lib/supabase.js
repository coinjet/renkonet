import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yrokptdcmwqvimqlhaac.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlyb2twdGRjbXdxdmltcWxoYWFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNzAyNDQsImV4cCI6MjA2OTk0NjI0NH0.daSupk2k9W6Z3qgpVkjhkaHzNOB-ieYiZdrPFRAQugY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

