import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [imgIdx, setImgIdx] = useState(0);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*, categories(name)").eq("id", id!).single();
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) return <Layout><div className="container mx-auto px-4 py-20 text-center">Loading...</div></Layout>;
  if (!product) return <Layout><div className="container mx-auto px-4 py-20 text-center">Product not found</div></Layout>;

  const images = (product.images as string[]) ?? [];
  const currentImage = images[imgIdx] || "/placeholder.svg";

  const specs = [
    { label: "Brand", value: product.brand },
    { label: "Horsepower", value: product.horsepower ? `${product.horsepower} HP` : null },
    { label: "Engine Type", value: product.engine_type },
    { label: "Weight", value: product.weight },
    { label: "Fuel Type", value: product.fuel_type },
    { label: "Stock", value: product.stock != null ? `${product.stock} units` : null },
  ].filter((s) => s.value);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Link to="/products" className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-block">&larr; Back to Products</Link>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
              <img src={currentImage} alt={product.name} className="w-full h-full object-cover" />
              {images.length > 1 && (
                <>
                  <button onClick={() => setImgIdx((i) => (i - 1 + images.length) % images.length)} className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 flex items-center justify-center hover:bg-background">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button onClick={() => setImgIdx((i) => (i + 1) % images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 flex items-center justify-center hover:bg-background">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setImgIdx(i)} className={`w-20 h-20 rounded-md overflow-hidden border-2 flex-shrink-0 ${i === imgIdx ? "border-primary" : "border-transparent"}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            {product.brand && <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{product.brand}</span>}
            <h1 className="text-3xl font-bold font-serif">{product.name}</h1>
            <p className="text-3xl font-bold text-gradient-gold">${Number(product.price).toLocaleString()}</p>
            {product.description && <p className="text-muted-foreground leading-relaxed">{product.description}</p>}

            {specs.length > 0 && (
              <div className="border border-border rounded-lg divide-y divide-border">
                {specs.map((s) => (
                  <div key={s.label} className="flex justify-between px-4 py-3">
                    <span className="text-muted-foreground text-sm">{s.label}</span>
                    <span className="font-medium text-sm">{s.value}</span>
                  </div>
                ))}
              </div>
            )}

            <Button
              size="lg"
              className="w-full gradient-gold text-primary-foreground shadow-gold hover:opacity-90"
              onClick={() => addItem({ id: product.id, name: product.name, price: Number(product.price), image: currentImage })}
            >
              <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}