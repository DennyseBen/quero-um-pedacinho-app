import { createSupabaseClient } from '@pedacinho/shared';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pkjrenijzgyzqilqpjyl.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBranJlbmlqemd5enFpbHFwanlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxMDEzODIsImV4cCI6MjA4ODY3NzM4Mn0.pq1kCFTqM3y3RTa0ZTs-g_iWsxrjNYOnC8Iq6dbMOL8';

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);
