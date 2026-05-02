import Layout from "@/components/Layout";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Minus, MessageCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";

export default function Cart() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState(profile?.address || "");
  const [city, setCity] = useState(profile?.city || "");
  const [country, setCountry] = useState(profile?.country || "");

  const { data: settings } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("admin_settings").select("*").limit(1).single();
      return data;
    },
  });

  const handleWhatsAppCheckout = async () => {
    if (!user) {
      toast.error("Please sign in to proceed");
      navigate("/auth");
      return;
    }
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    const phone = settings?.whatsapp_number?.replace(/[^0-9]/g, "") || "";
    const itemsList = items.map((i) => `• ${i.name} (x${i.quantity}) - $${(i.price * i.quantity).toLocaleString()}`).join("\n");
    const message = `🛒 *New Order from Marine Pro*\n\n*Customer Info:*\nName: ${profile?.full_name || "N/A"}\nEmail: ${profile?.email || user.email}\nAddress: ${address || "N/A"}\nCity: ${city || "N/A"}\nCountry: ${country || "N/A"}\n\n*Order Items:*\n${itemsList}\n\n*Total: $${total.toLocaleString()}*\n\n*Payment Method:* Cash on Delivery / Bank Transfer`;

    // Save order to DB
    await supabase.from("orders").insert({
      user_id: user.id,
      items: items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
      total,
      customer_name: profile?.full_name || "",
      customer_email: profile?.email || user.email || "",
      customer_phone: profile?.phone || "",
      customer_address: `${address}, ${city}, ${country}`,
    });

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    clearCart();
    toast.success("Order sent via WhatsApp!");
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold font-serif mb-8">Shopping <span className="text-gradient-gold">Cart</span></h1>

        {items.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <p className="text-muted-foreground text-lg">Your cart is empty</p>
            <Button asChild className="gradient-gold text-primary-foreground shadow-gold hover:opacity-90">
              <Link to="/products">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 border border-border rounded-lg">
                  <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-md" />
                  <div className="flex-1">
                    <h3 className="font-serif font-semibold">{item.name}</h3>
                    <p className="text-gradient-gold font-bold">${item.price.toLocaleString()}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 rounded border border-border flex items-center justify-center hover:bg-muted">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 rounded border border-border flex items-center justify-center hover:bg-muted">
                        <Plus className="h-3 w-3" />
                      </button>
                      <button onClick={() => removeItem(item.id)} className="ml-auto text-destructive hover:text-destructive/80">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <div className="border border-border rounded-lg p-6 space-y-4">
                <h3 className="font-serif font-semibold text-lg">Delivery Info</h3>
                <Input placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
                <Input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
                <Input placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
              </div>
              <div className="border border-border rounded-lg p-6 space-y-4">
                <h3 className="font-serif font-semibold text-lg">Order Summary</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Items ({items.length})</span>
                  <span>${total.toLocaleString()}</span>
                </div>
                <div className="border-t border-border pt-4 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-gradient-gold">${total.toLocaleString()}</span>
                </div>
                <Button onClick={handleWhatsAppCheckout} size="lg" className="w-full gradient-gold text-primary-foreground shadow-gold hover:opacity-90">
                  <MessageCircle className="mr-2 h-5 w-5" /> Order via WhatsApp
                </Button>
                <p className="text-xs text-muted-foreground text-center">You'll be redirected to WhatsApp to complete your order</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}