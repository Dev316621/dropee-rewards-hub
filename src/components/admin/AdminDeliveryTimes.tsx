import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Pencil, Trash2, Save, Clock, CalendarOff, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// ── Hooks ──
const useOperatingHours = () =>
  useQuery({
    queryKey: ["operating-hours"],
    queryFn: async () => {
      const { data, error } = await supabase.from("operating_hours").select("*").order("day_of_week");
      if (error) throw error;
      return data ?? [];
    },
  });

const useDeliveryTimeSlots = () =>
  useQuery({
    queryKey: ["delivery-time-slots"],
    queryFn: async () => {
      const { data, error } = await supabase.from("delivery_time_slots").select("*").order("display_order");
      if (error) throw error;
      return data ?? [];
    },
  });

const useDeliveryHolidays = () =>
  useQuery({
    queryKey: ["delivery-holidays"],
    queryFn: async () => {
      const { data, error } = await supabase.from("delivery_holidays").select("*").order("date");
      if (error) throw error;
      return data ?? [];
    },
  });

// ── Operating Hours Tab ──
const OperatingHoursTab = () => {
  const { data: hours = [], isLoading } = useOperatingHours();
  const qc = useQueryClient();

  const updateHour = useMutation({
    mutationFn: async (row: { id: string; open_time?: string; close_time?: string; is_open?: boolean }) => {
      const { error } = await supabase.from("operating_hours").update(row).eq("id", row.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["operating-hours"] });
      toast.success("Updated");
    },
    onError: () => toast.error("Failed to update"),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm">Daily Operating Hours</h3>
      {hours.map((h: any) => (
        <Card key={h.id} className={cn(!h.is_open && "opacity-50")}>
          <CardContent className="p-4 flex items-center gap-3 flex-wrap">
            <div className="w-24">
              <p className="text-sm font-medium">{DAYS[h.day_of_week]}</p>
            </div>
            <Switch
              checked={h.is_open}
              onCheckedChange={(v) => updateHour.mutate({ id: h.id, is_open: v })}
            />
            <div className="flex items-center gap-2">
              <Input
                type="time"
                value={h.open_time?.slice(0, 5) || "09:00"}
                onChange={(e) => updateHour.mutate({ id: h.id, open_time: e.target.value })}
                className="w-28 text-sm"
                disabled={!h.is_open}
              />
              <span className="text-muted-foreground text-xs">to</span>
              <Input
                type="time"
                value={h.close_time?.slice(0, 5) || "18:00"}
                onChange={(e) => updateHour.mutate({ id: h.id, close_time: e.target.value })}
                className="w-28 text-sm"
                disabled={!h.is_open}
              />
            </div>
            <Badge variant={h.is_open ? "default" : "secondary"} className="text-[10px]">
              {h.is_open ? "Open" : "Closed"}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// ── Time Slots Tab ──
const TimeSlotsTab = () => {
  const { data: slots = [], isLoading } = useDeliveryTimeSlots();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ label: "", start_time: "09:00", end_time: "12:00", max_orders: 10, is_active: true, display_order: 0 });

  const upsert = useMutation({
    mutationFn: async (data: any) => {
      const { error } = data.id
        ? await supabase.from("delivery_time_slots").update(data).eq("id", data.id)
        : await supabase.from("delivery_time_slots").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["delivery-time-slots"] });
      toast.success("Saved");
      setEditing(null);
    },
    onError: () => toast.error("Failed"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("delivery_time_slots").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["delivery-time-slots"] });
      toast.success("Deleted");
    },
  });

  const startEdit = (slot?: any) => {
    if (slot) {
      setForm({ label: slot.label, start_time: slot.start_time?.slice(0, 5), end_time: slot.end_time?.slice(0, 5), max_orders: slot.max_orders, is_active: slot.is_active, display_order: slot.display_order });
      setEditing(slot.id);
    } else {
      setForm({ label: "", start_time: "09:00", end_time: "12:00", max_orders: 10, is_active: true, display_order: slots.length });
      setEditing("new");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">Delivery Time Slots</h3>
        <Button size="sm" onClick={() => startEdit()}><Plus className="h-3.5 w-3.5 mr-1" />Add Slot</Button>
      </div>

      {(editing === "new" || editing) && (
        <Card className="border-primary/30">
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Label</Label>
                <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="text-sm" />
              </div>
              <div>
                <Label className="text-xs">Max Orders</Label>
                <Input type="number" value={form.max_orders} onChange={(e) => setForm({ ...form, max_orders: Number(e.target.value) })} className="text-sm" />
              </div>
              <div>
                <Label className="text-xs">Start Time</Label>
                <Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} className="text-sm" />
              </div>
              <div>
                <Label className="text-xs">End Time</Label>
                <Input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} className="text-sm" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              <Label className="text-xs">Active</Label>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => upsert.mutate(editing === "new" ? form : { ...form, id: editing })}>
                <Save className="h-3.5 w-3.5 mr-1" />Save
              </Button>
              <Button size="sm" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? <p className="text-sm text-muted-foreground">Loading...</p> : slots.map((s: any) => (
        editing !== s.id && (
          <Card key={s.id} className={cn(!s.is_active && "opacity-50")}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.start_time?.slice(0, 5)} – {s.end_time?.slice(0, 5)} · Max {s.max_orders} orders</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(s)}><Pencil className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { if (confirm("Delete?")) remove.mutate(s.id); }}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </CardContent>
          </Card>
        )
      ))}
    </div>
  );
};

