"use client"

import { createContext, useContext, useState, useMemo, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type CartItem = {
  product_id: number,
  name: string,
  price: number,
  quantity: number,
}

type CartContextType = {
  cartItems: CartItem[];
  totalPrice: number;
  addToCart: (product: { id: number, name: string, price: number }, quantity: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () =>Promise<void>;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType>({
  cartItems: [],
  totalPrice: 0,
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: async () => {},
  isLoading: false,
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const clearCart = async () => {
  if (!userId) return;

  await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", userId);

  setCartItems([]);

  await supabase
    .from("carts")
    .update({ processed: false })
    .eq("user_id", userId);
  };
  

  const totalPrice = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  useEffect(() => {
    async function initCart() {
      const { data: { user } } = await supabase.auth.getUser();
      console.log("1. initCart user:", user)

      if (!user) {
        setIsLoading(false);
        return;
      }

      setUserId(user.id)

      const { data: cart, error: cartError } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", user.id)
        .eq("processed", false)
        .single();

      console.log("2. cart fetch:", cart, "cartError:", cartError)

      if (!cart) {
        const { error: insertError } = await supabase
          .from("carts")
          .insert({ user_id: user.id });
        console.log("3. cart insert error:", insertError)
      }

      const { data: items, error: itemsError } = await supabase
        .from("cart_items")
        .select(`
          product_id,
          quantity,
          price_at_add,
          products (
            name
          )
        `)
        .eq("user_id", user.id);

      console.log("4. cart items fetch:", items, "itemsError:", itemsError)

      if (items) {
        setCartItems(items.map((item: any) => ({
          product_id: item.product_id,
          name: item.products.name,
          price: item.price_at_add,
          quantity: item.quantity,
        })));
      }

      setIsLoading(false);
    }

    initCart();
  }, []);

  const addToCart = async (product: { id: number; name: string; price: number }, quantity: number) => {
    if (!userId) {
      console.log("addToCart: no userId")
      return;
    }

    const existing = cartItems.find(i => i.product_id === product.id);
    const newQuantity = existing ? existing.quantity + quantity : quantity;

    const { error } = await supabase
      .from("cart_items")
      .upsert(
        {
          user_id: userId,
          product_id: product.id,
          quantity: newQuantity,
          price_at_add: product.price,
        },
        { onConflict: "user_id,product_id" }
      );

    console.log("addToCart error:", error)

    setCartItems(prev => {
      const existing = prev.find(i => i.product_id === product.id);
      if (existing) {
        return prev.map(i =>
          i.product_id === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { product_id: product.id, name: product.name, price: product.price, quantity }];
    });
  };

  const removeFromCart = async (productId: number) => {
    if (!userId) {
      console.log("removeFromCart: no userId")
      return;
    }

    console.log("removeFromCart userId:", userId, "productId:", productId)

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", userId)
      .eq("product_id", productId);

    console.log("removeFromCart error:", error)

    setCartItems(prev => prev.filter(i => i.product_id !== productId));
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    if (!userId) {
      console.log("updateQuantity: no userId")
      return;
    }

    const { error } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("user_id", userId)
      .eq("product_id", productId);

    console.log("updateQuantity error:", error)

    setCartItems(prev =>
      prev.map(i => i.product_id === productId ? { ...i, quantity } : i)
    );
  };

  return (
    <CartContext.Provider value={{ cartItems, totalPrice, isLoading, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}