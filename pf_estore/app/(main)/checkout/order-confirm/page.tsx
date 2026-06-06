export default function OrderConfirmPage({
  searchParams,
}: {
  searchParams: { orderId?: string };
}) {
  const orderId = searchParams.orderId;
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded shadow-md text-center">
                <h1 className="text-2xl font-bold mb-4">Thank you for your order!</h1>
                {orderId ? (
                    <p className="text-gray-700">Your order ID is <span className="font-mono">{orderId}</span>.</p>
                ) : (
                    <p className="text-gray-700">Your order has been received and is being processed.</p>
                )}
            </div>
            <a href="/products">Continue Shopping</a>
        </div>
    );
}