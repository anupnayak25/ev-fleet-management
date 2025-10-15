const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn("Supabase env not set. Please define SUPABASE_URL and SUPABASE_ANON_KEY in your .env");
}

const supabase = createClient(SUPABASE_URL || "", SUPABASE_ANON_KEY || "");

module.exports = { supabase };
