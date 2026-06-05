// Create tables for the polling system
// Usage: Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars, then run:
//   node src/supabase/create-tables.js
//
// Or just copy the SQL from src/supabase/polling-schema.sql 
// and run it in the Supabase SQL Editor.

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log("Missing env vars. Run the SQL manually in the Supabase SQL Editor:");
  console.log("File: src/supabase/polling-schema.sql");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { error } = await supabase.from("solutions").select("id").limit(1);
  if (!error) {
    console.log("Tables already exist!");
  } else {
    console.log("Tables not found. Please run src/supabase/polling-schema.sql in the Supabase SQL Editor.");
  }
}

run();
