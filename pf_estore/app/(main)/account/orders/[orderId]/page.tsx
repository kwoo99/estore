import { createClient} from "@/lib/supabase/server";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
    const orderId = (await params).orderId;
    const supabase = await createClient();
    const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("total_price, status, created_at, transaction_key, auth_code")
    .eq("id", orderId)
    .single();

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("quantity, price_at_purchase, products(id, name)")
    .eq("order_id", orderId);

    console.log("orderId:", orderId)
    console.log("order:", order)
    console.log("orderError:", orderError)
    return (
        <div>
            <h1>Order Detail for Order ID: {orderId}</h1>
            {order && (
                <div>
                    <p>Total Price: ${order.total_price.toFixed(2)}</p>
                    <p>Status: {order.status === 1 ? "Approved" : order.status === 2 ? "Failed" : "Pending"}</p>
                    <p>Transaction Key: {order.transaction_key}</p>
                    <p>Auth Code: {order.auth_code}</p>
                    <h2>Items:</h2>
                    <ul>
                        {items?.map((item: any) => (
                            <li key={item.products.id}>
                                {item.products.name} x{item.quantity} - ${(
                                    item.price_at_purchase * item.quantity
                                ).toFixed(2)}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}       