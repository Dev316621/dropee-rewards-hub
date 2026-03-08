import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Eye, MapPin, Weight, Package, RefreshCw } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  confirmed: "bg-blue-500/20 text-blue-400",
  in_progress: "bg-purple-500/20 text-purple-400",
  completed: "bg-green-500/20 text-green-400",
  cancelled: "bg-red-500/20 text-red-400",
};

const AdminServiceBookings = () => {
  const qc = useQueryClient();
  const [detail, setDetail] = useState<any>(null);

  const { data: bookings, refetch } = useQuery({
    queryKey: ["admin-service-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("service_bookings").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("admin-service-bookings-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "service_bookings" }, () => {
        refetch();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [refetch]);

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("service_bookings").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-service-bookings"] }); toast.success("Booking updated"); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold font-display text-dashboard-card-foreground">Service Bookings</h1>
        <Button variant="outline" size="sm" className="gap-1" onClick={() => refetch()}>
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {["pending", "confirmed", "in_progress", "completed", "cancelled"].map(s => (
          <div key={s} className="bg-dashboard-card border border-dashboard-border rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-dashboard-card-foreground">{(bookings ?? []).filter(b => b.status === s).length}</p>
            <p className="text-[10px] text-muted-foreground capitalize">{s.replace("_", " ")}</p>
          </div>
        ))}
      </div>

      <div className="bg-dashboard-card border border-dashboard-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-dashboard-border">
              <TableHead className="text-muted-foreground">ID</TableHead>
              <TableHead className="text-muted-foreground">Pickup → Dropoff</TableHead>
              <TableHead className="text-muted-foreground">Fee</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Date</TableHead>
              <TableHead className="text-muted-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(bookings ?? []).map(b => (
              <TableRow key={b.id} className="border-dashboard-border">
                <TableCell className="font-mono text-xs text-dashboard-card-foreground">{b.id.slice(0, 8)}</TableCell>
                <TableCell className="text-xs text-dashboard-card-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-green-400 shrink-0" />
                    <span className="truncate max-w-[80px]">{b.pickup}</span>
                    <span className="text-muted-foreground">→</span>
                    <MapPin className="w-3 h-3 text-destructive shrink-0" />
                    <span className="truncate max-w-[80px]">{b.dropoff}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm font-medium text-dashboard-card-foreground">₹{b.estimated_fee}</TableCell>
                <TableCell>
                  <Select value={b.status} onValueChange={s => updateStatus.mutate({ id: b.id, status: s })}>
                    <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["pending", "confirmed", "in_progress", "completed", "cancelled"].map(s => (
                        <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{new Date(b.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetail(b)}><Eye className="w-3.5 h-3.5" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Booking Details</DialogTitle></DialogHeader>
          {detail && (
            <div className="space-y-3 text-sm">
              <div><strong>Booking ID:</strong> <span className="font-mono">{detail.id.slice(0, 8)}</span></div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-green-500" /> <strong>Pickup:</strong> {detail.pickup}</div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-destructive" /> <strong>Dropoff:</strong> {detail.dropoff}</div>
              <div className="flex items-center gap-2"><Weight className="w-4 h-4 text-primary" /> <strong>Weight:</strong> {detail.weight} kg</div>
              <div><strong>Estimated Fee:</strong> <span className="text-primary font-bold">₹{detail.estimated_fee}</span></div>
              <div><strong>Notes:</strong> {detail.notes || "None"}</div>
              {Array.isArray(detail.addons) && detail.addons.length > 0 && (
                <div>
                  <strong>Add-ons:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {detail.addons.map((a: any, i: number) => (
                      <Badge key={i} variant="secondary" className="text-[10px]">{a.name} +₹{a.price}</Badge>
                    ))}
                  </div>
                </div>
              )}
              <div><strong>Created:</strong> {new Date(detail.created_at).toLocaleString()}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminServiceBookings;
