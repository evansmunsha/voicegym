import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  // Log a warning on server start — missing env will be handled at runtime too.
  // It's safe to import this file in local dev; runtime routes should check before use.
  // eslint-disable-next-line no-console
  console.warn('Supabase credentials not set: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

export default supabaseAdmin;
