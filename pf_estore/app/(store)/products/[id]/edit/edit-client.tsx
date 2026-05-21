"use client";


type EditProductFormProps = {
  action: (formData: FormData) => void;
};

export default function EditProductForm({ action }: EditProductFormProps) {
  return (
    <main>
        <h1>Edit Product</h1>
        <form action={action}>

      <input
        name="name"
        placeholder="Product Name"
      />

      <textarea
        name="description"
        placeholder="Description"
      />

      <input
        name="price"
        type="number"
        placeholder="Price"
      />

      <button type="submit">
        Save
      </button>

    </form>
    </main>
  );
}
