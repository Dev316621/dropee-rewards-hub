import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Loader2, Package, ArrowLeft } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", phone: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (form.password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    setLoading(true);
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get("ref");

    const { error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: form.fullName.trim(), phone: form.phone.trim(), referral_source: refCode || "" },
      },
    });
    setLoading(false);

    if (error) {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Check your email!", description: "We sent you a verification link." });
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen hero-section flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-1.5 text-primary-foreground/70 hover:text-primary-foreground mb-6 sm:mb-8 transition-colors text-sm">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to home
        </Link>
        <div className="bg-card rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-2xl border border-border">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-5 sm:mb-6">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-primary flex items-center justify-center">
              <Package className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Create Account</h1>
          </div>
          <form onSubmit={handleRegister} className="space-y-3 sm:space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-sm">Full Name</Label>
              <Input id="fullName" value={form.fullName} onChange={update("fullName")} placeholder="Your full name" required className="h-11 sm:h-10" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm">Phone Number</Label>
              <Input id="phone" type="tel" value={form.phone} onChange={update("phone")} placeholder="+91 XXXXX XXXXX" className="h-11 sm:h-10" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={update("email")} placeholder="you@example.com" required className="h-11 sm:h-10" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm">Password</Label>
              <Input id="password" type="password" value={form.password} onChange={update("password")} placeholder="Min. 6 characters" required className="h-11 sm:h-10" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-sm">Confirm Password</Label>
              <Input id="confirmPassword" type="password" value={form.confirmPassword} onChange={update("confirmPassword")} placeholder="Repeat password" required className="h-11 sm:h-10" />
            </div>
            <Button type="submit" className="w-full h-11 sm:h-10 text-sm" size="lg" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
            </Button>
          </form>
          <p className="mt-4 text-center text-xs sm:text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
