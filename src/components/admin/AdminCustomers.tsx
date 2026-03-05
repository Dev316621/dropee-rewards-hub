import { useState } from "react";
import { useAdminCustomers } from "@/hooks/useAdminData";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Users, Plus, Loader2, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const AdminCustomers = () => {
  const [search, setSearch] = useState("");
  const { data: customers, isLoading } = useAdminCustomers(search);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", password: "" });
  const qc = useQueryClient();

  const createUser = useMutation({
    mutationFn: async (data: typeof form) => {
      const { data: result, error } = await supabase.functions.invoke("admin-create-user", {
        body: data,
      });
      if (error) throw error;
      if (result?.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-customers"] });
      toast.success("User created successfully");
      setDialogOpen(false);
      setForm({ full_name: "", email: "", phone: "", password: "" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleCreate = () => {
    if (!form.full_name.trim() || !form.email.trim() || !form.password.trim()) {
      toast.error("Name, email and password are required");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    createUser.mutate(form);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold font-display text-dashboard-card-foreground flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" /> Customer Management
        </h1>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">{customers?.length ?? 0} users</Badge>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" /> Add User</Button>
            </DialogTrigger>
            <DialogContent className="bg-dashboard-card border-dashboard-border text-dashboard-card-foreground">
              <DialogHeader><DialogTitle>Add New User</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label className="text-xs text-muted-foreground">Full Name *</Label><Input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="bg-dashboard-bg border-dashboard-border" /></div>
                <div><Label className="text-xs text-muted-foreground">Email *</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="bg-dashboard-bg border-dashboard-border" /></div>
                <div><Label className="text-xs text-muted-foreground">Phone</Label><Input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" className="bg-dashboard-bg border-dashboard-border" /></div>
                <div><Label className="text-xs text-muted-foreground">Password *</Label><Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min. 6 characters" className="bg-dashboard-bg border-dashboard-border" /></div>
                <Button onClick={handleCreate} disabled={createUser.isPending} className="w-full">
                  {createUser.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create User"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search customers…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-dashboard-card border-dashboard-border text-dashboard-card-foreground" />
      </div>

      <Card className="bg-dashboard-card border-dashboard-border">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 bg-dashboard-border" />)}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-dashboard-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground text-xs">Name</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Phone</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Referral Code</TableHead>
                     <TableHead className="text-muted-foreground text-xs">Joined</TableHead>
                     <TableHead className="text-muted-foreground text-xs">Actions</TableHead>
                   </TableRow>
                 </TableHeader>
                <TableBody>
                  {(customers ?? []).map((c) => (
                    <TableRow key={c.id} className="border-dashboard-border">
                      <TableCell className="text-dashboard-card-foreground text-sm font-medium">{c.full_name || "—"}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{c.phone || "—"}</TableCell>
                      <TableCell><Badge variant="outline" className="font-mono text-[10px] border-dashboard-border text-muted-foreground">{c.referral_code}</Badge></TableCell>
                       <TableCell className="text-muted-foreground text-xs">{format(new Date(c.created_at), "MMM d, yyyy")}</TableCell>
                       <TableCell>
                         <Button variant="ghost" size="icon" className="h-7 w-7 text-primary" onClick={() => navigate(`/admin/customers/${c.user_id}`)}><Eye className="h-3.5 w-3.5" /></Button>
                       </TableCell>
                     </TableRow>
                  ))}
                  {(customers ?? []).length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No customers found</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCustomers;
