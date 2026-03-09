import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import {
  Truck,
  Package,
  MapPin,
  Phone,
  User,
  Clock,
  LogOut,
  RefreshCw,
  CheckCircle2,
  Circle,
  Map,
  List,
  Navigation,
} from "lucide-react";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface AgentContext {
  agent: {
    id: string;
    name: string;
    phone: string;
    email: string;
    agent_code: string;
    is_active: boolean;
  };
}

const STATUS_OPTIONS = [
  { value: "confirmed", label: "Confirmed", color: "bg-blue-500" },
  { value: "preparing", label: "Preparing", color: "bg-yellow-500" },
  { value: "picked_up", label: "Picked Up", color: "bg-purple-500" },
  { value: "on_the_way", label: "On The Way", color: "bg-orange-500" },
  { value: "delivered", label: "Delivered", color: "bg-green-500" },
];

const AgentDashboard = () => {
  const { agent } = useOutletContext<AgentContext>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(false);

  // Fetch current online status
  useEffect(() => {
    const fetchStatus = async () => {
      const { data } = await supabase
        .from("hub_delivery_agents")
        .select("is_online")
        .eq("id", agent.id)
        .single();
      if (data) setIsOnline(data.is_online);
    };
    fetchStatus();
  }, [agent.id]);

  // Heartbeat: update last_seen_at every 60s while online
  useEffect(() => {
    if (!isOnline) return;
    const interval = setInterval(async () => {
      await supabase
        .from("hub_delivery_agents")
        .update({ last_seen_at: new Date().toISOString() } as any)
        .eq("id", agent.id);
    }, 60000);
    return () => clearInterval(interval);
  }, [isOnline, agent.id]);

  // Set offline on page unload
  useEffect(() => {
    const handleUnload = () => {
      navigator.sendBeacon && supabase
        .from("hub_delivery_agents")
        .update({ is_online: false } as any)
        .eq("id", agent.id);
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [agent.id]);

  const toggleOnline = async (online: boolean) => {
    setIsOnline(online);
    await supabase
      .from("hub_delivery_agents")
      .update({ is_online: online, last_seen_at: new Date().toISOString() } as any)
      .eq("id", agent.id);
    toast.success(online ? "You're now online!" : "You're now offline");
  };

  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ["agent-orders", agent.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hub_orders")
        .select("*, hub_websites(name, label_color)")
        .eq("assigned_agent_id", agent.id)
        .neq("status", "cancelled")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, newStatus }: { orderId: string; newStatus: string }) => {
      const res = await supabase.functions.invoke("hub-update-status", {
        body: { order_id: orderId, new_status: newStatus },
      });
      if (res.error) throw new Error(res.error.message);
      if (res.data?.error) throw new Error(res.data.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-orders"] });
      toast.success("Order status updated!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update status");
    },
    onSettled: () => {
      setUpdatingOrderId(null);
    },
  });

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    updateStatusMutation.mutate({ orderId, newStatus });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/agent/login");
  };

  const activeOrders = orders.filter((o) => !["delivered", "cancelled"].includes(o.status));
  const completedOrders = orders.filter((o) => o.status === "delivered");

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: "Pending", variant: "outline" },
      confirmed: { label: "Confirmed", variant: "secondary" },
      preparing: { label: "Preparing", variant: "secondary" },
      picked_up: { label: "Picked Up", variant: "default" },
      on_the_way: { label: "On The Way", variant: "default" },
      delivered: { label: "Delivered", variant: "default" },
      cancelled: { label: "Cancelled", variant: "destructive" },
    };
    const config = statusConfig[status] || { label: status, variant: "outline" as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Truck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-lg">{agent.name}</h1>
              <p className="text-sm text-muted-foreground">
                Agent ID: <span className="font-mono font-bold text-primary">{agent.agent_code}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch
                id="online-toggle"
                checked={isOnline}
                onCheckedChange={toggleOnline}
              />
              <Label htmlFor="online-toggle" className={`text-sm font-semibold ${isOnline ? "text-success" : "text-muted-foreground"}`}>
                {isOnline ? "Online" : "Offline"}
              </Label>
            </div>
            <Button variant="outline" size="icon" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <Package className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeOrders.length}</p>
                <p className="text-xs text-muted-foreground">Active Orders</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedOrders.length}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Orders */}
        <Tabs defaultValue="list" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Circle className="h-3 w-3 fill-orange-500 text-orange-500" />
              Active Deliveries
            </h2>
            <TabsList className="grid grid-cols-2 w-auto">
              <TabsTrigger value="list" className="gap-1 px-3">
                <List className="h-4 w-4" />
                List
              </TabsTrigger>
              <TabsTrigger value="map" className="gap-1 px-3">
                <Map className="h-4 w-4" />
                Map
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="list">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading orders...</div>
            ) : activeOrders.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No active deliveries assigned to you.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {activeOrders.map((order) => (
                  <Card key={order.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {order.hub_websites && (
                              <Badge
                                style={{ backgroundColor: order.hub_websites.label_color }}
                                className="text-white text-xs"
                              >
                                {order.hub_websites.name}
                              </Badge>
                            )}
                            {getStatusBadge(order.status)}
                          </div>
                          <CardTitle className="text-base">
                            Order #{order.external_order_id || order.id.slice(0, 8)}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(order.created_at), "MMM d, h:mm a")}
                          </CardDescription>
                        </div>
                        <p className="text-lg font-bold text-primary">₹{order.total}</p>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Customer Info */}
                      <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{order.customer_name}</p>
                          <a
                            href={`tel:${order.customer_phone}`}
                            className="text-sm text-primary flex items-center gap-1"
                          >
                            <Phone className="h-3 w-3" />
                            {order.customer_phone}
                          </a>
                        </div>
                      </div>

                      {/* Address */}
                      <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm">{order.customer_address}</p>
                          {order.latitude && order.longitude && (
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${order.latitude},${order.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary flex items-center gap-1 mt-1"
                            >
                              <Navigation className="h-3 w-3" />
                              Open in Google Maps
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Items */}
                      <div className="border-t pt-3">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Items:</p>
                        <ul className="text-sm space-y-1">
                          {Array.isArray(order.items) &&
                            order.items.map((item: any, idx: number) => (
                              <li key={idx} className="flex justify-between">
                                <span>
                                  {item.qty}x {item.name}
                                </span>
                                <span className="text-muted-foreground">₹{item.price * item.qty}</span>
                              </li>
                            ))}
                        </ul>
                      </div>

                      {order.notes && (
                        <div className="text-sm bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded text-yellow-800 dark:text-yellow-200">
                          <strong>Note:</strong> {order.notes}
                        </div>
                      )}

                      {/* Status Update */}
                      <div className="border-t pt-3">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Update Status:</p>
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleStatusChange(order.id, value)}
                          disabled={updatingOrderId === order.id}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                <div className="flex items-center gap-2">
                                  <Circle className={`h-2 w-2 ${opt.color} rounded-full`} />
                                  {opt.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="map">
            {activeOrders.filter(o => o.latitude && o.longitude).length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No pinned locations</p>
                  <p className="text-sm">Orders with map locations will appear here</p>
                </CardContent>
              </Card>
            ) : (
              <Card className="overflow-hidden">
                <div className="h-[400px]">
                  <MapContainer
                    center={[
                      activeOrders.find(o => o.latitude)?.latitude || 25.097,
                      activeOrders.find(o => o.longitude)?.longitude || 94.361
                    ]}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                    scrollWheelZoom={true}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {activeOrders
                      .filter((o) => o.latitude && o.longitude)
                      .map((order) => (
                        <Marker key={order.id} position={[order.latitude!, order.longitude!]}>
                          <Popup>
                            <div className="text-sm space-y-1">
                              <p className="font-bold">#{order.external_order_id || order.id.slice(0, 8)}</p>
                              <p className="font-medium">{order.customer_name}</p>
                              <p>{order.customer_address}</p>
                              <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${order.latitude},${order.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary flex items-center gap-1"
                              >
                                <Navigation className="h-3 w-3" />
                                Navigate
                              </a>
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                  </MapContainer>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Completed Orders */}
        {completedOrders.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Completed Today
            </h2>
            <div className="space-y-2">
              {completedOrders.slice(0, 5).map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        #{order.external_order_id || order.id.slice(0, 8)}
                      </p>
                      <p className="text-sm text-muted-foreground">{order.customer_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{order.total}</p>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Delivered
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default AgentDashboard;
