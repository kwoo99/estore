"use client";

import styles from "../products.module.css";

type ProductFormProps = {
  action: (formData: FormData) => void;
};

export default function ProductForm({
  action,
}: ProductFormProps) {

  return (
    <main>
        <h1>Add New Product</h1>
        <form action={action} className={styles.form}>

      <input
        name="name"
        placeholder="Product Name"
        className={styles.input}
      />

      <textarea
        name="description"
        placeholder="Description"
        className={styles.textarea}
      />

      <input
        name="price"
        type="number"
        placeholder="Price"
        className={styles.input}
      />

      <button type="submit">
        Add Product
      </button>

    </form>
    </main>
  );
}