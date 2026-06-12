import { createClient} from "@/lib/supabase/server";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
    const userId = (await params).userId;
    const supabase = await createClient();
    const { data: user, error: userError } = await supabase
    .from("profiles")
    .select("full_name, email, phone, created_at")
    .eq("id", userId)
    .single();

    console.log("userId:", userId)
    console.log("user:", user)
    console.log("userError:", userError)
    return (
        <div>
            <h1>User Detail for User ID: {userId}</h1>
            {user && (
                <div>
                    <p>Name: {user.full_name}</p>
                    <p>Email: {user.email}</p>
                    <p>Phone: {user.phone ?? "—"}</p>
                    <p>Joined: {new Date(user.created_at).toLocaleDateString()}</p>
                </div>
            )}
        </div>
    );
}