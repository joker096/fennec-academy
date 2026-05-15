/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qhiietjvfuekfaehddox.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFoaWlldGp2ZnVla2ZhZWhkZG94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxNDY3MTAsImV4cCI6MjA2NTcyMjcxMH0.Ae-xBpuSnLcQpWGC8COR3N_5BAjdJ6cqkzP4rnCJAzA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
