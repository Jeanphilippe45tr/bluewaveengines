import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function AdminUsers() {
  const { data: users } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold font-serif mb-8">Users</h1>
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Name</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Email</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Phone</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Role</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users?.map((u: any) => (
              <tr key={u.id}>
                <td className="p-4 font-medium text-sm">{u.full_name || "—"}</td>
                <td className="p-4 text-sm">{u.email || "—"}</td>
                <td className="p-4 text-sm">{u.phone || "—"}</td>
                <td className="p-4 text-sm">{u.is_admin ? <span className="px-2 py-1 rounded-full text-xs gradient-gold text-primary-foreground">Admin</span> : "Customer"}</td>
                <td className="p-4 text-sm text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}