import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://asvelariyhlcrnujtqsq.supabase.co";
const SUPABASE_KEY = "sb_publishable_T6-Wlk2PumuS8_xzBRI3ng_KWouOIDi";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
