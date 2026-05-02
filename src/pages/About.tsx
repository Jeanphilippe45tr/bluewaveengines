import Layout from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Anchor, Award, Users, Globe } from "lucide-react";

export default function About() {
  const { data: settings } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("admin_settings").select("*").limit(1).single();
      return data;
    },
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold font-serif mb-4">About <span className="text-gradient-gold">{settings?.business_name || "Marine Pro"}</span></h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">{settings?.about_text || "We are your trusted source for premium outboard marine engines."}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            { icon: Award, title: "Premium Quality", desc: "We only carry top-tier brands and certified engines." },
            { icon: Users, title: "Expert Team", desc: "Our team has decades of marine engine experience." },
            { icon: Globe, title: "Global Reach", desc: "We ship worldwide with reliable logistics partners." },
          ].map((f) => (
            <div key={f.title} className="text-center p-8 rounded-lg border border-border space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full gradient-gold flex items-center justify-center">
                <f.icon className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="font-serif font-semibold text-xl">{f.title}</h3>
              <p className="text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-secondary text-secondary-foreground rounded-2xl p-12 text-center">
          <Anchor className="mx-auto h-12 w-12 text-primary mb-4" />
          <h2 className="text-2xl font-bold font-serif mb-4">Our Mission</h2>
          <p className="max-w-2xl mx-auto text-secondary-foreground/80">
            To provide boating enthusiasts and professionals with the highest quality outboard engines at competitive prices, backed by exceptional customer service and expert guidance.
          </p>
        </div>
      </div>
    </Layout>
  );
}