import { createClient } from "@/lib/supabase/server";

export default async function OrderConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const supabase = await createClient();
  const orderId = (await searchParams).orderId;

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

  if (!order) {
    return <div>Order not found.</div>;
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
  <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
    
    {/* Header */}
    <h1 className="text-2xl font-bold text-center mb-2">Thank you for your order!</h1>
    <p className="text-center text-green-600 font-semibold mb-6">✓ Payment Approved</p>

    {/* Order Items */}
    <div className="border-t border-b border-gray-200 py-4 mb-4">
      <h2 className="font-semibold text-gray-700 mb-3">Items Ordered</h2>
      {items?.map((item: any) => (
        <div key={item.products.id} className="flex justify-between mb-2">
          <span className="text-gray-600">{item.products.name} x{item.quantity}</span>
          <span className="font-medium">${(item.price_at_purchase * item.quantity).toFixed(2)}</span>
        </div>
      ))}
    </div>

    {/* Total */}
    <div className="flex justify-between font-bold text-lg mb-6">
      <span>Total</span>
      <span>${order.total_price?.toFixed(2)}</span>
    </div>

    {/* Transaction Details */}
    <div className="bg-gray-50 rounded p-4 mb-6 text-sm">
      <h2 className="font-semibold text-gray-700 mb-2">Transaction Details</h2>
      <div className="flex justify-between mb-1">
        <span className="text-gray-500">Transaction Key: </span>
        <span className="font-mono">{order.transaction_key}</span>
      </div>
      <div className="flex justify-between mb-1">
        <span className="text-gray-500">Auth Code: </span>
        <span className="font-mono">{order.auth_code}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-500">Date: </span>
        <span>{new Date(order.created_at).toLocaleDateString()}</span>
      </div>
    </div>

    {/* Continue Shopping */}
    <a 
      href="/products" 
      className="block text-center bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
    >
      Continue Shopping
    </a>

  </div>
</div>
  );
}
