import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Loader2, Package } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({ fullName: "", phone: "", dateOfBirth: "", address: "" });
  const [loading, setLoading] = useState(false);

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.phone.trim() || !form.dateOfBirth || !form.address.trim()) {
      toast({ title: "All fields are required", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: form.fullName.trim(),
        phone: form.phone.trim(),
        date_of_birth: form.dateOfBirth,
        address: form.address.trim(),
        profile_completed: true,
      })
      .eq("user_id", user!.id);
    setLoading(false);
    if (error) {
      toast({ title: "Failed to save profile", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile completed!", description: "Welcome to DROPEE!" });
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen hero-section flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-2xl border border-border">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-5 sm:mb-6">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-primary flex items-center justify-center">
              <Package className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Complete Your Profile</h1>
              <p className="text-xs text-muted-foreground">Please fill in your details to continue</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-sm">Full Name</Label>
              <Input id="fullName" value={form.fullName} onChange={update("fullName")} placeholder="Your full name" required className="h-11 sm:h-10" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm">Phone Number</Label>
              <Input id="phone" type="tel" value={form.phone} onChange={update("phone")} placeholder="+91 XXXXX XXXXX" required className="h-11 sm:h-10" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dob" className="text-sm">Date of Birth</Label>
              <Input id="dob" type="date" value={form.dateOfBirth} onChange={update("dateOfBirth")} required className="h-11 sm:h-10" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-sm">Home Address</Label>
              <Input id="address" value={form.address} onChange={update("address")} placeholder="Your home address" required className="h-11 sm:h-10" />
            </div>
            <Button type="submit" className="w-full h-11 sm:h-10 text-sm" size="lg" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save & Continue"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
