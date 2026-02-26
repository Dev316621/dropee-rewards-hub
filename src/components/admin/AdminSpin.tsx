import { useAdminSpinConfig, useUpsertSpinSlot, useDeleteSpinSlot, useUpdateSpinConfig } from "@/hooks/useAdminData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Disc3, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const AdminSpin = () => {
  const { data, isLoading } = useAdminSpinConfig();
  const upsertSlot = useUpsertSpinSlot();
  const deleteSlot = useDeleteSpinSlot();
  const updateConfig = useUpdateSpinConfig();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ label: "", prize_type: "no_prize", prize_value: "", probability_weight: 1, color: "#FF6B35", icon: "🎁", spin_type: "daily", is_active: true, display_order: 0, coupon_expiry_days: 7 });

  const handleSaveSlot = async () => {
    if (!form.label) { toast.error("Label required"); return; }
    try { await upsertSlot.mutateAsync(form); toast.success("Slot saved"); setDialogOpen(false); }
    catch { toast.error("Failed"); }
  };

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48 bg-dashboard-border" /><Skeleton className="h-64 bg-dashboard-border" /></div>;

  const configs = data?.configs ?? [];
  const slots = data?.slots ?? [];
  const dailySlots = slots.filter(s => s.spin_type === "daily");
  const weeklySlots = slots.filter(s => s.spin_type === "weekly");

  const totalWeight = (type: string) => slots.filter(s => s.spin_type === type && s.is_active).reduce((s, sl) => s + sl.probability_weight, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold font-display text-dashboard-card-foreground flex items-center gap-2">
          <Disc3 className="h-5 w-5 text-primary" /> Spin Wheel Management
        </h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" /> Add Slot</Button></DialogTrigger>
          <DialogContent className="bg-dashboard-card border-dashboard-border text-dashboard-card-foreground max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>New Spin Slot</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs text-muted-foreground">Label</Label><Input value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} className="bg-dashboard-bg border-dashboard-border" /></div>
                <div><Label className="text-xs text-muted-foreground">Icon</Label><Input value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} className="bg-dashboard-bg border-dashboard-border" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Prize Type</Label>
                  <Select value={form.prize_type} onValueChange={v => setForm({ ...form, prize_type: v })}>
                    <SelectTrigger className="bg-dashboard-bg border-dashboard-border"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["no_prize", "points", "coupon", "free_delivery", "mystery_box", "custom_message"].map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs text-muted-foreground">Prize Value</Label><Input value={form.prize_value} onChange={e => setForm({ ...form, prize_value: e.target.value })} className="bg-dashboard-bg border-dashboard-border" /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label className="text-xs text-muted-foreground">Weight</Label><Input type="number" value={form.probability_weight} onChange={e => setForm({ ...form, probability_weight: +e.target.value })} className="bg-dashboard-bg border-dashboard-border" /></div>
                <div><Label className="text-xs text-muted-foreground">Color</Label><Input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="bg-dashboard-bg border-dashboard-border h-9" /></div>
                <div>
                  <Label className="text-xs text-muted-foreground">Spin Type</Label>
                  <Select value={form.spin_type} onValueChange={v => setForm({ ...form, spin_type: v })}>
                    <SelectTrigger className="bg-dashboard-bg border-dashboard-border"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="daily">Daily</SelectItem><SelectItem value="weekly">Weekly</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label className="text-xs text-muted-foreground">Coupon Expiry (days)</Label><Input type="number" value={form.coupon_expiry_days} onChange={e => setForm({ ...form, coupon_expiry_days: +e.target.value })} className="bg-dashboard-bg border-dashboard-border" /></div>
              <Button onClick={handleSaveSlot} disabled={upsertSlot.isPending} className="w-full">{upsertSlot.isPending ? "Saving…" : "Save Slot"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Config toggles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {configs.map(c => (
          <Card key={c.id} className="bg-dashboard-card border-dashboard-border">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-dashboard-card-foreground capitalize">{c.spin_type} Spin</p>
                <Switch checked={c.enabled ?? true} onCheckedChange={v => updateConfig.mutate({ id: c.id, enabled: v })} />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">Max Spins:</Label>
                <Input
                  type="number"
                  defaultValue={c.max_spins ?? 1}
                  className="bg-dashboard-bg border-dashboard-border w-20 h-7 text-xs"
                  onBlur={e => updateConfig.mutate({ id: c.id, max_spins: +e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Slots */}
      {[{ label: "Daily Slots", items: dailySlots, type: "daily" }, { label: "Weekly Slots", items: weeklySlots, type: "weekly" }].map(({ label, items, type }) => (
        <Card key={type} className="bg-dashboard-card border-dashboard-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-dashboard-card-foreground flex items-center justify-between">
              {label}
              <Badge variant="secondary" className="text-[10px]">Total weight: {totalWeight(type)}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {items.length === 0 && <p className="text-xs text-muted-foreground py-4 text-center">No slots configured</p>}
            {items.map(slot => {
              const pct = totalWeight(type) > 0 ? ((slot.probability_weight / totalWeight(type)) * 100).toFixed(1) : "0";
              return (
                <div key={slot.id} className="flex items-center gap-3 p-2 rounded-lg bg-dashboard-bg border border-dashboard-border">
                  <div className="h-8 w-8 rounded-md flex items-center justify-center text-lg shrink-0" style={{ backgroundColor: slot.color ?? "#FF6B35" }}>
                    {slot.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dashboard-card-foreground truncate">{slot.label}</p>
                    <p className="text-[10px] text-muted-foreground">{slot.prize_type.replace(/_/g, " ")} {slot.prize_value ? `· ${slot.prize_value}` : ""} · {pct}%</p>
                  </div>
                  <Badge className={slot.is_active ? "bg-emerald-500/20 text-emerald-400" : "bg-muted text-muted-foreground"} variant="secondary">
                    {slot.is_active ? "On" : "Off"}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive shrink-0" onClick={async () => { if (confirm("Delete slot?")) { await deleteSlot.mutateAsync(slot.id); toast.success("Deleted"); } }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminSpin;
