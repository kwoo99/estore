"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { createPayFabricSession } from "@/lib/actions/checkout";
import { createOrder } from "@/lib/actions/orders";
import { createClient } from "@/lib/supabase/client";

type Stage = "form" | "payment";

type BillingForm = {
  line1: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  email: string;
  phone: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, totalPrice, isLoading, clearCart } = useCart();
  const [stage, setStage] = useState<Stage>("form");
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [transactionKey, setTransactionKey] = useState<string | null>(null);
  const [tender, setTender] = useState<"CreditCard" | "ECheck">("CreditCard");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const [billing, setBilling] = useState<BillingForm>({
    line1: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    email: "",
    phone: "",
  });

  // Get userId on mount
  useEffect(() => {
    async function getUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    }
    getUser();
  }, []);

  // Listen for PayFabric postMessage response
  useEffect(() => {
    async function handleMessage(event: MessageEvent) {
  if (!event.origin.includes("payfabric.com")) return;

  // Data comes as a double-stringified JSON string
  let data: any;
  try {
    const parsed = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
    data = typeof parsed === "string" ? JSON.parse(parsed) : parsed;
  } catch {
    return;
  }

  // Ignore non-payment messages
  if (!data?.Event || data.Event !== "successCallback") return;

  if (data.ResultStatus === "True" && data.RespStatus === "Approved") {
    if (!userId) return;

    const result = await createOrder(
      {
        TrxKey: data.TrxKey,
        Status: data.RespStatus,
        AuthCode: data.AuthCode,
        OriginationID: data.OriginationID,
      },
      cartItems,
      totalPrice,
      userId
    );

    if (result.success) {
        clearCart()
      router.push(`/checkout/order-confirm?orderId=${result.orderId}`);
    } else {
      setError("Payment approved but order creation failed. Please contact support.");
    }
  } else if (data.Event === "failureCallback") {
    setError(`Payment declined: ${data.ResponseMsg ?? "Please try again."}`);
  }
}

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [userId, cartItems, totalPrice]);

    useEffect(() => {
        console.log("postMessage listener mounted")
  function handleAllMessages(event: MessageEvent) {
    console.log("ANY postMessage:")
    console.log("  origin:", event.origin)
    console.log("  data type:", typeof event.data)
    console.log("  data:", JSON.stringify(event.data))
  }
  window.addEventListener("message", handleAllMessages)
  return () => window.removeEventListener("message", handleAllMessages)
}, [])

  async function handleProceedToPayment() {
    console.log("handleProceedToPayment called")
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createPayFabricSession(
        totalPrice,
        tender,
        billing
      );

      setIframeUrl(result.iframeUrl);
      setTransactionKey(result.transactionKey);
      setStage("payment");
    } catch (err) {
      setError("Failed to initialize payment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleBillingChange(field: keyof BillingForm, value: string) {
    setBilling(prev => ({ ...prev, [field]: value }));
  }

  if (isLoading) return <div>Loading cart...</div>;

  if (cartItems.length === 0) {
    return <div>Your cart is empty. <a href="/products">Continue shopping</a></div>;
  }

  return (
    <div>
      <h1>Checkout</h1>

      {/* Order Summary */}
      <div>
        <h2>Order Summary</h2>
        {cartItems.map(item => (
          <div key={item.product_id}>
            <span>{item.name}</span>
            <span>x{item.quantity}</span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div><strong>Total: ${totalPrice.toFixed(2)}</strong></div>
      </div>

      {error && <div style={{ color: "red" }}>{error}</div>}

      {/* Stage: Billing Form */}
      {stage === "form" && (
        <div>
          <h2>Billing Information</h2>

          <div>
            <label>Payment Method</label>
            <select
              value={tender}
              onChange={(e) => setTender(e.target.value as "CreditCard" | "ECheck")}
            >
              <option value="CreditCard">Credit Card</option>
              <option value="ECheck">eCheck</option>
            </select>
          </div>

          <div>
            <label>Street Address *</label>
            <input
              value={billing.line1}
              onChange={(e) => handleBillingChange("line1", e.target.value)}
              placeholder="123 Main St"
            />
          </div>

          <div>
            <label>City *</label>
            <input
              value={billing.city}
              onChange={(e) => handleBillingChange("city", e.target.value)}
              placeholder="City"
            />
          </div>

          <div>
            <label>State *</label>
            <input
              value={billing.state}
              onChange={(e) => handleBillingChange("state", e.target.value)}
              placeholder="CA"
            />
          </div>

          <div>
            <label>Zip Code *</label>
            <input
              value={billing.zip}
              onChange={(e) => handleBillingChange("zip", e.target.value)}
              placeholder="90210"
            />
          </div>

          <div>
            <label>Country *</label>
            <input
              value={billing.country}
              onChange={(e) => handleBillingChange("country", e.target.value)}
              placeholder="US"
            />
          </div>

          <div>
            <label>Email (optional)</label>
            <input
              value={billing.email}
              onChange={(e) => handleBillingChange("email", e.target.value)}
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label>Phone (optional)</label>
            <input
              value={billing.phone}
              onChange={(e) => handleBillingChange("phone", e.target.value)}
              placeholder="555-555-5555"
            />
          </div>

          <button
            onClick={handleProceedToPayment}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Initializing..." : "Proceed to Payment"}
          </button>
        </div>
      )}

      {/* Stage: Payment iframe */}
      {stage === "payment" && iframeUrl && (
        <div>
          <h2>Payment</h2>
          <iframe
            src={iframeUrl}
            width="100%"
            height="600px"
            style={{ border: "none" }}
            title="PayFabric Payment"
          />
          <button onClick={() => setStage("form")}>
            Back to Billing
          </button>
        </div>
      )}
    </div>
  );
}