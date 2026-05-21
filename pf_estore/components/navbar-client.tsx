"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function NavbarClient({
  user,
  isAdmin,
}: {
  user: any;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <nav>
      <a href="/">Home</a>
      <a href="/products">Products</a>
      {user ? (
        <>
          <a href="/account">Account</a>
          {isAdmin && <a href="/admin/products">Admin</a>}
          <button onClick={handleSignOut}>Sign out</button>
        </>
      ) : (
        <>
          <a href="/auth/login">Login</a>
          <a href="/auth/sign-up">Sign up</a>
        </>
      )}
    </nav>
  );
}