// ── Holidays Tab ──
const HolidaysTab = () => {
  const { data: holidays = [], isLoading } = useDeliveryHolidays();
  const qc = useQueryClient();
  const [date, setDate] = useState<Date>();
  const [reason, setReason] = useState("");

  const add = useMutation({
    mutationFn: async (data: { date: string; reason: string }) => {
      const { error } = await supabase.from("delivery_holidays").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["delivery-holidays"] });
      toast.success("Holiday added");
      setDate(undefined);
      setReason("");
    },
    onError: () => toast.error("Failed — date may already exist"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("delivery_holidays").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["delivery-holidays"] });
      toast.success("Removed");
    },
  });

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm">Holidays & Off-Days</h3>
      <Card className="border-primary/30">
        <CardContent className="p-4 space-y-3">
          <div className="flex gap-3 items-end flex-wrap">
            <div>
              <Label className="text-xs">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-[200px] justify-start text-left font-normal text-sm", !date && "text-muted-foreground")}>
                    <CalendarIcon className="h-3.5 w-3.5 mr-2" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className={cn("p-3 pointer-events-auto")} />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex-1 min-w-[150px]">
              <Label className="text-xs">Reason</Label>
              <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Christmas" className="text-sm" />
            </div>
            <Button size="sm" disabled={!date} onClick={() => date && add.mutate({ date: format(date, "yyyy-MM-dd"), reason })}>
              <Plus className="h-3.5 w-3.5 mr-1" />Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? <p className="text-sm text-muted-foreground">Loading...</p> : holidays.map((h: any) => (
        <Card key={h.id}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CalendarOff className="h-4 w-4 text-destructive" />
              <div>
                <p className="text-sm font-medium">{format(new Date(h.date + "T00:00:00"), "MMMM d, yyyy")}</p>
                <p className="text-xs text-muted-foreground">{h.reason || "No reason"}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { if (confirm("Remove?")) remove.mutate(h.id); }}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </CardContent>
        </Card>
      ))}
      {!isLoading && holidays.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No holidays scheduled</p>}
    </div>
  );
};

// ── Estimated Times Tab ──
const EstimatedTimesTab = () => {
  const { data: zones = [], isLoading } = useQuery({
    queryKey: ["pricing-zones-times"],
    queryFn: async () => {
      const { data, error } = await supabase.from("pricing_zones").select("id, name, estimated_time").order("display_order");
      if (error) throw error;
      return data ?? [];
    },
  });
  const qc = useQueryClient();

  const update = useMutation({
    mutationFn: async ({ id, estimated_time }: { id: string; estimated_time: string }) => {
      const { error } = await supabase.from("pricing_zones").update({ estimated_time }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pricing-zones-times"] });
      toast.success("Updated");
    },
    onError: () => toast.error("Failed"),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm">Estimated Delivery Times by Zone</h3>
      {zones.map((z: any) => (
        <Card key={z.id}>
          <CardContent className="p-4 flex items-center gap-3 flex-wrap">
            <div className="w-32">
              <p className="text-sm font-medium">{z.name}</p>
            </div>
            <Input
              value={z.estimated_time || ""}
              onChange={(e) => update.mutate({ id: z.id, estimated_time: e.target.value })}
              placeholder="e.g. 30-60 min"
              className="w-40 text-sm"
            />
          </CardContent>
        </Card>
      ))}
      {zones.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No zones configured. Add zones in Pricing settings.</p>}
    </div>
  );
};

// ── Main Component ──
const AdminDeliveryTimes = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold font-display text-foreground">Delivery Times</h1>
        <p className="text-sm text-muted-foreground">Manage operating hours, time slots, holidays, and estimated delivery times</p>
      </div>

      <Tabs defaultValue="hours">
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="hours" className="text-xs">Hours</TabsTrigger>
          <TabsTrigger value="slots" className="text-xs">Time Slots</TabsTrigger>
          <TabsTrigger value="holidays" className="text-xs">Holidays</TabsTrigger>
          <TabsTrigger value="estimated" className="text-xs">Estimated</TabsTrigger>
        </TabsList>
        <TabsContent value="hours"><OperatingHoursTab /></TabsContent>
        <TabsContent value="slots"><TimeSlotsTab /></TabsContent>
        <TabsContent value="holidays"><HolidaysTab /></TabsContent>
        <TabsContent value="estimated"><EstimatedTimesTab /></TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDeliveryTimes;
