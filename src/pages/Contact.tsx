import Layout from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Contact() {
  const { data: settings } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("admin_settings").select("*").limit(1).single();
      return data;
    },
  });

  const openWhatsApp = () => {
    const phone = settings?.whatsapp_number?.replace(/[^0-9]/g, "") || "";
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent("Hello! I have a question about your outboard engines.")}`, "_blank");
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold font-serif mb-4">Contact <span className="text-gradient-gold">Us</span></h1>
          <p className="text-muted-foreground max-w-xl mx-auto">Get in touch with our team. We're here to help you find the perfect engine.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {settings?.admin_email && (
            <div className="text-center p-8 rounded-lg border border-border space-y-4">
              <div className="mx-auto w-14 h-14 rounded-full gradient-gold flex items-center justify-center">
                <Mail className="h-7 w-7 text-primary-foreground" />
              </div>
              <h3 className="font-serif font-semibold">Email</h3>
              <a href={`mailto:${settings.admin_email}`} className="text-muted-foreground hover:text-primary transition-colors">{settings.admin_email}</a>
            </div>
          )}
          {settings?.whatsapp_number && (
            <div className="text-center p-8 rounded-lg border border-border space-y-4">
              <div className="mx-auto w-14 h-14 rounded-full gradient-gold flex items-center justify-center">
                <Phone className="h-7 w-7 text-primary-foreground" />
              </div>
              <h3 className="font-serif font-semibold">Phone / WhatsApp</h3>
              <p className="text-muted-foreground">{settings.whatsapp_number}</p>
            </div>
          )}
          {settings?.business_address && (
            <div className="text-center p-8 rounded-lg border border-border space-y-4">
              <div className="mx-auto w-14 h-14 rounded-full gradient-gold flex items-center justify-center">
                <MapPin className="h-7 w-7 text-primary-foreground" />
              </div>
              <h3 className="font-serif font-semibold">Location</h3>
              <p className="text-muted-foreground">{settings.business_address}</p>
            </div>
          )}
        </div>

        <div className="text-center mt-12">
          <Button onClick={openWhatsApp} size="lg" className="gradient-gold text-primary-foreground shadow-gold hover:opacity-90">
            <MessageCircle className="mr-2 h-5 w-5" /> Chat on WhatsApp
          </Button>
        </div>
      </div>
    </Layout>
  );
}