"use server"

import { createServiceClient } from "@/lib/supabase/service";

type CartItem = {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
}

type TransactionResponse = {
  TrxKey: string;
  Status: string;
  AuthCode: string;
  OriginationID: string;
}

type CreateOrderResult = {
  success: boolean;
  orderId?: string;
  error?: string;
}

export async function createOrder(
  transactionResponse: TransactionResponse,
  cartItems: CartItem[],
  totalPrice: number,
  userId: string
): Promise<CreateOrderResult> {

  const supabase = createServiceClient();

  // Step 1 — Insert order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      total_price: totalPrice,
      status: 1,
      transaction_key: transactionResponse.TrxKey,
      auth_code: transactionResponse.AuthCode,
      origination_id: transactionResponse.OriginationID,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return { success: false, error: "Failed to create order" };
  }

  // Step 2 — Insert order items
  const orderItems = cartItems.map(item => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price_at_purchase: item.price,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    return { success: false, error: "Failed to create order items" };
  }

  // Step 3 — Mark cart as processed
  const { error: cartError } = await supabase
    .from("carts")
    .update({ processed: true })
    .eq("user_id", userId);

  if (cartError) {
    console.error("Failed to mark cart as processed:", cartError);
    // non-critical — order already created, don't fail
  }

  return { success: true, orderId: order.id };
}