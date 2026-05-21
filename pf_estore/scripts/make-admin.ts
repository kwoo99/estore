import { createClient } from "@supabase/supabase-js";

async function makeAdmin() {
  const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const { data, error } = await supabase.auth.admin.updateUserById(
  "7fb1c830-0668-4cd3-b4b1-3e12f9404ead",
  { app_metadata: { role: "admin" } }
);

if (error) console.error(error);
else console.log("Done:", data.user.email, "is now an admin");
}

makeAdmin().catch(console.error);