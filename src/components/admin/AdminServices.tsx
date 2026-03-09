import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Plus, Trash2, Loader2, Package, Clock, CheckCircle2, XCircle, Truck, User, Edit } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import ImageUpload from "./ImageUpload";

// ── Hooks ──
const useServiceTypes = () =>
  useQuery({
    queryKey: ["admin-service-types"],
    queryFn: async () => {
      const { data, error } = await supabase.from("service_types").select("*").order("display_order");
      if (error) throw error;
      return data ?? [];
    },
  });

const useUpsertServiceType = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (st: { id?: string; name: string; description?: string; icon?: string; base_price: number; is_active?: boolean; display_order?: number; image_url?: string | null }) => {
      const { error } = st.id
        ? await supabase.from("service_types").update(st).eq("id", st.id)
        : await supabase.from("service_types").insert(st);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-service-types"] }),
  });
};

const useDeleteServiceType = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("service_types").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-service-types"] }),
  });
};

const useLiveOrders = () => {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["admin-live-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("live_orders")
        .select("*, service_types(name, icon)")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("live-orders-admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "live_orders" }, () => {
        qc.invalidateQueries({ queryKey: ["admin-live-orders"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [qc]);

  return query;
};

const useUpdateLiveOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; status?: string; assigned_to?: string; notes?: string; estimated_fee?: number }) => {
      const { error } = await supabase.from("live_orders").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-live-orders"] }),
  });
};

const statusColors: Record<string, string> = {
  new: "bg-blue-500/20 text-blue-400",
  accepted: "bg-yellow-500/20 text-yellow-400",
  in_progress: "bg-primary/20 text-primary",
  completed: "bg-green-500/20 text-green-400",
  cancelled: "bg-destructive/20 text-destructive",
};

const statusIcons: Record<string, any> = {
  new: Clock,
  accepted: CheckCircle2,
  in_progress: Truck,
  completed: CheckCircle2,
  cancelled: XCircle,
};

