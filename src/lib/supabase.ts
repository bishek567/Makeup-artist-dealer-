import { createClient } from '@supabase/supabase-js';

// Respect client env variables or fallback to project default to prevent compilation of preview issues
const metaEnv = (import.meta as any).env || {};
let supabaseUrl = (metaEnv.VITE_SUPABASE_URL || 'https://nbkbwqvohpfvhmzqptfk.supabase.co').trim();
supabaseUrl = supabaseUrl.replace(/^['"]|['"]$/g, '').trim();

let supabaseKey = (metaEnv.VITE_SUPABASE_ANON_KEY || 'sb_publishable_vIzLhYuTHU1myQBmKcLDbQ_mR9z_9QE').trim();
supabaseKey = supabaseKey.replace(/^['"]|['"]$/g, '').trim();

// Keep URL clean from any trailing rest suffix
const cleanUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, '').trim();

export const supabase = createClient(cleanUrl, supabaseKey);
