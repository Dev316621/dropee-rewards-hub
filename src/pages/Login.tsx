import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Loader2, Package, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isLoading && user) return <Navigate to="/dashboard" replace />;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } else {
      navigate("/dashboard");
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
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Sign In</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required className="h-11 sm:h-10" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required className="h-11 sm:h-10" />
            </div>
            <Button type="submit" className="w-full h-11 sm:h-10 text-sm" size="lg" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
            </Button>
          </form>
          <div className="mt-4 text-center text-xs sm:text-sm text-muted-foreground space-y-2">
            <Link to="/forgot-password" className="text-primary hover:underline block">Forgot password?</Link>
            <p>Don't have an account? <Link to="/register" className="text-primary hover:underline">Sign up</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
