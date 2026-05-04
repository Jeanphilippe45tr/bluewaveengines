import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function AdminSettings() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState({ whatsapp_number: "", admin_email: "", business_name: "", business_address: "", currency: "USD", about_text: "" });
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("admin_settings").select("*").limit(1).single();
      return data;
    },
  });

  useEffect(() => {
    if (settings) {
      setForm({
        whatsapp_number: settings.whatsapp_number || "",
        admin_email: settings.admin_email || "",
        business_name: settings.business_name || "",
        business_address: settings.business_address || "",
        currency: settings.currency || "USD",
        about_text: settings.about_text || "",
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    if (settings) {
      await supabase.from("admin_settings").update(form).eq("id", settings.id);
    }
    qc.invalidateQueries({ queryKey: ["admin-settings"] });
    toast.success("Settings saved!");
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) toast.error(error.message);
    else { toast.success("Password changed!"); setNewPassword(""); }
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl">
      <h1 className="text-2xl md:text-3xl font-bold font-serif mb-6 md:mb-8">Settings</h1>
      <div className="space-y-6">
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="font-serif font-semibold text-lg">Business Information</h2>
          <div><Label>Business Name</Label><Input value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} /></div>
          <div><Label>Business Address</Label><Input value={form.business_address} onChange={(e) => setForm({ ...form, business_address: e.target.value })} /></div>
          <div><Label>About Text</Label><Textarea value={form.about_text} onChange={(e) => setForm({ ...form, about_text: e.target.value })} rows={4} /></div>
          <div><Label>Currency</Label><Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} /></div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="font-serif font-semibold text-lg">Contact Information</h2>
          <div><Label>WhatsApp Number (with country code)</Label><Input value={form.whatsapp_number} onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })} placeholder="+1234567890" /></div>
          <div><Label>Email</Label><Input value={form.admin_email} onChange={(e) => setForm({ ...form, admin_email: e.target.value })} /></div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full gradient-gold text-primary-foreground shadow-gold hover:opacity-90">
          {saving ? "Saving..." : "Save Settings"}
        </Button>

        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="font-serif font-semibold text-lg">Change Password</h2>
          <div><Label>New Password</Label><Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" /></div>
          <Button onClick={handleChangePassword} variant="outline">Change Password</Button>
        </div>
      </div>
    </div>
  );
}