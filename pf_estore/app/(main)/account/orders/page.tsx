import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!user) {
    return <div>Please log in to view your orders.</div>;
  }

  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, total_price, status, created_at, transaction_key, auth_code")
    .eq("user_id", user.sub)
    .order("created_at", { ascending: false });

  if (error) {
    return <div>Error loading orders: {error.message}</div>;
  }

  return (
    <div>
      <h1>Your Orders</h1>
      {orders && orders.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
              <th>Transaction Key</th>
              <th>Auth Code</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{new Date(order.created_at).toLocaleDateString()}</td>
                <td>${order.total_price.toFixed(2)}</td>
                <td>{order.status === 1 ? "Approved" : order.status === 2 ? "Failed" : "Pending"}</td>
                <td>{order.transaction_key}</td>
                <td>{order.auth_code}</td>
                <td><Link href={`/account/orders/${order.id}`}>View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>You have no orders yet.</p>
      )}
    </div>
  );
}