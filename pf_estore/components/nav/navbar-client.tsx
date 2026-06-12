"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import CartDropdown from "@/components/nav/cart-dropdown";
import AccountDropdown from "@/components/nav/account-dropdown";

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
          <AccountDropdown user={user} />
          {isAdmin && <a href="/manage-users">Admin</a>}
          <CartDropdown user={user} />
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