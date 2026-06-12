import { createClient } from '@/lib/supabase/server';
import Link from "next/link";

export default async function AdminPage() {

  const supabase = await createClient();

const { data: users, error } = await supabase.from('profiles').select('*');

if (error) {
  console.error('Error fetching users:', error);
} else {
  console.log('Users:', users);
} 

  return (
    <div>
      <h1>Manage Users</h1>
      {users && users.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.full_name}</td>
                <td>{user.email}</td>
                <td>{user.phone ?? "—"}</td>
                <td><Link href={`/manage-users/${user.id}`}>View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No users found.</p>
      )}
    </div>
  );
}