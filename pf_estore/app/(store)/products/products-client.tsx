"use client";
import { useRouter } from "next/navigation";
import styles from "./products.module.css";

    type Products = {
        id: number;
        name: string;
        price: number;
        description: string;
    }

    type Props = {
        products: Products[];
    }

export default function ProductsList({ products }: Props) {

    const router = useRouter();
    async function handleAddNewProduct() {
        router.push("/products/new");
    }

    async function handleAddEditProduct(id: number) {
        router.push(`/products/${id}/edit`);
    }

  return (
    <div className={styles.container}>
        <button className={styles.button} onClick={handleAddNewProduct}>
            Add New Product
        </button>
      {products.map((p, index) => (
        <div key={index}>
          <h2>{p.name}</h2>
          <p>{p.description}</p>
          <p>${p.price}</p> 
          <button className={styles.button}>
            Add to Cart
          </button>
          <button className={styles.button} onClick={() => handleAddEditProduct(p.id)}>
            Edit
          </button>
        </div>
      ))}
    </div>
  );
}
