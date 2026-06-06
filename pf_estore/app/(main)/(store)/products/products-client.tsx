"use client";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import styles from "./products.module.css";

    type Products = {
        id: number;
        name: string;
        price: number;
        description: string;
    }

    type Props = {
        products: Products[],
        user: any,
        isAdmin: boolean
    }

export default function ProductsList({ products, isAdmin }: Props) {

    const { addToCart } = useCart();

    const router = useRouter();
    async function handleAddNewProduct() {
        router.push("/products/new");
    }

    async function handleAddEditProduct(id: number) {
        router.push(`/products/${id}/edit`);
    }

  return (
    <div className={styles.container}>
        {isAdmin && (
            <button className={styles.button} onClick={handleAddNewProduct}>
                Add New Product
            </button>
        )}
      {products.map((p) => (
        <div key={p.id}>
          <h2>{p.name}</h2>
          <p>{p.description}</p>
          <p>${p.price}</p> 
          <button className={styles.button} onClick={() => addToCart(p, 1)}>
            Add to Cart
          </button>
          {isAdmin && <button className={styles.button} onClick={() => handleAddEditProduct(p.id)}>
            Edit
          </button>}
        </div>
      ))}
    </div>
  );
}
