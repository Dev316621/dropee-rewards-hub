import { useState } from "react";
import { useAdminDeliveries, useCreateDelivery, useUpdateDelivery, useDeleteDelivery, useAdminCustomers } from "@/hooks/useAdminData";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Truck, Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-400",
  in_transit: "bg-blue-500/20 text-blue-400",
  completed: "bg-emerald-500/20 text-emerald-400",
  cancelled: "bg-destructive/20 text-destructive",
};

const AdminDeliveries = () => {
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const { data, isLoading } = useAdminDeliveries(page, statusFilter);
  const createDelivery = useCreateDelivery();
  const updateDelivery = useUpdateDelivery();
  const deleteDelivery = useDeleteDelivery();
  const { data: customers } = useAdminCustomers("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ user_id: "", pickup: "", dropoff: "", fee: 0, weight: 0, status: "pending", is_free: false });

  const handleCreate = async () => {
    if (!form.user_id || !form.pickup || !form.dropoff) { toast.error("Fill all required fields"); return; }
    try {
      await createDelivery.mutateAsync(form);
      toast.success("Delivery created");
      setDialogOpen(false);
      setForm({ user_id: "", pickup: "", dropoff: "", fee: 0, weight: 0, status: "pending", is_free: false });
    } catch { toast.error("Failed to create delivery"); }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try { await updateDelivery.mutateAsync({ id, status }); toast.success("Status updated"); }
    catch { toast.error("Update failed"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this delivery?")) return;
    try { await deleteDelivery.mutateAsync(id); toast.success("Deleted"); }
    catch { toast.error("Delete failed"); }
  };

  const pageSize = 20;
  const totalPages = Math.ceil((data?.count ?? 0) / pageSize);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold font-display text-dashboard-card-foreground flex items-center gap-2">
          <Truck className="h-5 w-5 text-primary" /> Delivery Management
        </h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" /> Add Delivery</Button>
          </DialogTrigger>
          <DialogContent className="bg-dashboard-card border-dashboard-border text-dashboard-card-foreground">
            <DialogHeader><DialogTitle>New Delivery</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Customer</Label>
                <Select value={form.user_id} onValueChange={v => setForm({ ...form, user_id: v })}>
                  <SelectTrigger className="bg-dashboard-bg border-dashboard-border"><SelectValue placeholder="Select customer" /></SelectTrigger>
                  <SelectContent>
                    {(customers ?? []).map(c => <SelectItem key={c.user_id} value={c.user_id}>{c.full_name || c.user_id.slice(0, 8)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs text-muted-foreground">Pickup</Label><Input value={form.pickup} onChange={e => setForm({ ...form, pickup: e.target.value })} className="bg-dashboard-bg border-dashboard-border" /></div>
                <div><Label className="text-xs text-muted-foreground">Dropoff</Label><Input value={form.dropoff} onChange={e => setForm({ ...form, dropoff: e.target.value })} className="bg-dashboard-bg border-dashboard-border" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs text-muted-foreground">Fee ($)</Label><Input type="number" value={form.fee} onChange={e => setForm({ ...form, fee: +e.target.value })} className="bg-dashboard-bg border-dashboard-border" /></div>
                <div><Label className="text-xs text-muted-foreground">Weight (kg)</Label><Input type="number" value={form.weight} onChange={e => setForm({ ...form, weight: +e.target.value })} className="bg-dashboard-bg border-dashboard-border" /></div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_free} onCheckedChange={v => setForm({ ...form, is_free: v })} />
                <Label className="text-xs text-muted-foreground">Free delivery</Label>
              </div>
              <Button onClick={handleCreate} disabled={createDelivery.isPending} className="w-full">
                {createDelivery.isPending ? "Creating…" : "Create Delivery"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(0); }}>
        <SelectTrigger className="w-40 bg-dashboard-card border-dashboard-border text-dashboard-card-foreground"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="in_transit">In Transit</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>

      <Card className="bg-dashboard-card border-dashboard-border">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 bg-dashboard-border" />)}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-dashboard-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground text-xs">Customer</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Route</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Fee</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Status</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Date</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data?.data ?? []).map((d: any) => (
                    <TableRow key={d.id} className="border-dashboard-border">
                      <TableCell className="text-dashboard-card-foreground text-sm font-mono text-xs">{d.user_id.slice(0, 8)}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{d.pickup} → {d.dropoff}</TableCell>
                      <TableCell className="text-dashboard-card-foreground text-sm">
                        {d.is_free ? <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px]">FREE</Badge> : `$${d.fee}`}
                      </TableCell>
                      <TableCell>
                        <Select value={d.status} onValueChange={v => handleStatusChange(d.id, v)}>
                          <SelectTrigger className="h-7 text-xs w-28 border-0 p-0">
                            <Badge className={`${statusColors[d.status] || ""} text-[10px]`}>{d.status}</Badge>
                          </SelectTrigger>
                          <SelectContent>
                            {["pending", "in_transit", "completed", "cancelled"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">{format(new Date(d.created_at), "MMM d")}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(d.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8 border-dashboard-border" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground">{page + 1} / {totalPages}</span>
          <Button variant="outline" size="icon" className="h-8 w-8 border-dashboard-border" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminDeliveries;
