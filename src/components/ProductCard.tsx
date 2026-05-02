import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  brand?: string;
  horsepower?: string;
}

export default function ProductCard({ id, name, price, image, brand, horsepower }: ProductCardProps) {
  const { addItem } = useCart();

  return (
    <div className="group bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-all duration-300">
      <Link to={`/products/${id}`}>
        <div className="aspect-square overflow-hidden bg-muted">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>
      </Link>
      <div className="p-4 space-y-2">
        {brand && <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{brand}</span>}
        <Link to={`/products/${id}`}>
          <h3 className="font-serif font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors">{name}</h3>
        </Link>
        {horsepower && <p className="text-xs text-muted-foreground">{horsepower} HP</p>}
        <div className="flex items-center justify-between pt-2">
          <span className="text-lg font-bold text-gradient-gold">${price.toLocaleString()}</span>
          <Button
            size="sm"
            className="gradient-gold text-primary-foreground shadow-gold hover:opacity-90"
            onClick={() => addItem({ id, name, price, image })}
          >
            <ShoppingCart className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
      </div>
    </div>
  );
}