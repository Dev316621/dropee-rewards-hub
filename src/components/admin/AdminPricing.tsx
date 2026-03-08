import { useState } from "react";
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
import { DollarSign, Plus, Trash2, Save, Loader2, MapPin, Circle } from "lucide-react";
import { toast } from "sonner";

// ── Hooks ──
const usePricingConfig = () =>
  useQuery({
    queryKey: ["admin-pricing-config"],
    queryFn: async () => {
      const { data, error } = await supabase.from("pricing_config").select("*");
      if (error) throw error;
      return data ?? [];
    },
  });

const useUpdatePricingConfig = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: number }) => {
      const { error } = await supabase.from("pricing_config").update({ value }).eq("key", key);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-pricing-config"] }),
  });
};

const usePricingAddons = () =>
  useQuery({
    queryKey: ["admin-pricing-addons"],
    queryFn: async () => {
      const { data, error } = await supabase.from("pricing_addons").select("*").order("display_order");
      if (error) throw error;
      return data ?? [];
    },
  });

const useUpsertAddon = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (addon: { id?: string; name: string; price: number; is_active?: boolean; display_order?: number }) => {
      const { error } = addon.id
        ? await supabase.from("pricing_addons").update(addon).eq("id", addon.id)
        : await supabase.from("pricing_addons").insert(addon);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-pricing-addons"] }),
  });
};

const useDeleteAddon = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("pricing_addons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-pricing-addons"] }),
  });
};

const usePricingZones = () =>
  useQuery({
    queryKey: ["admin-pricing-zones"],
    queryFn: async () => {
      const { data, error } = await supabase.from("pricing_zones").select("*").order("created_at");
      if (error) throw error;
      return data ?? [];
    },
  });

const useUpsertZone = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (zone: { id?: string; name: string; center_lat: number; center_lng: number; radius_km: number; multiplier: number; color?: string; is_active?: boolean }) => {
      const { error } = zone.id
        ? await supabase.from("pricing_zones").update(zone).eq("id", zone.id)
        : await supabase.from("pricing_zones").insert(zone);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-pricing-zones"] }),
  });
};

const useDeleteZone = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("pricing_zones").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-pricing-zones"] }),
  });
};

