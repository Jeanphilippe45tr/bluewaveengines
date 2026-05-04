import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Menu, X, MessageCircle, Anchor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: "Home", to: "/" },
    { label: "Products", to: "/products" },
    { label: "About", to: "/about" },
    { label: "Contact", to: "/contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <Anchor className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold font-serif text-secondary">BlueWave<span className="text-gradient-gold"> Engines</span></span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <Link to="/chat" className="relative">
              <MessageCircle className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
            </Link>
          )}
          <Link to="/cart" className="relative">
            <ShoppingCart className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full gradient-gold text-xs font-bold text-primary-foreground">
                {itemCount}
              </span>
            )}
          </Link>
          {user ? (
            <div className="flex items-center gap-2">
              {profile?.is_admin && (
                <Button variant="outline" size="sm" onClick={() => navigate("/admin")} className="inline-flex">
                  Admin
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => navigate("/profile")}>
                <User className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground text-xs">
                Logout
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={() => navigate("/auth")} className="gradient-gold text-primary-foreground shadow-gold hover:opacity-90">
              Sign In
            </Button>
          )}
          <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 space-y-3">
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to} className="block text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(false)}>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}