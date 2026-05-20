import { createClient } from "@supabase/supabase-js";


const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export const dbConnection = async () => {
  try {
    const { error } = await supabase.from("users").select("id").limit(1);
    if (error) throw error;
    console.log("Connected to Supabase database!");
  } catch (err) {
    console.error("Error connecting to Supabase:", err.message);
    process.exit(1);
  }
};
