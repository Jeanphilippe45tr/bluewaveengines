import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function AdminOrders() {
  const qc = useQueryClient();
  const { data: orders } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await supabase.from("orders").update({ status }).eq("id", id);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-orders"] }); toast.success("Order updated!"); },
  });

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold font-serif mb-6 md:mb-8">Orders</h1>
      <div className="bg-card border border-border rounded-lg overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Customer</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Items</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Total</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders?.map((o: any) => (
              <tr key={o.id}>
                <td className="p-4">
                  <p className="font-medium text-sm">{o.customer_name || "N/A"}</p>
                  <p className="text-xs text-muted-foreground">{o.customer_email}</p>
                </td>
                <td className="p-4 text-sm">
                  {(o.items as any[])?.map((item: any, i: number) => (
                    <div key={i}>{item.name} x{item.quantity}</div>
                  ))}
                </td>
                <td className="p-4 font-medium">${Number(o.total).toLocaleString()}</td>
                <td className="p-4">
                  <Select value={o.status} onValueChange={(v) => updateStatus.mutate({ id: o.id, status: v })}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["pending", "confirmed", "shipped", "delivered", "cancelled"].map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-4 text-sm text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!orders || orders.length === 0) && <p className="text-center py-8 text-muted-foreground">No orders yet</p>}
      </div>
    </div>
  );
}