import Products from "./products-client";
import { createClient } from "@/lib/supabase/server";

export default async function ProductsData() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;
  const isAdmin = user?.app_metadata?.role === "admin";

  const { data: products, error } = await supabase
    .from("products")
    .select("*");

  if (error) {
    console.error(error);
    return <div>Failed to load products</div>;
  }

  return (
    <div>
      <h1>Products List</h1>
      <Products products={products ?? []} user={user} isAdmin={isAdmin} />
    </div>
  );
} 