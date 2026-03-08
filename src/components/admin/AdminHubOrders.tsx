import { useState } from "react";
import { useHubOrders, useHubWebsites, useHubAgents, useUpdateHubOrderStatus, useHubOrderStatusLog, HubOrder, HUB_STATUSES } from "@/hooks/useHubData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Eye, RefreshCw, Package } from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-700 border-yellow-300",
  confirmed: "bg-blue-500/15 text-blue-700 border-blue-300",
  preparing: "bg-purple-500/15 text-purple-700 border-purple-300",
  picked_up: "bg-indigo-500/15 text-indigo-700 border-indigo-300",
  on_the_way: "bg-orange-500/15 text-orange-700 border-orange-300",
  delivered: "bg-green-500/15 text-green-700 border-green-300",
  cancelled: "bg-red-500/15 text-red-700 border-red-300",
};

const AdminHubOrders = () => {
  const { data: orders, isLoading } = useHubOrders();
  const { data: websites } = useHubWebsites();
  const { data: agents } = useHubAgents();
  const updateStatus = useUpdateHubOrderStatus();

  const [filterWebsite, setFilterWebsite] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<HubOrder | null>(null);

  const { data: statusLog } = useHubOrderStatusLog(selectedOrder?.id || null);

  const filtered = (orders || []).filter((o) => {
    if (filterWebsite !== "all" && o.website_id !== filterWebsite) return false;
    if (filterStatus !== "all" && o.status !== filterStatus) return false;
    if (filterDate && !o.created_at.startsWith(filterDate)) return false;
    return true;
  });

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateStatus.mutateAsync({ order_id: orderId, new_status: newStatus });
      toast({ title: "Status updated" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleAssignAgent = async (orderId: string, agentId: string | null) => {
    try {
      await updateStatus.mutateAsync({ order_id: orderId, assigned_agent_id: agentId });
      toast({ title: "Agent assigned" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Order Hub</h1>
          <p className="text-sm text-muted-foreground">All orders from connected websites — live updates</p>
        </div>
        <Badge variant="outline" className="gap-1">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          Live
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-3">
            <Select value={filterWebsite} onValueChange={setFilterWebsite}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Websites" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Websites</SelectItem>
                {(websites || []).map((w) => (
                  <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {HUB_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="w-[160px]" />
            {(filterWebsite !== "all" || filterStatus !== "all" || filterDate) && (
              <Button variant="ghost" size="sm" onClick={() => { setFilterWebsite("all"); setFilterStatus("all"); setFilterDate(""); }}>Clear</Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Hub ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Time</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">No orders yet</TableCell></TableRow>
              )}
              {filtered.map((order) => {
                const items = Array.isArray(order.items) ? order.items : [];
                const itemsSummary = items.length > 0
                  ? items.slice(0, 2).map((i: any) => `${i.name} x${i.qty}`).join(", ") + (items.length > 2 ? ` +${items.length - 2}` : "")
                  : "—";
                return (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Badge style={{ backgroundColor: order.hub_websites?.label_color || "#3B82F6", color: "#fff" }} className="text-[10px]">
                        {order.hub_websites?.name || "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}</TableCell>
                    <TableCell className="font-medium">{order.customer_name}</TableCell>
                    <TableCell className="text-xs max-w-[200px] truncate">{itemsSummary}</TableCell>
                    <TableCell className="font-medium">₹{order.total}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[order.status] || ""}>
                        {order.status.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{order.hub_delivery_agents?.name || "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{format(new Date(order.created_at), "MMM d, HH:mm")}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(order)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(o) => !o && setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order {selectedOrder.id.slice(0, 8)}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Customer Info */}
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Customer</CardTitle></CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p><strong>Name:</strong> {selectedOrder.customer_name}</p>
                    <p><strong>Phone:</strong> {selectedOrder.customer_phone || "—"}</p>
                    <p><strong>Address:</strong> {selectedOrder.customer_address || "—"}</p>
                    {selectedOrder.notes && <p><strong>Notes:</strong> {selectedOrder.notes}</p>}
                    {selectedOrder.external_order_id && <p><strong>External ID:</strong> {selectedOrder.external_order_id}</p>}
                  </CardContent>
                </Card>

                {/* Items */}
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Items</CardTitle></CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Qty</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Subtotal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(Array.isArray(selectedOrder.items) ? selectedOrder.items : []).map((item: any, i: number) => (
                          <TableRow key={i}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.qty}</TableCell>
                            <TableCell>₹{item.price}</TableCell>
                            <TableCell>₹{(item.qty * item.price).toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={3} className="font-bold text-right">Total</TableCell>
                          <TableCell className="font-bold">₹{selectedOrder.total}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Actions */}
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Actions</CardTitle></CardHeader>
                  <CardContent className="flex flex-wrap gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Status</label>
                      <Select value={selectedOrder.status} onValueChange={(v) => handleStatusChange(selectedOrder.id, v)}>
                        <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {HUB_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Assign Agent</label>
                      <Select value={selectedOrder.assigned_agent_id || "none"} onValueChange={(v) => handleAssignAgent(selectedOrder.id, v === "none" ? null : v)}>
                        <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Unassigned</SelectItem>
                          {(agents || []).filter((a) => a.is_active).map((a) => (
                            <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Status History */}
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Status History</CardTitle></CardHeader>
                  <CardContent>
                    {!statusLog || statusLog.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No history yet</p>
                    ) : (
                      <div className="space-y-2">
                        {statusLog.map((log) => (
                          <div key={log.id} className="flex items-center gap-3 text-xs">
                            <span className="text-muted-foreground w-32">{format(new Date(log.changed_at), "MMM d, HH:mm:ss")}</span>
                            {log.old_status && (
                              <>
                                <Badge variant="outline" className="text-[10px]">{log.old_status.replace(/_/g, " ")}</Badge>
                                <span>→</span>
                              </>
                            )}
                            <Badge variant="outline" className={statusColors[log.new_status] || ""}>{log.new_status.replace(/_/g, " ")}</Badge>
                            <span className="text-muted-foreground ml-auto">{log.changed_by}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminHubOrders;
