import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Printer } from "lucide-react";

export default function AdminReceipts() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ customer_name: "", customer_email: "", items: "", total: "", notes: "" });

  const { data: receipts } = useQuery({
    queryKey: ["admin-receipts"],
    queryFn: async () => {
      const { data } = await supabase.from("receipts").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: orders } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const createReceipt = useMutation({
    mutationFn: async () => {
      const receiptNumber = `RCT-${Date.now().toString(36).toUpperCase()}`;
      let items: any[] = [];
      try { items = JSON.parse(form.items); } catch { items = [{ name: form.items, quantity: 1, price: parseFloat(form.total) }]; }
      await supabase.from("receipts").insert({
        receipt_number: receiptNumber,
        customer_name: form.customer_name,
        customer_email: form.customer_email,
        items,
        total: parseFloat(form.total) || 0,
        notes: form.notes,
        created_by: user?.id,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-receipts"] });
      toast.success("Receipt created!");
      setOpen(false);
      setForm({ customer_name: "", customer_email: "", items: "", total: "", notes: "" });
    },
  });

  const createFromOrder = (order: any) => {
    setForm({
      customer_name: order.customer_name || "",
      customer_email: order.customer_email || "",
      items: JSON.stringify(order.items),
      total: String(order.total),
      notes: "",
    });
    setOpen(true);
  };

  const printReceipt = (receipt: any) => {
    const items = (receipt.items as any[]) || [];
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<html><head><title>Receipt ${receipt.receipt_number}</title><style>body{font-family:Arial;max-width:400px;margin:40px auto;padding:20px}h1{text-align:center;color:#b8860b}table{width:100%;border-collapse:collapse;margin:20px 0}td,th{padding:8px;text-align:left;border-bottom:1px solid #eee}th{font-weight:600}.total{font-size:1.2em;font-weight:bold;text-align:right}</style></head><body>`);
    win.document.write(`<h1>Marine Pro</h1><p><strong>Receipt #:</strong> ${receipt.receipt_number}</p><p><strong>Date:</strong> ${new Date(receipt.created_at).toLocaleDateString()}</p><p><strong>Customer:</strong> ${receipt.customer_name}</p>`);
    win.document.write(`<table><tr><th>Item</th><th>Qty</th><th>Price</th></tr>`);
    items.forEach((item: any) => { win.document.write(`<tr><td>${item.name}</td><td>${item.quantity}</td><td>$${Number(item.price).toLocaleString()}</td></tr>`); });
    win.document.write(`</table><p class="total">Total: $${Number(receipt.total).toLocaleString()}</p>`);
    if (receipt.notes) win.document.write(`<p><strong>Notes:</strong> ${receipt.notes}</p>`);
    win.document.write(`<p style="text-align:center;margin-top:40px;color:#999">Thank you for your purchase!</p></body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold font-serif">Receipts</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-gold text-primary-foreground shadow-gold hover:opacity-90"><Plus className="h-4 w-4 mr-2" />Create Receipt</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-serif">Create Receipt</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Customer Name</Label><Input value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} /></div>
              <div><Label>Customer Email</Label><Input value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} /></div>
              <div><Label>Items (description)</Label><Textarea value={form.items} onChange={(e) => setForm({ ...form, items: e.target.value })} rows={3} /></div>
              <div><Label>Total ($)</Label><Input type="number" value={form.total} onChange={(e) => setForm({ ...form, total: e.target.value })} /></div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} /></div>
              <Button onClick={() => createReceipt.mutate()} className="w-full gradient-gold text-primary-foreground shadow-gold hover:opacity-90">Create Receipt</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick create from orders */}
      {orders && orders.length > 0 && (
        <div className="mb-8">
          <h3 className="font-semibold mb-3">Quick Create from Orders</h3>
          <div className="flex gap-2 flex-wrap">
            {orders.slice(0, 5).map((o: any) => (
              <Button key={o.id} variant="outline" size="sm" onClick={() => createFromOrder(o)}>
                {o.customer_name || "Order"} - ${Number(o.total).toLocaleString()}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {receipts?.map((r: any) => (
          <div key={r.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold">{r.receipt_number}</p>
              <p className="text-sm text-muted-foreground">{r.customer_name} — ${Number(r.total).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => printReceipt(r)}><Printer className="h-4 w-4 mr-1" />Print</Button>
          </div>
        ))}
        {(!receipts || receipts.length === 0) && <p className="text-center py-8 text-muted-foreground">No receipts yet</p>}
      </div>
    </div>
  );
}