// ── Rate Settings Tab ──
const RateSettings = () => {
  const { data: configs, isLoading } = usePricingConfig();
  const update = useUpdatePricingConfig();
  const [values, setValues] = useState<Record<string, string>>({});

  const getVal = (key: string) => values[key] ?? String(configs?.find(c => c.key === key)?.value ?? "0");
  const handleSave = (key: string) => {
    const val = parseFloat(getVal(key));
    if (isNaN(val)) return;
    update.mutate({ key, value: val }, { onSuccess: () => toast.success("Rate updated") });
  };

  if (isLoading) return <div className="text-muted-foreground text-sm p-4">Loading...</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {(configs ?? []).map(c => (
        <Card key={c.key} className="bg-dashboard-card border-dashboard-border">
          <CardContent className="p-4">
            <Label className="text-xs text-muted-foreground">{c.label}</Label>
            <div className="flex gap-2 mt-1.5">
              <Input
                type="number"
                value={getVal(c.key)}
                onChange={e => setValues({ ...values, [c.key]: e.target.value })}
                className="bg-dashboard-bg border-dashboard-border text-sm"
              />
              <Button size="sm" onClick={() => handleSave(c.key)} disabled={update.isPending} className="gap-1">
                {update.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// ── Add-ons Tab ──
const AddonsTab = () => {
  const { data: addons } = usePricingAddons();
  const upsert = useUpsertAddon();
  const del = useDeleteAddon();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", price: 0, display_order: 0 });
  const [editId, setEditId] = useState<string | undefined>();

  const handleSave = () => {
    upsert.mutate({ ...form, id: editId }, {
      onSuccess: () => { toast.success("Saved"); setOpen(false); setEditId(undefined); setForm({ name: "", price: 0, display_order: 0 }); },
      onError: () => toast.error("Failed"),
    });
  };

  const handleEdit = (a: any) => {
    setEditId(a.id);
    setForm({ name: a.name, price: Number(a.price), display_order: a.display_order });
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{(addons ?? []).length} add-ons</p>
        <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) { setEditId(undefined); setForm({ name: "", price: 0, display_order: 0 }); } }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1 text-xs"><Plus className="h-3 w-3" /> Add</Button>
          </DialogTrigger>
          <DialogContent className="bg-dashboard-card border-dashboard-border">
            <DialogHeader><DialogTitle className="text-dashboard-card-foreground">{editId ? "Edit" : "New"} Add-on</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs">Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-dashboard-bg border-dashboard-border" /></div>
              <div><Label className="text-xs">Price (₹)</Label><Input type="number" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} className="bg-dashboard-bg border-dashboard-border" /></div>
              <div><Label className="text-xs">Display Order</Label><Input type="number" value={form.display_order} onChange={e => setForm({ ...form, display_order: Number(e.target.value) })} className="bg-dashboard-bg border-dashboard-border" /></div>
              <Button onClick={handleSave} disabled={upsert.isPending || !form.name} className="w-full">{upsert.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="border-dashboard-border hover:bg-transparent">
            <TableHead className="text-muted-foreground text-xs">Name</TableHead>
            <TableHead className="text-muted-foreground text-xs">Price</TableHead>
            <TableHead className="text-muted-foreground text-xs">Active</TableHead>
            <TableHead className="text-muted-foreground text-xs">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(addons ?? []).map(a => (
            <TableRow key={a.id} className="border-dashboard-border">
              <TableCell className="text-sm text-dashboard-card-foreground">{a.name}</TableCell>
              <TableCell className="text-sm text-muted-foreground">₹{a.price}</TableCell>
              <TableCell>
                <Switch checked={a.is_active} onCheckedChange={v => upsert.mutate({ id: a.id, name: a.name, price: Number(a.price), is_active: v })} />
              </TableCell>
              <TableCell className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => handleEdit(a)} className="text-xs h-7">Edit</Button>
                <Button size="sm" variant="ghost" onClick={() => del.mutate(a.id)} className="text-destructive h-7"><Trash2 className="h-3 w-3" /></Button>
              </TableCell>
            </TableRow>
          ))}
          {(addons ?? []).length === 0 && (
            <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground text-xs py-6">No add-ons yet</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

// ── Zone Pricing Tab ──
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const AdminZoneMap = ({ zones, onMapClick }: { zones: any[]; onMapClick?: (lat: number, lng: number) => void }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; }

    const map = L.map(mapRef.current).setView([25.097, 94.361], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    zones.forEach(z => {
      L.circle([z.center_lat, z.center_lng], {
        radius: z.radius_km * 1000,
        color: z.color || "#FF6B35",
        fillColor: z.color || "#FF6B35",
        fillOpacity: 0.15,
        weight: 2,
      })
        .bindPopup(`<strong>${z.name}</strong><br>${Number(z.multiplier)}× rate<br>${z.radius_km}km radius`)
        .addTo(map);
    });

    if (onMapClick) {
      map.on("click", (e: L.LeafletMouseEvent) => {
        onMapClick(parseFloat(e.latlng.lat.toFixed(6)), parseFloat(e.latlng.lng.toFixed(6)));
      });
    }

    mapInstance.current = map;
    return () => { map.remove(); mapInstance.current = null; };
  }, [zones, onMapClick]);

  return <div ref={mapRef} className="w-full h-72 sm:h-96 rounded-lg" />;
};

const ZonePricingTab = () => {
  const { data: zones } = usePricingZones();
  const upsert = useUpsertZone();
  const del = useDeleteZone();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | undefined>();
  const [form, setForm] = useState({ name: "", center_lat: 25.097, center_lng: 94.361, radius_km: 5, multiplier: 1.0, color: "#FF6B35" });

  const handleSave = () => {
    upsert.mutate({ ...form, id: editId }, {
      onSuccess: () => { toast.success("Zone saved"); setOpen(false); setEditId(undefined); },
      onError: () => toast.error("Failed"),
    });
  };

  const handleEdit = (z: any) => {
    setEditId(z.id);
    setForm({ name: z.name, center_lat: z.center_lat, center_lng: z.center_lng, radius_km: z.radius_km, multiplier: Number(z.multiplier), color: z.color || "#FF6B35" });
    setOpen(true);
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (open) {
      setForm(f => ({ ...f, center_lat: lat, center_lng: lng }));
      toast.info(`Coordinates set: ${lat}, ${lng}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Interactive Map */}
      <Card className="bg-dashboard-card border-dashboard-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-dashboard-card-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" /> Ukhrul Zone Map
          </CardTitle>
          <p className="text-[10px] text-muted-foreground">
            {open ? "Click on map to set zone center" : "Interactive map showing all pricing zones"}
          </p>
        </CardHeader>
        <CardContent>
          <AdminZoneMap zones={zones ?? []} onMapClick={open ? handleMapClick : undefined} />
        </CardContent>
      </Card>

      {/* Zone list + add */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{(zones ?? []).length} zones configured</p>
        <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) { setEditId(undefined); setForm({ name: "", center_lat: 25.097, center_lng: 94.361, radius_km: 5, multiplier: 1.0, color: "#FF6B35" }); } }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1 text-xs"><Plus className="h-3 w-3" /> Add Zone</Button>
          </DialogTrigger>
          <DialogContent className="bg-dashboard-card border-dashboard-border">
            <DialogHeader><DialogTitle className="text-dashboard-card-foreground">{editId ? "Edit" : "New"} Zone</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs">Zone Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-dashboard-bg border-dashboard-border" placeholder="e.g. Town Center" /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Center Lat</Label><Input type="number" step="0.001" value={form.center_lat} onChange={e => setForm({ ...form, center_lat: Number(e.target.value) })} className="bg-dashboard-bg border-dashboard-border" /></div>
                <div><Label className="text-xs">Center Lng</Label><Input type="number" step="0.001" value={form.center_lng} onChange={e => setForm({ ...form, center_lng: Number(e.target.value) })} className="bg-dashboard-bg border-dashboard-border" /></div>
              </div>
              <p className="text-[10px] text-muted-foreground">💡 Click on the map above to set coordinates</p>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Radius (km)</Label><Input type="number" step="0.5" value={form.radius_km} onChange={e => setForm({ ...form, radius_km: Number(e.target.value) })} className="bg-dashboard-bg border-dashboard-border" /></div>
                <div><Label className="text-xs">Price Multiplier</Label><Input type="number" step="0.1" value={form.multiplier} onChange={e => setForm({ ...form, multiplier: Number(e.target.value) })} className="bg-dashboard-bg border-dashboard-border" /></div>
              </div>
              <div><Label className="text-xs">Color</Label><Input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="h-10 w-20 p-1 bg-dashboard-bg border-dashboard-border" /></div>
              <Button onClick={handleSave} disabled={upsert.isPending || !form.name} className="w-full">{upsert.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Zone"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Zone cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {(zones ?? []).map(z => (
          <Card key={z.id} className="bg-dashboard-card border-dashboard-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Circle className="h-3 w-3" style={{ color: z.color || "#FF6B35", fill: z.color || "#FF6B35" }} />
                  <span className="text-sm font-medium text-dashboard-card-foreground">{z.name}</span>
                </div>
                <Badge variant={z.is_active ? "default" : "secondary"} className="text-[10px]">{z.is_active ? "Active" : "Inactive"}</Badge>
              </div>
              <div className="text-xs text-muted-foreground space-y-0.5">
                <p>Center: {z.center_lat.toFixed(3)}, {z.center_lng.toFixed(3)}</p>
                <p>Radius: {z.radius_km} km</p>
                <p>Multiplier: {Number(z.multiplier)}×</p>
              </div>
              <div className="flex gap-1 mt-3">
                <Button size="sm" variant="ghost" onClick={() => handleEdit(z)} className="text-xs h-7 flex-1">Edit</Button>
                <Button size="sm" variant="ghost" onClick={() => del.mutate(z.id, { onSuccess: () => toast.success("Deleted") })} className="text-destructive h-7"><Trash2 className="h-3 w-3" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ── Main Component ──
const AdminPricing = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold font-display text-dashboard-card-foreground flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" /> Pricing Management
        </h1>
        <p className="text-xs text-muted-foreground mt-1">Configure delivery rates, add-ons, and zone pricing</p>
      </div>

      <Tabs defaultValue="rates">
        <TabsList className="bg-dashboard-border">
          <TabsTrigger value="rates" className="text-xs">Rate Settings</TabsTrigger>
          <TabsTrigger value="addons" className="text-xs">Add-ons</TabsTrigger>
          <TabsTrigger value="zones" className="text-xs">Zone Pricing</TabsTrigger>
        </TabsList>
        <TabsContent value="rates"><RateSettings /></TabsContent>
        <TabsContent value="addons"><AddonsTab /></TabsContent>
        <TabsContent value="zones"><ZonePricingTab /></TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPricing;
