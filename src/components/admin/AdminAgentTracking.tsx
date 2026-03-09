import { useState, useMemo } from "react";
import { useHubAgents, useHubOrders, HubAgent, HubOrder } from "@/hooks/useHubData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Download, Eye, Phone, Star, Package, TrendingUp, Users } from "lucide-react";
import { format, startOfDay, endOfDay, isWithinInterval, parseISO } from "date-fns";

interface AgentStats {
  agent: HubAgent;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  avgRating: number;
  orders: HubOrder[];
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-700 border-yellow-300",
  confirmed: "bg-blue-500/15 text-blue-700 border-blue-300",
  preparing: "bg-purple-500/15 text-purple-700 border-purple-300",
  picked_up: "bg-indigo-500/15 text-indigo-700 border-indigo-300",
  on_the_way: "bg-orange-500/15 text-orange-700 border-orange-300",
  delivered: "bg-green-500/15 text-green-700 border-green-300",
  cancelled: "bg-red-500/15 text-red-700 border-red-300",
};

const AdminAgentTracking = () => {
  const { data: agents, isLoading: agentsLoading } = useHubAgents();
  const { data: orders, isLoading: ordersLoading } = useHubOrders();

  const [filterAgent, setFilterAgent] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<AgentStats | null>(null);

  const agentStats = useMemo(() => {
    if (!agents || !orders) return [];

    return agents
      .filter(a => a.status === "approved")
      .map(agent => {
        const agentOrders = orders.filter(o => o.assigned_agent_id === agent.id);
        
        // Apply date filters
        const filteredOrders = agentOrders.filter(o => {
          if (dateFrom && dateTo) {
            const orderDate = parseISO(o.created_at);
            return isWithinInterval(orderDate, {
              start: startOfDay(parseISO(dateFrom)),
              end: endOfDay(parseISO(dateTo))
            });
          }
          if (dateFrom) {
            return parseISO(o.created_at) >= startOfDay(parseISO(dateFrom));
          }
          if (dateTo) {
            return parseISO(o.created_at) <= endOfDay(parseISO(dateTo));
          }
          return true;
        });

        return {
          agent,
          totalOrders: filteredOrders.length,
          completedOrders: filteredOrders.filter(o => o.status === "delivered").length,
          pendingOrders: filteredOrders.filter(o => !["delivered", "cancelled"].includes(o.status)).length,
          totalRevenue: filteredOrders.filter(o => o.status === "delivered").reduce((sum, o) => sum + (o.total || 0), 0),
          avgRating: agent.average_rating || 0,
          orders: filteredOrders
        };
      })
      .filter(stat => {
        if (filterAgent !== "all" && stat.agent.id !== filterAgent) return false;
        return true;
      })
      .sort((a, b) => b.totalOrders - a.totalOrders);
  }, [agents, orders, filterAgent, dateFrom, dateTo]);

  const totals = useMemo(() => {
    return agentStats.reduce(
      (acc, stat) => ({
        orders: acc.orders + stat.totalOrders,
        completed: acc.completed + stat.completedOrders,
        revenue: acc.revenue + stat.totalRevenue,
      }),
      { orders: 0, completed: 0, revenue: 0 }
    );
  }, [agentStats]);

  const exportToCSV = () => {
    const headers = ["Agent Code", "Agent Name", "Phone", "Total Orders", "Completed", "Pending", "Revenue (₹)", "Avg Rating"];
    const rows = agentStats.map(stat => [
      stat.agent.agent_code || "",
      stat.agent.name,
      stat.agent.phone,
      stat.totalOrders,
      stat.completedOrders,
      stat.pendingOrders,
      stat.totalRevenue.toFixed(2),
      stat.avgRating.toFixed(1)
    ]);

    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `agent-tracking-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportOrdersCSV = (stat: AgentStats) => {
    const headers = ["Order ID", "Customer", "Phone", "Address", "Items", "Total (₹)", "Status", "Date"];
    const rows = stat.orders.map(o => [
      o.id.slice(0, 8),
      o.customer_name,
      o.customer_phone,
      `"${o.customer_address.replace(/"/g, '""')}"`,
      Array.isArray(o.items) ? o.items.map((i: any) => `${i.name} x${i.qty}`).join("; ") : "",
      o.total.toFixed(2),
      o.status,
      format(new Date(o.created_at), "yyyy-MM-dd HH:mm")
    ]);

    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${stat.agent.agent_code || stat.agent.name}-orders-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (agentsLoading || ordersLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agent Tracking</h1>
          <p className="text-sm text-muted-foreground">Monitor agent performance and order history</p>
        </div>
        <Button onClick={exportToCSV} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export All
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Agents</p>
                <p className="text-2xl font-bold">{agentStats.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{totals.orders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent">
                <TrendingUp className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{totals.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary">
                <Star className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">₹{totals.revenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-3">
            <Select value={filterAgent} onValueChange={setFilterAgent}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="All Agents" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                {(agents || []).filter(a => a.status === "approved").map(a => (
                  <SelectItem key={a.id} value={a.id}>{a.agent_code || a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">From:</span>
              <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-[150px]" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">To:</span>
              <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-[150px]" />
            </div>
            {(filterAgent !== "all" || dateFrom || dateTo) && (
              <Button variant="ghost" size="sm" onClick={() => { setFilterAgent("all"); setDateFrom(""); setDateTo(""); }}>
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Agents Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-center">Total Orders</TableHead>
                <TableHead className="text-center">Completed</TableHead>
                <TableHead className="text-center">Pending</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-center">Rating</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agentStats.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No agents found
                  </TableCell>
                </TableRow>
              )}
              {agentStats.map(stat => (
                <TableRow key={stat.agent.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{stat.agent.name}</span>
                      <Badge variant="outline" className="w-fit text-[10px]">{stat.agent.agent_code}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{stat.agent.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-medium">{stat.totalOrders}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="bg-accent text-accent-foreground">{stat.completedOrders}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="bg-secondary text-secondary-foreground">{stat.pendingOrders}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">₹{stat.totalRevenue.toLocaleString()}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="h-3 w-3 fill-primary text-primary" />
                      <span className="text-sm">{stat.avgRating.toFixed(1)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedAgent(stat)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Agent Detail Dialog */}
      <Dialog open={!!selectedAgent} onOpenChange={o => !o && setSelectedAgent(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          {selectedAgent && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5" />
                    <span>{selectedAgent.agent.name}</span>
                    <Badge variant="outline">{selectedAgent.agent.agent_code}</Badge>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => exportOrdersCSV(selectedAgent)}>
                    <Download className="h-4 w-4" />
                    Export Orders
                  </Button>
                </DialogTitle>
              </DialogHeader>

              {/* Agent Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <Card>
                  <CardContent className="p-3 text-center">
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="text-xl font-bold">{selectedAgent.totalOrders}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <p className="text-xs text-muted-foreground">Completed</p>
                    <p className="text-xl font-bold text-green-600">{selectedAgent.completedOrders}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <p className="text-xs text-muted-foreground">Revenue</p>
                    <p className="text-xl font-bold">₹{selectedAgent.totalRevenue.toLocaleString()}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <p className="text-xs text-muted-foreground">Rating</p>
                    <p className="text-xl font-bold flex items-center justify-center gap-1">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      {selectedAgent.avgRating.toFixed(1)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Orders Table */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Order History ({selectedAgent.orders.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedAgent.orders.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                            No orders assigned
                          </TableCell>
                        </TableRow>
                      )}
                      {selectedAgent.orders.map(order => {
                        const items = Array.isArray(order.items) ? order.items : [];
                        const itemsSummary = items.length > 0
                          ? items.slice(0, 2).map((i: any) => `${i.name} x${i.qty}`).join(", ") + (items.length > 2 ? ` +${items.length - 2}` : "")
                          : "—";
                        return (
                          <TableRow key={order.id}>
                            <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}</TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium text-sm">{order.customer_name}</span>
                                <span className="text-xs text-muted-foreground">{order.customer_phone}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-xs max-w-[150px] truncate">{itemsSummary}</TableCell>
                            <TableCell className="font-medium">₹{order.total}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={statusColors[order.status] || ""}>
                                {order.status.replace(/_/g, " ")}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {format(new Date(order.created_at), "MMM d, HH:mm")}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAgentTracking;
