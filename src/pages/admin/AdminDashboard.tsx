import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Package, ShoppingBag, Users, DollarSign } from "lucide-react";

export default function AdminDashboard() {
  const { data: productCount } = useQuery({
    queryKey: ["admin-product-count"],
    queryFn: async () => {
      const { count } = await supabase.from("products").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: orderCount } = useQuery({
    queryKey: ["admin-order-count"],
    queryFn: async () => {
      const { count } = await supabase.from("orders").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: userCount } = useQuery({
    queryKey: ["admin-user-count"],
    queryFn: async () => {
      const { count } = await supabase.from("profiles").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: revenue } = useQuery({
    queryKey: ["admin-revenue"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("total");
      return data?.reduce((sum, o) => sum + Number(o.total), 0) || 0;
    },
  });

  const stats = [
    { label: "Products", value: productCount, icon: Package, color: "text-blue-500" },
    { label: "Orders", value: orderCount, icon: ShoppingBag, color: "text-green-500" },
    { label: "Users", value: userCount, icon: Users, color: "text-purple-500" },
    { label: "Revenue", value: `$${(revenue || 0).toLocaleString()}`, icon: DollarSign, color: "text-primary" },
  ];

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold font-serif mb-6 md:mb-8">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold mt-1">{s.value ?? "..."}</p>
              </div>
              <s.icon className={`h-8 w-8 ${s.color}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}