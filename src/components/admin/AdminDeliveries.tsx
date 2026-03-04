import { useState } from "react";
import { useAdminDeliveries, useCreateDelivery, useUpdateDelivery, useDeleteDelivery, useAdminCustomers } from "@/hooks/useAdminData";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Truck, Plus, Trash2, ChevronLeft, ChevronRight, MessageCircle, MapPin, Printer, Eye, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-400",
  out_for_delivery: "bg-blue-500/20 text-blue-400",
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
  const qc = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [receiptDialog, setReceiptDialog] = useState<any>(null);
  const [locationDialog, setLocationDialog] = useState<any>(null);
  const [form, setForm] = useState({
    user_id: "", pickup: "", dropoff: "", fee: 0, weight: 0, status: "pending",
    is_free: false, recipient_name: "", description: "", receipt: "",
  });

  const handleCreate = async () => {
    if (!form.user_id || !form.pickup || !form.dropoff) { toast.error("Fill required fields"); return; }
    try {
      await createDelivery.mutateAsync(form);
      toast.success("Delivery created");
      setDialogOpen(false);
      setForm({ user_id: "", pickup: "", dropoff: "", fee: 0, weight: 0, status: "pending", is_free: false, recipient_name: "", description: "", receipt: "" });
    } catch { toast.error("Failed to create"); }
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

  const getCustomerPhone = (userId: string) => {
    const c = (customers ?? []).find((c) => c.user_id === userId);
    return c?.phone || "";
  };

  const getCustomerName = (userId: string) => {
    const c = (customers ?? []).find((c) => c.user_id === userId);
    return c?.full_name || userId.slice(0, 8);
  };

  const sendWhatsApp = (d: any) => {
    const phone = getCustomerPhone(d.user_id).replace(/[^0-9+]/g, "").replace(/^\+/, "");
    const msg = `📦 *DROPEE Delivery Update*\n\nRecipient: ${d.recipient_name || getCustomerName(d.user_id)}\nDescription: ${d.description || "N/A"}\nPickup: ${d.pickup}\nDropoff: ${d.dropoff}\nStatus: ${d.status.replace(/_/g, " ").toUpperCase()}\n\nThank you for using DROPEE!`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const requestLocation = useMutation({
    mutationFn: async (delivery: any) => {
      const token = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
      const { error } = await supabase.from("location_requests").insert({
        delivery_id: delivery.id,
        user_id: delivery.user_id,
        token,
      });
      if (error) throw error;
      return { token, delivery };
    },
    onSuccess: ({ token, delivery }) => {
      const url = `${window.location.origin}/share-location/${token}`;
      const phone = getCustomerPhone(delivery.user_id).replace(/[^0-9+]/g, "").replace(/^\+/, "");
      const msg = `📍 *DROPEE - Share Your Location*\n\nHi! Please share your location so we can deliver your package:\n${url}`;
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
      toast.success("Location request created");
    },
    onError: () => toast.error("Failed to create location request"),
  });

  // Fetch location for a delivery
  const locationQuery = useQuery({
    queryKey: ["location-request", locationDialog?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("location_requests")
        .select("*")
        .eq("delivery_id", locationDialog.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      return data;
    },
    enabled: !!locationDialog,
  });

  const printReceipt = () => {
    const w = window.open("", "_blank");
    if (!w || !receiptDialog) return;
    w.document.write(`<html><head><title>Receipt</title><style>body{font-family:sans-serif;padding:40px;max-width:600px;margin:0 auto}h1{font-size:20px}p{margin:4px 0}hr{margin:16px 0;border:none;border-top:1px solid #ddd}.label{color:#666;font-size:12px}</style></head><body>
      <h1>📦 DROPEE Delivery Receipt</h1><hr>
      <p class="label">Recipient</p><p>${receiptDialog.recipient_name || "—"}</p>
      <p class="label">Description</p><p>${receiptDialog.description || "—"}</p>
      <p class="label">Route</p><p>${receiptDialog.pickup} → ${receiptDialog.dropoff}</p>
      <p class="label">Status</p><p>${receiptDialog.status}</p>
      <p class="label">Fee</p><p>${receiptDialog.is_free ? "FREE" : "$" + receiptDialog.fee}</p>
      <p class="label">Date</p><p>${format(new Date(receiptDialog.created_at), "MMM d, yyyy HH:mm")}</p>
      <hr><p class="label">Receipt Notes</p><p>${receiptDialog.receipt || "—"}</p>
      <hr><p style="text-align:center;color:#999;font-size:11px">DROPEE Delivery Services</p>
    </body></html>`);
    w.document.close();
    w.print();
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
          <DialogContent className="bg-dashboard-card border-dashboard-border text-dashboard-card-foreground max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>New Delivery</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Customer *</Label>
                <Select value={form.user_id} onValueChange={v => setForm({ ...form, user_id: v })}>
                  <SelectTrigger className="bg-dashboard-bg border-dashboard-border"><SelectValue placeholder="Select customer" /></SelectTrigger>
                  <SelectContent>
                    {(customers ?? []).map(c => <SelectItem key={c.user_id} value={c.user_id}>{c.full_name || c.user_id.slice(0, 8)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs text-muted-foreground">Recipient Name</Label><Input value={form.recipient_name} onChange={e => setForm({ ...form, recipient_name: e.target.value })} className="bg-dashboard-bg border-dashboard-border" /></div>
              <div><Label className="text-xs text-muted-foreground">Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="bg-dashboard-bg border-dashboard-border" rows={2} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs text-muted-foreground">Pickup *</Label><Input value={form.pickup} onChange={e => setForm({ ...form, pickup: e.target.value })} className="bg-dashboard-bg border-dashboard-border" /></div>
                <div><Label className="text-xs text-muted-foreground">Dropoff *</Label><Input value={form.dropoff} onChange={e => setForm({ ...form, dropoff: e.target.value })} className="bg-dashboard-bg border-dashboard-border" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs text-muted-foreground">Fee ($)</Label><Input type="number" value={form.fee} onChange={e => setForm({ ...form, fee: +e.target.value })} className="bg-dashboard-bg border-dashboard-border" /></div>
                <div><Label className="text-xs text-muted-foreground">Weight (kg)</Label><Input type="number" value={form.weight} onChange={e => setForm({ ...form, weight: +e.target.value })} className="bg-dashboard-bg border-dashboard-border" /></div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Status</Label>
                <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                  <SelectTrigger className="bg-dashboard-bg border-dashboard-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                    <SelectItem value="completed">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs text-muted-foreground">Receipt Notes</Label><Textarea value={form.receipt} onChange={e => setForm({ ...form, receipt: e.target.value })} className="bg-dashboard-bg border-dashboard-border" rows={2} placeholder="Receipt details..." /></div>
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
        <SelectTrigger className="w-44 bg-dashboard-card border-dashboard-border text-dashboard-card-foreground"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
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
                    <TableHead className="text-muted-foreground text-xs">Recipient</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Description</TableHead>
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
                      <TableCell className="text-dashboard-card-foreground text-sm font-medium">
                        {d.recipient_name || getCustomerName(d.user_id)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs max-w-[150px] truncate">{d.description || "—"}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{d.pickup} → {d.dropoff}</TableCell>
                      <TableCell className="text-dashboard-card-foreground text-sm">
                        {d.is_free ? <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px]">FREE</Badge> : `$${d.fee}`}
                      </TableCell>
                      <TableCell>
                        <Select value={d.status} onValueChange={v => handleStatusChange(d.id, v)}>
                          <SelectTrigger className="h-7 text-xs w-32 border-0 p-0">
                            <Badge className={`${statusColors[d.status] || ""} text-[10px]`}>{d.status.replace(/_/g, " ")}</Badge>
                          </SelectTrigger>
                          <SelectContent>
                            {["pending", "out_for_delivery", "in_transit", "completed", "cancelled"].map(s =>
                              <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">{format(new Date(d.created_at), "MMM d")}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-primary" title="View Receipt" onClick={() => setReceiptDialog(d)}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-400" title="WhatsApp" onClick={() => sendWhatsApp(d)}>
                            <MessageCircle className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-400" title="Request Location" onClick={() => requestLocation.mutate(d)} disabled={requestLocation.isPending}>
                            <MapPin className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" title="View Map" onClick={() => setLocationDialog(d)}>
                            <MapPin className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(d.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
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

      {/* Receipt Dialog */}
      <Dialog open={!!receiptDialog} onOpenChange={() => setReceiptDialog(null)}>
        <DialogContent className="bg-dashboard-card border-dashboard-border text-dashboard-card-foreground max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Printer className="h-4 w-4" /> Delivery Receipt</DialogTitle></DialogHeader>
          {receiptDialog && (
            <div className="space-y-3 text-sm">
              <div><span className="text-muted-foreground text-xs">Recipient</span><p className="font-medium">{receiptDialog.recipient_name || "—"}</p></div>
              <div><span className="text-muted-foreground text-xs">Description</span><p>{receiptDialog.description || "—"}</p></div>
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground text-xs">Pickup</span><p>{receiptDialog.pickup}</p></div>
                <div><span className="text-muted-foreground text-xs">Dropoff</span><p>{receiptDialog.dropoff}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground text-xs">Status</span><p><Badge className={`${statusColors[receiptDialog.status] || ""} text-[10px]`}>{receiptDialog.status.replace(/_/g, " ")}</Badge></p></div>
                <div><span className="text-muted-foreground text-xs">Fee</span><p>{receiptDialog.is_free ? "FREE" : `$${receiptDialog.fee}`}</p></div>
              </div>
              <div><span className="text-muted-foreground text-xs">Date</span><p>{format(new Date(receiptDialog.created_at), "MMM d, yyyy HH:mm")}</p></div>
              <div className="border-t border-dashboard-border pt-3"><span className="text-muted-foreground text-xs">Receipt Notes</span><p>{receiptDialog.receipt || "—"}</p></div>
              <Button onClick={printReceipt} className="w-full gap-2"><Printer className="h-4 w-4" /> Print Receipt</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Location Map Dialog */}
      <Dialog open={!!locationDialog} onOpenChange={() => setLocationDialog(null)}>
        <DialogContent className="bg-dashboard-card border-dashboard-border text-dashboard-card-foreground max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><MapPin className="h-4 w-4" /> User Location</DialogTitle></DialogHeader>
          {locationDialog && (
            <div className="space-y-3">
              {locationQuery.isLoading ? (
                <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : locationQuery.data?.status === "completed" && locationQuery.data.latitude && locationQuery.data.longitude ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Coordinates: {locationQuery.data.latitude.toFixed(6)}, {locationQuery.data.longitude.toFixed(6)}
                  </p>
                  <iframe
                    className="w-full h-64 rounded-lg border border-dashboard-border"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${locationQuery.data.longitude - 0.005}%2C${locationQuery.data.latitude - 0.005}%2C${locationQuery.data.longitude + 0.005}%2C${locationQuery.data.latitude + 0.005}&layer=mapnik&marker=${locationQuery.data.latitude}%2C${locationQuery.data.longitude}`}
                    loading="lazy"
                  />
                  <Button variant="outline" className="w-full" onClick={() => window.open(`https://www.google.com/maps?q=${locationQuery.data!.latitude},${locationQuery.data!.longitude}`, "_blank")}>
                    Open in Google Maps
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No location shared yet</p>
                  <Button className="mt-3 gap-2" size="sm" onClick={() => requestLocation.mutate(locationDialog)} disabled={requestLocation.isPending}>
                    <MessageCircle className="h-3.5 w-3.5" /> Request via WhatsApp
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDeliveries;
