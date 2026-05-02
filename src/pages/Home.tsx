import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Shield, Truck, Award, Headphones } from "lucide-react";
import heroImage from "@/assets/hero-engine.jpg";

export default function Home() {
  const { data: featured } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").eq("featured", true).limit(4);
      return data ?? [];
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").limit(6);
      return data ?? [];
    },
  });

  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[600px] md:h-[700px] overflow-hidden">
        <img src={heroImage} alt="Premium outboard engine" className="absolute inset-0 w-full h-full object-cover" width={1920} height={1080} />
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/90 via-secondary/60 to-transparent" />
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-xl space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold font-serif text-secondary-foreground leading-tight">
              Premium <span className="text-primary">Outboard</span> Engines
            </h1>
            <p className="text-lg text-secondary-foreground/80">
              Discover our curated selection of high-performance marine engines. Power, reliability, and excellence for every voyage.
            </p>
            <div className="flex gap-4">
              <Button asChild size="lg" className="gradient-gold text-primary-foreground shadow-gold hover:opacity-90">
                <Link to="/products">Shop Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10">
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: "Warranty", desc: "Full manufacturer warranty" },
              { icon: Truck, title: "Worldwide Shipping", desc: "Fast & reliable delivery" },
              { icon: Award, title: "Certified Quality", desc: "Top brands only" },
              { icon: Headphones, title: "24/7 Support", desc: "Expert assistance" },
            ].map((f) => (
              <div key={f.title} className="text-center space-y-3 p-6">
                <div className="mx-auto w-12 h-12 rounded-full gradient-gold flex items-center justify-center">
                  <f.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-serif font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featured && featured.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold font-serif">Featured <span className="text-gradient-gold">Engines</span></h2>
              <p className="text-muted-foreground mt-2">Our most popular outboard engines</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((p: any) => (
                <ProductCard key={p.id} id={p.id} name={p.name} price={p.price} image={p.images?.[0] || "/placeholder.svg"} brand={p.brand} horsepower={p.horsepower} />
              ))}
            </div>
            <div className="text-center mt-8">
              <Button asChild variant="outline" size="lg">
                <Link to="/products">View All Products <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      {categories && categories.length > 0 && (
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold font-serif text-center mb-12">Browse by <span className="text-gradient-gold">Category</span></h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {categories.map((c: any) => (
                <Link key={c.id} to={`/products?category=${c.id}`} className="group relative h-48 rounded-lg overflow-hidden bg-secondary">
                  {c.image_url && <img src={c.image_url} alt={c.name} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" loading="lazy" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <h3 className="font-serif font-semibold text-secondary-foreground text-lg">{c.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4">Ready to Power Your <span className="text-gradient-gold">Adventure</span>?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">Browse our full catalog and find the perfect engine for your boat. Order via WhatsApp for a personalized experience.</p>
          <Button asChild size="lg" className="gradient-gold text-primary-foreground shadow-gold hover:opacity-90">
            <Link to="/products">Explore All Engines <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}