// ── Service Types Tab ──
const ServiceTypesTab = () => {
  const { data: types } = useServiceTypes();
  const upsert = useUpsertServiceType();
  const del = useDeleteServiceType();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | undefined>();
  const [form, setForm] = useState({ name: "", description: "", icon: "Package", base_price: 0, display_order: 0, image_url: "" });

  const resetForm = () => {
    setEditId(undefined);
    setForm({ name: "", description: "", icon: "Package", base_price: 0, display_order: 0, image_url: "" });
  };

  const handleSave = () => {
    upsert.mutate({ ...form, image_url: form.image_url || null, id: editId }, {
      onSuccess: () => { toast.success("Saved"); setOpen(false); resetForm(); },
      onError: () => toast.error("Failed"),
    });
  };

  const handleEdit = (t: any) => {
    setEditId(t.id);
    setForm({
      name: t.name,
      description: t.description || "",
      icon: t.icon || "Package",
      base_price: Number(t.base_price),
      display_order: t.display_order,
      image_url: t.image_url || "",
    });
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{(types ?? []).length} service types</p>
        <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1 text-xs"><Plus className="h-3 w-3" /> Add Service</Button>
          </DialogTrigger>
          <DialogContent className="bg-dashboard-card border-dashboard-border max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="text-dashboard-card-foreground">{editId ? "Edit" : "New"} Service Type</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <ImageUpload
                value={form.image_url}
                onChange={url => setForm({ ...form, image_url: url })}
                label="Service Image"
                folder="services"
              />
              <div><Label className="text-xs">Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-dashboard-bg border-dashboard-border" placeholder="e.g. Laundry, Electrician, House Cleaning" /></div>
              <div><Label className="text-xs">Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="bg-dashboard-bg border-dashboard-border" rows={2} placeholder="Describe the service..." /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Icon (Lucide name)</Label><Input value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} className="bg-dashboard-bg border-dashboard-border" placeholder="Package" /></div>
                <div><Label className="text-xs">Base Price (₹)</Label><Input type="number" value={form.base_price} onChange={e => setForm({ ...form, base_price: Number(e.target.value) })} className="bg-dashboard-bg border-dashboard-border" /></div>
              </div>
              <div><Label className="text-xs">Display Order</Label><Input type="number" value={form.display_order} onChange={e => setForm({ ...form, display_order: Number(e.target.value) })} className="bg-dashboard-bg border-dashboard-border" /></div>
              <Button onClick={handleSave} disabled={upsert.isPending || !form.name} className="w-full">{upsert.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Card grid view for services */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {(types ?? []).map(t => (
          <Card key={t.id} className="bg-dashboard-card border-dashboard-border overflow-hidden">
            {t.image_url && (
              <div className="h-32 w-full overflow-hidden">
                <img src={t.image_url} alt={t.name} className="w-full h-full object-cover" />
              </div>
            )}
            <CardContent className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-dashboard-card-foreground">{t.name}</h3>
                <Badge variant={t.is_active ? "default" : "secondary"} className="text-[10px]">
                  {t.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              {t.description && <p className="text-xs text-muted-foreground line-clamp-2">{t.description}</p>}
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-primary">₹{t.base_price}</span>
                <div className="flex gap-1">
                  <Switch
                    checked={t.is_active}
                    onCheckedChange={v => upsert.mutate({ id: t.id, name: t.name, base_price: Number(t.base_price), is_active: v }, { onSuccess: () => toast.success("Updated") })}
                  />
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(t)} className="h-7 w-7 p-0"><Edit className="h-3 w-3" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => del.mutate(t.id, { onSuccess: () => toast.success("Deleted") })} className="text-destructive h-7 w-7 p-0"><Trash2 className="h-3 w-3" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ── Live Orders Tab ──
const LiveOrdersTab = () => {
  const { data: orders, isLoading } = useLiveOrders();
  const update = useUpdateLiveOrder();
  const [selectedStatus, setSelectedStatus] = useState("all");

  const filtered = selectedStatus === "all" ? orders : orders?.filter(o => o.status === selectedStatus);

  const handleStatusChange = (id: string, status: string) => {
    update.mutate({ id, status }, { onSuccess: () => toast.success(`Order ${status}`) });
  };

  const handleAssign = (id: string, name: string) => {
    update.mutate({ id, assigned_to: name }, { onSuccess: () => toast.success("Assigned") });
  };

  if (isLoading) return <div className="text-muted-foreground text-sm p-4">Loading orders...</div>;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {["all", "new", "accepted", "in_progress", "completed", "cancelled"].map(s => (
          <Button
            key={s}
            size="sm"
            variant={selectedStatus === s ? "default" : "outline"}
            onClick={() => setSelectedStatus(s)}
            className="text-xs h-7 capitalize"
          >
            {s.replace("_", " ")} {s !== "all" && `(${(orders ?? []).filter(o => o.status === s).length})`}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {(filtered ?? []).map((order: any) => {
          const StatusIcon = statusIcons[order.status] || Clock;
          return (
            <Card key={order.id} className="bg-dashboard-card border-dashboard-border">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className={`text-[10px] ${statusColors[order.status] || ""}`}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {order.status.replace("_", " ")}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">{format(new Date(order.created_at), "HH:mm, MMM d")}</span>
                </div>

                <div className="text-xs space-y-1">
                  <p className="text-dashboard-card-foreground"><span className="text-muted-foreground">Service:</span> {order.service_types?.name || "—"}</p>
                  <p className="text-dashboard-card-foreground"><span className="text-muted-foreground">Pickup:</span> {order.pickup}</p>
                  <p className="text-dashboard-card-foreground"><span className="text-muted-foreground">Dropoff:</span> {order.dropoff}</p>
                  {order.notes && <p className="text-muted-foreground italic">{order.notes}</p>}
                  <p className="text-dashboard-card-foreground font-medium">₹{order.estimated_fee}</p>
                </div>

                <div className="flex gap-1">
                  <Input
                    placeholder="Assign driver"
                    defaultValue={order.assigned_to || ""}
                    onBlur={e => { if (e.target.value !== (order.assigned_to || "")) handleAssign(order.id, e.target.value); }}
                    className="bg-dashboard-bg border-dashboard-border text-xs h-7"
                  />
                </div>

                <div className="flex gap-1 flex-wrap">
                  {order.status === "new" && (
                    <>
                      <Button size="sm" onClick={() => handleStatusChange(order.id, "accepted")} className="text-xs h-7 flex-1 gap-1 bg-green-600 hover:bg-green-700">
                        <CheckCircle2 className="h-3 w-3" /> Accept
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleStatusChange(order.id, "cancelled")} className="text-xs h-7 flex-1 gap-1">
                        <XCircle className="h-3 w-3" /> Reject
                      </Button>
                    </>
                  )}
                  {order.status === "accepted" && (
                    <Button size="sm" onClick={() => handleStatusChange(order.id, "in_progress")} className="text-xs h-7 flex-1 gap-1">
                      <Truck className="h-3 w-3" /> Start Delivery
                    </Button>
                  )}
                  {order.status === "in_progress" && (
                    <Button size="sm" onClick={() => handleStatusChange(order.id, "completed")} className="text-xs h-7 flex-1 gap-1 bg-green-600 hover:bg-green-700">
                      <CheckCircle2 className="h-3 w-3" /> Complete
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {(filtered ?? []).length === 0 && (
          <div className="col-span-full text-center text-muted-foreground text-sm py-12">No orders found</div>
        )}
      </div>
    </div>
  );
};

// ── Main ──
const AdminServices = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold font-display text-dashboard-card-foreground flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" /> Services Management
        </h1>
        <p className="text-xs text-muted-foreground mt-1">Manage service types and process live orders in real-time</p>
      </div>

      <Tabs defaultValue="types">
        <TabsList className="bg-dashboard-border">
          <TabsTrigger value="types" className="text-xs">Service Types</TabsTrigger>
          <TabsTrigger value="orders" className="text-xs">Live Orders</TabsTrigger>
        </TabsList>
        <TabsContent value="types"><ServiceTypesTab /></TabsContent>
        <TabsContent value="orders"><LiveOrdersTab /></TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminServices;
