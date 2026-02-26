import { useState } from "react";
import { useAdminCoupons, useUpsertCoupon, useDeleteCoupon } from "@/hooks/useAdminData";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Ticket, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";

const AdminCoupons = () => {
  const { data: coupons, isLoading } = useAdminCoupons();
  const upsertCoupon = useUpsertCoupon();
  const deleteCoupon = useDeleteCoupon();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ code: "", discount_type: "percentage", discount_value: 10, max_uses: 1, expiry_date: "", is_public: false, is_active: true });

  const handleSave = async () => {
    if (!form.code) { toast.error("Code is required"); return; }
    try {
      await upsertCoupon.mutateAsync({ ...form, expiry_date: form.expiry_date || undefined });
      toast.success("Coupon saved");
      setDialogOpen(false);
      setForm({ code: "", discount_type: "percentage", discount_value: 10, max_uses: 1, expiry_date: "", is_public: false, is_active: true });
    } catch { toast.error("Failed"); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold font-display text-dashboard-card-foreground flex items-center gap-2">
          <Ticket className="h-5 w-5 text-primary" /> Coupon Management
        </h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" /> Add Coupon</Button></DialogTrigger>
          <DialogContent className="bg-dashboard-card border-dashboard-border text-dashboard-card-foreground">
            <DialogHeader><DialogTitle>New Coupon</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs text-muted-foreground">Code</Label><Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} className="bg-dashboard-bg border-dashboard-border font-mono" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Type</Label>
                  <Select value={form.discount_type} onValueChange={v => setForm({ ...form, discount_type: v })}>
                    <SelectTrigger className="bg-dashboard-bg border-dashboard-border"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="percentage">Percentage</SelectItem><SelectItem value="fixed">Fixed</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs text-muted-foreground">Value</Label><Input type="number" value={form.discount_value} onChange={e => setForm({ ...form, discount_value: +e.target.value })} className="bg-dashboard-bg border-dashboard-border" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs text-muted-foreground">Max Uses</Label><Input type="number" value={form.max_uses} onChange={e => setForm({ ...form, max_uses: +e.target.value })} className="bg-dashboard-bg border-dashboard-border" /></div>
                <div><Label className="text-xs text-muted-foreground">Expiry</Label><Input type="date" value={form.expiry_date} onChange={e => setForm({ ...form, expiry_date: e.target.value })} className="bg-dashboard-bg border-dashboard-border" /></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2"><Switch checked={form.is_public} onCheckedChange={v => setForm({ ...form, is_public: v })} /><Label className="text-xs">Public</Label></div>
                <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={v => setForm({ ...form, is_active: v })} /><Label className="text-xs">Active</Label></div>
              </div>
              <Button onClick={handleSave} disabled={upsertCoupon.isPending} className="w-full">{upsertCoupon.isPending ? "Saving…" : "Create Coupon"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-dashboard-card border-dashboard-border">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 bg-dashboard-border" />)}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-dashboard-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground text-xs">Code</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Discount</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Uses</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Status</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Expiry</TableHead>
                    <TableHead className="text-muted-foreground text-xs"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(coupons ?? []).map((c) => (
                    <TableRow key={c.id} className="border-dashboard-border">
                      <TableCell className="font-mono text-sm text-dashboard-card-foreground">{c.code}</TableCell>
                      <TableCell className="text-sm text-dashboard-card-foreground">
                        {c.discount_type === "percentage" ? `${c.discount_value}%` : `$${c.discount_value}`}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{c.current_uses}/{c.max_uses}</TableCell>
                      <TableCell>
                        <Badge className={c.is_active ? "bg-emerald-500/20 text-emerald-400" : "bg-destructive/20 text-destructive"} variant="secondary">
                          {c.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{c.expiry_date ? format(new Date(c.expiry_date), "MMM d, yyyy") : "—"}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={async () => { if (confirm("Delete?")) { await deleteCoupon.mutateAsync(c.id); toast.success("Deleted"); } }}>
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
    </div>
  );
};

export default AdminCoupons;
