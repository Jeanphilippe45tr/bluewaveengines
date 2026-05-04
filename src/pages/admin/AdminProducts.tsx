import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Trash2, Edit, Upload } from "lucide-react";

export default function AdminProducts() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", description: "", price: "", brand: "", horsepower: "", engine_type: "", weight: "", fuel_type: "", stock: "0", featured: false, category_id: "" });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const { data: products } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*, categories(name)").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*");
      return data ?? [];
    },
  });

  const uploadImages = async (files: File[]): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of files) {
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file);
      if (error) { toast.error(`Failed to upload ${file.name}`); continue; }
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    return urls;
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      setUploading(true);
      let images: string[] = editing?.images || [];
      if (imageFiles.length > 0) {
        const newUrls = await uploadImages(imageFiles);
        images = [...images, ...newUrls];
      }
      const payload = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price) || 0,
        brand: form.brand,
        horsepower: form.horsepower,
        engine_type: form.engine_type,
        weight: form.weight,
        fuel_type: form.fuel_type,
        stock: parseInt(form.stock) || 0,
        featured: form.featured,
        category_id: form.category_id || null,
        images,
      };
      if (editing) {
        await supabase.from("products").update(payload).eq("id", editing.id);
      } else {
        await supabase.from("products").insert(payload);
      }
      setUploading(false);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success(editing ? "Product updated!" : "Product created!");
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("products").delete().eq("id", id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product deleted!");
    },
  });

  const resetForm = () => {
    setForm({ name: "", description: "", price: "", brand: "", horsepower: "", engine_type: "", weight: "", fuel_type: "", stock: "0", featured: false, category_id: "" });
    setImageFiles([]);
    setEditing(null);
    setOpen(false);
  };

  const openEdit = (p: any) => {
    setEditing(p);
    setForm({
      name: p.name, description: p.description || "", price: String(p.price), brand: p.brand || "",
      horsepower: p.horsepower || "", engine_type: p.engine_type || "", weight: p.weight || "",
      fuel_type: p.fuel_type || "", stock: String(p.stock || 0), featured: p.featured || false,
      category_id: p.category_id || "",
    });
    setImageFiles([]);
    setOpen(true);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6 md:mb-8 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold font-serif">Products</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gradient-gold text-primary-foreground shadow-gold hover:opacity-90"><Plus className="h-4 w-4 mr-2" />Add Product</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-serif">{editing ? "Edit" : "Add"} Product</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>Price *</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
              </div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Brand</Label><Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} /></div>
                <div><Label>Horsepower</Label><Input value={form.horsepower} onChange={(e) => setForm({ ...form, horsepower: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Engine Type</Label><Input value={form.engine_type} onChange={(e) => setForm({ ...form, engine_type: e.target.value })} /></div>
                <div><Label>Fuel Type</Label><Input value={form.fuel_type} onChange={(e) => setForm({ ...form, fuel_type: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Weight</Label><Input value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} /></div>
                <div><Label>Stock</Label><Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></div>
              </div>
              <div>
                <Label>Category</Label>
                <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories?.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
                <Label>Featured Product</Label>
              </div>
              <div>
                <Label>Images</Label>
                <div className="mt-2">
                  <label className="flex items-center gap-2 cursor-pointer border-2 border-dashed border-border rounded-lg p-4 hover:border-primary transition-colors">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Click to upload images (any size)</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => setImageFiles(Array.from(e.target.files || []))} />
                  </label>
                  {imageFiles.length > 0 && <p className="text-sm text-muted-foreground mt-2">{imageFiles.length} file(s) selected</p>}
                  {editing?.images?.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {(editing.images as string[]).map((img: string, i: number) => (
                        <img key={i} src={img} alt="" className="w-16 h-16 object-cover rounded" />
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <Button onClick={() => saveMutation.mutate()} disabled={uploading || !form.name || !form.price} className="w-full gradient-gold text-primary-foreground shadow-gold hover:opacity-90">
                {uploading ? "Uploading..." : editing ? "Update Product" : "Create Product"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Product</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Price</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Stock</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Featured</th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products?.map((p: any) => (
              <tr key={p.id}>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={p.images?.[0] || "/placeholder.svg"} alt="" className="w-12 h-12 object-cover rounded" />
                    <div>
                      <p className="font-medium text-sm">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.brand}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 font-medium">${Number(p.price).toLocaleString()}</td>
                <td className="p-4 text-sm">{p.stock}</td>
                <td className="p-4 text-sm">{p.featured ? "⭐" : "—"}</td>
                <td className="p-4 text-right space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(p)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(p.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!products || products.length === 0) && <p className="text-center py-8 text-muted-foreground">No products yet</p>}
      </div>
    </div>
  );
}