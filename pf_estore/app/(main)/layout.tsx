import Navbar from "@/components/nav/navbar";
import { CartProvider } from "@/context/cart-context";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <Navbar />
      <main>{children}</main>
    </CartProvider>
  );
}
