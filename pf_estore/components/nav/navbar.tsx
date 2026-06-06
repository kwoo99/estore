import { createClient } from "@/lib/supabase/server";
import NavbarClient from "./navbar-client";

export default async function Navbar() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;
  const isAdmin = user?.app_metadata?.role === "admin";

  return <NavbarClient user={user} isAdmin={isAdmin} />;
}