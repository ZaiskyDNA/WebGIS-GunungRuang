import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// KATA 'export' DI BAWAH INI SANGAT PENTING
export const supabase = createClient(supabaseUrl, supabaseKey);