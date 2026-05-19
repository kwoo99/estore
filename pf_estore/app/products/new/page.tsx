import { createClient } from "@/lib/supabase/server";
import ProductForm from "./newProductClient";

export default function NewProduct() {

  async function SubmitNewProduct(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const productName = formData.get("name");
    const productDesc = formData.get("description");
    const productPrice = formData.get("price");

    const { error } = await supabase
      .from("products")
      .insert([
        {
          name: productName,
          description: productDesc,
          price: productPrice,
        },
      ]);

    if (error) {
      console.error(error);
    }
  }

  return (
    <main>
      <ProductForm action={SubmitNewProduct} />
    </main>
  );
}