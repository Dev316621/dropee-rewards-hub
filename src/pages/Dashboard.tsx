import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Package } from "lucide-react";

const Dashboard = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-[hsl(var(--dashboard-bg))] text-[hsl(var(--dashboard-card-foreground))]">
      <header className="border-b border-[hsl(var(--dashboard-border))] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
            <Package className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold">DROPEE Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{user?.email}</span>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>
      <main className="p-6 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Welcome to your Dashboard</h2>
        <p className="text-muted-foreground">Your gamified delivery dashboard is coming next in Phase 3.</p>
      </main>
    </div>
  );
};

export default Dashboard;
