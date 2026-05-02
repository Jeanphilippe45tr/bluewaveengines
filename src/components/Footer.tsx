import { Anchor, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function Footer() {
  const { data: settings } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("admin_settings").select("*").limit(1).single();
      return data;
    },
  });

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Anchor className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold font-serif">Marine<span className="text-primary">Pro</span></span>
            </div>
            <p className="text-sm text-secondary-foreground/70">
              Premium outboard engines for professionals and enthusiasts.
            </p>
          </div>
          <div>
            <h4 className="font-serif font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2">
              <Link to="/products" className="block text-sm text-secondary-foreground/70 hover:text-primary transition-colors">Products</Link>
              <Link to="/about" className="block text-sm text-secondary-foreground/70 hover:text-primary transition-colors">About Us</Link>
              <Link to="/contact" className="block text-sm text-secondary-foreground/70 hover:text-primary transition-colors">Contact</Link>
            </div>
          </div>
          <div>
            <h4 className="font-serif font-semibold mb-4">Contact</h4>
            <div className="space-y-2 text-sm text-secondary-foreground/70">
              {settings?.admin_email && (
                <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" />{settings.admin_email}</div>
              )}
              {settings?.whatsapp_number && (
                <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" />{settings.whatsapp_number}</div>
              )}
              {settings?.business_address && (
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />{settings.business_address}</div>
              )}
            </div>
          </div>
          <div>
            <h4 className="font-serif font-semibold mb-4">Business Hours</h4>
            <p className="text-sm text-secondary-foreground/70">Mon - Fri: 9:00 AM - 6:00 PM</p>
            <p className="text-sm text-secondary-foreground/70">Sat: 10:00 AM - 4:00 PM</p>
            <p className="text-sm text-secondary-foreground/70">Sun: Closed</p>
          </div>
        </div>
        <div className="border-t border-secondary-foreground/10 mt-8 pt-8 text-center text-sm text-secondary-foreground/50">
          &copy; {new Date().getFullYear()} {settings?.business_name || "Marine Engines Pro"}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}