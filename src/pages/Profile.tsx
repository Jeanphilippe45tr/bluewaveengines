import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      setAddress(profile.address || "");
      setCity(profile.city || "");
      setCountry(profile.country || "");
    }
  }, [profile, user, navigate]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ full_name: fullName, phone, address, city, country }).eq("id", user.id);
    if (error) toast.error("Failed to update profile");
    else { toast.success("Profile updated!"); await refreshProfile(); }
    setSaving(false);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <h1 className="text-3xl font-bold font-serif mb-8">My <span className="text-gradient-gold">Profile</span></h1>
        <div className="space-y-4">
          <div><Label>Email</Label><Input value={user?.email || ""} disabled /></div>
          <div><Label>Full Name</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
          <div><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
          <div><Label>Address</Label><Input value={address} onChange={(e) => setAddress(e.target.value)} /></div>
          <div><Label>City</Label><Input value={city} onChange={(e) => setCity(e.target.value)} /></div>
          <div><Label>Country</Label><Input value={country} onChange={(e) => setCountry(e.target.value)} /></div>
          <Button onClick={handleSave} disabled={saving} className="w-full gradient-gold text-primary-foreground shadow-gold hover:opacity-90">
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </div>
    </Layout>
  );
}