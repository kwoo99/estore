"use client";

import { useCart } from "@/context/cart-context";
import { useState } from "react";
import Link from "next/link"

export default function CartDropdown({ user }: { user: any }) {
  // console.log("CartDropdown rendering", user)
  const [isOpen, setIsOpen] = useState(false);
  const { cartItems, totalPrice, isLoading, removeFromCart, updateQuantity } = useCart();

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>
        Cart ({totalItems})
      </button>
      {isOpen && (
        <div>
          {isLoading ? (
            <div>Loading...</div>
          ) : cartItems.length === 0 ? (
            <div>Your cart is empty</div>
          ) : (
            <div>
              {cartItems.map((item) => (
                <div key={item.product_id}>
                  <span>{item.name}</span>
                  <span>${item.price}</span>
                  <div>
                    <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)}>+</button>
                  </div>
                  <button onClick={() => removeFromCart(item.product_id)}>Remove</button>
                </div>
              ))}
              <div>Total: ${totalPrice}</div>
              <Link href="/checkout" onClick={() => setIsOpen(false)}>Checkout</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}