import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Globe, Plus, Trash2, RefreshCw, Loader2, ExternalLink, Package } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const useApiIntegrations = () =>
  useQuery({
    queryKey: ["admin-api-integrations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("api_integrations").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

const useTrackedOrders = () =>
  useQuery({
    queryKey: ["admin-tracked-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tracked_orders").select("*").order("created_at", { ascending: false }).limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });

const useAdminCustomersList = () =>
  useQuery({
    queryKey: ["admin-customers-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("user_id, full_name, phone").order("full_name").limit(500);
      if (error) throw error;
      return data ?? [];
    },
  });

const AdminApiIntegrations = () => {
  const qc = useQueryClient();
  const { data: integrations, isLoading: intLoading } = useApiIntegrations();
  const { data: orders, isLoading: ordLoading } = useTrackedOrders();
  const { data: customers } = useAdminCustomersList();

  const [intDialog, setIntDialog] = useState(false);
  const [ordDialog, setOrdDialog] = useState(false);
  const [intForm, setIntForm] = useState({ name: "", base_url: "", api_key_encrypted: "", headers_json: "{}" });
  const [ordForm, setOrdForm] = useState({ integration_id: "", user_id: "", external_order_id: "", tracking_url: "" });

  const createIntegration = useMutation({
    mutationFn: async (data: typeof intForm) => {
      let headers = {};
      try { headers = JSON.parse(data.headers_json); } catch {}
      const { error } = await supabase.from("api_integrations").insert({
        name: data.name,
        base_url: data.base_url,
        api_key_encrypted: data.api_key_encrypted,
        headers_json: headers,
      });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-api-integrations"] }); toast.success("Integration added"); setIntDialog(false); setIntForm({ name: "", base_url: "", api_key_encrypted: "", headers_json: "{}" }); },
    onError: () => toast.error("Failed to create integration"),
  });

  const deleteIntegration = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("api_integrations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-api-integrations"] }); toast.success("Deleted"); },
  });

  const createOrder = useMutation({
    mutationFn: async (data: typeof ordForm) => {
      const { error } = await supabase.from("tracked_orders").insert({
        integration_id: data.integration_id,
        user_id: data.user_id,
        external_order_id: data.external_order_id,
        tracking_url: data.tracking_url,
      });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-tracked-orders"] }); toast.success("Order tracked"); setOrdDialog(false); setOrdForm({ integration_id: "", user_id: "", external_order_id: "", tracking_url: "" }); },
    onError: () => toast.error("Failed to create tracked order"),
  });

  const checkStatus = useMutation({
    mutationFn: async (orderId: string) => {
      const order = (orders ?? []).find(o => o.id === orderId);
      if (!order) throw new Error("Order not found");
      const { data, error } = await supabase.functions.invoke("track-order", {
        body: { integration_id: order.integration_id, order_id: orderId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-tracked-orders"] }); toast.success("Status updated"); },
    onError: (e: Error) => toast.error(e.message || "Failed to check status"),
  });

  const deleteOrder = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tracked_orders").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-tracked-orders"] }); toast.success("Removed"); },
  });

  if (intLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48 bg-dashboard-border" /><Skeleton className="h-64 bg-dashboard-border" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold font-display text-dashboard-card-foreground flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" /> API Integrations & Order Tracking
        </h1>
        <div className="flex gap-2">
          <Dialog open={intDialog} onOpenChange={setIntDialog}>
            <DialogTrigger asChild><Button size="sm" variant="outline" className="gap-1 border-dashboard-border"><Plus className="h-3.5 w-3.5" /> Add API</Button></DialogTrigger>
            <DialogContent className="bg-dashboard-card border-dashboard-border text-dashboard-card-foreground">
              <DialogHeader><DialogTitle>New API Integration</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label className="text-xs text-muted-foreground">Name</Label><Input value={intForm.name} onChange={e => setIntForm({ ...intForm, name: e.target.value })} placeholder="e.g. Aramex Tracking" className="bg-dashboard-bg border-dashboard-border" /></div>
                <div><Label className="text-xs text-muted-foreground">Base URL</Label><Input value={intForm.base_url} onChange={e => setIntForm({ ...intForm, base_url: e.target.value })} placeholder="https://api.example.com/v1" className="bg-dashboard-bg border-dashboard-border" /></div>
                <div><Label className="text-xs text-muted-foreground">API Key</Label><Input type="password" value={intForm.api_key_encrypted} onChange={e => setIntForm({ ...intForm, api_key_encrypted: e.target.value })} className="bg-dashboard-bg border-dashboard-border" /></div>
                <div><Label className="text-xs text-muted-foreground">Custom Headers (JSON)</Label><Textarea value={intForm.headers_json} onChange={e => setIntForm({ ...intForm, headers_json: e.target.value })} placeholder='{"X-Custom": "value"}' className="bg-dashboard-bg border-dashboard-border text-xs font-mono" rows={3} /></div>
                <Button onClick={() => createIntegration.mutate(intForm)} disabled={!intForm.name || !intForm.base_url || createIntegration.isPending} className="w-full">
                  {createIntegration.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Integration"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={ordDialog} onOpenChange={setOrdDialog}>
            <DialogTrigger asChild><Button size="sm" className="gap-1"><Package className="h-3.5 w-3.5" /> Track Order</Button></DialogTrigger>
            <DialogContent className="bg-dashboard-card border-dashboard-border text-dashboard-card-foreground">
              <DialogHeader><DialogTitle>Track New Order</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">API Integration</Label>
                  <Select value={ordForm.integration_id} onValueChange={v => setOrdForm({ ...ordForm, integration_id: v })}>
                    <SelectTrigger className="bg-dashboard-bg border-dashboard-border"><SelectValue placeholder="Select API" /></SelectTrigger>
                    <SelectContent>
                      {(integrations ?? []).map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Customer</Label>
                  <Select value={ordForm.user_id} onValueChange={v => setOrdForm({ ...ordForm, user_id: v })}>
                    <SelectTrigger className="bg-dashboard-bg border-dashboard-border"><SelectValue placeholder="Select user" /></SelectTrigger>
                    <SelectContent>
                      {(customers ?? []).map(c => <SelectItem key={c.user_id} value={c.user_id}>{c.full_name || c.phone || c.user_id}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs text-muted-foreground">External Order ID</Label><Input value={ordForm.external_order_id} onChange={e => setOrdForm({ ...ordForm, external_order_id: e.target.value })} className="bg-dashboard-bg border-dashboard-border" /></div>
                <div><Label className="text-xs text-muted-foreground">Tracking URL (optional)</Label><Input value={ordForm.tracking_url} onChange={e => setOrdForm({ ...ordForm, tracking_url: e.target.value })} placeholder="https://track.example.com/..." className="bg-dashboard-bg border-dashboard-border" /></div>
                <Button onClick={() => createOrder.mutate(ordForm)} disabled={!ordForm.integration_id || !ordForm.user_id || !ordForm.external_order_id || createOrder.isPending} className="w-full">
                  {createOrder.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Start Tracking"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Integrations List */}
      <Card className="bg-dashboard-card border-dashboard-border">
        <CardHeader className="pb-2"><CardTitle className="text-sm text-dashboard-card-foreground">API Integrations</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {(integrations ?? []).length === 0 && <p className="text-xs text-muted-foreground py-4 text-center">No integrations configured</p>}
          {(integrations ?? []).map(int => (
            <div key={int.id} className="flex items-center gap-3 p-3 rounded-lg bg-dashboard-bg border border-dashboard-border">
              <Globe className="h-4 w-4 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-dashboard-card-foreground">{int.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{int.base_url}</p>
              </div>
              <Badge variant="secondary" className={int.is_active ? "bg-emerald-500/20 text-emerald-400" : "bg-muted text-muted-foreground"}>{int.is_active ? "Active" : "Off"}</Badge>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { if (confirm("Delete this integration and all its tracked orders?")) deleteIntegration.mutate(int.id); }}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Tracked Orders */}
      <Card className="bg-dashboard-card border-dashboard-border">
        <CardHeader className="pb-2"><CardTitle className="text-sm text-dashboard-card-foreground">Tracked Orders</CardTitle></CardHeader>
        <CardContent className="p-0">
          {ordLoading ? <div className="p-4"><Skeleton className="h-32 bg-dashboard-border" /></div> : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-dashboard-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground text-xs">Order ID</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Status</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Last Checked</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Response</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(orders ?? []).map(o => (
                    <TableRow key={o.id} className="border-dashboard-border">
                      <TableCell className="text-sm text-dashboard-card-foreground font-mono">{o.external_order_id}</TableCell>
                      <TableCell><Badge variant="secondary" className="text-[10px]">{o.status}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{o.last_checked_at ? format(new Date(o.last_checked_at), "MMM d HH:mm") : "Never"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{o.last_response ? JSON.stringify(o.last_response).slice(0, 80) : "—"}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-primary" onClick={() => checkStatus.mutate(o.id)} disabled={checkStatus.isPending}>
                            {checkStatus.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                          </Button>
                          {o.tracking_url && (
                            <Button variant="ghost" size="icon" className="h-7 w-7" asChild><a href={o.tracking_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3.5 w-3.5" /></a></Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { if (confirm("Remove tracked order?")) deleteOrder.mutate(o.id); }}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(orders ?? []).length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8 text-xs">No tracked orders</TableCell></TableRow>
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

export default AdminApiIntegrations;
