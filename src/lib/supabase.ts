import { createClient } from "@supabase/supabase-js";

// This is the client-side, public connection
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

// This code is for a server (which you are not running)
// and will not work in a Vite app, so we will comment it out.
/*
export const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(
      import.meta.env.VITE_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )
  : null;
*/
