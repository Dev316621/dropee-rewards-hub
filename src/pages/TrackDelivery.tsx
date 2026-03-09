import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import {
  Search,
  Package,
  MapPin,
  Clock,
  Phone,
  Truck,
  CheckCircle2,
  Circle,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const STATUS_STEPS = [
  { value: "pending", label: "Pending", icon: Circle },
  { value: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { value: "preparing", label: "Preparing", icon: Package },
  { value: "picked_up", label: "Picked Up", icon: Package },
  { value: "on_the_way", label: "On The Way", icon: Truck },
  { value: "delivered", label: "Delivered", icon: CheckCircle2 },
];

const TrackDelivery = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [searchPhone, setSearchPhone] = useState("");

  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ["track-orders", searchPhone],
    queryFn: async () => {
      if (!searchPhone) return [];
      const { data, error } = await supabase
        .from("hub_orders")
        .select("*, hub_websites(name, label_color)")
        .ilike("customer_phone", `%${searchPhone}%`)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
    enabled: !!searchPhone,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.trim()) {
      setSearchPhone(phoneNumber.trim());
    }
  };

  const getStatusIndex = (status: string) => {
    return STATUS_STEPS.findIndex((s) => s.value === status);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered": return "text-green-600 bg-green-100 dark:bg-green-900/20";
      case "cancelled": return "text-red-600 bg-red-100 dark:bg-red-900/20";
      case "on_the_way": return "text-orange-600 bg-orange-100 dark:bg-orange-900/20";
      default: return "text-blue-600 bg-blue-100 dark:bg-blue-900/20";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Truck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Track Your Delivery</h1>
              <p className="text-xs text-muted-foreground">Enter your phone number to track orders</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="h-5 w-5" />
              Find Your Orders
            </CardTitle>
            <CardDescription>
              Enter the phone number you used when placing your order
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="tel"
                  placeholder="Enter phone number..."
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" disabled={!phoneNumber.trim()}>
                <Search className="h-4 w-4 mr-2" />
                Track
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {isLoading && (
          <div className="text-center py-12 text-muted-foreground">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            Searching for orders...
          </div>
        )}

        {searchPhone && !isLoading && orders.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No orders found</p>
              <p className="text-sm">Try a different phone number</p>
            </CardContent>
          </Card>
        )}

        {orders.length > 0 && (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Found {orders.length} order{orders.length > 1 ? "s" : ""} for this phone number
            </p>

            {orders.map((order) => {
              const currentStatusIndex = getStatusIndex(order.status);
              const hasLocation = order.latitude && order.longitude;

              return (
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
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">
                          Order #{order.external_order_id || order.id.slice(0, 8)}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(order.created_at), "MMM d, yyyy 'at' h:mm a")}
                        </CardDescription>
                      </div>
                      <p className="text-xl font-bold text-primary">₹{order.total}</p>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Status Timeline */}
                    <div className="py-4">
                      <div className="flex items-center justify-between relative">
                        <div className="absolute top-4 left-0 right-0 h-1 bg-muted rounded-full -z-10" />
                        <div
                          className="absolute top-4 left-0 h-1 bg-primary rounded-full -z-10 transition-all"
                          style={{ width: `${(currentStatusIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
                        />
                        {STATUS_STEPS.map((step, index) => {
                          const isCompleted = index <= currentStatusIndex;
                          const isCurrent = index === currentStatusIndex;
                          const Icon = step.icon;
                          return (
                            <div key={step.value} className="flex flex-col items-center">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                  isCompleted
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground"
                                } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}
                              >
                                <Icon className="h-4 w-4" />
                              </div>
                              <span className={`text-[10px] mt-2 font-medium ${isCompleted ? "text-primary" : "text-muted-foreground"}`}>
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <MapPin className="h-4 w-4 text-primary mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Delivery Address</p>
                        <p className="text-sm">{order.customer_address}</p>
                      </div>
                    </div>

                    {/* Map */}
                    {hasLocation && (
                      <div className="rounded-lg overflow-hidden border h-48">
                        <MapContainer
                          center={[order.latitude!, order.longitude!]}
                          zoom={15}
                          style={{ height: "100%", width: "100%" }}
                          scrollWheelZoom={false}
                        >
                          <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          <Marker position={[order.latitude!, order.longitude!]}>
                            <Popup>Delivery Location</Popup>
                          </Marker>
                        </MapContainer>
                      </div>
                    )}

                    {/* Items */}
                    <div className="border-t pt-3">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Order Items:</p>
                      <ul className="text-sm space-y-1">
                        {Array.isArray(order.items) &&
                          order.items.map((item: any, idx: number) => (
                            <li key={idx} className="flex justify-between">
                              <span>{item.qty}x {item.name}</span>
                              <span className="text-muted-foreground">₹{item.price * item.qty}</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default TrackDelivery;
