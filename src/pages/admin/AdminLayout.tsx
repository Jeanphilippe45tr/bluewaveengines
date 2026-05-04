import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Anchor, Package, FolderOpen, ShoppingBag, MessageCircle, Settings, Receipt, Users, LayoutDashboard, Menu, X } from "lucide-react";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: FolderOpen },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/receipts", label: "Receipts", icon: Receipt },
  { to: "/admin/chat", label: "Chat", icon: MessageCircle },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !profile?.is_admin)) navigate("/");
  }, [user, profile, loading, navigate]);

  if (loading || !profile?.is_admin) return null;

  return (
    <div className="flex h-screen bg-muted">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-secondary text-secondary-foreground flex flex-col transform transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="p-4 border-b border-secondary-foreground/10">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Anchor className="h-6 w-6 text-primary" />
              <span className="font-serif font-bold">BlueWave<span className="text-primary"> Engines</span></span>
            </Link>
            <button className="lg:hidden text-secondary-foreground/70 hover:text-secondary-foreground" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-xs text-secondary-foreground/50 mt-1">Admin Panel</p>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                location.pathname === item.to ? "bg-primary/20 text-primary font-medium" : "text-secondary-foreground/70 hover:text-secondary-foreground hover:bg-secondary-foreground/5"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-secondary-foreground/10">
          <Link to="/" className="text-xs text-secondary-foreground/50 hover:text-primary transition-colors">← Back to Site</Link>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-30 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-serif font-bold text-sm">Admin Panel</span>
        </div>
        <Outlet />
      </main>
    </div>
  );
}