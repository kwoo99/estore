import { createClient } from "@/lib/supabase/server";
import EditProductForm from "./editProductClient";

type Props = {
  params: {
    id: string;
  };
};

export default async function EditProduct({ params }: Props) {

  const { id } = await params;
  
  async function updateProduct(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const name = formData.get("name");
    const description = formData.get("description");
    const price = formData.get("price");

    const { data, error } = await supabase
      .from("products")
      .update({ name: name, description: description, price: price })
      .eq("id", id)
      .select();

    console.log(data);

    if (error) {
      console.error(error);
    }
  }
  return (
      <main>
        <EditProductForm action={updateProduct} />
      </main>
    );
}
